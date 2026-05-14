import { useEffect, useState } from 'react';

/**
 * SplashScreen — muncul hanya sekali saat pertama kali buka app.
 * Setelah 2.2 detik otomatis fade out dan masuk home.
 * Flag disimpan di sessionStorage (bukan localStorage) supaya
 * muncul lagi kalau tab ditutup & dibuka ulang, tapi tidak
 * muncul lagi saat navigasi dalam app.
 */
export function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('enter'); // 'enter' | 'idle' | 'exit'

  useEffect(() => {
    // Phase timeline:
    // 0ms       → enter (logo slide in)
    // 600ms     → idle  (logo diam)
    // 1600ms    → exit  (fade out)
    // 2200ms    → done  (panggil onDone)

    const t1 = setTimeout(() => setPhase('idle'), 600);
    const t2 = setTimeout(() => setPhase('exit'), 1600);
    const t3 = setTimeout(() => onDone(), 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-500 ${
        phase === 'exit' ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(160deg, #7c3a00 0%, #b85c00 40%, #ff9700 100%)',
      }}
      aria-label="Javanesia loading"
      aria-live="polite"
    >
      {/* Batik border top */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[52px] opacity-30"
        style={{
          backgroundImage: "url('/assets/batik-border.svg')",
          backgroundSize: '260px 52px',
          backgroundRepeat: 'repeat-x',
        }}
        aria-hidden="true"
      />

      {/* Batik border bottom (flipped) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[52px] rotate-180 opacity-30"
        style={{
          backgroundImage: "url('/assets/batik-border.svg')",
          backgroundSize: '260px 52px',
          backgroundRepeat: 'repeat-x',
        }}
        aria-hidden="true"
      />

      {/* Glow background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.6) 0%, transparent 65%)',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        className={`relative flex flex-col items-center gap-4 transition-all duration-500 ${
          phase === 'enter'
            ? 'translate-y-6 opacity-0'
            : 'translate-y-0 opacity-100'
        }`}
      >
        {/* Logo text */}
        <h1
          className="text-[clamp(3.5rem,12vw,6rem)] font-black uppercase leading-none text-white"
          style={{
            WebkitTextStroke: '6px rgba(120,50,0,0.4)',
            paintOrder: 'stroke fill',
            filter: 'drop-shadow(0 6px 24px rgba(0,0,0,0.25))',
          }}
        >
          Javanesia
        </h1>

        {/* Tagline */}
        <p className="text-[clamp(0.9rem,2.5vw,1.1rem)] font-bold tracking-[0.2em] text-white/80 uppercase">
          Sinau Basa Jawa kanthi Cara Menarik
        </p>

        {/* Decorative divider */}
        <div className="mt-2 flex items-center gap-3">
          <div className="h-px w-16 bg-white/40" />
          <span className="text-white/60 text-lg" aria-hidden="true">✦</span>
          <div className="h-px w-16 bg-white/40" />
        </div>
      </div>

      {/* Bottom loading dots */}
      <div
        className={`absolute bottom-16 flex gap-2 transition-all duration-500 ${
          phase === 'enter' ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden="true"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-2 rounded-full bg-white/60"
            style={{
              animation: 'splashDot 1s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
