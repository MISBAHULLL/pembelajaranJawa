const GOOGLE_TTS_URL = 'https://translate.google.com/translate_tts';

function getGoogleTtsUrl(text) {
  const params = new URLSearchParams({
    ie: 'UTF-8',
    client: 'tw-ob',
    tl: 'id',
    q: text,
  });

  return `${GOOGLE_TTS_URL}?${params.toString()}`;
}

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

function playGoogleVoice(text) {
  try {
    const audio = new Audio(getGoogleTtsUrl(text));
    audio.volume = 1;
    audio.play().catch(() => speakFallback(text));
  } catch {
    speakFallback(text);
  }
}

function createAudioContext() {
  return new (window.AudioContext || window.webkitAudioContext)();
}

function playClapBurst(ctx, delay) {
  const startAt = ctx.currentTime + delay;
  const bufferSize = ctx.sampleRate * 0.14;
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
  gainNode.gain.exponentialRampToValueAtTime(0.45, startAt + 0.01);
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

export function useResultSound() {
  const playApplause = () => {
    playApplauseSound();
    window.setTimeout(() => {
      playGoogleVoice('Sempurna, aku bangga sama kamu');
    }, 1250);
  };

  const playEncourage = () => {
    playGoogleVoice('Ayo semangat, coba lagi');
  };

  const playFailed = () => {
    playGoogleVoice('Kamu gagal, coba lagi');
  };

  return { playApplause, playEncourage, playFailed };
}
