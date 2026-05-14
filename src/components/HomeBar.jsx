import React from 'react';
import { Home } from 'lucide-react';

export function HomeBar({ onHome }) {
  return (
    <footer className="mt-auto flex min-h-[68px] justify-center border-t-2 border-orange-500/70 bg-[linear-gradient(90deg,rgba(255,252,246,0.9),rgba(248,225,200,0.88)),url('/assets/batik-border.svg')] bg-[size:auto,220px_42px] px-4 py-3 sm:min-h-[74px]">
      <button
        className="inline-flex min-w-36 items-center justify-center gap-2 rounded-xl border-0 bg-white/90 px-5 py-2.5 text-lg font-black uppercase text-orange-500 shadow-lg transition hover:-translate-y-0.5 focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
        type="button"
        onClick={onHome}
      >
        <Home size={22} aria-hidden="true" />
        <span>Home</span>
      </button>
    </footer>
  );
}
