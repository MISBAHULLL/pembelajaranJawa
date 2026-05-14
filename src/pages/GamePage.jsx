import React, { useState, useRef } from 'react';
import { Star, Trophy, RotateCcw, ChevronRight, CheckCircle2, XCircle, Sparkles, Zap, Target } from 'lucide-react';
import { gameLevels } from '../data/gameParikan.js';
import { useClickSound } from '../hooks/useClickSound.js';

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
function LevelSelect({ scores, onSelect }) {
  const playClick = useClickSound();
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const maxScore = gameLevels.reduce((a, l) => a + l.questions.length, 0);

  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-col items-center gap-8 px-4 py-2">
      {/* Header */}
      <header className="w-full text-center">
        <div className="inline-flex items-center gap-2 rounded-full border-2 border-orange-400 bg-white px-5 py-2 text-sm font-black uppercase tracking-widest text-orange-600 shadow-md">
          <Zap size={14} className="text-orange-500" aria-hidden="true" />
          Game Parikan
          <Zap size={14} className="text-orange-500" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-[clamp(2.8rem,6vw,4.5rem)] font-black uppercase leading-none text-white drop-shadow-2xl"
          style={{ WebkitTextStroke: '6px #ff9632', paintOrder: 'stroke fill' }}>
          Pilih Tingkat
        </h1>
        <p className="mt-2 text-base font-bold text-[#2e1d10] drop-shadow-sm">
          Uji kemampuanmu ngerti lan ngrakit parikan!
        </p>

        {/* Total score badge */}
        {totalScore > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-yellow-400 px-5 py-2 text-sm font-black text-yellow-900 shadow-lg">
            <Trophy size={16} aria-hidden="true" />
            Skor Total: {totalScore} / {maxScore}
          </div>
        )}
      </header>

      {/* Level cards */}
      <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-3">
        {gameLevels.map((level, idx) => {
          const best = scores[level.id] ?? 0;
          const total = level.questions.length;
          const pct = Math.round((best / total) * 100);
          const starsEarned = pct >= 80 ? 3 : pct >= 50 ? 2 : pct > 0 ? 1 : 0;
          const unlocked = idx === 0 || (scores[gameLevels[idx - 1].id] ?? 0) >= Math.ceil(gameLevels[idx - 1].questions.length * 0.5);

          return (
            <button
              key={level.id}
              type="button"
              disabled={!unlocked}
              onClick={() => { playClick(); onSelect(level); }}
              className={`group relative flex flex-col items-center gap-4 overflow-hidden rounded-3xl border-4 p-6 text-center font-black text-white shadow-2xl transition-all duration-300
                ${unlocked
                  ? 'cursor-pointer hover:-translate-y-2 hover:scale-[1.03] active:translate-y-0 active:scale-100'
                  : 'cursor-not-allowed opacity-50 grayscale'
                }`}
              style={{
                borderColor: `${level.color}cc`,
                background: `linear-gradient(145deg, ${level.color}dd, ${level.color}88)`,
                boxShadow: unlocked ? `0 12px 40px ${level.shadow}, 0 4px 0 ${level.color}66` : undefined,
              }}
              aria-label={`${level.label} — ${level.subtitle}${!unlocked ? ' (terkunci)' : ''}`}
            >
              {/* Shine overlay */}
              <span className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/25 via-transparent to-transparent" />
              <span className="pointer-events-none absolute inset-1 rounded-[20px] border border-white/30" />

              {/* Lock icon */}
              {!unlocked && (
                <span className="absolute right-3 top-3 text-2xl" aria-hidden="true">🔒</span>
              )}

              {/* Stars */}
              <StarRating count={3} filled={starsEarned} size={22} />

              {/* Label */}
              <div>
                <div className="text-[clamp(1.4rem,3vw,1.8rem)] leading-tight drop-shadow-md">{level.label}</div>
                <div className="mt-1 text-sm font-bold uppercase tracking-widest text-white/80">{level.subtitle}</div>
              </div>

              {/* Description */}
              <p className="text-xs font-semibold leading-snug text-white/75">{level.description}</p>

              {/* Progress */}
              {best > 0 && (
                <div className="w-full">
                  <ProgressBar current={best} total={total} color="rgba(255,255,255,0.9)" />
                  <p className="mt-1 text-xs font-bold text-white/70">
                    Skor terbaik: {best}/{total}
                  </p>
                </div>
              )}

              {/* Play button */}
              {unlocked && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-black uppercase tracking-wide shadow-md transition group-hover:shadow-lg"
                  style={{ color: level.color }}>
                  {best > 0 ? 'Main Lagi' : 'Mulai'}
                  <ChevronRight size={14} aria-hidden="true" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Decorative parikan quote */}
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

// ── Quiz screen ──────────────────────────────────────────────────────────────
function QuizScreen({ level, onFinish, onBack }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [shake, setShake] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const answerRef = useRef(null);
  const playClick = useClickSound();
  // Different tones for correct/wrong answers
  const playCorrect = useClickSound({ frequency: 660, duration: 0.12, volume: 0.22 });
  const playWrong = useClickSound({ frequency: 280, duration: 0.15, volume: 0.2 });

  const q = level.questions[current];
  const isLast = current === level.questions.length - 1;

  const handleSelect = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    setShowExplanation(true);
    if (idx === q.answer) {
      setScore((s) => s + 1);
      playCorrect();
    } else {
      playWrong();
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
    // Scroll to answer area on mobile
    setTimeout(() => answerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
  };

  const handleNext = () => {
    playClick();
    if (isLast) {
      onFinish(score + (selected === q.answer && !answered ? 1 : 0));
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
      setShowExplanation(false);
    }
  };

  const optionStyle = (idx) => {
    if (!answered) {
      return 'border-[#d1d5db] bg-white text-[#2e1d10] hover:bg-[#f3f4f6] hover:border-[#9ca3af] hover:-translate-y-0.5 cursor-pointer';
    }
    if (idx === q.answer) return 'border-green-500 bg-green-500 text-white';
    if (idx === selected) return 'border-red-500 bg-red-500 text-white';
    return 'border-[#e5e7eb] bg-[#f9fafb] text-[#9ca3af] opacity-60';
  };

  return (
    <div className="mx-auto flex w-full max-w-[780px] flex-col gap-5 px-4 py-2">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => { playClick(); onBack(); }}
          className="rounded-xl border-2 border-white bg-white/95 px-3 py-2 text-xs font-black uppercase text-[#2e1d10] shadow-md transition hover:bg-white hover:-translate-y-0.5"
        >
          ← Kembali
        </button>
        <div className="flex items-center gap-2 rounded-full border-2 px-4 py-1.5 text-sm font-black shadow-md"
          style={{ borderColor: level.color, background: 'white', color: level.color }}>
          {level.label}
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-yellow-400 px-3 py-1.5 text-sm font-black text-yellow-900 shadow-md">
          <Target size={14} aria-hidden="true" />
          {score}
        </div>
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs font-bold text-[#2e1d10]">
          <span>Soal {current + 1} saka {level.questions.length}</span>
          <span>{Math.round(((current) / level.questions.length) * 100)}% rampung</span>
        </div>
        <ProgressBar current={current} total={level.questions.length} color={level.color} />
      </div>

      {/* Question card */}
      <div
        className={`relative overflow-hidden rounded-3xl border-3 shadow-2xl sm:p-8 transition-all duration-300 ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
        style={{ borderColor: `${level.color}`, borderWidth: '3px', background: 'white', padding: '1.5rem' }}
      >
        <span className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/50 via-transparent to-transparent" />

        {/* Question number badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-widest shadow-sm"
          style={{ background: level.color, color: 'white' }}>
          <Sparkles size={12} aria-hidden="true" />
          Pitakon {current + 1}
        </div>

        <p className="relative text-[clamp(1.05rem,2.5vw,1.35rem)] font-extrabold leading-relaxed text-[#2e1d10]">
          {q.question}
        </p>
      </div>

      {/* Options */}
      <div className="grid gap-3" role="group" aria-label="Pilihan jawaban">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            type="button"
            disabled={answered}
            onClick={() => handleSelect(idx)}
            className={`group relative flex items-center gap-4 rounded-2xl border-2 p-4 text-left font-bold shadow-lg backdrop-blur-sm transition-all duration-200 sm:p-5 ${optionStyle(idx)}`}
          >
            {/* Option letter */}
            <span className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-current text-sm font-black transition-all group-hover:scale-110">
              {String.fromCharCode(65 + idx)}
            </span>
            <span className="text-[clamp(0.9rem,2vw,1.1rem)] leading-snug">{opt}</span>

            {/* Correct/wrong icon */}
            {answered && idx === q.answer && (
              <CheckCircle2 className="ml-auto shrink-0 text-green-400" size={22} aria-hidden="true" />
            )}
            {answered && idx === selected && idx !== q.answer && (
              <XCircle className="ml-auto shrink-0 text-red-400" size={22} aria-hidden="true" />
            )}
          </button>
        ))}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div
          ref={answerRef}
          className={`rounded-2xl border-2 p-4 text-sm font-semibold leading-relaxed sm:p-5 ${
            selected === q.answer
              ? 'border-green-500 bg-green-50 text-green-900'
              : 'border-red-500 bg-red-50 text-red-900'
          }`}
        >
          <div className="mb-1.5 flex items-center gap-2 font-black uppercase tracking-wide">
            {selected === q.answer
              ? <><CheckCircle2 size={16} className="text-green-600" aria-hidden="true" /> Bener! 🎉</>
              : <><XCircle size={16} className="text-red-600" aria-hidden="true" /> Durung bener 😅</>
            }
          </div>
          {q.explanation}
        </div>
      )}

      {/* Next button */}
      {answered && (
        <button
          type="button"
          onClick={handleNext}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-4 border-white/80 py-4 text-lg font-black uppercase text-white shadow-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl active:translate-y-0"
          style={{ background: `linear-gradient(135deg, ${level.color}, ${level.color}bb)` }}
        >
          {isLast ? (
            <><Trophy size={20} aria-hidden="true" /> Lihat Hasil</>
          ) : (
            <>Soal Sabanjure <ChevronRight size={20} aria-hidden="true" /></>
          )}
        </button>
      )}
    </div>
  );
}

// ── Result screen ────────────────────────────────────────────────────────────
function ResultScreen({ level, score, onRetry, onBack }) {
  const playClick = useClickSound();
  const total = level.questions.length;
  const pct = Math.round((score / total) * 100);
  const starsEarned = pct >= 80 ? 3 : pct >= 50 ? 2 : pct > 0 ? 1 : 0;

  const feedback =
    pct === 100 ? { msg: 'Luar biasa! Sampurna! 🏆', sub: 'Kowe pancen jago banget!' } :
    pct >= 80  ? { msg: 'Apik banget! 🌟', sub: 'Meh sampurna, terusna sinau!' } :
    pct >= 50  ? { msg: 'Lumayan! 👍', sub: 'Isih ana sing kudu dilatih maneh.' } :
                 { msg: 'Ayo coba maneh! 💪', sub: 'Sinau maneh banjur coba maneh ya!' };

  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-col items-center gap-6 px-4 py-2 text-center">
      {/* Trophy animation */}
      <div
        className="relative flex size-32 items-center justify-center rounded-full border-4 border-white/50 shadow-2xl"
        style={{ background: `radial-gradient(circle, ${level.color}cc, ${level.color}66)` }}
      >
        <span className="text-6xl animate-[bounceIn_0.6s_ease-out]" aria-hidden="true">
          {pct === 100 ? '🏆' : pct >= 80 ? '🌟' : pct >= 50 ? '👍' : '💪'}
        </span>
      </div>

      {/* Stars */}
      <StarRating count={3} filled={starsEarned} size={36} />

      {/* Score */}
      <div>
        <div className="text-[clamp(3rem,8vw,5rem)] font-black leading-none text-white drop-shadow-2xl"
          style={{ WebkitTextStroke: '4px rgba(0,0,0,0.2)', paintOrder: 'stroke fill' }}>
          {score}<span className="text-[0.5em] text-white/60">/{total}</span>
        </div>
        <div className="mt-1 text-lg font-black text-white/80">{pct}% bener</div>
      </div>

      {/* Feedback */}
      <div className="rounded-2xl border-2 border-white bg-white px-6 py-4 shadow-lg">
        <p className="text-xl font-black text-[#2e1d10]">{feedback.msg}</p>
        <p className="mt-1 text-sm font-semibold text-gray-600">{feedback.sub}</p>
      </div>

      {/* Parikan reward */}
      {pct >= 80 && (
        <div className="w-full rounded-2xl border-2 border-yellow-400 bg-yellow-50 px-5 py-4 shadow-md">
          <p className="text-xs font-black uppercase tracking-widest text-yellow-700">🎁 Parikan Hadiah</p>
          <p className="mt-2 text-sm font-bold italic text-[#2e1d10] leading-relaxed">
            "Tuku kupat ning pinggir dalan,<br />
            <span className="text-orange-600">eling pepeling aja kesusu tumindak."</span>
          </p>
        </div>
      )}

      {/* Buttons */}
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
  const [screen, setScreen] = useState('select'); // 'select' | 'quiz' | 'result'
  const [activeLevel, setActiveLevel] = useState(null);
  const [lastScore, setLastScore] = useState(0);
  const [scores, setScores] = useState({}); // { levelId: bestScore }

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

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      {screen === 'select' && (
        <LevelSelect scores={scores} onSelect={handleSelectLevel} />
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
