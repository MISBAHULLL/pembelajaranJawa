import { MenuButton } from '../components/MenuButton.jsx';

export function HomePage({ menuItems, onChooseMenu }) {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center justify-center gap-10 px-4 sm:gap-12 sm:px-6 lg:gap-14 lg:px-8">
      <header className="grid w-full max-w-4xl justify-items-center text-center">
        <h1 className="home-title animate-[fadeInUp_0.8s_ease-out] text-[clamp(3.5rem,7vw,5rem)] font-black uppercase leading-none text-white drop-shadow-2xl">
          Javanesia
        </h1>
        <p className="mt-4 animate-[fadeInUp_1s_ease-out] text-lg font-bold text-white/90 drop-shadow-md sm:text-xl">
          Sinau Basa Jawa kanthi Cara Menarik
        </p>
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
