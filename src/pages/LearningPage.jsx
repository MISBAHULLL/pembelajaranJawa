import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { MenuIcon } from '../components/Icon.jsx';

export function LearningPage({ item }) {
  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-7 px-4 py-2 sm:px-6 lg:px-8">
      <header className="relative overflow-hidden rounded-[8px] border border-white/80 bg-white/82 px-5 py-6 text-center shadow-[0_18px_40px_rgba(77,48,24,0.16)] backdrop-blur-md sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#0ea5a4]" />
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-[#fff3d6] text-[#d97706] shadow-inner ring-4 ring-white sm:size-20">
          <MenuIcon name={item.icon} size={36} />
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#edf7f5] px-4 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#0f766e]">
          <Sparkles size={14} aria-hidden="true" />
          Javanesia
        </span>
        <h1 className="mt-4 text-[clamp(2.1rem,5vw,4.1rem)] font-black uppercase leading-[0.95] text-[#2b1d12]">
          {item.title}
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-base font-semibold leading-relaxed text-[#6b4a2d] sm:text-lg">
          {item.body}
        </p>
      </header>

      <section className="grid gap-4 sm:gap-5" aria-label={item.eyebrow ?? item.title}>
        {item.points.map((point, index) => (
          <article
            key={point}
            className="group grid gap-4 rounded-[8px] border border-white/85 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(255,246,226,0.9))] p-4 shadow-[0_12px_28px_rgba(77,48,24,0.12)] backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(77,48,24,0.16)] sm:grid-cols-[72px_1fr] sm:p-5"
          >
            <div className="flex items-center gap-3 sm:block">
              <div className="grid size-12 shrink-0 place-items-center rounded-full bg-[#d97706] text-xl font-black text-white shadow-[0_5px_0_rgba(146,64,14,0.24)] sm:mx-auto sm:size-14">
                {index + 1}
              </div>
              <CheckCircle2 className="text-[#0f766e] sm:mx-auto sm:mt-3" size={24} aria-hidden="true" strokeWidth={3} />
            </div>
            <p className="text-[clamp(1rem,2.1vw,1.28rem)] font-extrabold leading-relaxed text-[#352315]">
              {point}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
