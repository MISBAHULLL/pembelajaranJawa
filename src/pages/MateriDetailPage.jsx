import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Volume2, Square, BookOpen, LoaderCircle } from 'lucide-react';
import { useClickSound } from '../hooks/useClickSound.js';
import { playAudioFile } from '../hooks/useAudioFile.js';

export function MateriDetailPage({ item, index, total, onNext, onPrev, hasNext, hasPrev, onBackToList }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreparingAudio, setIsPreparingAudio] = useState(false);
  const [audioMessage, setAudioMessage] = useState('');
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const narrationRef = useRef(null);
  const playClick = useClickSound();

  const lines = item.example ? item.example.split('\n') : [];

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

  // Cleanup on unmount
  useEffect(() => {
    return () => stopNarration();
  }, []);

  const toggleSpeech = () => {
    playClick();
    if (isPlaying || isPreparingAudio) {
      stopNarration();
    } else {
<<<<<<< HEAD
      setAudioMessage('');
      narrationRef.current = playAudioFile(item.audioSrc, {
        onLoadStart: () => setIsPreparingAudio(true),
=======
      narrationRef.current = playNaturalJavaneseSpeech(narrationText, {
        audioSrc: item.audioSrc,
        onLoading: () => setIsPreparingAudio(true),
>>>>>>> 81158be57ea706fbc03e13a1f6c488a4628d7d30
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
      className="mx-auto flex w-full max-w-[780px] flex-col gap-6 px-4 py-2 sm:px-6"
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
