// Isi URL setelah ruang ZEP Space / ZEP Quiz sudah dibuat.
// Kalau semua URL masih kosong, panel ZEP tidak akan tampil di halaman siswa.

export const zepGameHub = {
  spaceUrl: '',
  title: 'Ekspedisi Parikan Arek Suroboyo',
  description: 'Jelajahi telung pos khas Surabaya, rampungake tantangan parikan, lan kumpulake lencana saben misi.',
};

export const zepGameLevels = [
  {
    levelId: 1,
    title: 'Sambung Parikan',
    type: 'ZEP Game',
    url: 'https://quiz.zep.us/id/play/gGjrpb',
    image: '/assets/game/surabaya/level-1.png',
    location: 'Tugu Sura lan Baya',
    posLabel: 'Pos Wani',
    description: 'Sambung parikan kanthi trep kanggo nguripake semangat wani arek Suroboyo.',
    badge: 'Lencana Wani',
    keywords: ['Tugu Sura lan Baya', 'semanggi'],
  },
  {
    levelId: 2,
    title: 'Rakit Parikan',
    type: 'ZEP Game',
    url: 'https://quiz.zep.us/id/play/odJELZ',
    image: '/assets/game/surabaya/level-2.jpg',
    location: 'Kota Lama Surabaya',
    posLabel: 'Pos Kreatif',
    description: 'Rakit parikan saka tetembungan kutha nalika njelajah jejak Kota Lama Surabaya.',
    badge: 'Lencana Kreatif',
    keywords: ['Kota Lama', 'Jembatan Merah'],
  },
  {
    levelId: 3,
    title: 'Pujangga Muda',
    type: 'ZEP Game',
    url: 'https://quiz.zep.us/id/play/odJELL',
    image: '/assets/game/surabaya/level-3.jpg',
    location: 'Suramadu',
    posLabel: 'Pos Pujangga',
    description: 'Gawe parikanmu dhewe kanthi inspirasi segara, Suramadu, lan urip bebarengan.',
    badge: 'Lencana Pujangga',
    keywords: ['Suramadu', 'Sura lan Baya'],
  },
];

export const hasZepGameLinks =
  Boolean(zepGameHub.spaceUrl) ||
  zepGameLevels.some((level) => Boolean(level.url));
