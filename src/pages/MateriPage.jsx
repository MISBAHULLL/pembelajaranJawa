import React from 'react';
import { ChevronRight, BookOpen } from 'lucide-react';
import { useClickSound } from '../hooks/useClickSound.js';

export function MateriPage({ materiItems, onOpenMateri }) {
  const playClick = useClickSound();

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center gap-8 px-4 py-2 sm:px-6 lg:px-8">

      {/* Header */}
      <header className="w-full max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border-2 border-orange-300 bg-white/80 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-orange-600 shadow-sm backdrop-blur-sm">
          <BookOpen size={13} aria-hidden="true" />
          Materi Parikan
        </div>
        <h1
          className="mt-3 text-[clamp(2.8rem,6vw,4rem)] font-black uppercase leading-none text-white drop-shadow-2xl"
          style={{ WebkitTextStroke: '5px #ff9632', paintOrder: 'stroke fill' }}
        >
          Pilih Materi
        </h1>
        <p className="mt-2 text-sm font-bold text-[#2e1d10]/80 drop-shadow-sm">
          {materiItems.length} materi kasedhiya — klik kanggo maca kanthi lengkap
        </p>
      </header>

      {/* Grid kartu materi */}
      <nav
        className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5"
        aria-label="Daftar materi parikan"
      >
        {materiItems.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => { playClick(); onOpenMateri(item); }}
            className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border-4 border-white/90 bg-white/90 p-5 text-left shadow-[0_6px_0_rgba(95,60,31,0.15),0_12px_24px_rgba(78,45,21,0.12)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-1.5 hover:border-orange-300 hover:shadow-[0_10px_0_rgba(95,60,31,0.12),0_18px_30px_rgba(78,45,21,0.18)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-300 active:translate-y-0 animate-[fadeInUp_0.5s_ease-out]"
            style={{ animationDelay: `${index * 0.06}s`, animationFillMode: 'both' }}
            aria-label={`Buka materi: ${item.title}`}
          >
            {/* Shine overlay */}
            <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/60 via-transparent to-transparent" />

            {/* Number badge */}
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ff9b2f] to-[#ffba73] text-sm font-black text-white shadow-md">
              {index + 1}
            </span>

            {/* Title */}
            <h2 className="relative text-[clamp(1.05rem,2vw,1.2rem)] font-black leading-snug text-[#4f2912]">
              {item.title}
            </h2>

            {/* Short description */}
            {item.short && (
              <p className="relative text-sm font-semibold leading-relaxed text-[#7a5030]/80">
                {item.short}
              </p>
            )}

            {/* Example preview */}
            {item.example && (
              <p className="relative truncate rounded-lg bg-orange-50 px-3 py-2 text-xs font-bold italic text-orange-700 ring-1 ring-orange-200">
                "{item.example.split('\n')[0]}"
              </p>
            )}

            {/* Arrow */}
            <span className="relative mt-auto flex items-center gap-1 text-xs font-black uppercase tracking-wide text-orange-500 transition-all group-hover:gap-2">
              Waca Materi
              <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
