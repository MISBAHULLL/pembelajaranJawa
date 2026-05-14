import { useState } from 'react';
import { Play, ArrowLeft, Youtube, BookOpen } from 'lucide-react';
import { useClickSound } from '../hooks/useClickSound.js';

export function VideoPage({ videos }) {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [thumbError, setThumbError] = useState({});
  const playClick = useClickSound();

  const handleSelect = (video) => {
    playClick();
    setSelectedVideo(video);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    playClick();
    setSelectedVideo(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Player view ──────────────────────────────────────────────────────────────
  if (selectedVideo) {
    return (
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-5 px-4 py-2 sm:px-6">

        {/* Back button */}
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex w-fit items-center gap-2 rounded-xl border-2 border-white/80 bg-white/80 px-4 py-2 text-sm font-black text-[#7a4f2e] shadow-md backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Kembali ke Daftar Video
        </button>

        {/* Player card */}
        <article className="overflow-hidden rounded-3xl border-4 border-white/80 bg-white shadow-[0_8px_40px_rgba(46,29,16,0.18)]">
          {/* Video iframe */}
          <div className="aspect-video w-full bg-black">
            <iframe
              className="h-full w-full"
              src={`${selectedVideo.embedUrl}?autoplay=1&rel=0&modestbranding=1`}
              title={selectedVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Info below player */}
          <div className="px-6 py-5 sm:px-8 sm:py-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="mb-1 block text-xs font-black uppercase tracking-[0.12em] text-orange-500">
                  Sedang Diputar
                </span>
                <h2 className="text-[clamp(1.3rem,3vw,1.8rem)] font-black leading-tight text-[#3d2817]">
                  {selectedVideo.title}
                </h2>
                <p className="mt-1.5 text-sm font-semibold leading-relaxed text-[#7a5030]">
                  {selectedVideo.description}
                </p>
              </div>

              {/* YouTube badge */}
              <a
                href={`https://youtu.be/${selectedVideo.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-black text-white shadow-md transition hover:bg-red-700"
                aria-label="Buka di YouTube"
              >
                <Youtube size={14} aria-hidden="true" />
                YouTube
              </a>
            </div>
          </div>
        </article>

        {/* Other videos */}
        {videos.length > 1 && (
          <section className="mt-2">
            <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-[#2e1d10]/60">
              Video Liyane
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {videos
                .filter(v => v.videoId !== selectedVideo.videoId)
                .map(video => (
                  <VideoCard
                    key={video.videoId}
                    video={video}
                    compact
                    thumbError={thumbError}
                    onThumbError={setThumbError}
                    onClick={() => handleSelect(video)}
                  />
                ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center gap-8 px-4 py-2 sm:px-6 lg:px-8">

      {/* Header */}
      <header className="w-full max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border-2 border-orange-300 bg-white/80 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-orange-600 shadow-sm backdrop-blur-sm">
          <BookOpen size={13} aria-hidden="true" />
          Video Pembelajaran
        </div>
        <h1
          className="mt-3 text-[clamp(2.8rem,6vw,4rem)] font-black uppercase leading-none text-white drop-shadow-2xl"
          style={{ WebkitTextStroke: '5px #ff9632', paintOrder: 'stroke fill' }}
        >
          Pilih Video
        </h1>
        <p className="mt-2 text-sm font-bold text-[#2e1d10]/80 drop-shadow-sm">
          {videos.length} video kasedhiya — klik kanggo nonton
        </p>
      </header>

      {/* Video grid */}
      <nav
        className={`grid w-full gap-5 sm:gap-6 ${
          videos.length === 1
            ? 'max-w-[520px]'
            : videos.length === 2
            ? 'max-w-[860px] sm:grid-cols-2'
            : 'sm:grid-cols-2 lg:grid-cols-3'
        }`}
        aria-label="Daftar video pembelajaran"
      >
        {videos.map((video, index) => (
          <div
            key={video.videoId}
            className="animate-[fadeInUp_0.55s_ease-out]"
            style={{ '--stagger-delay': `${index * 100}ms`, animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
          >
            <VideoCard
              video={video}
              thumbError={thumbError}
              onThumbError={setThumbError}
              onClick={() => handleSelect(video)}
            />
          </div>
        ))}
      </nav>
    </div>
  );
}

// ── VideoCard sub-component ──────────────────────────────────────────────────
function VideoCard({ video, compact = false, thumbError, onThumbError, onClick }) {
  // YouTube thumbnail: try maxresdefault first, fallback to hqdefault
  const thumbUrl = thumbError[video.videoId]
    ? `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`
    : `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`;

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group flex w-full items-center gap-3 overflow-hidden rounded-2xl border-2 border-white/80 bg-white/90 p-3 text-left shadow-md transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
      >
        {/* Thumbnail */}
        <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-xl bg-black">
          <img
            src={thumbUrl}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
            onError={() => onThumbError(prev => ({ ...prev, [video.videoId]: true }))}
          />
          <div className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 transition group-hover:opacity-100">
            <Play size={20} className="text-white" fill="white" aria-hidden="true" />
          </div>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-[#3d2817]">{video.title}</p>
          <p className="mt-0.5 line-clamp-2 text-xs font-semibold text-[#7a5030]">{video.description}</p>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex w-full flex-col overflow-hidden rounded-3xl border-4 border-white/90 bg-white shadow-[0_6px_0_rgba(95,60,31,0.15),0_12px_28px_rgba(78,45,21,0.14)] transition-all duration-200 hover:-translate-y-2 hover:shadow-[0_10px_0_rgba(95,60,31,0.12),0_20px_36px_rgba(78,45,21,0.2)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-300 active:translate-y-0"
      aria-label={`Putar video: ${video.title}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <img
          src={thumbUrl}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => onThumbError(prev => ({ ...prev, [video.videoId]: true }))}
        />

        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Play button */}
        <div className="absolute inset-0 grid place-items-center">
          <div className="grid size-16 place-items-center rounded-full bg-white/95 text-red-600 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_6px_28px_rgba(0,0,0,0.4)]">
            <Play size={28} fill="currentColor" className="ml-1" aria-hidden="true" />
          </div>
        </div>

        {/* YouTube badge */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-xs font-black text-white shadow-md">
          <Youtube size={12} aria-hidden="true" />
          YouTube
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 p-5">
        <h2 className="text-[clamp(1rem,2vw,1.2rem)] font-black leading-snug text-[#3d2817]">
          {video.title}
        </h2>
        <p className="line-clamp-2 text-sm font-semibold leading-relaxed text-[#7a5030]">
          {video.description}
        </p>
        <span className="mt-1 inline-flex w-fit items-center gap-1 text-xs font-black uppercase tracking-wide text-orange-500 transition-all group-hover:gap-1.5">
          <Play size={11} fill="currentColor" aria-hidden="true" />
          Putar Video
        </span>
      </div>
    </button>
  );
}
