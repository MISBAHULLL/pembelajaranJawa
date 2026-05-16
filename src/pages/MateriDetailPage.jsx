import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, ListChecks, RotateCcw, Volume2, Square, BookOpen, LoaderCircle, XCircle } from 'lucide-react';
import { materiActivities } from '../data/materiActivities.js';
import { useClickSound } from '../hooks/useClickSound.js';
import { playAudioFile } from '../hooks/useAudioFile.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import {
  LEARNING_PROGRESS_KEY,
  initialLearningProgress,
  normalizeLearningProgress,
} from '../utils/learningProgress.js';

function getFloatingBubbleStyle(bubble, bubbleIndex) {
  if (bubble.bubbleStyle) return bubble.bubbleStyle;

  const speaker = bubble.speaker?.toLowerCase() ?? '';
  if (speaker.includes('rara') || bubbleIndex === 1) {
    return { left: '56%', top: '7%', width: '34%' };
  }

  return { left: '26%', top: '6%', width: '34%' };
}

function buildFallbackStimulus(index, title) {
  return {
    image: `/assets/Komik/Comic_Materi${index + 1}.png`,
    bubbles: [
      {
        speaker: 'Dimas',
        text: `Rara, sadurunge sinau ${title}, aku kudu nggatekake apa dhisik?`,
      },
      {
        speaker: 'Rara',
        text: 'Ayo delengen critane dhisik, banjur goleki pitakon penting saka gambar iki.',
      },
    ],
    question: 'Miturutmu, apa sing bakal disinaoni saka crita iki?',
  };
}

function StimulusComic({ stimulus, title }) {
  if (!stimulus?.image) return null;

  return (
    <section
      className="overflow-hidden rounded-[1.75rem] border-4 border-white/80 bg-white shadow-[0_8px_34px_rgba(46,29,16,0.18)]"
      aria-label={`Komik pembuka materi ${title}`}
    >
      <div className="relative bg-[#e7f6ff]">
        <img
          src={stimulus.image}
          alt={`Komik pembuka materi ${title}`}
          className="aspect-video h-auto w-full object-cover"
          loading="lazy"
        />

        <div className="pointer-events-none absolute inset-0 hidden sm:block">
          {stimulus.bubbles?.map((bubble, bubbleIndex) => (
            <div
              key={`${bubble.speaker}-floating-${bubbleIndex}`}
              className="comic-cloud-bubble comic-cloud-bubble-floating absolute"
              style={getFloatingBubbleStyle(bubble, bubbleIndex)}
            >
              <span className="block text-[0.56rem] font-black uppercase tracking-[0.12em] text-orange-500 lg:text-[0.62rem]">
                {bubble.speaker}
              </span>
              <p className="mt-1 text-[clamp(0.6rem,0.95vw,0.84rem)] font-black leading-snug text-[#3f2918]">
                {bubble.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 bg-gradient-to-r from-sky-50 via-white to-orange-50 px-5 py-4 sm:hidden">
        {stimulus.bubbles?.map((bubble, bubbleIndex) => (
          <div key={`${bubble.speaker}-${bubbleIndex}`} className="comic-cloud-bubble comic-cloud-bubble-mobile">
            <span className="block text-[0.66rem] font-black uppercase tracking-[0.12em] text-orange-500">
              {bubble.speaker}
            </span>
            <p className="mt-1 text-sm font-black leading-snug text-[#3f2918] sm:text-[0.95rem]">
              {bubble.text}
            </p>
          </div>
        ))}
      </div>

      {stimulus.question && (
        <div className="border-t-2 border-orange-100 bg-orange-50 px-5 py-4 sm:px-6">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-500">
            Pitakon Pemantik
          </p>
          <p className="mt-1 text-base font-black leading-snug text-[#6d3a14] sm:text-lg">
            {stimulus.question}
          </p>
        </div>
      )}
    </section>
  );
}

function isSameArray(left = [], right = []) {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}

function evaluateActivity(activity, answer) {
  if (!activity) return false;

  if (activity.type === 'single') {
    return answer === activity.correctIndex;
  }

  if (activity.type === 'multi') {
    const selected = [...(answer ?? [])].sort((a, b) => a - b);
    const correct = [...activity.correctIndexes].sort((a, b) => a - b);
    return isSameArray(selected, correct);
  }

  if (activity.type === 'classify') {
    return activity.correct.every((category, index) => answer?.[index] === category);
  }

  if (activity.type === 'order') {
    return isSameArray(answer ?? [], activity.correctOrder);
  }

  return false;
}

function hasActivityAnswer(activity, answer) {
  if (!activity) return false;
  if (activity.type === 'single') return Number.isInteger(answer);
  if (activity.type === 'multi') return Array.isArray(answer) && answer.length > 0;
  if (activity.type === 'classify') return Object.keys(answer ?? {}).length === activity.lines.length;
  if (activity.type === 'order') return Array.isArray(answer) && answer.length === activity.correctOrder.length;
  return false;
}

function getDefaultActivityAnswer(activity) {
  return activity?.type === 'classify' ? {} : [];
}

function getSafeActivityAnswer(activity, answer) {
  if (!activity) return answer;
  if (activity.type === 'single') return Number.isInteger(answer) ? answer : null;
  if (activity.type === 'multi' || activity.type === 'order') return Array.isArray(answer) ? answer : [];
  if (activity.type === 'classify') return answer && !Array.isArray(answer) && typeof answer === 'object' ? answer : {};
  return answer;
}

function MiniActivity({ activity }) {
  const playClick = useClickSound();
  const [answer, setAnswer] = useState(() => getDefaultActivityAnswer(activity));
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setAnswer(getDefaultActivityAnswer(activity));
    setChecked(false);
  }, [activity]);

  if (!activity) return null;

  const safeAnswer = getSafeActivityAnswer(activity, answer);
  const isCorrect = checked && evaluateActivity(activity, safeAnswer);
  const isWrong = checked && !isCorrect;
  const canCheck = hasActivityAnswer(activity, safeAnswer);

  const handleCheck = () => {
    playClick();
    setChecked(true);
  };

  const handleReset = () => {
    playClick();
    setAnswer(getDefaultActivityAnswer(activity));
    setChecked(false);
  };

  const toggleMulti = (optionIndex) => {
    playClick();
    setChecked(false);
    setAnswer((current) => {
      const currentAnswer = Array.isArray(current) ? current : [];
      return currentAnswer.includes(optionIndex)
        ? currentAnswer.filter((item) => item !== optionIndex)
        : [...currentAnswer, optionIndex];
    });
  };

  return (
    <section className="mt-7 overflow-hidden rounded-2xl border-2 border-teal-200 bg-gradient-to-br from-teal-50 via-white to-orange-50 p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-teal-100 text-teal-600 shadow-inner">
          <ListChecks size={23} aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.15em] text-teal-600">
            Coba Saiki
          </p>
          <h2 className="mt-1 text-xl font-black leading-tight text-[#3f2918]">
            {activity.title}
          </h2>
          <p className="mt-1 text-sm font-bold leading-relaxed text-[#6b4a2d]">
            {activity.prompt}
          </p>
        </div>
      </div>

      {activity.type === 'single' && (
        <div className="mt-4 grid gap-2">
          {activity.options.map((option, optionIndex) => (
            <button
              key={option}
              type="button"
              onClick={() => { playClick(); setAnswer(optionIndex); setChecked(false); }}
              className={`rounded-2xl border-2 px-4 py-3 text-left text-sm font-black leading-snug transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-200 ${
                safeAnswer === optionIndex
                  ? 'border-teal-400 bg-teal-100 text-teal-800'
                  : 'border-white bg-white text-[#4f2912] hover:border-teal-200'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {activity.type === 'multi' && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {activity.options.map((option, optionIndex) => {
            const selected = safeAnswer.includes(optionIndex);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleMulti(optionIndex)}
                className={`rounded-2xl border-2 px-4 py-3 text-left text-sm font-black leading-snug transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-200 ${
                  selected
                    ? 'border-teal-400 bg-teal-100 text-teal-800'
                    : 'border-white bg-white text-[#4f2912] hover:border-teal-200'
                }`}
              >
                {selected ? '✓ ' : ''}
                {option}
              </button>
            );
          })}
        </div>
      )}

      {activity.type === 'classify' && (
        <div className="mt-4 grid gap-3">
          {activity.lines.map((line, lineIndex) => (
            <div key={line} className="rounded-2xl border-2 border-white bg-white p-4">
              <p className="text-base font-black leading-snug text-[#5d351d]">{line}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {activity.categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      playClick();
                      setChecked(false);
                      setAnswer((current) => ({ ...(current ?? {}), [lineIndex]: category }));
                    }}
                    className={`rounded-full border-2 px-4 py-2 text-xs font-black uppercase tracking-wide transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-200 ${
                      safeAnswer?.[lineIndex] === category
                        ? 'border-teal-400 bg-teal-100 text-teal-800'
                        : 'border-orange-100 bg-orange-50 text-orange-700 hover:border-orange-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activity.type === 'order' && (
        <div className="mt-4 grid gap-4">
          <div className="rounded-2xl border-2 border-white bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-500">Urutanmu</p>
            <div className="mt-3 grid gap-2">
              {safeAnswer.length === 0 ? (
                <p className="rounded-xl bg-orange-50 px-3 py-2 text-sm font-bold text-orange-700">
                  Klik langkah ing ngisor iki kanggo nyusun urutan.
                </p>
              ) : (
                safeAnswer.map((step, stepIndex) => (
                  <div key={`${step}-${stepIndex}`} className="rounded-xl bg-teal-50 px-3 py-2 text-sm font-black text-teal-800">
                    {stepIndex + 1}. {step}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {activity.items.map((step) => {
              const selected = safeAnswer.includes(step);
              return (
                <button
                  key={step}
                  type="button"
                  disabled={selected}
                  onClick={() => {
                    playClick();
                    setChecked(false);
                    setAnswer((current) => [...(current ?? []), step]);
                  }}
                  className={`rounded-2xl border-2 px-4 py-3 text-left text-sm font-black leading-snug transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-200 ${
                    selected
                      ? 'cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400'
                      : 'border-white bg-white text-[#4f2912] hover:-translate-y-0.5 hover:border-teal-200'
                  }`}
                >
                  {step}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {checked && (
        <div className={`mt-4 rounded-2xl border-2 px-4 py-3 text-sm font-black leading-relaxed ${
          isCorrect
            ? 'border-green-200 bg-green-50 text-green-700'
            : 'border-amber-200 bg-amber-50 text-amber-700'
        }`}>
          <span className="inline-flex items-center gap-2">
            {isCorrect ? <CheckCircle2 size={17} aria-hidden="true" /> : <XCircle size={17} aria-hidden="true" />}
            {isCorrect ? activity.success : activity.retry}
          </span>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCheck}
          disabled={!canCheck}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black uppercase tracking-wide shadow-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-200 ${
            canCheck
              ? 'bg-teal-600 text-white hover:-translate-y-0.5 hover:bg-teal-700'
              : 'cursor-not-allowed bg-stone-200 text-stone-500'
          }`}
        >
          <CheckCircle2 size={16} aria-hidden="true" />
          Cek Jawaban
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 rounded-full border-2 border-orange-200 bg-white px-4 py-2 text-sm font-black uppercase tracking-wide text-orange-600 transition hover:-translate-y-0.5 hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
        >
          <RotateCcw size={16} aria-hidden="true" />
          Coba Maneh
        </button>
      </div>
    </section>
  );
}

export function MateriDetailPage({ item, index, total, onNext, onPrev, hasNext, hasPrev, onBackToList }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreparingAudio, setIsPreparingAudio] = useState(false);
  const [audioMessage, setAudioMessage] = useState('');
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const narrationRef = useRef(null);
  const playClick = useClickSound();
  const [learningProgress, setLearningProgress] = useLocalStorage(LEARNING_PROGRESS_KEY, initialLearningProgress);

  const lines = item.example ? item.example.split('\n') : [];
  const stimulus = item.stimulus ?? buildFallbackStimulus(index, item.title);
  const miniActivity = item.activity ?? materiActivities[index];
  const normalizedProgress = normalizeLearningProgress(learningProgress);
  const isMateriCompleted = Boolean(normalizedProgress.completedMateri[item.title]);

  const stopNarration = () => {
    narrationRef.current?.stop();
    narrationRef.current = null;
    setIsPlaying(false);
    setIsPreparingAudio(false);
  };

  // Stop narration when item changes
  useEffect(() => {
    stopNarration();
    setAudioMessage('');
  }, [item]);

  useEffect(() => {
    setLearningProgress((current) => {
      const normalized = normalizeLearningProgress(current);
      const existingVisit = normalized.visitedMateri[item.title];

      return {
        ...normalized,
        lastMateriIndex: index,
        visitedMateri: {
          ...normalized.visitedMateri,
          [item.title]: existingVisit ?? {
            title: item.title,
            index,
            firstVisitedAt: new Date().toISOString(),
          },
        },
      };
    });
  }, [item.title, index]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopNarration();
  }, []);

  const toggleSpeech = () => {
    playClick();
    if (isPlaying || isPreparingAudio) {
      stopNarration();
    } else {
      setAudioMessage('');
      narrationRef.current = playAudioFile(item.audioSrc, {
        onLoadStart: () => setIsPreparingAudio(true),
        onStart: () => {
          setIsPreparingAudio(false);
          setIsPlaying(true);
        },
        onEnd: () => {
          setIsPreparingAudio(false);
          setIsPlaying(false);
        },
        onError: () => {
          setIsPreparingAudio(false);
          setIsPlaying(false);
          setAudioMessage('Audio materi belum tersedia. Tambahkan file MP3 sesuai audioSrc di folder public/assets/sounds.');
        },
      });
    }
  };

  const handleNext = () => {
    playClick();
    onNext?.();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    playClick();
    onPrev?.();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    playClick();
    onBackToList?.();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleMateriComplete = () => {
    playClick();
    setLearningProgress((current) => {
      const normalized = normalizeLearningProgress(current);
      const nextCompleted = { ...normalized.completedMateri };

      if (nextCompleted[item.title]) {
        delete nextCompleted[item.title];
      } else {
        nextCompleted[item.title] = {
          title: item.title,
          index,
          completedAt: new Date().toISOString(),
        };
      }

      return {
        ...normalized,
        lastMateriIndex: index,
        visitedMateri: {
          ...normalized.visitedMateri,
          [item.title]: normalized.visitedMateri[item.title] ?? {
            title: item.title,
            index,
            firstVisitedAt: new Date().toISOString(),
          },
        },
        completedMateri: nextCompleted,
      };
    });
  };

  // Touch swipe support
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const dist = touchStart - touchEnd;
    if (dist > 50 && hasNext) handleNext();
    if (dist < -50 && hasPrev) handlePrev();
  };

  return (
    <div
      className="mx-auto flex w-full max-w-[980px] flex-col gap-6 px-4 py-2 sm:px-6 lg:px-8"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-3">
        {/* Back to list */}
        <button
          type="button"
          onClick={handleBackToList}
          className="inline-flex items-center gap-1.5 rounded-xl border-2 border-white/80 bg-white/80 px-3 py-2 text-sm font-black text-[#7a4f2e] shadow-md backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          Daftar Materi
        </button>

        {/* Progress badge */}
        <div className="inline-flex items-center gap-2 rounded-full border-2 border-orange-300 bg-white/90 px-4 py-1.5 text-sm font-black text-orange-600 shadow-md">
          <BookOpen size={14} aria-hidden="true" />
          {index + 1} / {total}
        </div>
      </div>

      {/* ── Progress dots ── */}
      <div className="flex justify-center gap-1.5" aria-label={`Materi ${index + 1} dari ${total}`}>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index
                ? 'w-6 bg-orange-500'
                : i < index
                ? 'w-2 bg-orange-300'
                : 'w-2 bg-white/50'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* ── Main content card ── */}
      <StimulusComic stimulus={stimulus} title={item.title} />

      <article className="overflow-hidden rounded-3xl border-4 border-white/80 bg-white shadow-[0_8px_40px_rgba(46,29,16,0.18)]">
        {/* Header */}
        <header className="relative bg-gradient-to-r from-[#ff9b2f] to-[#ffba73] px-6 py-6 sm:px-8 sm:py-7">
          {/* Decorative shine */}
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
          <span className="pointer-events-none absolute inset-1 rounded-t-2xl border border-white/30" />

          <p className="relative mb-1 text-xs font-black uppercase tracking-[0.15em] text-white/70">
            Materi Parikan
          </p>
          <h1 className="relative text-[clamp(1.8rem,4vw,2.6rem)] font-black leading-tight text-white drop-shadow-md">
            {item.title}
          </h1>
          {item.short && (
            <p className="relative mt-1.5 text-sm font-semibold text-white/80">
              {item.short}
            </p>
          )}
        </header>

        {/* Body */}
        <div className="px-6 py-7 sm:px-8 sm:py-8">
          {/* TTS + body text */}
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={toggleSpeech}
              aria-label={isPlaying ? 'Hentikan suara' : isPreparingAudio ? 'Menyiapkan suara' : 'Putar suara'}
              title={isPlaying ? 'Hentikan Suara' : isPreparingAudio ? 'Menyiapkan Suara' : 'Putar Suara'}
              className={`mt-1 grid size-12 shrink-0 place-items-center rounded-full shadow-lg transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 ${
                isPlaying
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : isPreparingAudio
                  ? 'cursor-wait bg-orange-400 text-white'
                  : 'bg-[#ff9700] text-white hover:bg-[#e68800]'
              }`}
            >
              {isPlaying
                ? <Square size={18} fill="currentColor" aria-hidden="true" />
                : isPreparingAudio
                ? <LoaderCircle size={22} className="animate-spin" aria-hidden="true" />
                : <Volume2 size={22} aria-hidden="true" />
              }
            </button>

            <p className="text-[clamp(1rem,2vw,1.2rem)] font-semibold leading-relaxed text-[#4f2912]">
              {item.body}
            </p>
          </div>

          {audioMessage && (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700">
              {audioMessage}
            </p>
          )}

          {/* Example block */}
          {lines.length > 0 && (
            <div className="relative mt-7 overflow-hidden rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-5 sm:p-6">
              {/* Left accent bar */}
              <div className="absolute left-0 top-0 h-full w-[5px] rounded-l-2xl bg-gradient-to-b from-[#ff9700] to-[#ffba73]" />

              <strong className="mb-4 block text-xs font-black uppercase tracking-[0.15em] text-[#d97706]">
                📜 Tuladha (Contoh)
              </strong>

              <div className="grid gap-2 pl-1">
                {lines.map((line, i) => (
                  <p
                    key={i}
                    className={`text-[clamp(1.05rem,2.5vw,1.3rem)] font-black leading-snug text-[#6d3a14] ${
                      i % 2 === 1 ? 'text-orange-700' : ''
                    }`}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}

          <MiniActivity activity={miniActivity} />

          <div className="mt-7 rounded-2xl border-2 border-green-200 bg-green-50 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-green-600">
                Progress Belajar
              </p>
              <p className="mt-1 text-sm font-bold leading-relaxed text-[#4f2912]">
                {isMateriCompleted
                  ? 'Materi iki wis ditandai rampung. Progresmu bakal katon ing Alur Belajar.'
                  : 'Tandai rampung yen wis maca materi, komik, lan tuladha kanthi lengkap.'}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleMateriComplete}
              className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-black uppercase tracking-wide shadow-sm transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-200 sm:mt-0 sm:w-auto ${
                isMateriCompleted
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-white text-green-700 ring-2 ring-green-300 hover:bg-green-100'
              }`}
            >
              <CheckCircle2 size={17} aria-hidden="true" />
              {isMateriCompleted ? 'Wis Rampung' : 'Tandai Rampung'}
            </button>
          </div>
        </div>
      </article>

      {/* ── Navigation buttons ── */}
      <nav
        className="flex items-center justify-between gap-4 pb-2"
        aria-label="Navigasi materi"
      >
        <button
          type="button"
          onClick={handlePrev}
          disabled={!hasPrev}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border-4 py-4 text-base font-black uppercase shadow-lg transition-all duration-200 ${
            hasPrev
              ? 'border-white/80 bg-white text-[#7a4f2e] hover:-translate-y-1 hover:bg-orange-50 hover:shadow-xl active:translate-y-0'
              : 'cursor-not-allowed border-white/40 bg-white/40 text-gray-400 opacity-50'
          }`}
        >
          <ChevronLeft size={20} aria-hidden="true" />
          <span className="hidden sm:inline">Sadurunge</span>
          <span className="sm:hidden">Prev</span>
        </button>

        {/* Dot indicator (center) */}
        <span className="shrink-0 text-sm font-black text-white/70">
          {index + 1}/{total}
        </span>

        <button
          type="button"
          onClick={handleNext}
          disabled={!hasNext}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border-4 py-4 text-base font-black uppercase shadow-lg transition-all duration-200 ${
            hasNext
              ? 'border-white/80 bg-gradient-to-r from-[#ff9b2f] to-[#ffba73] text-white hover:-translate-y-1 hover:shadow-xl active:translate-y-0'
              : 'cursor-not-allowed border-white/40 bg-white/40 text-gray-400 opacity-50'
          }`}
        >
          <span className="hidden sm:inline">Sabanjure</span>
          <span className="sm:hidden">Next</span>
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </nav>

      {/* Swipe hint — mobile only */}
      <p className="text-center text-xs font-semibold text-white/50 sm:hidden" aria-hidden="true">
        ← Geser layar kanggo ganti materi →
      </p>
    </div>
  );
}
