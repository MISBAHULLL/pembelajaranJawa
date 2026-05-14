import React from 'react';
import { Home, ChevronRight } from 'lucide-react';
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
    <header className="sticky top-0 z-40 w-full border-b-2 border-orange-400/40 bg-[rgba(255,248,238,0.88)] shadow-[0_2px_16px_rgba(46,29,16,0.10)] backdrop-blur-md">
      <div className="mx-auto flex h-[56px] max-w-[1200px] items-center gap-3 px-4 sm:h-[62px] sm:px-6 lg:px-8">

        {/* Brand / Home button */}
        <button
          type="button"
          onClick={handleHome}
          aria-label="Kembali ke halaman utama"
          className="flex shrink-0 items-center gap-2 rounded-lg px-2 py-1.5 font-black text-orange-500 transition hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
        >
          <Home size={18} aria-hidden="true" />
          <span className="hidden text-base sm:inline">Javanesia</span>
        </button>

        {/* Divider */}
        {crumbs.length > 0 && (
          <ChevronRight size={15} className="shrink-0 text-orange-300" aria-hidden="true" />
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
                        className="truncate rounded-md bg-orange-100 px-2.5 py-1 text-sm font-black text-orange-600"
                        aria-current="page"
                      >
                        {crumb.label}
                      </span>
                    ) : (
                      /* Clickable ancestor */
                      <button
                        type="button"
                        onClick={() => handleCrumb(crumb)}
                        className="truncate rounded-md px-2 py-1 text-sm font-bold text-[#7a4f2e] transition hover:bg-orange-100 hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
                      >
                        {crumb.label}
                      </button>
                    )}
                  </li>

                  {/* Separator between crumbs */}
                  {!isLast && (
                    <li aria-hidden="true">
                      <ChevronRight size={13} className="shrink-0 text-orange-300" />
                    </li>
                  )}
                </React.Fragment>
              );
            })}
          </ol>
        </nav>

        {/* Right side — decorative batik accent */}
        <div
          className="pointer-events-none ml-auto hidden h-[28px] w-[120px] shrink-0 opacity-20 sm:block"
          style={{
            backgroundImage: "url('/assets/batik-border.svg')",
            backgroundSize: '120px 28px',
            backgroundRepeat: 'no-repeat',
          }}
          aria-hidden="true"
        />
      </div>
    </header>
  );
}
