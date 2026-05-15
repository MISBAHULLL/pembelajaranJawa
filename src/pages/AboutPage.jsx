import { GraduationCap, UsersRound, UserRoundCheck, Code2, BadgeCheck } from 'lucide-react';
import { developerProfile } from '../data/developerProfile.js';

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

function ProfileCard({ icon: Icon, label, person, accent = '#ff9b2f' }) {
  return (
    <article className="relative overflow-hidden rounded-2xl border-4 border-white/85 bg-white/95 p-5 text-left shadow-[0_8px_28px_rgba(78,45,21,0.16)]">
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-2"
        style={{ background: accent }}
        aria-hidden="true"
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative shrink-0">
          <div className="size-24 overflow-hidden rounded-2xl border-4 border-white bg-orange-100 shadow-lg">
            {person.photo ? (
              <img
                src={person.photo}
                alt={`Foto ${person.name}`}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                  event.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div
              className={`grid h-full w-full place-items-center text-2xl font-black text-white ${person.photo ? 'hidden' : ''}`}
              style={{ background: accent }}
            >
              {getInitials(person.name)}
            </div>
          </div>
          <div
            className="absolute -bottom-2 -right-2 grid size-9 place-items-center rounded-xl border-2 border-white text-white shadow-md"
            style={{ background: accent }}
          >
            <Icon size={18} aria-hidden="true" />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-500">
            {label}
          </p>
          <h2 className="mt-1 text-[clamp(1.2rem,2.5vw,1.55rem)] font-black leading-tight text-[#3d2817]">
            {person.name}
          </h2>
          <p className="mt-1 text-sm font-bold text-[#7a5030]">
            {person.role}
          </p>
        </div>
      </div>

      <ul className="mt-5 grid gap-2">
        {person.details.map((detail) => (
          <li key={detail} className="flex items-start gap-2 text-sm font-semibold leading-relaxed text-[#5a3a22]">
            <BadgeCheck className="mt-0.5 shrink-0 text-green-500" size={16} aria-hidden="true" />
            <span>{detail}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-[980px] flex-col gap-6 px-4 py-2 sm:px-6">
      <header className="overflow-hidden rounded-3xl border-4 border-white/80 bg-gradient-to-r from-[#ff9b2f] to-[#ffba73] px-6 py-7 text-white shadow-[0_8px_40px_rgba(46,29,16,0.18)] sm:px-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest">
          <UsersRound size={14} aria-hidden="true" />
          Profil Pengembang
        </div>
        <h1 className="mt-3 text-[clamp(2rem,5vw,3rem)] font-black leading-none drop-shadow-md">
          Tentang Pengembang
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-bold leading-relaxed text-white/85">
          Halaman ini memuat identitas mahasiswa, dosen pembimbing, dan tim developer aplikasi Javanesia.
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-2" aria-label="Profil utama">
        <ProfileCard
          icon={GraduationCap}
          label="Mahasiswa"
          person={developerProfile.student}
          accent="#22c55e"
        />
        <ProfileCard
          icon={UserRoundCheck}
          label="Dosen Pembimbing"
          person={developerProfile.supervisor}
          accent="#f59e0b"
        />
      </section>

      <section className="grid gap-5" aria-label="Developer">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border-2 border-orange-300 bg-white/90 px-4 py-2 text-sm font-black uppercase tracking-widest text-orange-600 shadow-md">
          <Code2 size={15} aria-hidden="true" />
          Developer Aplikasi
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {developerProfile.developers.map((developer, index) => (
            <ProfileCard
              key={developer.name}
              icon={Code2}
              label={`Developer ${index + 1}`}
              person={developer}
              accent={index === 0 ? '#ef4444' : '#3b82f6'}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
