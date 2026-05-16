import { HelpCircle, Map } from 'lucide-react';
import { MenuButton } from '../components/MenuButton.jsx';
import { useClickSound } from '../hooks/useClickSound.js';

export function HomePage({ menuItems, onChooseMenu, onOpenGuide, onOpenPath }) {
  const playClick = useClickSound();

  const handleOpenGuide = () => {
    playClick();
    onOpenGuide?.();
  };

  const handleOpenPath = () => {
    playClick();
    onOpenPath?.();
  };

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center justify-center gap-10 px-4 sm:gap-12 sm:px-6 lg:gap-14 lg:px-8">
      <header className="grid w-full max-w-4xl justify-items-center text-center">
        <img
          src="/assets/logo-icon.png"
          alt="Logo Javanesia"
          className="mb-3 h-auto w-[min(170px,42vw)] animate-[fadeInUp_0.65s_ease-out] drop-shadow-[0_10px_22px_rgba(46,29,16,0.22)]"
        />
        <h1 className="home-title animate-[fadeInUp_0.8s_ease-out] text-[clamp(3.5rem,7vw,5rem)] font-black uppercase leading-none text-white drop-shadow-2xl">
          Javanesia
        </h1>
        <p className="mt-4 animate-[fadeInUp_1s_ease-out] text-lg font-bold text-white/90 drop-shadow-md sm:text-xl">
          Sinau Basa Jawa kanthi Cara Menarik
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={handleOpenPath}
            className="inline-flex items-center gap-2 rounded-full border-2 border-white/95 bg-orange-500 px-5 py-2 text-sm font-black uppercase tracking-wide text-white shadow-[0_5px_0_rgba(95,60,31,0.18),0_10px_20px_rgba(46,29,16,0.14)] transition hover:-translate-y-0.5 hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
          >
            <Map size={17} aria-hidden="true" />
            Alur Belajar
          </button>
          <button
            type="button"
            onClick={handleOpenGuide}
            className="inline-flex items-center gap-2 rounded-full border-2 border-white/90 bg-white/90 px-5 py-2 text-sm font-black uppercase tracking-wide text-orange-500 shadow-[0_5px_0_rgba(95,60,31,0.18),0_10px_20px_rgba(46,29,16,0.14)] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
          >
            <HelpCircle size={17} aria-hidden="true" />
            Petunjuk
          </button>
        </div>
      </header>

      <nav 
        className="mx-auto grid w-full max-w-[900px] grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6" 
        aria-label="Menu utama Javanesia"
      >
        {menuItems.map((item, index) => (
          <div
            key={item.title}
            className="animate-[fadeInUp_0.6s_ease-out]"
            style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
          >
            <MenuButton item={item} variant="home" onClick={() => onChooseMenu(item)} />
          </div>
        ))}
      </nav>
    </div>
  );
}
