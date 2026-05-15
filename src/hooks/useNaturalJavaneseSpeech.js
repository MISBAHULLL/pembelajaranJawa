const PUTER_SCRIPT_SRC = 'https://js.puter.com/v2/';

const DEFAULT_GEMINI_TTS_OPTIONS = {
  provider: 'gemini',
  model: 'gemini-2.5-flash-preview-tts',
  voice: 'Kore',
  instructions: [
    'Read aloud in Javanese for Indonesian junior high school students.',
    'Use a warm teacher voice with natural Indonesian-Javanese pronunciation.',
    'Do not translate the text. Keep the original words exactly as written.',
    'Avoid an English accent.',
    'Pronounce dh, th, ng, ny, and final vowels clearly.',
    'Use a relaxed pace, friendly tone, and expressive rhythm that students can imitate.',
  ].join(' '),
};

const FALLBACK_SPEECH_OPTIONS = {
  lang: 'jv-ID',
  rate: 0.88,
  pitch: 1,
  volume: 1,
};

const MAX_CHUNK_LENGTH = 130;

let puterScriptPromise = null;
const ttsAudioCache = new Map();

function splitSpeechText(text) {
  const normalized = text
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?;:])/g, '$1')
    .trim();

  if (normalized.length <= MAX_CHUNK_LENGTH) {
    return normalized ? [normalized] : [];
  }

  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const chunks = [];
  let current = '';

  sentences.forEach((sentence) => {
    if (sentence.length > MAX_CHUNK_LENGTH) {
      if (current) {
        chunks.push(current);
        current = '';
      }

      let line = '';
      sentence.split(' ').forEach((word) => {
        const next = line ? `${line} ${word}` : word;
        if (next.length > MAX_CHUNK_LENGTH && line) {
          chunks.push(line);
          line = word;
        } else {
          line = next;
        }
      });

      if (line) chunks.push(line);
      return;
    }

    const next = current ? `${current} ${sentence}` : sentence;
    if (next.length > MAX_CHUNK_LENGTH && current) {
      chunks.push(current);
      current = sentence;
    } else {
      current = next;
    }
  });

  if (current) chunks.push(current);
  return chunks;
}

function loadPuterScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Puter is only available in the browser.'));
  }

  if (window.puter?.ai?.txt2speech) {
    return Promise.resolve(window.puter);
  }

  if (!puterScriptPromise) {
    puterScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${PUTER_SCRIPT_SRC}"]`);

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.puter), { once: true });
        existingScript.addEventListener('error', reject, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = PUTER_SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve(window.puter);
      script.onerror = () => reject(new Error('Failed to load Puter.js.'));
      document.head.appendChild(script);
    });
  }

  return puterScriptPromise.then((puter) => {
    if (!puter?.ai?.txt2speech) {
      throw new Error('Puter TTS is not available.');
    }
    return puter;
  });
}

function chooseBrowserVoice(voices, lang) {
  const normalizedLang = lang.toLowerCase();
  return (
    voices.find((voice) => voice.lang?.toLowerCase() === normalizedLang) ||
    voices.find((voice) => voice.lang?.toLowerCase().startsWith('jv')) ||
    voices.find((voice) => voice.lang?.toLowerCase().startsWith('id')) ||
    voices.find((voice) => voice.lang?.toLowerCase().startsWith('ms')) ||
    null
  );
}

function playBrowserSpeech(text, { onStart, onEnd, onError, speechOptions = {} } = {}) {
  if (
    typeof window === 'undefined' ||
    !('speechSynthesis' in window) ||
    !('SpeechSynthesisUtterance' in window)
  ) {
    onError?.(new Error('Browser speech synthesis is not supported.'));
    return { stop: () => {} };
  }

  let stopped = false;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const options = { ...FALLBACK_SPEECH_OPTIONS, ...speechOptions };
  const voices = window.speechSynthesis.getVoices();
  const selectedVoice = chooseBrowserVoice(voices, options.lang);

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  utterance.lang = selectedVoice?.lang || options.lang;
  utterance.rate = options.rate;
  utterance.pitch = options.pitch;
  utterance.volume = options.volume;
  utterance.onend = () => {
    if (!stopped) onEnd?.();
  };
  utterance.onerror = (event) => {
    if (!stopped) onError?.(event);
  };

  onStart?.();
  window.speechSynthesis.speak(utterance);

  return {
    stop: () => {
      stopped = true;
      window.speechSynthesis.cancel();
    },
  };
}

function playAudioElement(audio, { onStart, onEnd, onError, volume = 1 } = {}) {
  let stopped = false;
  let failed = false;
  const fail = (error) => {
    if (!stopped && !failed) {
      failed = true;
      onError?.(error);
    }
  };

  audio.volume = volume;
  audio.preload = 'auto';
  audio.onended = () => {
    if (!stopped) onEnd?.();
  };
  audio.onerror = fail;

  audio.play()
    .then(() => {
      if (!stopped) onStart?.();
    })
    .catch(fail);

  return {
    stop: () => {
      stopped = true;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    },
  };
}

function getCacheKey(text, ttsOptions) {
  return JSON.stringify({
    text,
    provider: ttsOptions?.provider ?? DEFAULT_GEMINI_TTS_OPTIONS.provider,
    model: ttsOptions?.model ?? DEFAULT_GEMINI_TTS_OPTIONS.model,
    voice: ttsOptions?.voice ?? DEFAULT_GEMINI_TTS_OPTIONS.voice,
    instructions: ttsOptions?.instructions ?? '',
  });
}

function getMergedTtsOptions(ttsOptions) {
  return {
    ...DEFAULT_GEMINI_TTS_OPTIONS,
    ...ttsOptions,
    instructions: [
      DEFAULT_GEMINI_TTS_OPTIONS.instructions,
      ttsOptions?.instructions,
    ].filter(Boolean).join(' '),
  };
}

function requestGeminiAudio(text, ttsOptions) {
  const key = getCacheKey(text, ttsOptions);
  const cached = ttsAudioCache.get(key);

  if (cached) {
    return cached;
  }

  const request = loadPuterScript()
    .then((puter) => puter.ai.txt2speech(text, getMergedTtsOptions(ttsOptions)))
    .then((audio) => {
      if (!audio?.src) {
        return audio;
      }

      return audio.src;
    })
    .catch((error) => {
      ttsAudioCache.delete(key);
      throw error;
    });

  ttsAudioCache.set(key, request);
  return request;
}

export function preloadPuterSpeech() {
  return loadPuterScript().catch(() => null);
}

export function prepareNaturalJavaneseSpeech(text, { ttsOptions, firstChunkOnly = false } = {}) {
  if (!text?.trim()) {
    return Promise.resolve(null);
  }

  const chunks = splitSpeechText(text);
  const chunksToPrepare = firstChunkOnly ? chunks.slice(0, 1) : chunks;
  return Promise.all(chunksToPrepare.map((chunk) => requestGeminiAudio(chunk, ttsOptions)))
    .catch(() => null);
}

export function playNaturalJavaneseSpeech(text, options = {}) {
  const {
    onStart,
    onLoading,
    onEnd,
    onError,
    ttsOptions,
    fallbackToBrowser = true,
    speechOptions,
  } = options;

  let stopped = false;
  let activeAudio = null;
  let fallbackController = null;
  let hasStarted = false;
  let hasFailedOver = false;
  const chunks = splitSpeechText(text);

  const emitStart = () => {
    if (!hasStarted) {
      hasStarted = true;
      onStart?.();
    }
  };

  const controller = {
    stop: () => {
      stopped = true;
      if (activeAudio) {
        activeAudio.pause();
        activeAudio.removeAttribute('src');
        activeAudio.load();
        activeAudio = null;
      }
      fallbackController?.stop();
    },
  };

  const fail = (error) => {
    if (stopped || hasFailedOver) return;
    hasFailedOver = true;
    if (fallbackToBrowser) {
      fallbackController = playBrowserSpeech(text, {
        onStart: emitStart,
        onEnd,
        onError,
        speechOptions,
      });
      return;
    }
    onError?.(error);
  };

  onLoading?.();

  chunks.slice(1).forEach((chunk) => {
    requestGeminiAudio(chunk, ttsOptions).catch(() => null);
  });

  const playChunk = (index) => {
    if (stopped) return;
    if (index >= chunks.length) {
      onEnd?.();
      return;
    }

    requestGeminiAudio(chunks[index], ttsOptions)
    .then((audioOrSrc) => {
      if (!audioOrSrc || stopped) return;

      const audio = typeof audioOrSrc === 'string'
        ? new Audio(audioOrSrc)
        : audioOrSrc;

      activeAudio = audio;
      playAudioElement(audio, {
        volume: options.volume ?? 1,
        onStart: emitStart,
        onEnd: () => {
          activeAudio = null;
          playChunk(index + 1);
        },
        onError: fail,
      });
    })
    .catch(fail);
  };

  if (chunks.length === 0) {
    onEnd?.();
    return controller;
  }

  playChunk(0);

  return controller;
}
