<<<<<<< HEAD
import { playAudioFile } from './useAudioFile.js';

const RESULT_AUDIO = {
  perfect: '/assets/sounds/result-sampurna.mp3',
  success: '/assets/sounds/result-lulus.mp3',
  retry: '/assets/sounds/result-lulus.mp3',
};
=======
const RESULT_LULUS_SOUND_SRC = '/assets/sounds/result-lulus.mp3';
const RESULT_SAMPURNA_SOUND_SRC = '/assets/sounds/result-sampurna.mp3';
const RESULT_GAGAL_SOUND_SRC = '/assets/sounds/salah.mp3';
const RESULT_TEPUK_TANGAN_SRC = '/assets/sounds/tepukTangan.mp3';
const RESULT_SORAKAN_SRC = '/assets/sounds/sorakan.mp3';

const RESULT_SOUND_SOURCES = [
  RESULT_LULUS_SOUND_SRC,
  RESULT_SAMPURNA_SOUND_SRC,
  RESULT_GAGAL_SOUND_SRC,
  RESULT_TEPUK_TANGAN_SRC,
  RESULT_SORAKAN_SRC,
];

const audioElementCache = new Map();
const decodedBufferCache = new Map();
let sharedAudioContext = null;
let activeResultAudio = null;

function getSharedAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    sharedAudioContext = new AudioContextClass();
  }

  sharedAudioContext.resume?.();
  return sharedAudioContext;
}

function getCachedAudioElement(src) {
  if (typeof window === 'undefined') return null;

  if (!audioElementCache.has(src)) {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.volume = 1;
    audioElementCache.set(src, audio);
  }

  return audioElementCache.get(src);
}

function preloadDecodedBuffer(src) {
  const ctx = getSharedAudioContext();
  if (!ctx || decodedBufferCache.has(src)) return decodedBufferCache.get(src) ?? null;

  const request = fetch(src)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.arrayBuffer();
    })
    .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer.slice(0)))
    .catch((error) => {
      decodedBufferCache.delete(src);
      console.warn(`Result sound gagal dipreload: ${src}`, error);
      return null;
    });

  decodedBufferCache.set(src, request);
  return request;
}

function stopActiveResultAudio() {
  if (!activeResultAudio) return;
>>>>>>> 81158be57ea706fbc03e13a1f6c488a4628d7d30

  try {
    activeResultAudio.pause();
    activeResultAudio.currentTime = 0;
  } catch {
    // Ignore stale media state.
  }

  activeResultAudio = null;
}

function playDecodedBuffer(src) {
  const ctx = getSharedAudioContext();
  const cached = decodedBufferCache.get(src);
  if (!ctx || !cached) return false;

  cached.then((buffer) => {
    if (!buffer) return;

    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    source.buffer = buffer;
    gainNode.gain.value = 1;
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(0);
  }).catch((error) => {
    console.warn(`Result sound decoded-buffer gagal diputar: ${src}`, error);
  });

  return true;
}

function playHtmlAudio(src, onError) {
  const audio = getCachedAudioElement(src);
  if (!audio) {
    onError?.();
    return;
  }

  // Resume AudioContext dulu supaya browser gak mblokir
  try { getSharedAudioContext()?.resume?.(); } catch { /* ignore */ }

  stopActiveResultAudio();
  activeResultAudio = audio;

  try {
    audio.pause();
    audio.muted = false;
    audio.volume = 1;
    // Reset currentTime aman mung yen wis siap
    try { audio.currentTime = 0; } catch { /* ignore */ }

    const playPromise = audio.play();
    if (playPromise?.catch) {
      playPromise.catch((error) => {
        console.warn(`Result sound HTMLAudio gagal diputar: ${src}`, error);
        if (activeResultAudio === audio) activeResultAudio = null;
        onError?.();
      });
    }
  } catch (error) {
    console.warn(`Result sound HTMLAudio gagal diputar: ${src}`, error);
    if (activeResultAudio === audio) activeResultAudio = null;
    onError?.();
  }
}

<<<<<<< HEAD
function playResultVoice(src, fallbackText) {
  playAudioFile(src, {
    onError: () => speakFallback(fallbackText),
  });
}

function scheduleResultVoice(src, fallbackText, delay) {
  window.setTimeout(() => {
    playResultVoice(src, fallbackText);
  }, delay);
=======
function playSoundEffect(src, fallback) {
  try {
    getSharedAudioContext();
    preloadDecodedBuffer(src);
  } catch (error) {
    console.warn(`Result sound gagal disiapkan: ${src}`, error);
  }

  playHtmlAudio(src, () => {
    if (playDecodedBuffer(src)) return;

    try {
      const audio = new Audio(src);
      audio.volume = 1;
      audio.play().catch(() => fallback?.());
    } catch {
      fallback?.();
    }
  });
}

function prepareResultSounds() {
  try {
    getSharedAudioContext();
    RESULT_SOUND_SOURCES.forEach((src) => {
      getCachedAudioElement(src)?.load();
      preloadDecodedBuffer(src);
    });
  } catch (error) {
    console.warn('Result sound preload gagal.', error);
  }
>>>>>>> 81158be57ea706fbc03e13a1f6c488a4628d7d30
}

function createAudioContext() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  ctx.resume?.();
  return ctx;
}

function playClapBurst(ctx, delay) {
  const startAt = ctx.currentTime + delay;
  const bufferSize = Math.floor(ctx.sampleRate * 0.14);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const source = ctx.createBufferSource();
  const bandpass = ctx.createBiquadFilter();
  const gainNode = ctx.createGain();

  source.buffer = buffer;
  bandpass.type = 'bandpass';
  bandpass.frequency.setValueAtTime(1400 + Math.random() * 900, startAt);
  bandpass.Q.setValueAtTime(0.8, startAt);

  source.connect(bandpass);
  bandpass.connect(gainNode);
  gainNode.connect(ctx.destination);

  gainNode.gain.setValueAtTime(0.001, startAt);
  gainNode.gain.exponentialRampToValueAtTime(0.62, startAt + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startAt + 0.14);

  source.start(startAt);
  source.stop(startAt + 0.14);
}

function playApplauseSound() {
  try {
    const ctx = createAudioContext();
    const clapTimes = [0, 0.09, 0.17, 0.29, 0.38, 0.52, 0.64, 0.78, 0.93, 1.08, 1.2, 1.32];
    clapTimes.forEach((delay) => playClapBurst(ctx, delay));
    window.setTimeout(() => ctx.close(), 1700);
  } catch {
    // Ignore unsupported Web Audio API.
  }
}

function playTone(ctx, freq, startAt, duration, gainValue = 0.35, type = 'sine') {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startAt);

  gain.gain.setValueAtTime(0.001, startAt);
  gain.gain.linearRampToValueAtTime(gainValue, startAt + 0.03);
  gain.gain.setValueAtTime(gainValue, startAt + duration - 0.05);
  gain.gain.linearRampToValueAtTime(0.001, startAt + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startAt);
  osc.stop(startAt + duration);
}

function playSuccessMusic() {
  try {
    const ctx = createAudioContext();
    const t = ctx.currentTime;

    [
      [523.25, 0.00, 0.18, 0.30],
      [587.33, 0.18, 0.18, 0.30],
      [659.25, 0.36, 0.18, 0.30],
      [783.99, 0.54, 0.28, 0.35],
      [880.00, 0.82, 0.18, 0.35],
      [783.99, 1.00, 0.14, 0.28],
      [880.00, 1.14, 0.14, 0.28],
      [1046.5, 1.28, 0.45, 0.40],
    ].forEach(([freq, start, dur, gain]) =>
      playTone(ctx, freq, t + start, dur, gain, 'triangle')
    );

    [
      [261.63, 0.00, 0.12, 0.18],
      [329.63, 0.10, 0.12, 0.18],
      [392.00, 0.20, 0.12, 0.18],
      [523.25, 0.30, 0.20, 0.18],
      [392.00, 1.75, 0.12, 0.20],
      [493.88, 1.87, 0.12, 0.20],
      [587.33, 1.99, 0.12, 0.20],
      [783.99, 2.11, 0.35, 0.25],
    ].forEach(([freq, start, dur, gain]) =>
      playTone(ctx, freq, t + start, dur, gain, 'sine')
    );

    window.setTimeout(() => ctx.close(), 3000);
  } catch {
    // Ignore unsupported Web Audio API.
  }
}

function playEncourageMusic() {
  try {
    const ctx = createAudioContext();
    const t = ctx.currentTime;

    [
      [440.00, 0.00, 0.30, 0.25],
      [392.00, 0.35, 0.30, 0.25],
      [349.23, 0.70, 0.30, 0.25],
      [329.63, 1.05, 0.40, 0.28],
      [349.23, 1.50, 0.25, 0.22],
      [392.00, 1.80, 0.25, 0.22],
      [440.00, 2.10, 0.50, 0.28],
      [220.00, 0.00, 0.25, 0.15],
      [196.00, 0.70, 0.25, 0.15],
      [174.61, 1.40, 0.25, 0.15],
      [220.00, 2.10, 0.40, 0.15],
    ].forEach(([freq, start, dur, gain]) =>
      playTone(ctx, freq, t + start, dur, gain, 'sine')
    );

    window.setTimeout(() => ctx.close(), 3200);
  } catch {
    // Ignore unsupported Web Audio API.
  }
}

<<<<<<< HEAD
export function useResultSound() {
  // Skor sempurna (100%): applause + TTS + fanfare
  const playApplause = () => {
    playApplauseSound();
    playSuccessMusic();
    scheduleResultVoice(
      RESULT_AUDIO.perfect,
      'Sampurna. Apik banget, kowe wis pinter nyinaoni parikan.',
      1250,
    );
  };

  // Skor ≥ 70%: backsound ceria + TTS semangat
  const playEncourage = () => {
    playSuccessMusic();
    scheduleResultVoice(
      RESULT_AUDIO.success,
      'Apik. Nilaimu wis lumayan. Terus latihan supaya parikanmu luwih runtut.',
      1800,
    );
  };

  // Skor < 70%: backsound pelan/motivasi + TTS
  const playFailed = () => {
    playEncourageMusic();
    scheduleResultVoice(
      RESULT_AUDIO.retry,
      'Aja kuwatir. Ayo sinau maneh, banjur coba sepisan maneh.',
      1800,
    );
  };

  return { playApplause, playEncourage, playFailed };
=======
// Helper: putar satu file tambahan dengan delay (volume bisa dikustom)
function playExtra(src, delayMs, volume = 0.85) {
  window.setTimeout(() => {
    try {
      const audio = getCachedAudioElement(src);
      if (!audio) return;
      try { getSharedAudioContext()?.resume?.(); } catch { /* ignore */ }
      try { audio.currentTime = 0; } catch { /* ignore */ }
      audio.volume = volume;
      audio.play().catch(() => {/* silent fallback */});
    } catch { /* ignore */ }
  }, delayMs);
}

// Putar dua file audio (utama + satu tambahan)
function playDouble(src1, src2, fallback) {
  playSoundEffect(src1, fallback);
  playExtra(src2, 80);
}

// Putar tiga file audio sekaligus (utama + dua tambahan)
function playTriple(src1, src2, src3, fallback) {
  playSoundEffect(src1, fallback);
  playExtra(src2, 80);
  playExtra(src3, 160);
}

export function useResultSound() {
  const playApplause = () => {
    // Sempurna (100%): result-sampurna + tepukTangan + result-lulus
    playTriple(RESULT_SAMPURNA_SOUND_SRC, RESULT_TEPUK_TANGAN_SRC, RESULT_LULUS_SOUND_SRC, () => {
      playApplauseSound();
      playSuccessMusic();
    });
  };

  const playEncourage = () => {
    // Berhasil (≥70%): result-lulus + tepukTangan + result-sampurna
    playTriple(RESULT_LULUS_SOUND_SRC, RESULT_TEPUK_TANGAN_SRC, RESULT_SAMPURNA_SOUND_SRC, () => {
      playSuccessMusic();
    });
  };

  const playFailed = () => {
    // Gagal (<70%): salah + sorakan
    playDouble(RESULT_GAGAL_SOUND_SRC, RESULT_SORAKAN_SRC, () => {
      playEncourageMusic();
    });
  };

  return { prepareResultSounds, playApplause, playEncourage, playFailed };
>>>>>>> 81158be57ea706fbc03e13a1f6c488a4628d7d30
}
