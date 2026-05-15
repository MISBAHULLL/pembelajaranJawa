import React from 'react';
import { BookOpen, Gamepad2, Headphones, Home, PlayCircle, Sparkles, Star } from 'lucide-react';

const guideSteps = [
  {
    icon: Sparkles,
    title: 'Waca Capaian lan Tujuan',
    body: 'Bukak Capaian Pembelajaran lan Tujuan Pembelajaran supaya ngerti apa sing bakal disinaoni ing Javanesia.',
  },
  {
    icon: BookOpen,
    title: 'Sinau Materi Parikan',
    body: 'Mlebu menyang Materi Parikan, banjur waca materi saka Tegese Parikan nganti Tuladha Parikan Patang Gatra kanthi urut.',
  },
  {
    icon: Headphones,
    title: 'Rungokake Swara Materi',
    body: 'Ing detail materi, pencet tombol swara kanggo ngrungokake penjelasan. Pencet maneh yen pengin mandhegake swara.',
  },
  {
    icon: PlayCircle,
    title: 'Tonton Video Pembelajaran',
    body: 'Gunakake Video Pembelajaran kanggo nguwatake pangerten babagan tegese, struktur, lan tuladha parikan.',
  },
  {
    icon: Gamepad2,
    title: 'Dolanan Game Parikan',
    body: 'Miwiti saka Tingkat 1. Yen skor wis cukup, tingkat sabanjure bakal kebuka kanggo latihan nulis parikan.',
  },
  {
    icon: Star,
    title: 'Waca Saran Guru',
    body: 'Nalika nulis parikan, waca Hasil Penilaian lan Saran Guru supaya ngerti bagian sing wis apik lan sing perlu direvisi.',
  },
  {
    icon: Home,
    title: 'Bali Menyang Home',
    body: 'Gunakake tombol Home utawa menu ndhuwur kanggo bali menyang halaman utama yen pengin milih menu liyane.',
  },
];

export function GuidePage() {
  return (
    <div className="mx-auto flex w-full max-w-[980px] flex-col gap-6 px-4 py-2 sm:px-6">
      <header className="overflow-hidden rounded-3xl border-4 border-white/80 bg-gradient-to-r from-[#ff9b2f] to-[#ffba73] px-6 py-7 text-white shadow-[0_8px_40px_rgba(46,29,16,0.18)] sm:px-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest">
          <Sparkles size={14} aria-hidden="true" />
          Petunjuk Siswa
        </div>
        <h1 className="mt-3 text-[clamp(2rem,5vw,3rem)] font-black leading-none drop-shadow-md">
          Petunjuk Penggunaan
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-bold leading-relaxed text-white/85">
          Gunakake urutan iki supaya sinau parikan ing Javanesia luwih gampang lan runtut.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2" aria-label="Petunjuk penggunaan untuk siswa">
        {guideSteps.map((step, index) => {
          const Icon = step.icon;

          return (
            <article
              key={step.title}
              className="relative overflow-hidden rounded-2xl border-4 border-white/85 bg-white/95 p-5 shadow-[0_8px_28px_rgba(78,45,21,0.16)]"
            >
              <span className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-orange-400 to-teal-500" aria-hidden="true" />
              <div className="flex items-start gap-4">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-orange-100 text-orange-500 shadow-inner">
                  <Icon size={24} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-500">
                    Langkah {index + 1}
                  </p>
                  <h2 className="mt-1 text-lg font-black leading-tight text-[#3d2817]">
                    {step.title}
                  </h2>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-[#6b4a2d]">
                    {step.body}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

