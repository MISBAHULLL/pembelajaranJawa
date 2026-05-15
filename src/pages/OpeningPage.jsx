import { BookOpen, ChevronRight } from 'lucide-react';
import { useClickSound } from '../hooks/useClickSound.js';

export function OpeningPage({ onEnter }) {
  const playClick = useClickSound();

  const handleEnter = () => {
    playClick();
    onEnter();
  };

  return (
    <div className="home-scene relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">

      {/* Batik border atas — animasi geser */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[48px] opacity-40"
        style={{
          backgroundImage: "url('/assets/batik-border.svg')",
          backgroundSize: '260px 48px',
          backgroundRepeat: 'repeat-x',
          animation: 'slideRight 20s linear infinite',
        }}
        aria-hidden="true"
      />

      {/* Batik border bawah */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[48px] rotate-180 opacity-40"
        style={{
          backgroundImage: "url('/assets/batik-border.svg')",
          backgroundSize: '260px 48px',
          backgroundRepeat: 'repeat-x',
          animation: 'slideRight 20s linear infinite',
        }}
        aria-hidden="true"
      />

      {/* Palace illustration */}
      <img
        src="/assets/javanese-palace.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 z-0 w-[min(700px,90vw)] -translate-x-1/2 opacity-30 drop-shadow-2xl sm:opacity-40"
      />

      {/* Mist kiri & kanan */}
      <div className="mist pointer-events-none absolute bottom-0 left-[-10vw] z-[1] h-48 w-[60vw] opacity-60" aria-hidden="true" />
      <div className="mist pointer-events-none absolute bottom-0 right-[-10vw] z-[1] h-48 w-[60vw] opacity-60" aria-hidden="true" />

      {/* Main content */}
      <main className="relative z-10 flex w-full max-w-[560px] flex-col items-center gap-8 text-center">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3 animate-[fadeInUp_0.7s_ease-out_both]">
          <div className="grid size-[clamp(7rem,22vw,11rem)] place-items-center rounded-full bg-white/18 p-3 shadow-[0_14px_40px_rgba(46,29,16,0.24)] ring-2 ring-white/35 backdrop-blur-sm">
            <img
              src="/assets/logo-icon.png"
              alt="Logo Javanesia"
              className="h-full w-full object-contain drop-shadow-[0_8px_18px_rgba(46,29,16,0.22)]"
            />
          </div>
          <h1
            className="text-[clamp(3rem,8vw,5.2rem)] font-black uppercase leading-none text-white"
            style={{
              WebkitTextStroke: '6px #ff9632',
              paintOrder: 'stroke fill',
              filter: 'drop-shadow(0 6px 0 rgba(255,150,50,0.3)) drop-shadow(0 12px 28px rgba(46,29,16,0.3))',
            }}
          >
            Javanesia
          </h1>
          <p className="text-base font-bold tracking-[0.15em] text-white/85 drop-shadow-md sm:text-lg">
            Sinau Basa Jawa kanthi Cara Menarik
          </p>
        </div>

        {/* Divider */}
        <div
          className="flex w-full items-center gap-4 animate-[fadeInUp_0.85s_ease-out_both]"
          aria-hidden="true"
        >
          <div className="h-px flex-1 bg-white/30" />
          <span className="text-white/50 text-xl">✦</span>
          <div className="h-px flex-1 bg-white/30" />
        </div>

        {/* Info card */}
        <div className="w-full animate-[fadeInUp_1s_ease-out_both] overflow-hidden rounded-2xl border-2 border-orange-200 bg-white/85 px-6 py-5 shadow-[0_8px_32px_rgba(46,29,16,0.2)] backdrop-blur-md">
          <div className="flex items-center justify-center gap-2 mb-3">
            <BookOpen size={15} className="text-orange-600" aria-hidden="true" />
            <span className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Media Pembelajaran</span>
          </div>
          <p className="text-[clamp(1.1rem,3vw,1.4rem)] font-black text-[#3d1f00] drop-shadow-sm">
            Basa Jawa
          </p>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-1.5 shadow-md">
            <span className="text-sm font-black text-white tracking-wide">Parikan</span>
          </div>
        </div>

        {/* Enter button */}
        <button
          type="button"
          onClick={handleEnter}
          className="group animate-[fadeInUp_1.15s_ease-out_both] relative w-full overflow-hidden rounded-2xl border-4 border-white/90 bg-[#ffba73] px-8 py-5 font-black text-white shadow-[0_8px_0_rgba(72,64,56,0.25),0_16px_32px_rgba(46,29,16,0.2)] transition-all duration-200 hover:-translate-y-1.5 hover:bg-[#ffac5e] hover:shadow-[0_12px_0_rgba(72,64,56,0.2),0_20px_36px_rgba(46,29,16,0.25)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 active:translate-y-0"
        >
          {/* Shine */}
          <span className="pointer-events-none absolute inset-1 rounded-xl border border-white/40" />
          <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/20 to-transparent" />

          <span className="relative flex items-center justify-center gap-3 text-[clamp(1.3rem,3vw,1.6rem)]">
            <span
              style={{
                WebkitTextStroke: '4px #e07a00',
                paintOrder: 'stroke fill',
              }}
            >
              Mlebu / Mulai
            </span>
            <ChevronRight
              size={24}
              className="transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
        </button>

        {/* Footer */}
        <p
          className="animate-[fadeInUp_1.3s_ease-out_both] text-xs font-bold text-[#000000]/100 tracking-widest uppercase"
          aria-hidden="true"
        >
          ✦ Javanesia · Parikan ✦
        </p>
      </main>
    </div>
  );
}
