export function SceneLayout({ children, isHome, label, variant = 'materi' }) {
  const isVideo = variant === 'video';

  return (
    <section
      className={`sky-scene relative isolate flex-1 transition-all duration-500 ${
        isHome
          ? 'home-scene grid min-h-screen content-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8'
          : isVideo
          ? 'video-scene min-h-[calc(100vh-56px)] px-4 pb-10 pt-8 sm:min-h-[calc(100vh-62px)] sm:px-6 sm:pb-12 sm:pt-10 lg:px-12'
          : 'min-h-[calc(100vh-56px)] px-4 pb-10 pt-8 sm:min-h-[calc(100vh-62px)] sm:px-6 sm:pb-12 sm:pt-10 lg:px-16'
      }`}
      aria-label={label}
    >
      {!isHome && !isVideo && (
        <>
          <img
            className="pointer-events-none absolute bottom-48 left-1/2 z-[-3] w-[min(800px,92vw)] -translate-x-1/2 opacity-50 drop-shadow-2xl transition-opacity duration-700 sm:bottom-16 sm:opacity-70 lg:bottom-20"
            src="/assets/javanese-palace.svg"
            alt=""
            aria-hidden="true"
          />
          <div className="mist pointer-events-none absolute bottom-24 left-[-10vw] z-[-2] h-48 w-[75vw] opacity-80 sm:bottom-16 sm:w-[50vw] lg:h-56" />
          <div className="mist pointer-events-none absolute bottom-24 right-[-10vw] z-[-2] h-48 w-[75vw] opacity-80 sm:bottom-16 sm:w-[50vw] lg:h-56" />
        </>
      )}
      {children}
    </section>
  );
}
