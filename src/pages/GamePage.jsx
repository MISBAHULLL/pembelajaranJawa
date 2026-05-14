import React, { useState, useRef, useEffect } from 'react';
import { Star, Trophy, RotateCcw, ChevronRight, CheckCircle2, XCircle, Sparkles, Zap, Target, PenLine, AlertCircle, Info } from 'lucide-react';
import { gameLevels } from '../data/gameParikan.js';
import { useClickSound } from '../hooks/useClickSound.js';
import { useFeedbackSound } from '../hooks/useFeedbackSound.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

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
function LevelSelect({ scores, onSelect, onReset }) {
  const playClick = useClickSound();
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const maxScore = gameLevels.reduce((a, l) => a + l.questions.length, 0);
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
          Pilih Tingkat
        </h1>
        <p className="mt-2 text-base font-bold text-[#2e1d10] drop-shadow-sm">
          Uji kemampuanmu ngerti lan ngrakit parikan!
        </p>

        {hasAnyScore && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-5 py-2 text-sm font-black text-yellow-900 shadow-lg">
              <Trophy size={16} aria-hidden="true" />
              Skor Total: {totalScore} / {maxScore}
            </div>
            <button
              type="button"
              onClick={() => { playClick(); onReset(); }}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-white/80 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-wide text-gray-500 shadow-md backdrop-blur-sm transition hover:bg-red-50 hover:text-red-500 hover:border-red-200"
            >
              <RotateCcw size={12} aria-hidden="true" />
              Reset Skor
            </button>
          </div>
        )}
      </header>

      <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-3">
        {gameLevels.map((level, idx) => {
          const best = scores[level.id] ?? 0;
          const total = level.questions.length;
          const isCompose = level.questions[0]?.type === 'compose';
          const maxScore = isCompose ? total * 10 : total;
          const pct = maxScore > 0 ? Math.round((best / maxScore) * 100) : 0;
          const starsEarned = pct >= 80 ? 3 : pct >= 50 ? 2 : pct > 0 ? 1 : 0;
          const hasQuestions = total > 0;
          // Unlock: skor level sebelumnya >= 70% dari skor maksimalnya
          const prevLevel = gameLevels[idx - 1];
          const prevMax = prevLevel
            ? (prevLevel.questions[0]?.type === 'compose'
                ? prevLevel.questions.length * 10
                : prevLevel.questions.length)
            : 0;
          const unlocked = idx === 0 || (scores[gameLevels[idx - 1].id] ?? 0) >= Math.ceil(prevMax * 0.7);
          const isAvailable = hasQuestions && unlocked;

          return (
            <button
              key={level.id}
              type="button"
              disabled={!isAvailable}
              onClick={() => { playClick(); onSelect(level); }}
              className={`group relative flex flex-col items-center gap-4 overflow-hidden rounded-3xl border-4 p-6 text-center font-black text-white shadow-2xl transition-all duration-300
                ${isAvailable
                  ? 'cursor-pointer hover:-translate-y-2 hover:scale-[1.03] active:translate-y-0 active:scale-100'
                  : 'cursor-not-allowed opacity-50 grayscale'
                }`}
              style={{
                borderColor: `${level.color}cc`,
                background: `linear-gradient(145deg, ${level.color}dd, ${level.color}88)`,
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

              <p className="text-xs font-semibold leading-snug text-white/75">{level.description}</p>

              {best > 0 && total > 0 && (
                <div className="w-full">
                  <ProgressBar current={best} total={maxScore} color="rgba(255,255,255,0.9)" />
                  <p className="mt-1 text-xs font-bold text-white/70">Skor terbaik: {best}/{maxScore}</p>
                </div>
              )}

              {isAvailable && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-black uppercase tracking-wide shadow-md transition group-hover:shadow-lg"
                  style={{ color: level.color }}
                >
                  {best > 0 ? 'Main Lagi' : 'Mulai'}
                  <ChevronRight size={14} aria-hidden="true" />
                </span>
              )}

              {!hasQuestions && (
                <span className="text-xs font-bold text-white/60">Soal menyusul...</span>
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
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => { playClick(); onBack(); }}
          className="rounded-xl border-2 border-white bg-white/95 px-3 py-2 text-xs font-black uppercase text-[#2e1d10] shadow-md transition hover:bg-white hover:-translate-y-0.5"
        >
          ← Kembali
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
          <span>Soal {current + 1} saka {total}</span>
          <span>{Math.round((current / total) * 100)}% rampung</span>
        </div>
        <ProgressBar current={current} total={total} color={level.color} />
      </div>
    </div>
  );
}

// ── Fill question (isian) ────────────────────────────────────────────────────
function FillQuestion({ q, level, questionNum, onCorrect, onWrong, onNext, isLast }) {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'correct' | 'wrong'
  const [warning, setWarning] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const inputRef = useRef(null);
  const feedbackRef = useRef(null);
  const { playCorrect, playWrong } = useFeedbackSound();
  const playClick = useClickSound();

  useEffect(() => {
    // Reset state saat soal berganti
    setInput('');
    setStatus('idle');
    setWarning('');
    setShowExplanation(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [q.id]);

  const handleSubmit = () => {
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

    if (isCorrect) {
      setStatus('correct');
      setShowExplanation(true);
      playCorrect();
      onCorrect();
    } else {
      setStatus('wrong');
      setShowExplanation(true);
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
              className="rounded-2xl border-3 px-5 py-3 text-sm font-black uppercase text-white shadow-md transition hover:-translate-y-0.5 active:translate-y-0"
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
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-4 border-white/80 py-4 text-lg font-black uppercase text-white shadow-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl active:translate-y-0"
          style={{ background: `linear-gradient(135deg, ${level.color}, ${level.color}bb)` }}
        >
          {isLast
            ? <><Trophy size={20} aria-hidden="true" /> Lihat Hasil</>
            : <>Soal Sabanjure <ChevronRight size={20} aria-hidden="true" /></>
          }
        </button>
      )}
    </div>
  );
}

// ── Compose question (nulis parikan) ─────────────────────────────────────────
function ComposeQuestion({ q, level, questionNum, onScore, onNext, isLast }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [bestPoints, setBestPoints] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const { playCorrect, playWrong } = useFeedbackSound();
  const playClick = useClickSound();
  const feedbackRef = useRef(null);

  useEffect(() => {
    setText('');
    setResult(null);
    setBestPoints(0);
    setSubmitted(false);
  }, [q.id]);

  const handleSubmit = () => {
    if (!text.trim()) {
      playWrong();
      return;
    }
    const scoring = scoreCompose(text, q.keyword);
    setResult(scoring);
    setSubmitted(true);
    if (scoring.points > bestPoints) {
      setBestPoints(scoring.points);
      onScore(scoring.points);
    }
    if (scoring.points === 10) playCorrect();
    else if (scoring.points >= 6) playClick();
    else playWrong();
    setTimeout(() => feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
  };

  const handleRevise = () => {
    setResult(null);
    setSubmitted(false);
  };

  const handleNext = () => { playClick(); onNext(); };

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  return (
    <div className="flex flex-col gap-4">
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
            className="rounded-2xl py-3 text-sm font-black uppercase text-white shadow-md transition hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
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
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-gray-400">Hasil Penilaian:</p>
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
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-white/80 bg-white/80 py-3 text-sm font-black uppercase text-[#7a4f2e] shadow-md transition hover:-translate-y-0.5"
              >
                <RotateCcw size={15} aria-hidden="true" />
                Revisi
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-4 border-white/80 py-3 text-sm font-black uppercase text-white shadow-xl transition hover:-translate-y-1"
              style={{ background: `linear-gradient(135deg, ${level.color}, ${level.color}bb)` }}
            >
              {isLast ? <><Trophy size={16} /> Lihat Hasil</> : <>Soal Sabanjure <ChevronRight size={16} /></>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Quiz screen (orchestrator) ───────────────────────────────────────────────
function QuizScreen({ level, onFinish, onBack }) {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  // Untuk compose: simpan poin per soal
  const pointsPerQuestion = useRef({});

  const q = level.questions[current];
  const isLast = current === level.questions.length - 1;

  // Dipanggil saat jawaban fill benar
  const handleCorrectWithRef = () => {
    scoreRef.current += 1;
    setScore(scoreRef.current);
  };

  // Dipanggil saat compose submit — simpan poin terbaik per soal
  const handleComposeScore = (points) => {
    const prev = pointsPerQuestion.current[q.id] ?? 0;
    if (points > prev) {
      const diff = points - prev;
      pointsPerQuestion.current[q.id] = points;
      scoreRef.current += diff;
      setScore(scoreRef.current);
    }
  };

  const handleNextWithFinish = () => {
    if (isLast) {
      onFinish(scoreRef.current);
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
        total={level.questions.length}
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
          onNext={handleNextWithFinish}
          isLast={isLast}
        />
      )}
    </div>
  );
}

// ── Result screen ────────────────────────────────────────────────────────────
function ResultScreen({ level, score, onRetry, onBack }) {
  const playClick = useClickSound();
  const total = level.questions.length;
  // Tingkat 2 (compose): skor maks = 10 * jumlah soal
  const isCompose = level.questions[0]?.type === 'compose';
  const maxScore = isCompose ? total * 10 : total;
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const starsEarned = pct >= 80 ? 3 : pct >= 50 ? 2 : pct > 0 ? 1 : 0;

  const feedback =
    pct === 100 ? { msg: 'Luar biasa! Sampurna! 🏆', sub: 'Kowe pancen jago banget!' } :
    pct >= 80   ? { msg: 'Apik banget! 🌟', sub: 'Meh sampurna, terusna sinau!' } :
    pct >= 50   ? { msg: 'Lumayan! 👍', sub: 'Isih ana sing kudu dilatih maneh.' } :
                  { msg: 'Ayo coba maneh! 💪', sub: 'Sinau maneh banjur coba maneh ya!' };

  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-col items-center gap-6 px-4 py-2 text-center">
      <div
        className="relative flex size-32 items-center justify-center rounded-full border-4 border-white/50 shadow-2xl"
        style={{ background: `radial-gradient(circle, ${level.color}cc, ${level.color}66)` }}
      >
        <span className="text-6xl animate-[bounceIn_0.6s_ease-out]" aria-hidden="true">
          {pct === 100 ? '🏆' : pct >= 80 ? '🌟' : pct >= 50 ? '👍' : '💪'}
        </span>
      </div>

      <StarRating count={3} filled={starsEarned} size={36} />

      <div>
        <div
          className="text-[clamp(3rem,8vw,5rem)] font-black leading-none text-white drop-shadow-2xl"
          style={{ WebkitTextStroke: '4px rgba(0,0,0,0.2)', paintOrder: 'stroke fill' }}
        >
          {score}<span className="text-[0.5em] text-white/60">/{maxScore}</span>
        </div>
        <div className="mt-1 text-lg font-black text-white/80">{pct}% {isCompose ? 'skor' : 'bener'}</div>
      </div>

      <div className="rounded-2xl border-2 border-white bg-white px-6 py-4 shadow-lg">
        <p className="text-xl font-black text-[#2e1d10]">{feedback.msg}</p>
        <p className="mt-1 text-sm font-semibold text-gray-600">{feedback.sub}</p>
      </div>

      {pct >= 80 && (
        <div className="w-full rounded-2xl border-2 border-yellow-400 bg-yellow-50 px-5 py-4 shadow-md">
          <p className="text-xs font-black uppercase tracking-widest text-yellow-700">🎁 Parikan Hadiah</p>
          <p className="mt-2 text-sm font-bold italic text-[#2e1d10] leading-relaxed">
            "Tuku kupat ning pinggir dalan,<br />
            <span className="text-orange-600">eling pepeling aja kesusu tumindak."</span>
          </p>
        </div>
      )}

      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => { playClick(); onRetry(); }}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-4 border-gray-300 bg-white py-4 text-base font-black uppercase text-gray-700 shadow-lg transition hover:-translate-y-1 hover:bg-gray-50"
        >
          <RotateCcw size={18} aria-hidden="true" />
          Coba Maneh
        </button>
        <button
          type="button"
          onClick={() => { playClick(); onBack(); }}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-4 border-white/80 py-4 text-base font-black uppercase text-white shadow-xl transition hover:-translate-y-1"
          style={{ background: `linear-gradient(135deg, ${level.color}, ${level.color}bb)` }}
        >
          <Trophy size={18} aria-hidden="true" />
          Pilih Tingkat
        </button>
      </div>
    </div>
  );
}

// ── Main GamePage ────────────────────────────────────────────────────────────
export function GamePage() {
  const [screen, setScreen] = useState('select');
  const [activeLevel, setActiveLevel] = useState(null);
  const [lastScore, setLastScore] = useState(0);
  const [scores, setScores] = useLocalStorage('javanesia-game-scores', {});

  const handleSelectLevel = (level) => {
    setActiveLevel(level);
    setScreen('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinish = (score) => {
    setLastScore(score);
    setScores((prev) => ({
      ...prev,
      [activeLevel.id]: Math.max(prev[activeLevel.id] ?? 0, score),
    }));
    setScreen('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetry = () => {
    setScreen('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setActiveLevel(null);
    setScreen('select');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setScores({});
    setScreen('select');
    setActiveLevel(null);
  };

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      {screen === 'select' && (
        <LevelSelect scores={scores} onSelect={handleSelectLevel} onReset={handleReset} />
      )}
      {screen === 'quiz' && activeLevel && (
        <QuizScreen level={activeLevel} onFinish={handleFinish} onBack={handleBack} />
      )}
      {screen === 'result' && activeLevel && (
        <ResultScreen level={activeLevel} score={lastScore} onRetry={handleRetry} onBack={handleBack} />
      )}
    </div>
  );
}
