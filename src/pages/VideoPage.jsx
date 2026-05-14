import { useState } from 'react';
import { PlayCircle, ArrowLeft } from 'lucide-react';

export function VideoPage({ videos }) {
  const [selectedVideo, setSelectedVideo] = useState(null);

  if (selectedVideo) {
    return (
      <div className="mx-auto w-full max-w-[1000px] px-4 pb-6 sm:px-6 lg:px-8">
        <button
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-5 py-2.5 font-black text-[#6d3518] shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
          onClick={() => setSelectedVideo(null)}
          type="button"
        >
          <ArrowLeft size={20} aria-hidden="true" />
          Kembali ke Daftar Video
        </button>

        <article className="grid gap-4 rounded-[14px] border border-white/70 bg-white/95 p-4 shadow-[0_24px_60px_rgba(45,31,18,0.28)] sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.08em] text-[#9c571d]">Sedang diputar</span>
              <h2 id="video-title" className="mt-1 text-[clamp(1.5rem,3vw,2rem)] font-black leading-tight text-[#3d2817]">
                {selectedVideo.title}
              </h2>
              <p className="font-bold text-[#6b4a2d]">{selectedVideo.description}</p>
            </div>
          </div>

          <div className="aspect-video overflow-hidden rounded-[12px] border-4 border-[#ff9700] bg-black shadow-inner">
            <iframe
              className="h-full w-full"
              src={selectedVideo.embedUrl}
              title={selectedVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#ff9700] px-4 py-2 font-black text-white">
            <PlayCircle size={20} aria-hidden="true" />
            YouTube
          </span>
        </article>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-[1200px] content-center gap-10 px-4 sm:gap-12 sm:px-6 lg:gap-16 lg:px-8">
      <header className="text-center">
        <h1 className="text-[clamp(2.5rem,5.5vw,3.5rem)] font-black uppercase leading-tight text-black">
          Video Pembelajaran
        </h1>
        <p className="mt-3 text-lg font-bold text-[#5b371d]">Pilih video kanggo sinau parikan Jawa</p>
      </header>

      <nav className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8" aria-label="Daftar video pembelajaran">
        {videos.map((video, index) => {
          return (
            <button
              key={video.title}
              className="group relative flex aspect-[4/3] w-full flex-col cursor-pointer overflow-hidden rounded-[20px] border-4 border-white/95 bg-gradient-to-b from-[#ffba73] to-[#e87b00] text-left font-black text-white shadow-[0_8px_0_rgba(139,69,19,0.3),0_15px_25px_rgba(139,69,19,0.2)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_0_rgba(139,69,19,0.25),0_20px_35px_rgba(139,69,19,0.25)] focus-visible:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-300 active:translate-y-0"
              type="button"
              onClick={() => setSelectedVideo(video)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Abstract Pattern Overlay */}
              <div className="absolute inset-0 z-0 opacity-20 bg-[url('/assets/batik-border.svg')] bg-[size:150px] mix-blend-overlay" />
              
              {/* Play Button Center */}
              <div className="absolute inset-0 z-10 grid place-items-center bg-black/5 transition-colors duration-300 group-hover:bg-black/10">
                <div className="grid size-16 place-items-center rounded-full bg-white text-[#e87b00] shadow-[0_8px_20px_rgba(0,0,0,0.2)] transition-transform duration-300 group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1.5"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
                </div>
              </div>

              {/* Title & Description at Bottom */}
              <div className="relative z-20 mt-auto w-full bg-gradient-to-t from-[#4a2508]/95 via-[#4a2508]/70 to-transparent p-5 pt-14">
                <h2 className="mb-1 text-[clamp(1.6rem,3vw,2.2rem)] leading-none text-white drop-shadow-md">
                  {video.title}
                </h2>
                <p className="line-clamp-2 text-sm font-bold leading-snug text-orange-200 drop-shadow-sm sm:text-base">
                  {video.description}
                </p>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
