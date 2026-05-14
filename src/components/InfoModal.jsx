import React, { useState, useEffect } from 'react';
import { X, Volume2, Square, ChevronLeft, ChevronRight } from 'lucide-react';

export function InfoModal({ label, item, example, onClose, onNext, onPrev, hasNext, hasPrev }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const lines = example ? example.split('\n') : [];

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Handle speech interruption when item changes
  useEffect(() => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }, [item]);

  const toggleSpeech = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel(); // clear any previous speech
      const textToSpeak = `${item.title}. ${item.body} ${example ? 'Tuladha: ' + example : ''}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'id-ID'; // Use Indonesian TTS to read Javanese text
      
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onNext && hasNext) onNext();
    if (isRightSwipe && onPrev && hasPrev) onPrev();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#2e1a0b]/60 p-4 backdrop-blur-sm transition-all" role="presentation" onClick={onClose}>
      <article
        className="relative grid max-h-[90vh] w-[min(680px,100%)] animate-[fadeInUp_0.3s_ease-out] overflow-hidden rounded-2xl border-4 border-white/80 bg-white text-[#4f2912] shadow-[0_24px_60px_rgba(46,26,11,0.4)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <header className="relative bg-gradient-to-r from-[#ff9b2f] to-[#ffba73] px-6 py-5 sm:px-8">
          <span className="mb-1 block text-sm font-black uppercase tracking-[0.12em] text-[#8b4513]/80 drop-shadow-sm">{label}</span>
          <h2 id="modal-title" className="pr-12 text-[clamp(1.7rem,3.5vw,2.4rem)] font-black leading-tight text-white drop-shadow-md">
            {item.title}
          </h2>
          <button
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white hover:text-[#ff9b2f] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
            type="button"
            aria-label="Tutup"
            onClick={onClose}
          >
            <X size={24} aria-hidden="true" strokeWidth={3} />
          </button>
        </header>

        <div className="overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
          <div className="mb-6 flex items-start gap-4">
            <button
              onClick={toggleSpeech}
              className={`mt-1 grid size-12 shrink-0 place-items-center rounded-full shadow-lg transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 ${
                isPlaying 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-[#ff9700] text-white hover:bg-[#e68800]'
              }`}
              title={isPlaying ? "Hentikan Suara" : "Putar Suara"}
            >
              {isPlaying ? <Square size={18} fill="currentColor" /> : <Volume2 size={24} />}
            </button>
            <p className="text-lg font-bold leading-relaxed text-[#5b3d24]">
              {item.body}
            </p>
          </div>

          {lines.length > 0 && (
            <div className="relative mt-2 overflow-hidden rounded-xl border-2 border-orange-200 bg-orange-50/50 p-5 sm:p-6">
              <div className="absolute left-0 top-0 h-full w-2 bg-[#ff9700]" />
              <strong className="mb-3 block text-sm font-black uppercase tracking-wider text-[#d97706]">Tuladha (Contoh):</strong>
              <div className="grid gap-1.5 text-xl font-black text-[#6d3a14]">
                {lines.map((line, i) => (
                  <span key={i}>{line}</span>
                ))}
              </div>
            </div>
          )}

          {(onPrev || onNext) && (
            <div className="mt-8 flex items-center justify-between gap-4 border-t-2 border-orange-100 pt-6">
              <button
                onClick={onPrev}
                disabled={!hasPrev}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-3 font-bold transition-all sm:gap-2 ${
                  hasPrev
                    ? 'bg-orange-100 text-[#d97706] hover:bg-orange-200 active:scale-95'
                    : 'cursor-not-allowed bg-gray-100 text-gray-400 opacity-50'
                }`}
              >
                <ChevronLeft size={20} />
                <span className="text-sm sm:text-base">Sadurunge</span>
              </button>
              
              <button
                onClick={onNext}
                disabled={!hasNext}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-3 font-bold shadow-md transition-all sm:gap-2 ${
                  hasNext
                    ? 'bg-[#ff9700] text-white hover:bg-[#e68800] active:scale-95'
                    : 'cursor-not-allowed bg-gray-100 text-gray-400 opacity-50 shadow-none'
                }`}
              >
                <span className="text-sm sm:text-base">Sabanjure</span>
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
