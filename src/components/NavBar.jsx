import React from 'react';
import { Home, ChevronRight, Sparkles } from 'lucide-react';
import { useClickSound } from '../hooks/useClickSound.js';

/**
 * NavBar — sticky top navigation with breadcrumb.
 *
 * Props:
 *  - crumbs: array of { label, onClick? }
 *    - first item = "Javanesia" (home)
 *    - last item = current page (no onClick, rendered as active)
 *  - onHome: callback to go back to home
 */
export function NavBar({ crumbs = [], onHome }) {
  const playClick = useClickSound();

  const handleHome = () => {
    playClick();
    onHome?.();
  };

  const handleCrumb = (crumb) => {
    if (crumb.onClick) {
      playClick();
      crumb.onClick();
    }
  };

  return (
    <header className="nav-shell sticky top-0 z-40 w-full overflow-hidden border-b border-orange-300/50 bg-[rgba(255,248,238,0.9)] shadow-[0_8px_28px_rgba(96,55,24,0.10)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-400/70 to-transparent" />
      <div className="mx-auto flex h-[64px] max-w-[1200px] items-center gap-3 px-4 sm:h-[68px] sm:px-6 lg:px-8">

        {/* Brand / Home button */}
        <button
          type="button"
          onClick={handleHome}
          aria-label="Kembali ke halaman utama"
          className="group flex shrink-0 items-center gap-2 rounded-full border-2 border-orange-200 bg-white/80 px-3 py-2 font-black text-orange-500 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
        >
          <span className="grid size-8 place-items-center rounded-full bg-orange-100 text-orange-500 transition group-hover:bg-orange-500 group-hover:text-white">
            <Home size={17} aria-hidden="true" />
          </span>
        </button>

        {/* Divider */}
        {crumbs.length > 0 && (
          <ChevronRight size={17} className="shrink-0 text-orange-300" aria-hidden="true" />
        )}

        {/* Breadcrumb trail */}
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 overflow-hidden">
          <ol className="flex min-w-0 items-center gap-1.5">
            {crumbs.map((crumb, i) => {
              const isLast = i === crumbs.length - 1;
              return (
                <React.Fragment key={i}>
                  <li className="flex min-w-0 items-center">
                    {isLast ? (
                      /* Active / current page */
                      <span
                        className="inline-flex max-w-[48vw] items-center gap-2 truncate rounded-full border-2 border-orange-200 bg-gradient-to-r from-orange-100 to-amber-100 px-4 py-2 text-sm font-black text-orange-600 shadow-sm sm:max-w-none"
                        aria-current="page"
                      >
                        <Sparkles size={14} className="shrink-0 text-orange-500" aria-hidden="true" />
                        {crumb.label}
                      </span>
                    ) : (
                      /* Clickable ancestor */
                      <button
                        type="button"
                        onClick={() => handleCrumb(crumb)}
                        className="truncate rounded-full px-3 py-2 text-sm font-bold text-[#7a4f2e] transition hover:-translate-y-0.5 hover:bg-white hover:text-orange-600 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
                      >
                        {crumb.label}
                      </button>
                    )}
                  </li>

                  {/* Separator between crumbs */}
                  {!isLast && (
                    <li aria-hidden="true">
                      <ChevronRight size={14} className="shrink-0 text-orange-300" />
                    </li>
                  )}
                </React.Fragment>
              );
            })}
          </ol>
        </nav>

        {/* Right side — decorative batik accent */}
        <div className="pointer-events-none ml-auto hidden shrink-0 rounded-full border-2 border-orange-200 bg-white/80 px-5 py-2 text-base font-black uppercase tracking-wide text-orange-500 shadow-sm sm:inline-flex">
          Javanesia
        </div>
      </div>
    </header>
  );
}
