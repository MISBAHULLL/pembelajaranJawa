const CORRECT_CROWD_SOUND_SRC = '/assets/sounds/bener.mp3';
const WRONG_CROWD_SOUND_SRC = '/assets/sounds/salah.mp3';

function createAudioContext() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  ctx.resume?.();
  return ctx;
}

function closeLater(ctx, seconds) {
  window.setTimeout(() => ctx.close(), seconds * 1000);
}

function playNoiseBurst(ctx, { delay, duration, volume, frequency, q = 1 }) {
  const startAt = ctx.currentTime + delay;
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gainNode = ctx.createGain();

  source.buffer = buffer;
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(frequency, startAt);
  filter.Q.setValueAtTime(q, startAt);

  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  gainNode.gain.setValueAtTime(0.001, startAt);
  gainNode.gain.exponentialRampToValueAtTime(volume, startAt + 0.015);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startAt + duration);

  source.start(startAt);
  source.stop(startAt + duration);
}

function playTone(ctx, { delay, duration, frequency, volume, type = 'sine' }) {
  const startAt = ctx.currentTime + delay;
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  gainNode.gain.setValueAtTime(0.001, startAt);
  gainNode.gain.exponentialRampToValueAtTime(volume, startAt + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startAt + duration);

  oscillator.start(startAt);
  oscillator.stop(startAt + duration);
}

function playSoundEffect(src, onError) {
  try {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.volume = 1;
    audio.play().catch(onError);
  } catch {
    onError?.();
  }
}

function playGeneratedCorrectCrowd() {
  try {
    const ctx = createAudioContext();
    [0, 0.05, 0.1, 0.17, 0.24, 0.33, 0.43, 0.54, 0.66].forEach((delay) => {
      playNoiseBurst(ctx, {
        delay,
        duration: 0.16,
        volume: 0.58,
        frequency: 1200 + Math.random() * 1300,
        q: 0.7,
      });
    });
    closeLater(ctx, 1.15);
  } catch {
    // Ignore unsupported Web Audio API.
  }
}

function playGeneratedWrongCrowd() {
  try {
    const ctx = createAudioContext();
    [0, 0.06, 0.13, 0.22, 0.32, 0.44, 0.58].forEach((delay) => {
      playNoiseBurst(ctx, {
        delay,
        duration: 0.22,
        volume: 0.2,
        frequency: 850 + Math.random() * 850,
        q: 0.45,
      });
    });
    [
      { delay: 0.02, frequency: 520 },
      { delay: 0.12, frequency: 660 },
      { delay: 0.24, frequency: 580 },
      { delay: 0.38, frequency: 720 },
    ].forEach((note) => {
      playTone(ctx, {
        delay: note.delay,
        duration: 0.22,
        frequency: note.frequency,
        volume: 0.07,
        type: 'triangle',
      });
    });
    closeLater(ctx, 1.05);
  } catch {
    // Ignore unsupported Web Audio API.
  }
}

export function useAnswerCrowdSound() {
  const playCorrectCrowd = () => {
    playSoundEffect(CORRECT_CROWD_SOUND_SRC, playGeneratedCorrectCrowd);
  };

  const playWrongCrowd = () => {
    playSoundEffect(WRONG_CROWD_SOUND_SRC, playGeneratedWrongCrowd);
  };

  return { playCorrectCrowd, playWrongCrowd };
}
