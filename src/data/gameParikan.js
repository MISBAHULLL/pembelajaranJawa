// Data soal Game Parikan per tingkat
// Tipe soal:
//   'fill'    — isian, jawaban berupa teks
//   'pilihan' — pilihan ganda (untuk tingkat 2 & 3 nanti)
//
// Untuk tipe 'fill':
//   lines    : array baris parikan yang ditampilkan (string)
//   blank    : baris/bagian yang harus diisi (ditampilkan sebagai ___)
//   answer   : jawaban yang benar (string, validasi case-insensitive + trim)
//   answers  : array jawaban alternatif yang juga diterima (opsional)
//   explanation: penjelasan setelah jawab

export const gameLevels = [
  {
    id: 1,
    label: 'Tingkat 1',
    subtitle: 'Pemula',
    emoji: '🌱',
    color: '#22c55e',
    shadow: 'rgba(34,197,94,0.35)',
    description: 'Jangkepi parikan ing ngisor iki!',
    questions: [
      {
        id: 'q1_1',
        type: 'fill',
        lines: [
          'Tuku gethuk regane sewu,',
          'Mata ngantuk ___',
        ],
        blank: 'Mata ngantuk ___',
        answer: 'jaluk turu',
        explanation: '"Tuku gethuk regane sewu, Mata ngantuk jaluk turu." — Swara "u" ing sewu lan turu cocog (purwakanthi).',
      },
      {
        id: 'q1_2',
        type: 'fill',
        lines: [
          'Abang-abang ora legi,',
          'Tiwas dagang ___',
        ],
        blank: 'Tiwas dagang ___',
        answer: 'ora bathi',
        explanation: '"Abang-abang ora legi, Tiwas dagang ora bathi." — Swara "i" ing legi lan bathi cocog (purwakanthi).',
      },
      {
        id: 'q1_3',
        type: 'fill',
        lines: [
          'Tuku buku gambare sawah,',
          'Pengin ilmu ___',
        ],
        blank: 'Pengin ilmu ___',
        answer: 'kudu sekolah',
        explanation: '"Tuku buku gambare sawah, Pengin ilmu kudu sekolah." — Swara "ah" ing sawah lan sekolah cocog (purwakanthi).',
      },
      {
        id: 'q1_4',
        type: 'fill',
        lines: [
          'Gresik Surabaya,',
          'Kalah dhisik ___',
        ],
        blank: 'Kalah dhisik ___',
        answer: 'aja ngersula',
        explanation: '"Gresik Surabaya, Kalah dhisik aja ngersula." — Pitutur supaya ora ngersula nalika kalah.',
      },
      {
        id: 'q1_5',
        type: 'fill',
        lines: [
          'Esuk nyuling sore nyuling,',
          'Sulinge arek Surabaya,',
          'Esuk eling sore eling,',
          '___',
        ],
        blank: '___',
        answer: 'sing di eling ora rumangsa',
        explanation: '"Esuk eling sore eling, sing di eling ora rumangsa." — Sindiran kanggo wong kang ora ngrasa yen dieling-eling.',
      },
      {
        id: 'q1_6',
        type: 'fill',
        lines: [
          'Manuk emprit nucuk tebu,',
          'Tebune ana ning sawahe bu sasa,',
          'Sadurungipun sinau,',
          'Monggo kita ___ marang sang Kuasa',
        ],
        blank: 'Monggo kita ___ marang sang Kuasa',
        answer: 'ndonga',
        explanation: '"Monggo kita ndonga marang sang Kuasa." — Pitutur supaya ndonga dhisik sadurunge sinau.',
      },
      {
        id: 'q1_7',
        type: 'fill',
        lines: [
          'Ngombe wedang isuk mau,',
          'Wedange diombe karo mesem ngguyu,',
          'Ayo kanca ndang ___,',
          'Supaya bisa nggayuh cita-citamu',
        ],
        blank: 'Ayo kanca ndang ___',
        answer: 'sinau',
        explanation: '"Ayo kanca ndang sinau, supaya bisa nggayuh cita-citamu." — Ajakan sinau supaya bisa nggayuh cita-cita.',
      },
      {
        id: 'q1_8',
        type: 'fill',
        lines: [
          'Tuku papat entuk siji,',
          'Entuke siji tibake ora isi,',
          'Ing abad selikur iki,',
          '___ kudu nomer siji',
        ],
        blank: '___ kudu nomer siji',
        answer: 'pendidikan',
        explanation: '"Ing abad selikur iki, pendidikan kudu nomer siji." — Pitutur babagan pentinge pendidikan ing jaman modern.',
      },
      {
        id: 'q1_9',
        type: 'fill',
        lines: [
          'Saiki hawane sumuk,',
          'Mulane adik ora isa turu,',
          'Ayo kanca tangi isuk,',
          'Banjur adus lan sinau maca ___',
        ],
        blank: 'Banjur adus lan sinau maca ___',
        answer: 'buku',
        explanation: '"Banjur adus lan sinau maca buku." — Pitutur supaya tangi isuk, adus, lan sinau maca buku.',
      },
      {
        id: 'q1_10',
        type: 'fill',
        lines: [
          'Limang dino mangan tahu,',
          'Ngadek ngarep pak budiman,',
          'Nggawa senter,',
          'Yo kanca padha sinau,',
          'Sinau sregep supaya dadi ___',
        ],
        blank: 'Sinau sregep supaya dadi ___',
        answer: 'pinter',
        explanation: '"Sinau sregep supaya dadi pinter." — Pitutur supaya sregep sinau supaya dadi bocah pinter.',
      },
    ],
  },
  {
    id: 2,
    label: 'Tingkat 2',
    subtitle: 'Menengah',
    emoji: '🌿',
    color: '#f59e0b',
    shadow: 'rgba(245,158,11,0.35)',
    description: 'Nulis parikan saka kata kunci!',
    questions: [
      {
        id: 'q2_1',
        type: 'compose',
        keyword: 'pasar',
        theme: 'Belanja ing pasar tradisional',
        example: 'Ibu mlaku-mlaku ing angin segar,\nwingi bali saka pasar.',
      },
      {
        id: 'q2_2',
        type: 'compose',
        keyword: 'gamelan',
        theme: 'Seni budaya Jawa',
        example: 'Ibu mlaku-mlaku ing angin segar,\nwingi bali saka pasar.',
      },
      {
        id: 'q2_3',
        type: 'compose',
        keyword: 'sekolah',
        theme: 'Belajar ing sekolah',
        example: 'Ibu mlaku-mlaku ing angin segar,\nwingi bali saka pasar.',
      },
      {
        id: 'q2_4',
        type: 'compose',
        keyword: 'gedhang goreng',
        theme: 'Panganan tradisional Jawa',
        example: 'Ibu mlaku-mlaku ing angin segar,\nwingi bali saka pasar.',
      },
      {
        id: 'q2_5',
        type: 'compose',
        keyword: 'tembok',
        theme: 'Omah / lingkungan omah',
        example: 'Ibu mlaku-mlaku ing angin segar,\nwingi bali saka pasar.',
      },
      {
        id: 'q2_6',
        type: 'compose',
        keyword: 'pendidikan',
        theme: 'Pendidikan ing sekolah',
        example: 'Ibu mlaku-mlaku ing angin segar,\nwingi bali saka pasar.',
      },
      {
        id: 'q2_7',
        type: 'compose',
        keyword: 'literasi',
        theme: 'Perpustakaan',
        example: 'Ibu mlaku-mlaku ing angin segar,\nwingi bali saka pasar.',
      },
      {
        id: 'q2_8',
        type: 'compose',
        keyword: 'tanduran',
        theme: 'Taman sekolah',
        example: 'Ibu mlaku-mlaku ing angin segar,\nwingi bali saka pasar.',
      },
      {
        id: 'q2_9',
        type: 'compose',
        keyword: 'bendera',
        theme: 'Upacara bendera',
        example: 'Ibu mlaku-mlaku ing angin segar,\nwingi bali saka pasar.',
      },
      {
        id: 'q2_10',
        type: 'compose',
        keyword: 'adiwiyata',
        theme: 'Sekolah adiwiyata',
        example: 'Ibu mlaku-mlaku ing angin segar,\nwingi bali saka pasar.',
      },
    ],
  },
  {
    id: 3,
    label: 'Tingkat 3',
    subtitle: 'Mahir',
    emoji: '🌟',
    color: '#ef4444',
    shadow: 'rgba(239,68,68,0.35)',
    description: 'Soal menyusul...',
    questions: [],
  },
];
