import React, { useState, useRef, useEffect } from 'react';
import { Star, Trophy, RotateCcw, ChevronRight, CheckCircle2, XCircle, Sparkles, Zap, Target, PenLine, AlertCircle, Info } from 'lucide-react';
import { gameLevels } from '../data/gameParikan.js';
import { useClickSound } from '../hooks/useClickSound.js';
import { useFeedbackSound } from '../hooks/useFeedbackSound.js';
import { useResultSound } from '../hooks/useResultSound.js';
import { useAnswerCrowdSound } from '../hooks/useAnswerCrowdSound.js';
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
function FeedbackEmoji({ type }) {
  if (!type) return null;

  const variants = {
    correct: { emoji: '😄', label: 'Bener!', className: 'border-green-300 bg-green-50 text-green-700' },
    wrong: { emoji: '😢', label: 'Salah!', className: 'border-red-300 bg-red-50 text-red-600' },
    great: { emoji: '🤩', label: 'Apik!', className: 'border-yellow-300 bg-yellow-50 text-yellow-700' },
  };
  const item = variants[type] ?? variants.wrong;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-between overflow-hidden px-0 sm:px-4">
      <div className={`animate-[feedbackSlideLeft_1.45s_ease-out_both] rounded-r-[2rem] border-y-4 border-r-4 px-5 py-5 text-center shadow-[0_22px_60px_rgba(46,29,16,0.28)] sm:rounded-[2rem] sm:border-4 sm:px-7 ${item.className}`}>
        <div className="text-6xl leading-none drop-shadow-sm sm:text-7xl" aria-hidden="true">{item.emoji}</div>
        <p className="mt-2 text-xl font-black uppercase tracking-wide sm:text-2xl">{item.label}</p>
      </div>
      <div className={`animate-[feedbackSlideRight_1.45s_ease-out_both] rounded-l-[2rem] border-y-4 border-l-4 px-5 py-5 text-center shadow-[0_22px_60px_rgba(46,29,16,0.28)] sm:rounded-[2rem] sm:border-4 sm:px-7 ${item.className}`}>
        <div className="text-6xl leading-none drop-shadow-sm sm:text-7xl" aria-hidden="true">{item.emoji}</div>
        <p className="mt-2 text-xl font-black uppercase tracking-wide sm:text-2xl">{item.label}</p>
      </div>
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
          const isLevel3 = level.type === 'theme-select';
          const total = isLevel3 ? (level.selectCount * 10) : level.questions.length;
          const isCompose = !isLevel3 && level.questions[0]?.type === 'compose';
          const maxScore = isCompose ? level.questions.length * 10 : total;
          const pct = maxScore > 0 ? Math.round((best / maxScore) * 100) : 0;
          const starsEarned = pct >= 80 ? 3 : pct >= 50 ? 2 : pct > 0 ? 1 : 0;
          const hasQuestions = isLevel3 ? true : level.questions.length > 0;
          // Unlock: skor level sebelumnya >= 70% dari skor maksimalnya
          const prevLevel = gameLevels[idx - 1];
          const prevIsLevel3 = prevLevel?.type === 'theme-select';
          const prevMax = prevLevel
            ? (prevIsLevel3
                ? prevLevel.selectCount * 10
                : prevLevel.questions[0]?.type === 'compose'
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
  const [emojiFeedback, setEmojiFeedback] = useState(null);
  const { playCorrect, playWrong } = useFeedbackSound();
  const { playCorrectCrowd, playWrongCrowd } = useAnswerCrowdSound();
  const playClick = useClickSound();
  const feedbackRef = useRef(null);

  useEffect(() => {
    setText('');
    setResult(null);
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
    setResult(scoring);
    setSubmitted(true);
    setEmojiFeedback(scoring.points === 10 ? 'correct' : scoring.points >= 6 ? 'great' : 'wrong');
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
      if (prev.length >= needed) return prev; // sudah cukup, tidak bisa tambah
      return [...prev, theme];
    });
  };

  const handleStart = () => {
    if (selected.length < needed) return;
    playClick();
    // Buat questions dari tema yang dipilih
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
      {/* Header */}
      <div className="flex items-center gap-3">
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
          {level.label} — {level.subtitle}
        </div>
      </div>

      {/* Instruksi */}
      <div
        className="rounded-3xl p-5 text-white shadow-xl"
        style={{ background: `linear-gradient(135deg, ${level.color}dd, ${level.color}99)` }}
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-widest">
          <Sparkles size={12} aria-hidden="true" />
          Pituduh Soal
        </div>
        <h2 className="text-xl font-black leading-snug">Soal Latihan Nulis Parikan</h2>
        <div className="mt-3 flex flex-col gap-1.5 text-sm font-semibold text-white/90">
          <p>Gawea parikan dhewe kanthi basa Jawa. Parikanmu kudu:</p>
          <ul className="mt-1 flex flex-col gap-1 pl-2">
            <li className="flex items-start gap-2"><span className="text-yellow-300 mt-0.5">✦</span> Ana 2 utawa 4 larik</li>
            <li className="flex items-start gap-2"><span className="text-yellow-300 mt-0.5">✦</span> Migunakake purwakanthi swara (rima)</li>
            <li className="flex items-start gap-2"><span className="text-yellow-300 mt-0.5">✦</span> Isi cocog karo tema sing kapilih</li>
          </ul>
        </div>
      </div>

      {/* Pilih tema */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-black text-white drop-shadow">
            Pilih {needed} Tema
          </h3>
          <span
            className="rounded-full px-3 py-1 text-sm font-black"
            style={{
              background: selected.length === needed ? level.color : 'rgba(255,255,255,0.2)',
              color: 'white',
            }}
          >
            {selected.length}/{needed} dipilih
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {level.themePool.map((theme) => {
            const isSelected = selected.find(t => t.id === theme.id);
            const isDisabled = !isSelected && selected.length >= needed;
            const selIdx = selected.findIndex(t => t.id === theme.id);

            return (
              <button
                key={theme.id}
                type="button"
                disabled={isDisabled}
                onClick={() => toggle(theme)}
                className={`group relative flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-200
                  ${isSelected
                    ? 'scale-[1.02] shadow-lg'
                    : isDisabled
                    ? 'cursor-not-allowed opacity-40'
                    : 'hover:-translate-y-0.5 hover:shadow-md cursor-pointer'
                  }`}
                style={{
                  borderColor: isSelected ? level.color : 'rgba(255,255,255,0.3)',
                  background: isSelected
                    ? `linear-gradient(135deg, ${level.color}22, ${level.color}11)`
                    : 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {/* Nomor urut / centang */}
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-black transition-all"
                  style={{
                    background: isSelected ? level.color : 'rgba(255,255,255,0.2)',
                    color: 'white',
                    boxShadow: isSelected ? `0 0 12px ${level.color}66` : 'none',
                  }}
                >
                  {isSelected ? selIdx + 1 : <span className="text-white/60 text-xs">○</span>}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xl leading-none" aria-hidden="true">{theme.emoji}</span>
                    <span
                      className="text-sm font-black"
                      style={{ color: isSelected ? 'white' : 'rgba(255,255,255,0.9)' }}
                    >
                      {theme.theme}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-white/60 leading-snug">
                    {theme.description}
                  </p>
                </div>

                {isSelected && (
                  <CheckCircle2 size={18} className="shrink-0 mt-0.5" style={{ color: level.color }} aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tombol mulai */}
      <button
        type="button"
        disabled={selected.length < needed}
        onClick={handleStart}
        className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-black uppercase text-white shadow-xl transition-all hover:-translate-y-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
        style={{
          background: selected.length === needed
            ? `linear-gradient(135deg, ${level.color}, ${level.color}bb)`
            : 'rgba(255,255,255,0.15)',
          border: '2px solid rgba(255,255,255,0.3)',
          boxShadow: selected.length === needed ? `0 8px 32px ${level.color}66` : 'none',
        }}
      >
        {selected.length < needed
          ? `Pilih ${needed - selected.length} tema maneh`
          : <><Sparkles size={20} aria-hidden="true" /> Wis Siap, Mulai Nulis!</>
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

  const questions = questionsOverride ?? level.questions;
  const q = questions[current];
  const isLast = current === questions.length - 1;

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

// ── Confetti particle ────────────────────────────────────────────────────────
function ConfettiParticle({ x, color, delay, duration, shape }) {
  const style = {
    position: 'absolute',
    left: `${x}%`,
    top: '-24px',
    width: shape === 'circle' ? '10px' : '8px',
    height: shape === 'circle' ? '10px' : '14px',
    borderRadius: shape === 'circle' ? '50%' : '2px',
    background: color,
    animation: `confettiFall ${duration}s ease-in ${delay}s both, confettiWiggle ${duration * 0.6}s ease-in-out ${delay}s infinite`,
    pointerEvents: 'none',
  };
  return <span aria-hidden="true" style={style} />;
}

// ── Ripple ring ──────────────────────────────────────────────────────────────
function RippleRing({ delay, color }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        border: `3px solid ${color}`,
        opacity: 0,
        animation: `rippleRing 1.4s ease-out ${delay}s both`,
        pointerEvents: 'none',
      }}
    />
  );
}

// ── Burst particle dari tengah ───────────────────────────────────────────────
function BurstParticle({ angle, distance, color, delay, size }) {
  const rad = (angle * Math.PI) / 180;
  const px = `${Math.cos(rad) * distance}px`;
  const py = `${Math.sin(rad) * distance}px`;
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        '--px': px,
        '--py': py,
        animation: `particleBurst 0.9s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}s both`,
        pointerEvents: 'none',
      }}
    />
  );
}

// ── Ambient floating orb ─────────────────────────────────────────────────────
function AmbientOrb({ x, y, size, color, duration, delay }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        filter: 'blur(8px)',
        animation: `ambientFloat ${duration}s ease-in-out ${delay}s infinite`,
        pointerEvents: 'none',
      }}
    />
  );
}

// ── Animated star ────────────────────────────────────────────────────────────
function AnimatedStar({ filled, delay }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        fontSize: '2.8rem',
        lineHeight: 1,
        opacity: 0,
        animation: filled
          ? `starPop 0.6s cubic-bezier(0.34,1.56,0.64,1) ${delay}s both`
          : `resultSubFadeUp 0.4s ease-out ${delay}s both`,
        filter: filled ? 'drop-shadow(0 0 12px #facc15)' : 'none',
      }}
    >
      {filled ? '⭐' : '☆'}
    </span>
  );
}

// ── Result overlay (animasi selamat / coba lagi) ─────────────────────────────
function ResultOverlay({ pct, levelColor, onDone }) {
  const isSuccess = pct >= 70;
  const isPerfect = pct === 100;
  const starsEarned = pct >= 80 ? 3 : pct >= 50 ? 2 : pct > 0 ? 1 : 0;

  // Auto-dismiss setelah 3 detik
  useEffect(() => {
    const t = window.setTimeout(onDone, 3000);
    return () => window.clearTimeout(t);
  }, [onDone]);

  // Confetti
  const successColors = ['#facc15', '#fb923c', '#4ade80', '#60a5fa', '#f472b6', '#a78bfa', '#fff', '#fde68a'];
  const failColors    = ['#94a3b8', '#cbd5e1', '#e2e8f0'];
  const confettiColors = isSuccess ? successColors : failColors;
  const particles = Array.from({ length: isSuccess ? 50 : 16 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: confettiColors[i % confettiColors.length],
    delay: Math.random() * 1.0,
    duration: 2.0 + Math.random() * 1.4,
    shape: Math.random() > 0.5 ? 'circle' : 'rect',
  }));

  // Burst particles dari tengah
  const burstColors = isSuccess
    ? ['#facc15', '#fb923c', '#4ade80', '#60a5fa', '#f472b6', '#a78bfa', '#fff', '#fde68a', '#34d399', '#f87171']
    : ['#94a3b8', '#64748b', '#cbd5e1', '#475569'];
  const burstParticles = Array.from({ length: isSuccess ? 24 : 12 }, (_, i) => ({
    id: i,
    angle: (360 / (isSuccess ? 24 : 12)) * i,
    distance: 80 + Math.random() * 80,
    color: burstColors[i % burstColors.length],
    delay: 0.1 + Math.random() * 0.2,
    size: `${6 + Math.random() * 8}px`,
  }));

  // Ambient orbs
  const orbs = isSuccess ? [
    { x: 10, y: 20, size: '60px', color: 'rgba(250,204,21,0.25)', duration: 4, delay: 0 },
    { x: 80, y: 15, size: '80px', color: 'rgba(244,114,182,0.2)', duration: 5, delay: 0.5 },
    { x: 15, y: 70, size: '50px', color: 'rgba(96,165,250,0.25)', duration: 3.5, delay: 1 },
    { x: 75, y: 65, size: '70px', color: 'rgba(74,222,128,0.2)', duration: 4.5, delay: 0.3 },
    { x: 50, y: 85, size: '45px', color: 'rgba(167,139,250,0.3)', duration: 3, delay: 0.8 },
  ] : [
    { x: 20, y: 25, size: '50px', color: 'rgba(148,163,184,0.2)', duration: 4, delay: 0 },
    { x: 70, y: 60, size: '60px', color: 'rgba(100,116,139,0.2)', duration: 5, delay: 0.5 },
  ];

  // Gradient background berdasarkan kondisi
  const bgGradient = isPerfect
    ? `radial-gradient(ellipse at 50% 30%, #fbbf24cc 0%, #f59e0baa 30%, #92400e99 70%, #1c0a00ee 100%)`
    : isSuccess
    ? `radial-gradient(ellipse at 50% 30%, ${levelColor}dd 0%, ${levelColor}99 40%, #0f172aee 100%)`
    : `radial-gradient(ellipse at 50% 40%, #1e3a5fee 0%, #0f172aee 50%, #000000cc 100%)`;

  const shimmerGradient = isPerfect
    ? 'linear-gradient(90deg, #fbbf24, #fff, #fbbf24, #fb923c, #fbbf24)'
    : isSuccess
    ? `linear-gradient(90deg, #fff, ${levelColor}, #fff, #a78bfa, #fff)`
    : 'linear-gradient(90deg, #94a3b8, #fff, #94a3b8, #cbd5e1, #94a3b8)';

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: bgGradient,
        animation: 'resultOverlayIn 0.4s ease-out both',
      }}
      onClick={onDone}
      role="status"
      aria-live="polite"
    >
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {orbs.map((o, i) => <AmbientOrb key={i} {...o} />)}
      </div>

      {/* Confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map(p => <ConfettiParticle key={p.id} {...p} />)}
      </div>

      {/* Ripple rings dari tengah */}
      <div className="pointer-events-none absolute flex items-center justify-center" style={{ inset: 0 }}>
        <div className="relative flex items-center justify-center">
          {[0, 0.25, 0.5, 0.75].map((d, i) => (
            <RippleRing key={i} delay={d} color={isSuccess ? 'rgba(255,255,255,0.6)' : 'rgba(148,163,184,0.5)'} />
          ))}
        </div>
      </div>

      {/* Burst particles dari tengah */}
      <div className="pointer-events-none absolute flex items-center justify-center" style={{ inset: 0 }}>
        <div className="relative">
          {burstParticles.map(p => <BurstParticle key={p.id} {...p} />)}
        </div>
      </div>

      {/* Spinning glow ring di belakang ikon */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: '220px',
          height: '220px',
          borderRadius: '50%',
          background: `conic-gradient(from 0deg, transparent 0%, ${isSuccess ? '#facc1566' : '#64748b44'} 30%, transparent 60%, ${isSuccess ? '#fb923c66' : '#94a3b844'} 80%, transparent 100%)`,
          animation: 'glowSpin 3s linear infinite',
          filter: 'blur(4px)',
        }}
      />

      {/* Konten utama */}
      <div
        className="relative z-10 flex flex-col items-center gap-4 px-6 text-center"
        style={{ animation: 'resultBannerDrop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.15s both' }}
      >
        {/* Ikon dengan glow */}
        <div
          className="relative flex items-center justify-center"
          style={{ animation: 'iconSpring 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.2s both', opacity: 0 }}
        >
          {/* Glow layer */}
          <div
            className="absolute rounded-full"
            style={{
              width: '130px',
              height: '130px',
              background: isSuccess
                ? 'radial-gradient(circle, rgba(250,204,21,0.5) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(148,163,184,0.4) 0%, transparent 70%)',
              filter: 'blur(12px)',
              animation: 'bgPulse 2s ease-in-out infinite',
            }}
          />
          {/* Ikon circle */}
          <div
            className="relative flex size-28 items-center justify-center rounded-full border-4 shadow-2xl"
            style={{
              borderColor: 'rgba(255,255,255,0.5)',
              background: isSuccess
                ? 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))'
                : 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(12px)',
              boxShadow: isSuccess
                ? '0 0 40px rgba(250,204,21,0.4), 0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.4)'
                : '0 0 30px rgba(148,163,184,0.3), 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            <span className="text-6xl leading-none" aria-hidden="true" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}>
              {isPerfect ? '🏆' : isSuccess ? '🌟' : '💪'}
            </span>
          </div>
        </div>

        {/* Teks utama dengan shimmer */}
        <h2
          className="text-[clamp(2.4rem,8vw,4rem)] font-black leading-tight"
          style={{
            background: shimmerGradient,
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'resultSubFadeUp 0.5s ease-out 0.5s both, textShimmer 2.5s linear 0.8s infinite',
            opacity: 0,
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))',
          }}
        >
          {isPerfect ? 'Sampurna! 🎊' : isSuccess ? 'Selamat! 🎉' : 'Ayo Semangat! 💪'}
        </h2>

        {/* Bintang animasi satu per satu */}
        <div
          className="flex gap-2"
          style={{ animation: 'resultSubFadeUp 0.01s ease-out 0.6s both', opacity: 0 }}
        >
          {[0, 1, 2].map(i => (
            <AnimatedStar key={i} filled={i < starsEarned} delay={0.65 + i * 0.15} />
          ))}
        </div>

        {/* Sub-teks */}
        <p
          className="max-w-xs text-base font-bold text-white/90"
          style={{
            animation: 'resultSubFadeUp 0.5s ease-out 1.1s both',
            opacity: 0,
            textShadow: '0 2px 8px rgba(0,0,0,0.6)',
          }}
        >
          {isPerfect
            ? 'Kowe pancen jago banget!'
            : isSuccess
            ? 'Nilaimu apik, terusna sinau!'
            : 'Sinau maneh, kowe mesthi bisa!'}
        </p>

        {/* Skor badge glassmorphism */}
        <div
          className="flex items-center gap-3 rounded-2xl px-6 py-3"
          style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
            animation: 'scoreReveal 0.6s cubic-bezier(0.34,1.56,0.64,1) 1.3s both',
            opacity: 0,
          }}
        >
          <span className="text-3xl font-black text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
            {pct}%
          </span>
          <div className="h-8 w-px bg-white/30" />
          <span className="text-sm font-bold text-white/80">
            {isPerfect ? '🏆 Sempurna' : isSuccess ? '✅ Lulus' : '❌ Belum Lulus'}
          </span>
        </div>
      </div>

      {/* Tap to continue */}
      <p
        className="absolute bottom-8 text-xs font-bold tracking-widest text-white/40 uppercase"
        style={{ animation: 'resultSubFadeUp 0.4s ease-out 2.2s both', opacity: 0 }}
      >
        ✦ Ketuk untuk lanjut ✦
      </p>
    </div>
  );
}

// ── Result screen ────────────────────────────────────────────────────────────
function ResultScreen({ level, score, maxScoreOverride, onRetry, onBack }) {
  const playClick = useClickSound();
  const { playApplause, playEncourage, playFailed } = useResultSound();
  const [showOverlay, setShowOverlay] = useState(true);
  const total = level.questions.length;
  const isCompose = level.questions[0]?.type === 'compose';
  const maxScore = maxScoreOverride ?? (isCompose ? total * 10 : total);
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const starsEarned = pct >= 80 ? 3 : pct >= 50 ? 2 : pct > 0 ? 1 : 0;
  const isSuccess = pct >= 70;

  const resultFeedback = pct === 100
    ? { msg: 'Luar biasa! Sampurna! 🏆', sub: 'Kowe pancen jago banget!' }
    : pct >= 80
    ? { msg: 'Apik banget! 🌟', sub: 'Meh sampurna, terusna sinau!' }
    : pct >= 70
    ? { msg: 'Ayo semangat, coba lagi!', sub: 'Nilaimu wis lumayan, nanging isih bisa luwih apik.' }
    : pct >= 50
    ? { msg: 'Lumayan! 👍', sub: 'Isih ana sing kudu dilatih maneh.' }
    : { msg: 'Kamu gagal, coba lagi!', sub: 'Sinau maneh banjur coba saka awal.' };

  useEffect(() => {
    if (pct === 100) playApplause();
    else if (pct >= 70) playEncourage();
    else playFailed();
  }, [pct]);

  const s = (delay) => !showOverlay
    ? { animation: `cardSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}s both` }
    : { opacity: 0, pointerEvents: 'none' };

  return (
    <>
      {showOverlay && (
        <ResultOverlay pct={pct} levelColor={level.color} onDone={() => setShowOverlay(false)} />
      )}

      <div
        className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-5 px-4 py-2 text-center"
        style={!showOverlay ? { animation: 'resultContentIn 0.4s ease-out both' } : { opacity: 0, pointerEvents: 'none' }}
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
              animation: !showOverlay ? 'iconSpring 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.05s both' : undefined,
              opacity: showOverlay ? 0 : undefined,
            }}
          >
            <span className="text-6xl leading-none" aria-hidden="true"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
              {pct === 100 ? '🏆' : pct >= 80 ? '🌟' : pct >= 50 ? '👍' : '💪'}
            </span>
          </div>
        </div>

        {/* ── Bintang ── */}
        <div className="flex gap-3" style={s(0.08)}>
          {[0, 1, 2].map(i => (
            <span
              key={i}
              aria-hidden="true"
              style={{
                fontSize: '2.2rem',
                lineHeight: 1,
                opacity: 0,
                animation: !showOverlay
                  ? (i < starsEarned
                    ? `starPop 0.55s cubic-bezier(0.34,1.56,0.64,1) ${0.1 + i * 0.12}s both`
                    : `resultSubFadeUp 0.4s ease-out ${0.1 + i * 0.12}s both`)
                  : undefined,
                filter: i < starsEarned ? 'drop-shadow(0 0 10px #facc15)' : 'none',
              }}
            >
              {i < starsEarned ? '⭐' : '☆'}
            </span>
          ))}
        </div>

        {/* ── Skor besar ── */}
        <div style={s(0.15)}>
          <div
            className="text-[clamp(3.5rem,10vw,5.5rem)] font-black leading-none text-white"
            style={{
              WebkitTextStroke: '4px rgba(0,0,0,0.15)',
              paintOrder: 'stroke fill',
              filter: `drop-shadow(0 4px 20px ${level.color}88)`,
            }}
          >
            {score}
            <span className="text-[0.45em] text-white/50">/{maxScore}</span>
          </div>
          <div className="mt-1 text-base font-black text-white/70 tracking-wide">
            {pct}% {isCompose ? 'skor' : 'bener'}
          </div>
        </div>

        {/* ── Progress bar animasi ── */}
        <div className="w-full" style={s(0.22)}>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full"
              style={{
                '--target-width': `${pct}%`,
                background: isSuccess
                  ? `linear-gradient(90deg, ${level.color}, #facc15, ${level.color})`
                  : 'linear-gradient(90deg, #64748b, #94a3b8)',
                animation: !showOverlay ? 'progressFill 1s cubic-bezier(0.16,1,0.3,1) 0.3s both' : undefined,
                width: showOverlay ? '0%' : undefined,
                boxShadow: isSuccess ? `0 0 12px ${level.color}88` : 'none',
              }}
            />
          </div>
        </div>

        {/* ── Feedback card glassmorphism ── */}
        <div
          className="w-full rounded-3xl px-6 py-5"
          style={{
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.25)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
            ...s(0.28),
          }}
        >
          <p className="text-xl font-black text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            {resultFeedback.msg}
          </p>
          <p className="mt-1 text-sm font-semibold text-white/70">{resultFeedback.sub}</p>
        </div>

        {/* ── Parikan hadiah ── */}
        {pct >= 80 && (
          <div
            className="w-full rounded-3xl px-5 py-4"
            style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,146,60,0.15))',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(251,191,36,0.4)',
              boxShadow: '0 4px 24px rgba(251,191,36,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
              ...s(0.36),
            }}
          >
            <p className="text-xs font-black uppercase tracking-widest text-yellow-300">🎁 Parikan Hadiah</p>
            <p className="mt-2 text-sm font-bold italic text-white/90 leading-relaxed">
              "Tuku kupat ning pinggir dalan,<br />
              <span className="text-yellow-300">eling pepeling aja kesusu tumindak."</span>
            </p>
          </div>
        )}

        {/* ── Tombol aksi ── */}
        <div className="flex w-full flex-col gap-3 sm:flex-row" style={s(0.44)}>
          <button
            type="button"
            onClick={() => { playClick(); onRetry(); }}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-base font-black uppercase transition-all hover:-translate-y-1 active:translate-y-0"
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(12px)',
              border: '2px solid rgba(255,255,255,0.3)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
          >
            <RotateCcw size={18} aria-hidden="true" />
            Coba Maneh
          </button>
          <button
            type="button"
            onClick={() => { playClick(); onBack(); }}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-base font-black uppercase text-white transition-all hover:-translate-y-1 active:translate-y-0"
            style={{
              background: `linear-gradient(135deg, ${level.color}, ${level.color}bb)`,
              border: '2px solid rgba(255,255,255,0.3)',
              boxShadow: `0 4px 24px ${level.color}66, 0 0 0 1px rgba(255,255,255,0.1)`,
            }}
          >
            <Trophy size={18} aria-hidden="true" />
            Pilih Tingkat
          </button>
        </div>
      </div>
    </>
  );
}

// ── Main GamePage ────────────────────────────────────────────────────────────
export function GamePage() {
  const [screen, setScreen] = useState('select');
  const [activeLevel, setActiveLevel] = useState(null);
  const [lastScore, setLastScore] = useState(0);
  const [level3Questions, setLevel3Questions] = useState(null); // soal dinamis tingkat 3
  const [scores, setScores] = useLocalStorage('javanesia-game-scores', {});

  const handleSelectLevel = (level) => {
    setActiveLevel(level);
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
    setLevel3Questions(questions);
    setScreen('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinish = (score) => {
    setLastScore(score);
    setScores((prev) => ({
      ...prev,
      [activeLevel.id]: Math.max(prev[activeLevel.id] ?? 0, score),
    }));
    setLevel3Questions(null);
    setScreen('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetry = () => {
    // Tingkat 3: kembali ke pilih tema lagi
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
    setLevel3Questions(null);
    setScreen('select');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setScores({});
    setScreen('select');
    setActiveLevel(null);
    setLevel3Questions(null);
  };

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      {screen === 'select' && (
        <LevelSelect scores={scores} onSelect={handleSelectLevel} onReset={handleReset} />
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
            ? () => { setLevel3Questions(null); setScreen('theme-select'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
            : handleBack
          }
        />
      )}
      {screen === 'result' && activeLevel && (
        <ResultScreen
          level={activeLevel}
          score={lastScore}
          maxScoreOverride={activeLevel.type === 'theme-select' ? activeLevel.selectCount * 10 : undefined}
          onRetry={handleRetry}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
