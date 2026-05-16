import React from 'react';
import { BookOpen, Gamepad2, Headphones, Home, Map, Sparkles } from 'lucide-react';

const guideSteps = [
  {
    icon: Map,
    title: 'Miwiti Saka Alur Belajar',
    body: 'Pencet tombol Alur Belajar ing halaman utama. Tindakake tahap sing wis disusun supaya sinau parikan luwih runtut.',
  },
  {
    icon: BookOpen,
    title: 'Bukak Materi lan Komik',
    body: 'Pilih Materi Parikan, waca komik pembuka, banjur lanjutake maca penjelasan lan tuladha ing saben materi.',
  },
  {
    icon: Headphones,
    title: 'Gunakake Tombol Swara',
    body: 'Ing detail materi, pencet tombol swara kanggo ngrungokake audio. Pencet tombol mandheg yen pengin nyetop audio.',
  },
  {
    icon: Gamepad2,
    title: 'Latihan Ing Game',
    body: 'Bukak Game Parikan kanggo latihan. Waca feedback lan saran guru supaya ngerti bagian sing perlu dibenerake.',
  },
  {
    icon: Home,
    title: 'Deleng Progres',
    body: 'Bali menyang Alur Belajar kanggo nandhani tahap sing wis rampung lan ndeleng ringkesan progres sinau.',
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
          Petunjuk iki mung kanggo mbantu nggunakake tombol lan fitur utama. Urutan sinau utama ana ing Alur Belajar.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2" aria-label="Petunjuk penggunaan untuk siswa">
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
