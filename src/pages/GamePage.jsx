import React, { useState, useRef, useEffect } from 'react';
import { Star, Trophy, RotateCcw, ChevronRight, CheckCircle2, XCircle, Sparkles, Zap, Target, PenLine, AlertCircle, Info, ExternalLink, Map, MapPin, ShieldCheck, Waves, Landmark } from 'lucide-react';
import { gameLevels } from '../data/gameParikan.js';
import { zepGameHub, zepGameLevels } from '../data/zepGameLinks.js';
import { useClickSound } from '../hooks/useClickSound.js';
import { useFeedbackSound } from '../hooks/useFeedbackSound.js';
import { useResultSound } from '../hooks/useResultSound.js';
import { useAnswerCrowdSound } from '../hooks/useAnswerCrowdSound.js';
import { useStudentLocalStorage } from '../hooks/useLocalStorage.js';

// ── Suku kata counter ────────────────────────────────────────────────────────
// Hitung suku kata sederhana: pisah per vokal cluster
function countSyllables(word) {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  const matches = cleaned.match(/[aeiouàáâãäåèéêëìíîïòóôõöùúûü]+/g);
  return matches ? matches.length : 0;
}

function countLineSyllables(line) {
  return line.trim().split(/\s+/).reduce((sum, w) => sum + countSyllables(w), 0);
}

function getLevelMaxScore(level) {
  if (!level) return 0;
  if (level.type === 'theme-select') return (level.selectCount ?? 0) * 10;
  if (level.questions[0]?.type === 'compose') return level.questions.length * 10;
  return level.questions.length;
}

function clampScore(score, maxScore) {
  return Math.min(Math.max(score ?? 0, 0), maxScore);
}

// ── Compose scoring ──────────────────────────────────────────────────────────
// Nilai per soal = 10, dibagi:
//   kata kunci ada   = 3 poin
//   jumlah baris ok  = 3 poin
//   suku kata 8-12   = 4 poin
function scoreCompose(text, keyword) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const fullText = text.toLowerCase();

  // Kriteria 1: kata kunci ada
  const hasKeyword = fullText.includes(keyword.toLowerCase());

  // Kriteria 2: jumlah baris 2 atau 4
  const validLines = lines.length === 2 || lines.length === 4;

  // Kriteria 3: semua baris 8-12 suku kata
  const syllableCounts = lines.map(countLineSyllables);
  const allSyllablesOk = lines.length > 0 && syllableCounts.every(c => c >= 8 && c <= 12);

  const points =
    (hasKeyword ? 3 : 0) +
    (validLines ? 3 : 0) +
    (allSyllablesOk ? 4 : 0);

  return {
    points,
    hasKeyword,
    validLines,
    allSyllablesOk,
    syllableCounts,
    lineCount: lines.length,
  };
}

// ── Fuzzy validation helper ──────────────────────────────────────────────────
// Normalisasi: lowercase, trim, hapus tanda baca di awal/akhir, spasi ganda
function getLastWord(line) {
  return line
    .toLowerCase()
    .replace(/[.,!?;:'"]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .at(-1) ?? '';
}

function getRhymeSound(line) {
  const lastWord = getLastWord(line);
  const match = lastWord.match(/[aiueo][a-z]*$/);
  return match ? match[0].slice(-2) : lastWord.slice(-2);
}

function checkRhyme(lines) {
  if (lines.length !== 2 && lines.length !== 4) {
    return { checked: false, pairs: [], allOk: false };
  }

  const pairs = lines.length === 2
    ? [[0, 1]]
    : [[0, 2], [1, 3]];

  const results = pairs.map(([a, b]) => {
    const first = getRhymeSound(lines[a]);
    const second = getRhymeSound(lines[b]);
    return {
      firstLine: a + 1,
      secondLine: b + 1,
      first,
      second,
      ok: first && second && first === second,
    };
  });

  return {
    checked: true,
    pairs: results,
    allOk: results.every((pair) => pair.ok),
  };
}

function buildComposeFeedback(text, keyword, scoring) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const rhyme = checkRhyme(lines);
  const strengths = [];
  const suggestions = [];

  if (scoring.hasKeyword) {
    strengths.push(`Kata kunci "${keyword}" wis mlebu, mula parikanmu wis nyambung karo tema.`);
  } else {
    suggestions.push(`Lebokna kata kunci "${keyword}" ing salah siji larik supaya tema luwih cetha.`);
  }

  if (scoring.validLines) {
    strengths.push(`Jumlah larikmu wis pas: ${scoring.lineCount} larik.`);
  } else {
    suggestions.push(`Parikanmu saiki ana ${scoring.lineCount} larik. Coba gawe dadi 2 utawa 4 larik.`);
  }

  if (scoring.allSyllablesOk) {
    strengths.push('Cacah suku kata saben larik wis imbang, dadi iramane luwih kepenak diwaca.');
  } else if (scoring.syllableCounts.length > 0) {
    scoring.syllableCounts.forEach((count, index) => {
      if (count < 8) {
        suggestions.push(`Larik ${index + 1} isih cekak (${count} suku kata). Tambahana tembung supaya tekan 8-12 suku kata.`);
      } else if (count > 12) {
        suggestions.push(`Larik ${index + 1} rada dawa (${count} suku kata). Coba cekakna ukarane supaya luwih ringkes.`);
      }
    });
  }

  if (rhyme.checked && rhyme.allOk) {
    strengths.push('Swara pungkasan larik wis selaras, purwakanthine mulai katon.');
  } else if (rhyme.checked) {
    rhyme.pairs
      .filter((pair) => !pair.ok)
      .forEach((pair) => {
        suggestions.push(`Swara pungkasan larik ${pair.firstLine} lan ${pair.secondLine} durung padha. Coba pilih tembung pungkasan sing swarane mirip.`);
      });
  } else {
    suggestions.push('Yen larik wis dadi 2 utawa 4, coba cek maneh swara pungkasan supaya ana purwakanthi.');
  }

  if (lines.length === 2) {
    suggestions.push('Elinga: larik kapisan bisa dadi sampiran, larik kapindho dadi isi utawa pesen.');
  } else if (lines.length === 4) {
    suggestions.push('Elinga: rong larik wiwitan bisa dadi sampiran, rong larik pungkasan dadi isi.');
  }

  return {
    strengths,
    suggestions: suggestions.length > 0
      ? suggestions
      : ['Parikanmu wis apik. Coba gawe tuladha liyane nganggo tema beda supaya luwih trampil.'],
  };
}

function getFillQuestionPrompt(q) {
  return q.lines?.join('\n') ?? q.blank ?? 'Tantangan parikan';
}

function getReviewRecommendation(entry) {
  if (entry.type === 'compose') {
    const issues = entry.issues ?? [];
    if (issues.includes('lineCount')) return 'Baleni Materi 3 Struktur Parikan supaya luwih paham sampiran lan isi.';
    if (issues.includes('syllables')) return 'Baleni Materi 6 Panggone Ukara Ing Parikan supaya ukarane luwih ringkes lan trep.';
    if (issues.includes('rhyme')) return 'Baleni Materi 2 Cirine Parikan supaya purwakanthi swara luwih mathuk.';
    if (issues.includes('keyword')) return 'Baleni Materi 7 Cara Ngerakit Parikan supaya pesen lan temane luwih cetha.';
    return 'Baleni Materi 7 Cara Ngerakit Parikan banjur coba gawe parikan maneh.';
  }

  const explanation = `${entry.explanation ?? ''}`.toLowerCase();
  if (explanation.includes('purwakanthi') || explanation.includes('swara')) {
    return 'Baleni Materi 2 Cirine Parikan supaya luwih paham swara pungkasan lan purwakanthi.';
  }
  if (explanation.includes('pitutur') || explanation.includes('sindiran')) {
    return 'Baleni Materi 5 Paedah Parikan supaya luwih paham isi lan pesen parikan.';
  }
  return 'Baleni Materi 1 Tegese Parikan lan waca maneh tuladha-tuladhane.';
}

function buildFillReview(q, userAnswer, isCorrect, questionNum) {
  const entry = {
    id: q.id,
    type: 'fill',
    questionNum,
    title: `Misi ${questionNum}`,
    prompt: getFillQuestionPrompt(q),
    userAnswer: userAnswer.trim(),
    correctAnswer: q.answer,
    isCorrect,
    explanation: q.explanation ?? 'Coba gatekna maneh gegayutan swara lan makna ing parikan iki.',
  };

  return {
    ...entry,
    recommendation: isCorrect ? null : getReviewRecommendation(entry),
  };
}

function buildComposeReview(q, text, scoring, teacherFeedback, questionNum) {
  const issues = [];
  if (!scoring.hasKeyword) issues.push('keyword');
  if (!scoring.validLines) issues.push('lineCount');
  if (!scoring.allSyllablesOk) issues.push('syllables');
  if ((teacherFeedback?.suggestions ?? []).some((message) => message.toLowerCase().includes('swara pungkasan'))) {
    issues.push('rhyme');
  }

  const entry = {
    id: q.id,
    type: 'compose',
    questionNum,
    title: `Parikan ${questionNum}`,
    prompt: `Tema: ${q.theme}\nKata kunci: ${q.keyword}`,
    userAnswer: text.trim(),
    correctAnswer: 'Parikan becik: ana 2 utawa 4 larik, ngemot kata kunci, suku kata 8-12 saben larik, lan swara pungkasan selaras.',
    isCorrect: scoring.points >= 8,
    points: scoring.points,
    maxPoints: 10,
    criteria: [
      {
        label: 'Kata kunci',
        ok: scoring.hasKeyword,
        value: scoring.hasKeyword ? 'Wis mlebu' : `Durung katon: ${q.keyword}`,
      },
      {
        label: 'Jumlah larik',
        ok: scoring.validLines,
        value: `${scoring.lineCount} larik`,
      },
      {
        label: 'Wanda',
        ok: scoring.allSyllablesOk,
        value: scoring.syllableCounts.length > 0
          ? scoring.syllableCounts.map((count, index) => `${index + 1}: ${count}`).join(', ')
          : 'Durung kebaca',
      },
    ],
    explanation: teacherFeedback?.suggestions?.[0] ?? teacherFeedback?.strengths?.[0] ?? 'Parikanmu wis dinilai saka kata kunci, jumlah baris, suku kata, lan purwakanthi.',
    issues,
  };

  return {
    ...entry,
    recommendation: scoring.points >= 8 ? null : getReviewRecommendation(entry),
  };
}

function mergeReviewEntry(previousReview, entry) {
  const withoutSameQuestion = previousReview.filter((item) => item.id !== entry.id);
  const previousEntry = previousReview.find((item) => item.id === entry.id);

  if (entry.type === 'compose' && previousEntry && (previousEntry.points ?? 0) > (entry.points ?? 0)) {
    return [...withoutSameQuestion, previousEntry].sort((a, b) => a.questionNum - b.questionNum);
  }

  return [...withoutSameQuestion, entry].sort((a, b) => a.questionNum - b.questionNum);
}

function normalize(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'"]/g, '')   // hapus tanda baca
    .replace(/\s+/g, ' ');        // spasi ganda → satu
}

// Cek apakah jawaban user cocok dengan jawaban yang benar
function checkAnswer(userInput, correctAnswer, altAnswers = []) {
  const userNorm = normalize(userInput);
  const allAnswers = [correctAnswer, ...(altAnswers || [])].map(normalize);
  return allAnswers.includes(userNorm);
}

// Deteksi masalah spesifik untuk feedback
function detectIssue(userInput) {
  if (!userInput.trim()) return null;
  if (/\s{2,}/.test(userInput)) return 'Perhatikan: ada spasi ganda dalam jawabanmu.';
  if (/^[.,!?;:]/.test(userInput.trim())) return 'Perhatikan: jangan mulai jawaban dengan tanda baca.';
  return null;
}

// ── Star rating display ──────────────────────────────────────────────────────
function FeedbackEmoji({ type }) {
  const [drops, setDrops] = useState([]);

  useEffect(() => {
    if (!type) {
      setDrops([]);
      return;
    }

    // Gawe rintik hujan emoji
    const numDrops = 35;
    const newDrops = Array.from({ length: numDrops }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 1.5 + Math.random() * 1.5, // 1.5s - 3.0s
      delay: Math.random() * 0.5,
      size: 24 + Math.random() * 24, // 24px - 48px
    }));
    setDrops(newDrops);

    const timer = setTimeout(() => setDrops([]), 3500);
    return () => clearTimeout(timer);
  }, [type]);

  if (!type || drops.length === 0) return null;

  const variants = {
    correct: { emoji: '😄', label: 'Bener!', className: 'border-green-300 bg-green-50 text-green-700' },
    wrong: { emoji: '😢', label: 'Salah!', className: 'border-red-300 bg-red-50 text-red-600' },
    great: { emoji: '🤩', label: 'Apik!', className: 'border-yellow-300 bg-yellow-50 text-yellow-700' },
  };
  const item = variants[type] ?? variants.wrong;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Label tengah */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ animation: 'fadeOut 0.5s ease-out 1.5s both' }}>
        <div className={`animate-[feedbackPop_0.6s_ease-out_both] rounded-[2rem] border-4 px-8 py-6 text-center shadow-[0_22px_60px_rgba(46,29,16,0.28)] sm:px-12 sm:py-8 ${item.className}`}>
          <div className="text-7xl leading-none drop-shadow-sm sm:text-8xl" aria-hidden="true">{item.emoji}</div>
          <p className="mt-3 text-3xl font-black uppercase tracking-wide sm:text-4xl">{item.label}</p>
        </div>
      </div>

      {/* Efek hujan emoji */}
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="absolute -top-16 opacity-0"
          style={{
            left: `${drop.left}%`,
            fontSize: `${drop.size}px`,
            animation: `rainFall ${drop.duration}s linear ${drop.delay}s forwards`,
          }}
          aria-hidden="true"
        >
          {item.emoji}
        </div>
      ))}
    </div>
  );
}

function StarRating({ count, filled = 0, size = 20 }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < filled ? 'text-yellow-400 drop-shadow-sm' : 'text-white/30'}
          fill={i < filled ? '#facc15' : 'none'}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

// ── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ current, total, color }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-white/20" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

// ── Level selection screen ───────────────────────────────────────────────────
function ZepAdventurePanel() {
  const activeLevels = zepGameLevels.filter((level) => level.url);
  const hasSpace = Boolean(zepGameHub.spaceUrl);
  const hasLinks = hasSpace || activeLevels.length > 0;
  if (!hasLinks) return null;

  const panelTitle = hasSpace ? zepGameHub.title : 'Tantangan Parikan';
  const panelDescription = hasSpace
    ? zepGameHub.description
    : 'Rampungake pos tantangan ing arena, banjur bali menyang Javanesia kanggo ndeleng progres lan latihan nulis parikan.';

  return (
    <section className="w-full rounded-[28px] border-4 border-white/80 bg-white/95 p-5 text-left shadow-[0_18px_42px_rgba(78,45,21,0.14)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            <Map size={24} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">
              {hasSpace ? 'Mode Petualangan' : 'Mode Tantangan'}
            </p>
            <h2 className="mt-1 text-xl font-black leading-tight text-[#2e1d10]">{panelTitle}</h2>
            <p className="mt-1 max-w-2xl text-sm font-bold leading-relaxed text-[#7a5030]">
              {panelDescription}
            </p>
          </div>
        </div>

        {zepGameHub.spaceUrl && (
          <a
            href={zepGameHub.spaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-md transition hover:-translate-y-0.5 hover:bg-orange-600 active:translate-y-0"
          >
            Mlebu ZEP Space
            <ExternalLink size={16} aria-hidden="true" />
          </a>
        )}
      </div>

      {activeLevels.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {activeLevels.map((level) => (
            <a
              key={level.levelId}
              href={level.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border-2 border-orange-100 bg-[#fffaf2] px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:bg-white"
            >
              <p className="text-[0.68rem] font-black uppercase tracking-widest text-orange-600">{level.type}</p>
              <p className="mt-1 text-sm font-black leading-snug text-[#2e1d10]">{level.title}</p>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

function LevelSelect({ scores, savedResults, onSelect, onReset, onViewResult }) {
  const [showGuide, setShowGuide] = useState(false);
  const playClick = useClickSound();
  const maxScore = gameLevels.reduce((sum, level) => sum + getLevelMaxScore(level), 0);
  const totalScore = gameLevels.reduce((sum, level) => (
    sum + clampScore(scores[level.id], getLevelMaxScore(level))
  ), 0);
  const hasAnyScore = totalScore > 0;

  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-col items-center gap-8 px-4 py-2">
      <header className="w-full text-center">
        <div className="inline-flex items-center gap-2 rounded-full border-2 border-orange-400 bg-white px-5 py-2 text-sm font-black uppercase tracking-widest text-orange-600 shadow-md">
          <Zap size={14} className="text-orange-500" aria-hidden="true" />
          Game Parikan
          <Zap size={14} className="text-orange-500" aria-hidden="true" />
        </div>
        <h1
          className="mt-4 text-[clamp(2.8rem,6vw,4.5rem)] font-black uppercase leading-none text-white drop-shadow-2xl"
          style={{ WebkitTextStroke: '6px #ff9632', paintOrder: 'stroke fill' }}
        >
          Pilih Misi
        </h1>
        <p className="mt-2 text-base font-bold text-[#2e1d10] drop-shadow-sm">
          Uji kemampuanmu ngerti lan ngrakit parikan!
        </p>

        <button
          type="button"
          onClick={() => { playClick(); setShowGuide((value) => !value); }}
          className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-white/80 bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-wide text-orange-600 shadow-md transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 active:translate-y-0 active:scale-95"
        >
          <Info size={14} aria-hidden="true" />
          {showGuide ? 'Tutup Petunjuk' : 'Petunjuk Game'}
        </button>

        {showGuide && (
          <div className="mx-auto mt-4 grid max-w-2xl gap-2 rounded-2xl border-2 border-orange-200 bg-white/92 p-4 text-left shadow-[0_10px_28px_rgba(78,45,21,0.14)] backdrop-blur-sm sm:grid-cols-2">
            {[
              'Miwiti saka Misi 1 kanggo nglengkapi parikan.',
              'Skor minimal 70% bakal mbukak misi sabanjure.',
              'Misi 2 lan 3 digunakake kanggo latihan nulis parikan dhewe.',
              'Sawise dikirim, waca Hasil Penilaian lan Saran Guru kanggo revisi.',
            ].map((guide) => (
              <p key={guide} className="flex items-start gap-2 text-sm font-bold leading-relaxed text-[#5a3a22]">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-green-500" aria-hidden="true" />
                <span>{guide}</span>
              </p>
            ))}
          </div>
        )}

        {hasAnyScore && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-5 py-2 text-sm font-black text-yellow-900 shadow-lg">
              <Trophy size={16} aria-hidden="true" />
              Gunggunge Skor: {totalScore} / {maxScore}
            </div>
            <button
              type="button"
              onClick={() => { playClick(); onReset(); }}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-white/80 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-wide text-gray-500 shadow-md backdrop-blur-sm transition hover:bg-red-50 hover:text-red-500 hover:border-red-200 active:translate-y-0 active:scale-95"
            >
              <RotateCcw size={12} aria-hidden="true" />
              Reseti Skor
            </button>
          </div>
        )}
      </header>

      <ZepAdventurePanel />

      <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-3">
        {gameLevels.map((level, idx) => {
          const levelMaxScore = getLevelMaxScore(level);
          const best = clampScore(scores[level.id], levelMaxScore);
          const pct = levelMaxScore > 0 ? Math.round((best / levelMaxScore) * 100) : 0;
          const starsEarned = pct >= 80 ? 3 : pct >= 50 ? 2 : pct > 0 ? 1 : 0;
          const hasQuestions = level.type === 'theme-select' ? true : level.questions.length > 0;
          // Unlock: skor level sebelumnya >= 70% dari skor maksimalnya
          const prevLevel = gameLevels[idx - 1];
          const prevMax = getLevelMaxScore(prevLevel);
          const prevScore = clampScore(scores[prevLevel?.id], prevMax);
          const unlocked = idx === 0 || prevScore >= Math.ceil(prevMax * 0.7);
          const isAvailable = hasQuestions && unlocked;

          return (
            <button
              key={level.id}
              type="button"
              disabled={!isAvailable}
              onClick={() => { playClick(); onSelect(level); }}
              className={`group relative flex flex-col items-center gap-4 overflow-hidden rounded-3xl border-4 p-6 text-center font-black text-white shadow-2xl transition-all duration-300
                ${isAvailable
                  ? 'cursor-pointer hover:-translate-y-2 hover:scale-[1.03] active:translate-y-[2px] active:scale-[0.98]'
                  : 'cursor-not-allowed saturate-[0.55]'
                }`}
              style={{
                borderColor: `${level.color}cc`,
                background: isAvailable
                  ? `linear-gradient(145deg, color-mix(in srgb, ${level.color} 72%, white), ${level.color})`
                  : `linear-gradient(145deg, color-mix(in srgb, ${level.color} 38%, white), color-mix(in srgb, ${level.color} 52%, #64748b))`,
                boxShadow: isAvailable ? `0 12px 40px ${level.shadow}, 0 4px 0 ${level.color}66` : undefined,
              }}
              aria-label={`${level.label} — ${level.subtitle}${!isAvailable ? ' (terkunci)' : ''}`}
            >
              <span className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/25 via-transparent to-transparent" />
              <span className="pointer-events-none absolute inset-1 rounded-[20px] border border-white/30" />

              {!isAvailable && (
                <span className="absolute right-3 top-3 text-2xl" aria-hidden="true">
                  {!hasQuestions ? '🔧' : '🔒'}
                </span>
              )}

              <StarRating count={3} filled={starsEarned} size={22} />

              <div>
                <div className="text-[clamp(1.4rem,3vw,1.8rem)] leading-tight drop-shadow-md">{level.label}</div>
                <div className="mt-1 text-sm font-bold uppercase tracking-widest text-white/80">{level.subtitle}</div>
              </div>

              <p className="text-xs font-semibold leading-snug text-white/75">
                {level.description}
              </p>

              {best > 0 && levelMaxScore > 0 && (
                <div className="w-full">
                  <ProgressBar current={best} total={levelMaxScore} color="rgba(255,255,255,0.9)" />
                  <p className="mt-1 text-xs font-bold text-white/70">Skor paling apik: {best}/{levelMaxScore}</p>
                </div>
              )}

              {isAvailable && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-black uppercase tracking-wide shadow-md transition group-hover:shadow-lg"
                  style={{ color: level.color }}
                >
                  {best > 0 ? 'Main Maneh' : 'Miwiti'}
                  <ChevronRight size={14} aria-hidden="true" />
                </span>
              )}

              {/* Tombol lihat hasil terakhir */}
              {false && savedResults?.[level.id] && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playClick();
                    onViewResult(level, savedResults[level.id]);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border-2 border-white/60 bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wide text-white/90 shadow-sm backdrop-blur-sm transition hover:bg-white/30 hover:border-white/80 active:translate-y-0 active:scale-95"
                  aria-label={`Lihat hasil terakhir ${level.label}`}
                >
                  <Trophy size={11} aria-hidden="true" />
                  Lihat Hasil
                </button>
              )}

              {!hasQuestions && (
                <span className="text-xs font-bold text-white/60">Misi nyusul...</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="w-full max-w-lg rounded-2xl border-2 border-yellow-400 bg-yellow-50 px-6 py-4 shadow-md">
        <p className="text-sm font-bold italic text-[#2e1d10] leading-relaxed">
          "Mlaku-mlaku menyang taman,<br />
          <span className="text-orange-600">sinau sregep dadi nyaman.</span>"
        </p>
        <p className="mt-1 text-xs font-semibold text-gray-600">— Tuladha Parikan</p>
      </div>
    </div>
  );
}

// ── Top bar (shared) ─────────────────────────────────────────────────────────
function QuizTopBar({ level, current, total, score, onBack }) {
  const playClick = useClickSound();
  const zepLevel = zepGameLevels.find((item) => item.levelId === level.id && item.url);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => { playClick(); onBack(); }}
          className="rounded-xl border-2 border-white bg-white/95 px-3 py-2 text-xs font-black uppercase text-[#2e1d10] shadow-md transition hover:bg-white hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
        >
          ← Bali
        </button>
        <div
          className="flex items-center gap-2 rounded-full border-2 px-4 py-1.5 text-sm font-black shadow-md"
          style={{ borderColor: level.color, background: 'white', color: level.color }}
        >
          {level.label}
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-yellow-400 px-3 py-1.5 text-sm font-black text-yellow-900 shadow-md">
          <Target size={14} aria-hidden="true" />
          {score}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs font-bold text-[#2e1d10]">
          <span>Misi {current + 1} saka {total}</span>
          <span>{Math.round((current / total) * 100)}% rampung</span>
        </div>
        <ProgressBar current={current} total={total} color={level.color} />
      </div>
      {zepLevel && (
        <a
          href={zepLevel.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-orange-200 bg-white/95 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-orange-600 shadow-md transition hover:-translate-y-0.5 hover:bg-orange-50 active:translate-y-0 sm:self-center sm:w-auto"
        >
          Bukak misi iki ing {zepLevel.type}
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      )}
    </div>
  );
}

// ── Fill question (isian) ────────────────────────────────────────────────────
function FillQuestion({ q, level, questionNum, onCorrect, onWrong, onReview, onNext, isLast }) {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'correct' | 'wrong'
  const [emojiFeedback, setEmojiFeedback] = useState(null);
  const [warning, setWarning] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const inputRef = useRef(null);
  const feedbackRef = useRef(null);
  const { playCorrect, playWrong } = useFeedbackSound();
  const { playCorrectCrowd, playWrongCrowd } = useAnswerCrowdSound();
  const playClick = useClickSound();

  useEffect(() => {
    // Reset state saat soal berganti
    setInput('');
    setStatus('idle');
    setEmojiFeedback(null);
    setWarning('');
    setShowExplanation(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [q.id]);

  const handleSubmit = () => {
    if (status !== 'idle') return;

    if (!input.trim()) {
      setWarning('Tulisen jawabanmu dhisik!');
      playWrong();
      return;
    }

    // Cek masalah format
    const issue = detectIssue(input);
    if (issue) {
      setWarning(issue);
      playWrong();
      return;
    }

    setWarning('');
    const isCorrect = checkAnswer(input, q.answer, q.answers);
    onReview(buildFillReview(q, input, isCorrect, questionNum));

    if (isCorrect) {
      setStatus('correct');
      setEmojiFeedback('correct');
      setShowExplanation(true);
      playCorrectCrowd();
      window.setTimeout(playCorrect, 450);
      onCorrect();
    } else {
      setStatus('wrong');
      setEmojiFeedback('wrong');
      setShowExplanation(true);
      playWrongCrowd();
      playWrong();
      onWrong();
    }

    setTimeout(() => feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && status === 'idle') handleSubmit();
  };

  const handleNext = () => {
    playClick();
    onNext();
  };

  // Render baris parikan — ganti ___ dengan input atau jawaban
  const renderLines = () => {
    return q.lines.map((line, i) => {
      const isBlankLine = line.includes('___');
      if (!isBlankLine) {
        return (
          <p key={i} className="text-[clamp(1rem,2.5vw,1.2rem)] font-bold leading-relaxed text-[#2e1d10]">
            {line}
          </p>
        );
      }

      // Baris yang ada blank-nya
      const parts = line.split('___');
      return (
        <p key={i} className="flex flex-wrap items-center gap-1 text-[clamp(1rem,2.5vw,1.2rem)] font-bold leading-relaxed text-[#2e1d10]">
          {parts[0] && <span>{parts[0]}</span>}
          {status === 'idle' ? (
            <span className="inline-block min-w-[120px] border-b-2 border-dashed border-orange-400 px-1 text-orange-500 italic">
              {input || '...'}
            </span>
          ) : (
            <span className={`inline-block rounded px-2 py-0.5 font-black ${
              status === 'correct'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-600 line-through'
            }`}>
              {input}
            </span>
          )}
          {status === 'wrong' && (
            <span className="inline-block rounded bg-green-100 px-2 py-0.5 font-black text-green-700">
              {q.answer}
            </span>
          )}
          {parts[1] && <span>{parts[1]}</span>}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <FeedbackEmoji type={emojiFeedback} />
      {/* Question card */}
      <div
        className="relative overflow-hidden rounded-3xl shadow-2xl"
        style={{ borderColor: level.color, borderWidth: '3px', borderStyle: 'solid', background: 'white', padding: '1.5rem' }}
      >
        <span className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/50 via-transparent to-transparent" />

        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-widest shadow-sm"
          style={{ background: level.color, color: 'white' }}
        >
          <PenLine size={12} aria-hidden="true" />
          Jangkepi Parikan {questionNum}
        </div>

        <p className="relative mb-4 text-xs font-black uppercase tracking-widest text-gray-400">
          Rampungna ukara ing ngisor iki supaya dadi parikan!
        </p>

        {/* Parikan lines */}
        <div className="relative flex flex-col gap-1.5 rounded-xl bg-orange-50/60 p-4 ring-1 ring-orange-100">
          <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl" style={{ background: level.color }} />
          {renderLines()}
        </div>
      </div>

      {/* Input area — hanya tampil saat belum jawab */}
      {status === 'idle' && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black uppercase tracking-widest text-[#2e1d10]/60">
            Tulisen jawabanmu:
          </label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); setWarning(''); }}
              onKeyDown={handleKeyDown}
              placeholder="Ketik jawaban ing kene..."
              className="flex-1 rounded-2xl border-3 border-orange-200 bg-white px-4 py-3 text-base font-bold text-[#2e1d10] shadow-md outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              style={{ borderWidth: '3px' }}
              aria-label="Input jawaban"
              autoComplete="off"
              spellCheck="false"
            />
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-2xl border-3 px-5 py-3 text-sm font-black uppercase text-white shadow-md transition hover:-translate-y-0.5 active:translate-y-px active:scale-95"
              style={{ background: level.color, borderColor: `${level.color}aa`, borderWidth: '3px' }}
            >
              Kirim
            </button>
          </div>

          {/* Warning */}
          {warning && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-700 ring-1 ring-amber-200">
              <AlertCircle size={15} aria-hidden="true" />
              {warning}
            </div>
          )}
        </div>
      )}

      {/* Feedback */}
      {showExplanation && (
        <div
          ref={feedbackRef}
          className={`rounded-2xl border-2 p-4 text-sm font-semibold leading-relaxed sm:p-5 ${
            status === 'correct'
              ? 'border-green-500 bg-green-50 text-green-900'
              : 'border-red-400 bg-red-50 text-red-900'
          }`}
        >
          <div className="mb-2 flex items-center gap-2 font-black uppercase tracking-wide">
            {status === 'correct'
              ? <><CheckCircle2 size={16} className="text-green-600" aria-hidden="true" /> Bener! 🎉</>
              : <><XCircle size={16} className="text-red-600" aria-hidden="true" /> Durung bener 😅</>
            }
          </div>
          <p>{q.explanation}</p>
        </div>
      )}

      {/* Next button */}
      {status !== 'idle' && (
        <button
          type="button"
          onClick={handleNext}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-4 border-white/80 py-4 text-lg font-black uppercase text-white shadow-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl active:translate-y-px active:scale-98 active:shadow-md"
          style={{ background: `linear-gradient(135deg, ${level.color}, ${level.color}bb)` }}
        >
          {isLast
            ? <><Trophy size={20} aria-hidden="true" /> Deleng Kasil</>
            : <>Misi Sabanjure <ChevronRight size={20} aria-hidden="true" /></>
          }
        </button>
      )}
    </div>
  );
}

// ── Compose question (nulis parikan) ─────────────────────────────────────────
function ComposeQuestion({ q, level, questionNum, onScore, onReview, onNext, isLast }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [teacherFeedback, setTeacherFeedback] = useState(null);
  const [bestPoints, setBestPoints] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [emojiFeedback, setEmojiFeedback] = useState(null);
  const { playCorrect, playWrong } = useFeedbackSound();
  const { playCorrectCrowd, playWrongCrowd } = useAnswerCrowdSound();
  const playClick = useClickSound();
  const feedbackRef = useRef(null);

  useEffect(() => {
    setText('');
    setResult(null);
    setTeacherFeedback(null);
    setBestPoints(0);
    setSubmitted(false);
    setEmojiFeedback(null);
  }, [q.id]);

  const handleSubmit = () => {
    if (!text.trim()) {
      playWrong();
      return;
    }
    const scoring = scoreCompose(text, q.keyword);
    const feedback = buildComposeFeedback(text, q.keyword, scoring);
    setResult(scoring);
    setTeacherFeedback(feedback);
    setSubmitted(true);
    setEmojiFeedback(scoring.points === 10 ? 'correct' : scoring.points >= 6 ? 'great' : 'wrong');
    onReview(buildComposeReview(q, text, scoring, feedback, questionNum));
    if (scoring.points > bestPoints) {
      setBestPoints(scoring.points);
      onScore(scoring.points);
    }
    if (scoring.points === 10) {
      playCorrectCrowd();
      window.setTimeout(playCorrect, 450);
    } else if (scoring.points >= 6) {
      playCorrectCrowd();
      playClick();
    } else {
      playWrongCrowd();
      playWrong();
    }
    setTimeout(() => feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
  };

  const handleRevise = () => {
    setResult(null);
    setTeacherFeedback(null);
    setSubmitted(false);
    setEmojiFeedback(null);
  };

  const handleNext = () => { playClick(); onNext(); };

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  return (
    <div className="flex flex-col gap-4">
      <FeedbackEmoji type={emojiFeedback} />
      {/* Soal card */}
      <div
        className="relative overflow-hidden rounded-3xl shadow-2xl"
        style={{ borderColor: level.color, borderWidth: '3px', borderStyle: 'solid', background: 'white', padding: '1.5rem' }}
      >
        <span className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/50 via-transparent to-transparent" />
        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-widest shadow-sm"
          style={{ background: level.color, color: 'white' }}
        >
          <PenLine size={12} aria-hidden="true" />
          Nulis Parikan {questionNum}
        </div>
        <p className="relative mb-3 text-xs font-black uppercase tracking-widest text-gray-400">
          Tulisen parikan nganggo kata kunci ing ngisor iki!
        </p>
        <div className="relative mb-4 flex flex-wrap items-center gap-3">
          <div className="rounded-xl bg-amber-50 px-4 py-2 ring-2 ring-amber-300">
            <span className="text-xs font-black uppercase tracking-widest text-amber-600">Kata Kunci</span>
            <p className="mt-0.5 text-xl font-black text-amber-800">{q.keyword}</p>
          </div>
          <div className="rounded-xl bg-orange-50 px-4 py-2 ring-1 ring-orange-200">
            <span className="text-xs font-black uppercase tracking-widest text-orange-500">Tema</span>
            <p className="mt-0.5 text-sm font-bold text-orange-700">{q.theme}</p>
          </div>
        </div>
        <div className="relative rounded-xl bg-gray-50 px-4 py-3 ring-1 ring-gray-200">
          <p className="mb-1.5 text-xs font-black uppercase tracking-widest text-gray-500">Syarat Parikan:</p>
          <ul className="flex flex-col gap-1 text-xs font-semibold text-gray-600">
            <li className="flex items-center gap-1.5"><span className="text-amber-500">✦</span> 2 utawa 4 baris</li>
            <li className="flex items-center gap-1.5"><span className="text-amber-500">✦</span> Saben baris 8–12 suku kata</li>
            <li className="flex items-center gap-1.5"><span className="text-amber-500">✦</span> Kata kunci kudu ana ing parikan</li>
          </ul>
        </div>
      </div>

      {/* Tuladha */}
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Info size={13} className="text-amber-600" aria-hidden="true" />
          <span className="text-xs font-black uppercase tracking-widest text-amber-600">Tuladha</span>
        </div>
        <div className="flex flex-col gap-0.5">
          {q.example.split('\n').map((line, i) => (
            <p key={i} className="text-sm font-bold italic text-amber-800">{line}</p>
          ))}
        </div>
      </div>

      {/* Textarea */}
      {!submitted && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-widest text-[#2e1d10]/60">
              Tulisen parikanmu ing kene:
            </label>
            <span className="text-xs font-bold text-gray-400">
              {lines.length} baris
            </span>
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={'Baris 1...\nBaris 2...\n(opsional) Baris 3...\n(opsional) Baris 4...'}
            rows={4}
            className="w-full resize-none rounded-2xl border-2 border-orange-200 bg-white px-4 py-3 text-base font-bold text-[#2e1d10] shadow-md outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            style={{ borderWidth: '2px' }}
            aria-label="Input parikan"
            spellCheck="false"
          />
          {/* Live suku kata counter */}
          {lines.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {lines.map((line, i) => {
                const count = countLineSyllables(line);
                const ok = count >= 8 && count <= 12;
                return (
                  <span
                    key={i}
                    className={`rounded-full px-3 py-1 text-xs font-black ${
                      ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}
                  >
                    Baris {i + 1}: {count} suku kata {ok ? '✓' : '✗'}
                  </span>
                );
              })}
            </div>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="rounded-2xl py-3 text-sm font-black uppercase text-white shadow-md transition hover:-translate-y-0.5 active:translate-y-px active:scale-98 active:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: level.color }}
          >
            Kirim Parikan
          </button>
        </div>
      )}

      {/* Feedback */}
      {result && (
        <div ref={feedbackRef} className="flex flex-col gap-3">
          {/* Skor */}
          <div
            className="flex items-center justify-between rounded-2xl px-5 py-4 text-white shadow-lg"
            style={{ background: `linear-gradient(135deg, ${level.color}, ${level.color}bb)` }}
          >
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white/70">Nilaimu</p>
              <p className="text-3xl font-black">{result.points} <span className="text-lg text-white/60">/ 10</span></p>
            </div>
            <div className="text-4xl" aria-hidden="true">
              {result.points === 10 ? '🏆' : result.points >= 7 ? '🌟' : result.points >= 4 ? '👍' : '💪'}
            </div>
          </div>

          {/* Kriteria */}
          <div className="rounded-2xl border-2 border-gray-100 bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-gray-400">Kasil Pambiji:</p>
            <div className="flex flex-col gap-2">
              <div className={`flex items-center justify-between rounded-xl px-4 py-2.5 ${result.hasKeyword ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'}`}>
                <div className="flex items-center gap-2">
                  {result.hasKeyword ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                  <span className="text-sm font-bold">Kata kunci "{q.keyword}" ana</span>
                </div>
                <span className="text-sm font-black">{result.hasKeyword ? '+3' : '+0'}</span>
              </div>
              <div className={`flex items-center justify-between rounded-xl px-4 py-2.5 ${result.validLines ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'}`}>
                <div className="flex items-center gap-2">
                  {result.validLines ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                  <span className="text-sm font-bold">Jumlah baris {result.lineCount} {result.validLines ? '(2 utawa 4 ✓)' : '(kudu 2 utawa 4)'}</span>
                </div>
                <span className="text-sm font-black">{result.validLines ? '+3' : '+0'}</span>
              </div>
              <div className={`flex items-center justify-between rounded-xl px-4 py-2.5 ${result.allSyllablesOk ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'}`}>
                <div className="flex items-center gap-2">
                  {result.allSyllablesOk ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                  <span className="text-sm font-bold">Suku kata 8–12 saben baris</span>
                </div>
                <span className="text-sm font-black">{result.allSyllablesOk ? '+4' : '+0'}</span>
              </div>
              {!result.allSyllablesOk && result.syllableCounts.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-1">
                  {result.syllableCounts.map((c, i) => (
                    <span key={i} className={`rounded-full px-2.5 py-1 text-xs font-bold ${c >= 8 && c <= 12 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      Baris {i + 1}: {c} suku kata
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {teacherFeedback && (
            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <p className="mb-3 text-xs font-black uppercase tracking-widest text-emerald-700">Saran Guru:</p>

              {teacherFeedback.strengths.length > 0 && (
                <div className="mb-3 grid gap-2">
                  {teacherFeedback.strengths.map((message) => (
                    <div key={message} className="flex items-start gap-2 rounded-xl bg-white/80 px-3 py-2 text-sm font-bold leading-relaxed text-emerald-800">
                      <CheckCircle2 size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                      <span>{message}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid gap-2">
                {teacherFeedback.suggestions.map((message) => (
                  <div key={message} className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-bold leading-relaxed text-amber-800 ring-1 ring-amber-200">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <span>{message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skor terbaik */}
          {bestPoints > result.points && (
            <p className="text-center text-xs font-bold text-white/70">
              Skor terbaikmu: {bestPoints}/10
            </p>
          )}

          {/* Tombol aksi */}
          <div className="flex gap-3">
            {result.points < 10 && (
              <button
                type="button"
                onClick={handleRevise}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-white/80 bg-white/80 py-3 text-sm font-black uppercase text-[#7a4f2e] shadow-md transition hover:-translate-y-0.5 active:translate-y-px active:scale-98"
              >
                <RotateCcw size={15} aria-hidden="true" />
                Revisi
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-4 border-white/80 py-3 text-sm font-black uppercase text-white shadow-xl transition hover:-translate-y-1 active:translate-y-px active:scale-98 active:shadow-md"
              style={{ background: `linear-gradient(135deg, ${level.color}, ${level.color}bb)` }}
            >
              {isLast ? <><Trophy size={16} /> Deleng Kasil</> : <>Misi Sabanjure <ChevronRight size={16} /></>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Theme select screen (Tingkat 3) ─────────────────────────────────────────
function ThemeSelectScreen({ level, onStart, onBack }) {
  const [selected, setSelected] = useState([]);
  const playClick = useClickSound();
  const needed = level.selectCount;

  const toggle = (theme) => {
    playClick();
    setSelected(prev => {
      const already = prev.find(t => t.id === theme.id);
      if (already) return prev.filter(t => t.id !== theme.id);
      if (prev.length >= needed) return prev;
      return [...prev, theme];
    });
  };

  const handleStart = () => {
    if (selected.length < needed) return;
    playClick();
    const questions = selected.map((t, i) => ({
      id: `t3_selected_${i}`,
      type: 'compose',
      keyword: t.keyword,
      theme: t.theme,
      example: t.example,
      themeEmoji: t.emoji,
    }));
    onStart(questions);
  };

  return (
    <div className="mx-auto flex w-full max-w-[780px] flex-col gap-6 px-4 py-2">

      {/* ── Header bar ── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => { playClick(); onBack(); }}
          className="rounded-xl border-2 border-white bg-white px-3 py-2 text-xs font-black uppercase text-[#2e1d10] shadow-md transition hover:bg-orange-50 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 active:translate-y-px active:scale-98"
        >
          ← Bali
        </button>
        <div
          className="flex items-center gap-2 rounded-full border-2 bg-white px-4 py-1.5 text-sm font-black shadow-md"
          style={{ borderColor: level.color, color: level.color }}
        >
          {level.label} — {level.subtitle}
        </div>
      </div>

      {/* ── Instruksi card ── */}
      <div
        className="relative overflow-hidden rounded-3xl p-5 text-white shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${level.color}, color-mix(in srgb, ${level.color} 70%, #1e3a5f))`,
          boxShadow: `0 12px 40px ${level.shadow ?? level.color + '55'}`,
        }}
      >
        {/* Decorative inner highlight */}
        <span className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 via-transparent to-transparent" />
        <span className="pointer-events-none absolute inset-1 rounded-[20px] border border-white/20" />

        <div className="relative mb-3 inline-flex items-center gap-2 rounded-full bg-white/25 px-3 py-1.5 text-xs font-black uppercase tracking-widest shadow-sm">
          <Sparkles size={12} aria-hidden="true" />
          Pituduh Misi
        </div>
        <h2 className="relative text-xl font-black leading-snug drop-shadow-sm">
          Misi Nulis Parikan
        </h2>
        <div className="relative mt-3 flex flex-col gap-1.5 text-sm font-semibold text-white/95">
          <p>Gawea parikan dhewe kanthi basa Jawa. Parikanmu kudu:</p>
          <ul className="mt-1.5 flex flex-col gap-1.5 pl-1">
            {[
              'Ana 2 utawa 4 larik',
              'Migunakake purwakanthi swara (rima)',
              'Isi cocog karo tema sing kapilih',
            ].map((rule) => (
              <li key={rule} className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-yellow-300" aria-hidden="true">✦</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Pilih tema section ── */}
      <div>
        {/* Section header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-black text-[#2e1d10] drop-shadow-sm">
            Pilih {needed} Tema
          </h3>
          <span
            className="rounded-full px-4 py-1.5 text-sm font-black shadow-md transition-all"
            style={{
              background: selected.length === needed
                ? `linear-gradient(135deg, ${level.color}, color-mix(in srgb, ${level.color} 80%, #1e3a5f))`
                : 'white',
              color: selected.length === needed ? 'white' : '#9b8a78',
              border: selected.length === needed ? 'none' : '2px solid #e5d9cc',
              boxShadow: selected.length === needed ? `0 4px 16px ${level.color}55` : 'none',
            }}
          >
            {selected.length}/{needed} dipilih
          </span>
        </div>

        {/* Theme cards grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {level.themePool.map((theme) => {
            const isSelected = !!selected.find(t => t.id === theme.id);
            const isDisabled = !isSelected && selected.length >= needed;
            const selIdx = selected.findIndex(t => t.id === theme.id);

            return (
              <button
                key={theme.id}
                type="button"
                disabled={isDisabled}
                onClick={() => toggle(theme)}
                className={`group relative flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-4
                  ${isSelected
                    ? 'scale-[1.02] shadow-xl active:scale-[0.98] active:translate-y-0'
                    : isDisabled
                    ? 'cursor-not-allowed opacity-50 grayscale-[30%]'
                    : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] active:translate-y-0'
                  }`}
                style={{
                  borderColor: isSelected ? level.color : '#e5d9cc',
                  background: isSelected
                    ? `linear-gradient(135deg, color-mix(in srgb, ${level.color} 12%, white), color-mix(in srgb, ${level.color} 6%, white))`
                    : 'white',
                  boxShadow: isSelected
                    ? `0 8px 28px ${level.color}33, 0 0 0 1px ${level.color}44`
                    : '0 2px 8px rgba(46,29,16,0.08)',
                  // eslint-disable-next-line no-dupe-keys
                  '--tw-ring-color': level.color + '44',
                }}
              >
                {/* Subtle inner glow when selected */}
                {isSelected && (
                  <span
                    className="pointer-events-none absolute inset-0 rounded-2xl"
                    style={{ background: `linear-gradient(135deg, ${level.color}10, transparent)` }}
                  />
                )}

                {/* Nomor urut / placeholder */}
                <div
                  className="relative flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-black transition-all duration-200"
                  style={{
                    background: isSelected
                      ? `linear-gradient(135deg, ${level.color}, color-mix(in srgb, ${level.color} 80%, #1e3a5f))`
                      : '#f3ede6',
                    color: isSelected ? 'white' : '#b7a090',
                    boxShadow: isSelected ? `0 4px 12px ${level.color}55` : 'none',
                  }}
                >
                  {isSelected
                    ? <span className="text-sm font-black">{selIdx + 1}</span>
                    : <span className="text-xs">○</span>
                  }
                </div>

                {/* Content */}
                <div className="relative flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xl leading-none" aria-hidden="true">{theme.emoji}</span>
                    <span
                      className="text-sm font-black leading-tight"
                      style={{ color: isSelected ? level.color : '#2e1d10' }}
                    >
                      {theme.theme}
                    </span>
                  </div>
                  <p
                    className="mt-1 text-xs font-semibold leading-snug"
                    style={{ color: isSelected ? '#5a3a22' : '#9b8a78' }}
                  >
                    {theme.description}
                  </p>
                </div>

                {/* Checkmark */}
                {isSelected && (
                  <CheckCircle2
                    size={18}
                    className="relative shrink-0 mt-0.5 transition-all"
                    style={{ color: level.color }}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tombol mulai ── */}
      <button
        type="button"
        disabled={selected.length < needed}
        onClick={handleStart}
        className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-black uppercase text-white shadow-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl active:translate-y-px active:scale-98 active:shadow-md disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4"
        style={{
          background: selected.length === needed
            ? `linear-gradient(135deg, ${level.color}, color-mix(in srgb, ${level.color} 75%, #1e3a5f))`
            : '#d4c4b4',
          border: selected.length === needed ? `2px solid ${level.color}cc` : '2px solid #c4b4a4',
          boxShadow: selected.length === needed ? `0 8px 32px ${level.color}55, 0 2px 0 ${level.color}88` : 'none',
          '--tw-ring-color': level.color + '44',
        }}
      >
        {selected.length < needed
          ? `Pilih ${needed - selected.length} tema maneh`
          : <><Sparkles size={20} aria-hidden="true" /> Wis Siap, Miwiti Nulis!</>
        }
      </button>
    </div>
  );
}

// ── Quiz screen (orchestrator) ───────────────────────────────────────────────
// questions prop opsional — untuk tingkat 3 yang soalnya dipilih dinamis
function QuizScreen({ level, questions: questionsOverride, onFinish, onBack }) {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const pointsPerQuestion = useRef({});
  const reviewRef = useRef([]);

  const questions = questionsOverride ?? level.questions ?? [];
  const q = questions[current];
  const isLast = current === questions.length - 1;

  if (!q) {
    return (
      <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-4 rounded-[28px] border-4 border-orange-200 bg-white/95 px-6 py-8 text-center shadow-[0_18px_45px_rgba(78,45,21,0.16)]">
        <div className="flex size-16 items-center justify-center rounded-full bg-orange-100 text-orange-600">
          <AlertCircle size={32} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#2e1d10]">Misi durung siap</h2>
          <p className="mt-2 text-sm font-bold leading-relaxed text-[#7a5030]">
            Data misi kanggo tingkat iki durung kebaca. Bali menyang pilihan misi banjur coba maneh.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-2xl bg-orange-500 px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-md transition hover:-translate-y-0.5 active:translate-y-0"
        >
          Bali Pilih Misi
        </button>
      </div>
    );
  }

  const handleCorrectWithRef = () => {
    scoreRef.current += 1;
    setScore(scoreRef.current);
  };

  const handleComposeScore = (points) => {
    const prev = pointsPerQuestion.current[q.id] ?? 0;
    if (points > prev) {
      const diff = points - prev;
      pointsPerQuestion.current[q.id] = points;
      scoreRef.current += diff;
      setScore(scoreRef.current);
    }
  };

  const handleReview = (entry) => {
    reviewRef.current = mergeReviewEntry(reviewRef.current, entry);
  };

  const handleNextWithFinish = () => {
    if (isLast) {
      onFinish(scoreRef.current, reviewRef.current);
    } else {
      setCurrent(c => c + 1);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto flex w-full max-w-[780px] flex-col gap-5 px-4 py-2">
      <QuizTopBar
        level={level}
        current={current}
        total={questions.length}
        score={score}
        onBack={onBack}
      />

      {q.type === 'fill' && (
        <FillQuestion
          key={q.id}
          q={q}
          level={level}
          questionNum={current + 1}
          onCorrect={handleCorrectWithRef}
          onWrong={() => {}}
          onReview={handleReview}
          onNext={handleNextWithFinish}
          isLast={isLast}
        />
      )}

      {q.type === 'compose' && (
        <ComposeQuestion
          key={q.id}
          q={q}
          level={level}
          questionNum={current + 1}
          onScore={handleComposeScore}
          onReview={handleReview}
          onNext={handleNextWithFinish}
          isLast={isLast}
        />
      )}
    </div>
  );
}



// ── Result screen ────────────────────────────────────────────────────────────
function ResultScreen({ level, score, review = [], onRetry, onBack }) {
  const playClick = useClickSound();
  const zepLevel = zepGameLevels.find((item) => item.levelId === level.id && item.url);
  const maxScore = getLevelMaxScore(level);
  const displayScore = clampScore(score, maxScore);
  const pct = maxScore > 0 ? Math.round((displayScore / maxScore) * 100) : 0;
  const starsEarned = pct >= 80 ? 3 : pct >= 50 ? 2 : pct > 0 ? 1 : 0;
  const isSuccess = pct >= 70;
  const isCompose = level.type === 'theme-select' || level.questions[0]?.type === 'compose';
  const reviewItems = Array.isArray(review) ? review : [];
  const wrongReviews = reviewItems.filter((item) => !item.isCorrect);
  const recommendations = Array.from(
    new Set(wrongReviews.map((item) => item.recommendation).filter(Boolean))
  );

  const resultFeedback = pct === 100
    ? { msg: 'Luar biasa! Sampurna! 🏆', sub: 'Kowe pancen jago banget!' }
    : pct >= 80
    ? { msg: 'Apik banget! 🌟', sub: 'Meh sampurna, terusna sinau!' }
    : pct >= 70
    ? { msg: 'Ayo semangat, coba lagi!', sub: 'Nilaimu wis lumayan, nanging isih bisa luwih apik.' }
    : pct >= 50
    ? { msg: 'Lumayan! 👍', sub: 'Isih ana sing kudu dilatih maneh.' }
    : { msg: 'Kamu gagal, coba lagi!', sub: 'Sinau maneh banjur coba saka awal.' };

  const s = (delay) => ({ animation: `cardSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}s both` });
  const polishedFeedback = pct === 100
    ? { msg: 'Sampurna!', sub: 'Kabeh wangsulanmu wis trep. Pertahankan cara sinau iki.' }
    : pct >= 80
    ? { msg: 'Apik banget!', sub: 'Asilmu wis kuwat, tinggal ngencengi bagean cilik sing durung trep.' }
    : pct >= 70
    ? { msg: 'Wis lulus.', sub: 'Nilaimu wis cukup, nanging isih ana bagean sing bisa dirapikake.' }
    : pct >= 50
    ? { msg: 'Lumayan.', sub: 'Ana sawetara konsep sing perlu diwaca maneh sadurunge nyoba maneh.' }
    : { msg: 'Ayo coba maneh.', sub: 'Baleni materi kunci dhisik, banjur kerjakake maneh kanthi luwih tenang.' };

  return (
    <div
      className="mx-auto flex w-full max-w-[860px] flex-col items-center gap-5 px-4 py-2"
      style={{ animation: 'resultContentIn 0.4s ease-out both' }}
    >
        {/* ── Ikon + glow ── */}
        <div className="relative flex flex-col items-center gap-1" style={s(0)}>
          {/* Glow halo */}
          <div
            className="absolute rounded-full"
            style={{
              width: '160px', height: '160px',
              background: isSuccess
                ? `radial-gradient(circle, ${level.color}88 0%, transparent 70%)`
                : 'radial-gradient(circle, rgba(100,116,139,0.4) 0%, transparent 70%)',
              filter: 'blur(20px)',
              top: '-16px',
            }}
          />
          <div
            className="relative flex size-28 items-center justify-center rounded-full border-4 shadow-2xl"
            style={{
              borderColor: 'rgba(255,255,255,0.4)',
              background: `linear-gradient(135deg, ${level.color}cc, ${level.color}66)`,
              boxShadow: `0 0 0 8px ${level.color}22, 0 20px 60px rgba(0,0,0,0.35)`,
              animation: 'iconSpring 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.05s both',
            }}
          >
            <Trophy
              size={54}
              aria-hidden="true"
              className="text-[#fff7d6]"
              strokeWidth={2.6}
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.28))' }}
            />
          </div>
        </div>

        {/* ── Bintang ── */}
        <div className="flex gap-2" style={s(0.08)} aria-label={`${starsEarned} saka 3 bintang`}>
          {[0, 1, 2].map(i => (
            <Star
              key={i}
              aria-hidden="true"
              style={{
                opacity: 0,
                animation: i < starsEarned
                  ? `starPop 0.55s cubic-bezier(0.34,1.56,0.64,1) ${0.1 + i * 0.12}s both`
                  : `resultSubFadeUp 0.4s ease-out ${0.1 + i * 0.12}s both`,
                filter: i < starsEarned ? 'drop-shadow(0 4px 10px rgba(246,183,60,0.35))' : 'none',
              }}
              size={30}
              fill={i < starsEarned ? '#f6b73c' : 'transparent'}
              strokeWidth={2.6}
              className={i < starsEarned ? 'text-[#f6b73c]' : 'text-[#d7c8b7]'}
            />
          ))}
        </div>

        {/* ── Skor besar ── */}
        <div style={s(0.15)}>
          <div
            className="text-center text-[clamp(3.2rem,9vw,5rem)] font-black leading-none text-[#2e1d10]"
            style={{ filter: `drop-shadow(0 4px 12px ${level.color}33)` }}
          >
            {displayScore}
            <span className="text-[0.45em] text-[#9b8a78]">/{maxScore}</span>
          </div>
          <div className="mt-1 text-center text-base font-black tracking-wide text-[#7a5a3a]">
            {pct}% {isCompose ? 'skor' : 'bener'}
          </div>
        </div>

        {/* ── Progress bar animasi ── */}
        <div className="w-full max-w-[640px]" style={s(0.22)}>
          <div className="h-3 w-full overflow-hidden rounded-full border border-white/70 bg-[#eadfce] shadow-inner">
            <div
              className="h-full rounded-full"
              style={{
                '--target-width': `${pct}%`,
                background: isSuccess
                  ? `linear-gradient(90deg, ${level.color}, color-mix(in srgb, ${level.color} 72%, #f6b73c))`
                  : 'linear-gradient(90deg, #9ca3af, #6b7280)',
                animation: 'progressFill 1s cubic-bezier(0.16,1,0.3,1) 0.3s both',
                boxShadow: isSuccess ? `0 0 14px ${level.color}66` : 'none',
              }}
            />
          </div>
        </div>

        {/* ── Feedback card ── */}
        <div
          className="w-full rounded-[24px] border border-[#eadfce] bg-[#fffaf2] px-6 py-5 text-center shadow-[0_14px_34px_rgba(79,49,26,0.10)]"
          style={s(0.28)}
        >
          <p className="text-xl font-black text-[#2e1d10]">
            {polishedFeedback.msg}
          </p>
          <p className="mx-auto mt-1 max-w-xl text-sm font-semibold leading-relaxed text-[#7a5a3a]">{polishedFeedback.sub}</p>
        </div>

        {/* Detail evaluasi */}
        {reviewItems.length > 0 && (
          <div
            className="w-full rounded-[26px] border border-[#eadfce] bg-[#fffdf8] p-4 text-left shadow-[0_16px_36px_rgba(79,49,26,0.10)] sm:p-5"
            style={s(0.33)}
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b7791f]">Tinjauan Wangsulan</p>
                <h3 className="text-xl font-black text-[#2e1d10]">
                  {wrongReviews.length > 0 ? `${wrongReviews.length} bagian perlu dibenahi` : 'Kabeh wangsulan wis apik'}
                </h3>
              </div>
              <span className="rounded-full border border-[#eadfce] bg-[#fff7ed] px-3 py-1 text-xs font-black text-[#7a5030]">
                {reviewItems.length - wrongReviews.length}/{reviewItems.length} tuntas
              </span>
            </div>

            {wrongReviews.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold leading-relaxed text-emerald-800">
                Ora ana wangsulan salah. Terusna latihan gawe parikan supaya luwih lancar lan kreatif.
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                {wrongReviews.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-[22px] border border-[#eadfce] bg-white p-4 text-[#2e1d10] shadow-[0_10px_24px_rgba(79,49,26,0.07)]"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-full border border-[#eadfce] bg-[#fffaf2] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#7a5030]">
                        {item.type === 'compose' ? `Evaluasi ${item.title}` : item.title}
                      </span>
                      {item.type === 'compose' && (
                        <span className="rounded-full border border-amber-200 bg-[#fff7ed] px-3 py-1 text-xs font-black text-amber-800 shadow-sm">
                          Skor {item.points}/{item.maxPoints}
                        </span>
                      )}
                    </div>

                    <div className="grid gap-3 text-sm font-semibold leading-relaxed">
                      <div>
                        <p className="mb-1 text-[0.68rem] font-black uppercase tracking-widest text-[#b7791f]">Tantangan</p>
                        <p className="whitespace-pre-line rounded-xl border border-[#f1e6d6] bg-[#fffaf2] px-3 py-2">{item.prompt}</p>
                      </div>
                      {item.type === 'compose' && item.criteria?.length > 0 && (
                        <div>
                          <p className="mb-2 text-[0.68rem] font-black uppercase tracking-widest text-[#7a5030]">Rubrik Penilaian</p>
                          <div className="grid gap-2 sm:grid-cols-3">
                            {item.criteria.map((criterion) => (
                              <div
                                key={criterion.label}
                                className={`rounded-xl border bg-white px-3 py-2 shadow-sm ${
                                  criterion.ok ? 'border-emerald-100' : 'border-amber-200'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {criterion.ok ? (
                                    <CheckCircle2 size={15} className="shrink-0 text-emerald-600" aria-hidden="true" />
                                  ) : (
                                    <AlertCircle size={15} className="shrink-0 text-amber-600" aria-hidden="true" />
                                  )}
                                  <p className="text-[0.68rem] font-black uppercase tracking-wider text-[#7a5030]">{criterion.label}</p>
                                </div>
                                <p className="mt-1 text-xs font-bold leading-snug text-[#2e1d10]">{criterion.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="mb-1 text-[0.68rem] font-black uppercase tracking-widest text-red-600">Wangsulanmu</p>
                          <p className="min-h-[72px] whitespace-pre-line rounded-xl border border-red-100 bg-white px-3 py-2 text-[#6f2a1d]">
                            {item.userAnswer || 'Durung ana wangsulan'}
                          </p>
                        </div>
                        <div>
                          <p className="mb-1 text-[0.68rem] font-black uppercase tracking-widest text-emerald-700">
                            {item.type === 'compose' ? 'Kriteria Bener' : 'Wangsulan Bener'}
                          </p>
                          <p className="min-h-[72px] whitespace-pre-line rounded-xl border border-emerald-100 bg-white px-3 py-2 text-emerald-800">
                            {item.correctAnswer}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="mb-1 text-[0.68rem] font-black uppercase tracking-widest text-[#2f7c8c]">Katrangan</p>
                        <p className="rounded-xl border border-[#dbeafe] bg-white px-3 py-2 text-[#24566a]">{item.explanation}</p>
                      </div>
                      {item.recommendation && (
                        <div>
                          <p className="mb-1 text-[0.68rem] font-black uppercase tracking-widest text-amber-700">Rekomendasi Ngulang</p>
                          <p className="rounded-xl border border-amber-100 bg-[#fffaf2] px-3 py-2 text-amber-900">{item.recommendation}</p>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}

            {recommendations.length > 1 && (
              <div className="mt-4 rounded-2xl border border-[#eadfce] bg-[#fffaf2] px-4 py-3 text-sm font-bold leading-relaxed text-[#7a5030]">
                <p className="mb-2 text-xs font-black uppercase tracking-widest text-amber-600">Ringkesan Materi Baleni</p>
                <ul className="grid gap-1.5">
                  {recommendations.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ── Parikan hadiah ── */}
        {pct >= 80 && (
          <div
            className="w-full rounded-[24px] border border-[#e8c77c] px-5 py-4 text-center shadow-[0_12px_28px_rgba(146,95,22,0.10)]"
            style={{
              background: 'linear-gradient(135deg, #fffaf0, #fff3d7)',
              ...s(0.36),
            }}
          >
            <p className="text-xs font-black uppercase tracking-widest text-amber-600">🎁 Parikan Hadiah</p>
            <p className="mt-2 text-sm font-bold italic text-amber-900 leading-relaxed">
              "Tuku kupat ning pinggir dalan,<br />
              <span className="text-amber-700">eling pepeling aja kesusu tumindak."</span>
            </p>
          </div>
        )}

        {/* ── Tombol aksi ── */}
        <div className="flex w-full flex-col gap-3 sm:flex-row" style={s(0.44)}>
          <button
            type="button"
            onClick={() => { playClick(); onRetry(); }}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 bg-white py-4 text-base font-black uppercase text-[#2e1d10] shadow-sm transition-all hover:bg-gray-50 hover:-translate-y-1 active:translate-y-px active:scale-98 active:shadow-md"
          >
            <RotateCcw size={18} aria-hidden="true" />
            Coba Maneh
          </button>
          <button
            type="button"
            onClick={() => { playClick(); onBack(); }}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-base font-black uppercase text-white transition-all hover:-translate-y-1 active:translate-y-px active:scale-98 active:shadow-md"
            style={{
              background: `linear-gradient(135deg, ${level.color}, ${level.color}bb)`,
              border: '2px solid rgba(255,255,255,0.3)',
              boxShadow: `0 4px 24px ${level.color}66, 0 0 0 1px rgba(255,255,255,0.1)`,
            }}
          >
            <Trophy size={18} aria-hidden="true" />
            Pilih Misi
          </button>
        </div>

        {zepLevel && (
          <a
            href={zepLevel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-orange-200 bg-white/95 px-5 py-3 text-sm font-black uppercase tracking-wide text-orange-600 shadow-md transition hover:-translate-y-0.5 hover:bg-orange-50 active:translate-y-0 sm:w-auto"
            style={s(0.5)}
          >
            Lanjut tantangan ing {zepLevel.type}
            <ExternalLink size={16} aria-hidden="true" />
          </a>
        )}
      </div>
  );
}

// ── Main GamePage ────────────────────────────────────────────────────────────
function ZepGameOnlyScreen() {
  const playClick = useClickSound();
  const missions = zepGameLevels.filter((mission) => mission.url);
  const hasSpace = Boolean(zepGameHub.spaceUrl);
  const missionIcons = [Landmark, MapPin, Waves];

  if (missions.length === 0 && !hasSpace) return null;

  return (
    <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-6 px-4 py-2">
      <header className="overflow-hidden rounded-[32px] border-4 border-white/85 bg-[#087f8c] shadow-[0_22px_55px_rgba(15,62,78,0.28)]">
        <img
          src="/assets/game/surabaya/banner-parikan.png"
          alt="Banner Parikan Arek Suroboyo di Tugu Pahlawan"
          className="aspect-video w-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
        <div className="sr-only">
          <p>Jelajah Kutha Surabaya. Petualangan telung pos.</p>
          <h1>Ekspedisi Parikan Arek Suroboyo</h1>
          <p>Rampungake Sambung Parikan, Rakit Parikan, lan Pujangga Muda kanggo nglumpukake telung lencana kutha.</p>
        </div>
      </header>

      {hasSpace && (
        <a
          href={zepGameHub.spaceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={playClick}
          className="group relative overflow-hidden rounded-[28px] border-4 border-white/80 bg-orange-500 px-6 py-5 text-white shadow-[0_18px_45px_rgba(234,88,12,0.26)] transition hover:-translate-y-1 active:translate-y-0"
        >
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/10" />
          <span className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>
              <span className="block text-xs font-black uppercase tracking-[0.18em] text-white/80">Ruang Petualangan</span>
              <span className="mt-1 block text-2xl font-black leading-tight">{zepGameHub.title}</span>
              <span className="mt-1 block text-sm font-bold leading-relaxed text-white/90">{zepGameHub.description}</span>
            </span>
            <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black uppercase tracking-wide text-orange-600 shadow-md">
              Mlebu Space
              <ExternalLink size={16} aria-hidden="true" />
            </span>
          </span>
        </a>
      )}

      <section className="mx-auto w-full max-w-[820px] rounded-[26px] border-4 border-white/80 bg-[#fffaf1] p-5 text-center shadow-[0_16px_38px_rgba(78,45,21,0.12)]">
        <div className="flex flex-col items-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#d9f3ef] text-[#087f8c]">
            <Info size={23} aria-hidden="true" />
          </div>
          <div className="mt-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#087f8c]">Pituduh Ekspedisi</p>
            <p className="mx-auto mt-2 max-w-2xl text-sm font-bold leading-relaxed text-[#6b4428]">
              Gunakake jeneng peserta kanthi format <strong>Nama_Kelas_Absen</strong>. Saben tombol misi bakal mbukak arena <i>ZEP</i> ing tab anyar.
              Rampungake kanthi urut saka Sambung Parikan, Rakit Parikan, banjur Pujangga Muda.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-1 px-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#087f8c]">Peta Ekspedisi</p>
            <h2 className="mt-1 text-2xl font-black text-[#3f2a1b]">Pilih pos tantanganmu</h2>
          </div>
          <p className="text-xs font-bold text-[#7a5a43]">Urutan sing disaranake: Pos 1 → Pos 2 → Pos 3</p>
        </div>

        <div className="relative grid gap-4 sm:grid-cols-3">
          <div className="pointer-events-none absolute left-[16.5%] right-[16.5%] top-9 hidden border-t-4 border-dashed border-[#efb942]/55 sm:block" aria-hidden="true" />
        {missions.map((mission, index) => {
          const level = gameLevels.find((item) => item.id === mission.levelId) ?? gameLevels[index];
          const color = level?.color ?? '#f97316';
          const label = level?.label ?? `Pos ${index + 1}`;
          const MissionIcon = missionIcons[index] ?? MapPin;

          return (
            <a
              key={mission.levelId}
              href={mission.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playClick}
              aria-label={`Miwiti ${mission.title} ing ZEP`}
              className="group relative flex min-h-[470px] flex-col overflow-hidden rounded-[28px] border-4 border-white/80 bg-white p-5 text-[#3f2a1b] shadow-[0_16px_42px_rgba(78,45,21,0.16)] transition hover:-translate-y-2 hover:shadow-[0_22px_50px_rgba(78,45,21,0.24)] active:translate-y-0"
              style={{
                boxShadow: `0 16px 42px ${level?.shadow ?? 'rgba(78,45,21,0.18)'}`,
              }}
            >
              <span className="relative -mx-5 -mt-5 mb-5 block overflow-hidden border-b-4 border-white bg-[#dcefe9]">
                <img
                  src={mission.image}
                  alt={`Ilustrasi ${mission.location}`}
                  className="aspect-video w-full object-cover transition duration-500 group-hover:scale-[1.035]"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                <span className="absolute right-3 top-3 rounded-full border border-white/80 bg-white/90 px-3 py-1 text-[0.62rem] font-black uppercase tracking-widest shadow-sm backdrop-blur-sm" style={{ color }}>
                  {mission.posLabel ?? label}
                </span>
              </span>

              <span className="relative flex flex-1 flex-col">
                <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.13em]" style={{ color }}>
                  <MissionIcon size={15} aria-hidden="true" />
                  {mission.location}
                </span>
                <span className="mt-2 block text-2xl font-black leading-tight text-[#3f2a1b]">{mission.title}</span>
                <span className="mt-3 block text-xs font-bold leading-relaxed text-[#76543c]">
                  {mission.description}
                </span>

                <span className="mt-4 flex flex-wrap gap-2">
                  {mission.keywords?.map((keyword) => (
                    <span key={keyword} className="rounded-full border border-[#ead8c8] bg-[#fffaf4] px-2.5 py-1 text-[0.62rem] font-black text-[#79563d]">
                      {keyword}
                    </span>
                  ))}
                </span>

                <span className="mt-auto flex items-center gap-2 pt-5 text-xs font-black" style={{ color }}>
                  <ShieldCheck size={17} aria-hidden="true" />
                  Hadiah: {mission.badge}
                </span>
              </span>

              <span className="relative mt-4 flex justify-center overflow-visible px-3 py-2 transition group-hover:scale-[1.025] group-active:scale-[0.98]">
                <img
                  src="/assets/game/surabaya/button-miwiti.png"
                  alt=""
                  className="h-auto w-[240px] max-w-full drop-shadow-lg"
                />
                <span className="sr-only">Miwiti misi ing ZEP</span>
              </span>
            </a>
          );
        })}
        </div>
      </section>

    </div>
  );
}

export function GamePage({ studentStorageId }) {
  const zepMissionsAvailable = Boolean(zepGameHub.spaceUrl) || zepGameLevels.some((mission) => mission.url);

  if (zepMissionsAvailable) {
    return <ZepGameOnlyScreen />;
  }

  const [screen, setScreen] = useState('select');
  const [activeLevel, setActiveLevel] = useState(null);
  const [lastScore, setLastScore] = useState(0);
  const [lastReview, setLastReview] = useState([]);
  const [level3Questions, setLevel3Questions] = useState(null); // soal dinamis tingkat 3
  const [scores, setScores] = useStudentLocalStorage('javanesia-game-scores', {});
  const [savedResults, setSavedResults] = useStudentLocalStorage('javanesia-game-results', {});
  const { prepareResultSounds, playApplause, playEncourage, playFailed } = useResultSound();

  useEffect(() => {
    setScreen('select');
    setActiveLevel(null);
    setLastScore(0);
    setLastReview([]);
    setLevel3Questions(null);
  }, [studentStorageId]);

  const handleSelectLevel = (level) => {
    prepareResultSounds();
    setActiveLevel(level);
    setLastReview([]);
    // Tingkat 3: tampilkan layar pilih tema dulu
    if (level.type === 'theme-select') {
      setScreen('theme-select');
    } else {
      setScreen('quiz');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dipanggil setelah user memilih tema di tingkat 3
  const handleThemeStart = (questions) => {
    prepareResultSounds();
    setLevel3Questions(questions);
    setLastReview([]);
    setScreen('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinish = (score, review = []) => {
    const maxScore = getLevelMaxScore(activeLevel);
    const finalScore = clampScore(score, maxScore);
    const pct = maxScore > 0 ? Math.round((finalScore / maxScore) * 100) : 0;
    
    setLastScore(finalScore);
    setLastReview(review);
    setScores((prev) => ({
      ...prev,
      [activeLevel.id]: Math.max(prev[activeLevel.id] ?? 0, finalScore),
    }));
    // Simpan hasil terakhir per level ke localStorage
    setSavedResults((prev) => ({
      ...prev,
      [activeLevel.id]: { score: finalScore, review },
    }));
    setLevel3Questions(null);
    setScreen('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Delay sebentar supaya sound soal terakhir (crowd/feedback) wis rampung
    // sak durunge result sound dimainake. Browser bisa mblokir yen too many audio.
    window.setTimeout(() => {
      try {
        if (pct === 100) playApplause();
        else if (pct >= 70) playEncourage();
        else playFailed();
      } catch (error) {
        console.warn('Result sound gagal diputar.', error);
      }
    }, 700);
  };

  const handleRetry = () => {
    // Tingkat 3: kembali ke pilih tema lagi
    setLastReview([]);
    if (activeLevel?.type === 'theme-select') {
      setLevel3Questions(null);
      setScreen('theme-select');
    } else {
      setScreen('quiz');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setActiveLevel(null);
    setLastReview([]);
    setLevel3Questions(null);
    setScreen('select');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      'Reset skor game kanggo siswa iki?\n\nData skor lan hasil game ing identitas sing lagi aktif bakal dibusak.'
    );

    if (!confirmed) return;

    setScores({});
    setSavedResults({});
    setScreen('select');
    setActiveLevel(null);
    setLastReview([]);
    setLevel3Questions(null);
  };

  // Buka hasil tersimpan dari halaman pilih tingkat
  const handleViewResult = (level, saved) => {
    setActiveLevel(level);
    setLastScore(saved.score);
    setLastReview(saved.review ?? []);
    setScreen('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      {screen === 'select' && (
        <LevelSelect
          scores={scores}
          savedResults={savedResults}
          onSelect={handleSelectLevel}
          onReset={handleReset}
          onViewResult={handleViewResult}
        />
      )}
      {screen === 'theme-select' && activeLevel && (
        <ThemeSelectScreen
          level={activeLevel}
          onStart={handleThemeStart}
          onBack={handleBack}
        />
      )}
      {screen === 'quiz' && activeLevel && (
        <QuizScreen
          level={activeLevel}
          questions={level3Questions ?? undefined}
          onFinish={handleFinish}
          onBack={activeLevel.type === 'theme-select'
            ? () => { setLevel3Questions(null); setLastReview([]); setScreen('theme-select'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
            : handleBack
          }
        />
      )}
      {screen === 'result' && activeLevel && (
        <ResultScreen
          level={activeLevel}
          score={lastScore}
          review={lastReview}
          onRetry={handleRetry}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
