import React from 'react';
import { ChevronRight } from 'lucide-react';
import { MenuIcon } from './Icon.jsx';

export function MenuButton({ item, active, compact = false, variant = 'default', onClick }) {
  if (variant === 'home') {
    return (
      <button
        className="home-menu-button group relative grid min-h-[86px] w-full cursor-pointer place-items-center rounded-[12px] border-[5px] border-white/95 bg-[#ffba73]/95 px-6 py-4 text-center font-black text-white shadow-[0_7px_0_rgba(72,64,56,0.25),0_12px_22px_rgba(65,53,42,0.12)] transition duration-200 hover:-translate-y-1 hover:bg-[#ffac5e] hover:shadow-[0_12px_0_rgba(72,64,56,0.18),0_18px_26px_rgba(65,53,42,0.18)] focus-visible:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 active:translate-y-px sm:min-h-[96px]"
        type="button"
        onClick={onClick}
      >
        <span className="pointer-events-none absolute inset-1 rounded-md border border-white/35" />
        <span className="home-menu-text relative z-10 min-w-0 overflow-wrap-anywhere text-[clamp(1.6rem,3.2vw,2.1rem)] leading-none">
          {item.title}
        </span>
      </button>
    );
  }

  return (
    <button
      className={`group relative grid w-full cursor-pointer items-center gap-3 rounded-[13px] border-4 border-white/95 bg-gradient-to-b from-[#ffc47d] to-[#ff9b2f] px-4 py-4 text-left font-black text-white shadow-[0_7px_0_rgba(95,60,31,0.22),0_16px_28px_rgba(78,45,21,0.16)] transition duration-200 hover:-translate-y-1 hover:saturate-110 hover:shadow-[0_12px_0_rgba(95,60,31,0.18),0_20px_30px_rgba(78,45,21,0.2)] focus-visible:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 active:translate-y-px ${compact ? 'aspect-[3/1] grid-cols-[28px_1fr_22px]' : 'aspect-[2.5/1] grid-cols-[32px_1fr] sm:px-6'} ${active ? 'from-[#e26e21] to-[#97411d]' : ''}`}
      type="button"
      onClick={onClick}
    >
      <span className="pointer-events-none absolute inset-1 rounded-lg border border-white/40" />
      <span className="relative z-10 grid place-items-center">
        <MenuIcon name={item.icon ?? 'book'} size={compact ? 22 : 26} />
      </span>
      <span className={`relative z-10 min-w-0 overflow-wrap-anywhere text-shadow-orange ${compact ? 'text-[clamp(1.05rem,1.6vw,1.4rem)] leading-tight' : 'text-center text-[clamp(1.2rem,3vw,2.2rem)] leading-none'}`}>
        {item.title}
      </span>
      {compact && <ChevronRight className="relative z-10 transition group-hover:translate-x-1" size={20} aria-hidden="true" />}
    </button>
  );
}
