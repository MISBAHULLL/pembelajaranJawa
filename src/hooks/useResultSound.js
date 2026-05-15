import { playNaturalJavaneseSpeech, prepareNaturalJavaneseSpeech } from './useNaturalJavaneseSpeech.js';

function speakFallback(text) {
  try {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const indonesianVoice = voices.find((voice) => voice.lang?.toLowerCase().startsWith('id'));

    if (indonesianVoice) {
      utterance.voice = indonesianVoice;
    }

    utterance.lang = indonesianVoice?.lang || 'id-ID';
    utterance.rate = 0.95;
    utterance.pitch = text.includes('gagal') ? 0.9 : 1.02;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore unsupported speech synthesis.
  }
}

function playResultVoice(text, { voice = 'Kore', instructions = '' } = {}) {
  const ttsOptions = {
    voice,
    instructions: [
      'This is quiz result feedback for an Indonesian junior high school student learning Bahasa Jawa.',
      'Use a warm, encouraging Javanese teacher voice.',
      'Keep the pronunciation natural for Javanese and Indonesian words.',
      instructions,
    ].filter(Boolean).join(' '),
  };

  playNaturalJavaneseSpeech(text, {
    ttsOptions,
    onError: () => speakFallback(text),
  });
}

function scheduleResultVoice(text, delay, options) {
  const ttsOptions = {
    voice: options?.voice ?? 'Kore',
    instructions: [
      'This is quiz result feedback for an Indonesian junior high school student learning Bahasa Jawa.',
      'Use a warm, encouraging Javanese teacher voice.',
      'Keep the pronunciation natural for Javanese and Indonesian words.',
      options?.instructions,
    ].filter(Boolean).join(' '),
  };

  prepareNaturalJavaneseSpeech(text, { ttsOptions });
  window.setTimeout(() => {
    playResultVoice(text, {
      voice: ttsOptions.voice,
      instructions: options?.instructions,
    });
  }, delay);
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

// ── Tone helper ──────────────────────────────────────────────────────────────
// Mainkan satu nada dengan oscillator
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

// ── Backsound ≥ 70: Melodi ceria / fanfare ───────────────────────────────────
// Tangga nada pentatonik Jawa (pelog): C D E G A
// Pola: naik-naik-naik lalu arpeggio chord
function playSuccessMusic() {
  try {
    const ctx = createAudioContext();
    const t = ctx.currentTime;

    // Melodi utama — nada naik ceria
    const melody = [
      // freq,  start, dur,  gain
      [523.25, 0.00, 0.18, 0.30],  // C5
      [587.33, 0.18, 0.18, 0.30],  // D5
      [659.25, 0.36, 0.18, 0.30],  // E5
      [783.99, 0.54, 0.28, 0.35],  // G5
      [880.00, 0.82, 0.18, 0.35],  // A5
      [783.99, 1.00, 0.14, 0.28],  // G5
      [880.00, 1.14, 0.14, 0.28],  // A5
      [1046.5, 1.28, 0.45, 0.40],  // C6 — puncak
    ];

    // Arpeggio chord C mayor di bawah
    const chord = [
      [261.63, 0.00, 0.12, 0.18],  // C4
      [329.63, 0.10, 0.12, 0.18],  // E4
      [392.00, 0.20, 0.12, 0.18],  // G4
      [523.25, 0.30, 0.20, 0.18],  // C5
    ];

    // Akord penutup — G major arpeggio
    const outro = [
      [392.00, 1.75, 0.12, 0.20],  // G4
      [493.88, 1.87, 0.12, 0.20],  // B4
      [587.33, 1.99, 0.12, 0.20],  // D5
      [783.99, 2.11, 0.35, 0.25],  // G5
    ];

    melody.forEach(([freq, start, dur, gain]) =>
      playTone(ctx, freq, t + start, dur, gain, 'triangle')
    );
    chord.forEach(([freq, start, dur, gain]) =>
      playTone(ctx, freq, t + start, dur, gain, 'sine')
    );
    outro.forEach(([freq, start, dur, gain]) =>
      playTone(ctx, freq, t + start, dur, gain, 'triangle')
    );

    window.setTimeout(() => ctx.close(), 3000);
  } catch {
    // Ignore unsupported Web Audio API.
  }
}

// ── Backsound < 70: Melodi pelan / motivasi ──────────────────────────────────
// Nada turun lembut, tempo lebih lambat — tetap positif/motivasi
function playEncourageMusic() {
  try {
    const ctx = createAudioContext();
    const t = ctx.currentTime;

    // Melodi turun pelan — A minor feel
    const melody = [
      [440.00, 0.00, 0.30, 0.25],  // A4
      [392.00, 0.35, 0.30, 0.25],  // G4
      [349.23, 0.70, 0.30, 0.25],  // F4
      [329.63, 1.05, 0.40, 0.28],  // E4
      [349.23, 1.50, 0.25, 0.22],  // F4 — sedikit naik lagi (harapan)
      [392.00, 1.80, 0.25, 0.22],  // G4
      [440.00, 2.10, 0.50, 0.28],  // A4 — kembali ke awal (resolusi)
    ];

    // Bass sederhana
    const bass = [
      [220.00, 0.00, 0.25, 0.15],  // A3
      [196.00, 0.70, 0.25, 0.15],  // G3
      [174.61, 1.40, 0.25, 0.15],  // F3
      [220.00, 2.10, 0.40, 0.15],  // A3
    ];

    melody.forEach(([freq, start, dur, gain]) =>
      playTone(ctx, freq, t + start, dur, gain, 'sine')
    );
    bass.forEach(([freq, start, dur, gain]) =>
      playTone(ctx, freq, t + start, dur, gain, 'sine')
    );

    window.setTimeout(() => ctx.close(), 3200);
  } catch {
    // Ignore unsupported Web Audio API.
  }
}

export function useResultSound() {
  // Skor sempurna (100%): applause + TTS + fanfare
  const playApplause = () => {
    playApplauseSound();
    playSuccessMusic();
    scheduleResultVoice(
      'Sampurna. Apik banget, kowe wis pinter nyinaoni parikan.',
      1250,
      {
        voice: 'Leda',
        instructions: 'Sound proud and happy, but still calm like a teacher in class.',
      },
    );
  };

  // Skor ≥ 70%: backsound ceria + TTS semangat
  const playEncourage = () => {
    playSuccessMusic();
    scheduleResultVoice(
      'Apik. Nilaimu wis lumayan. Terus latihan supaya parikanmu luwih runtut.',
      1800,
      {
        voice: 'Kore',
        instructions: 'Sound encouraging and clear, with a relaxed pace.',
      },
    );
  };

  // Skor < 70%: backsound pelan/motivasi + TTS
  const playFailed = () => {
    playEncourageMusic();
    scheduleResultVoice(
      'Aja kuwatir. Ayo sinau maneh, banjur coba sepisan maneh.',
      1800,
      {
        voice: 'Aoede',
        instructions: 'Sound gentle and supportive, never harsh.',
      },
    );
  };

  return { playApplause, playEncourage, playFailed };
}
