const GOOGLE_TTS_URL = 'https://translate.google.com/translate_tts';
const MAX_CHUNK_LENGTH = 180;

function getGoogleJavaneseTtsUrl(text) {
  const params = new URLSearchParams({
    ie: 'UTF-8',
    client: 'tw-ob',
    tl: 'jv',
    q: text,
  });

  return `${GOOGLE_TTS_URL}?${params.toString()}`;
}

function splitLongText(text) {
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const chunks = [];

  sentences.forEach((sentence) => {
    if (sentence.length <= MAX_CHUNK_LENGTH) {
      chunks.push(sentence);
      return;
    }

    let current = '';
    sentence.split(' ').forEach((word) => {
      const next = current ? `${current} ${word}` : word;
      if (next.length > MAX_CHUNK_LENGTH && current) {
        chunks.push(current);
        current = word;
      } else {
        current = next;
      }
    });

    if (current) {
      chunks.push(current);
    }
  });

  return chunks;
}

export function playGoogleJavaneseSpeech(text, { onStart, onEnd, onError } = {}) {
  const chunks = splitLongText(text);
  let index = 0;
  let stopped = false;
  let currentAudio = null;

  const stop = () => {
    stopped = true;
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.removeAttribute('src');
      currentAudio.load();
      currentAudio = null;
    }
  };

  const finish = () => {
    currentAudio = null;
    if (!stopped) {
      onEnd?.();
    }
  };

  const fail = (error) => {
    currentAudio = null;
    if (!stopped) {
      onError?.(error);
    }
  };

  const playNext = () => {
    if (stopped) return;
    if (index >= chunks.length) {
      finish();
      return;
    }

    currentAudio = new Audio(getGoogleJavaneseTtsUrl(chunks[index]));
    currentAudio.preload = 'auto';
    currentAudio.onended = () => {
      index += 1;
      playNext();
    };
    currentAudio.onerror = fail;
    currentAudio.play().catch(fail);
  };

  onStart?.();
  playNext();

  return { stop };
}
