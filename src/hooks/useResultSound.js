import { playAudioFile } from './useAudioFile.js';

const RESULT_AUDIO = {
  perfect: '/assets/sounds/result-sampurna.mp3',
  success: '/assets/sounds/result-lulus.mp3',
  retry: '/assets/sounds/result-lulus.mp3',
};

const RESULT_FALLBACK_TEXT = {
  perfect: 'Sampurna. Apik banget.',
  success: 'Apik. Terus latihan supaya luwih pinter.',
  retry: 'Aja kuwatir. Ayo sinau maneh.',
};

const PRELOAD_SOURCES = Object.values(RESULT_AUDIO);

function speakFallback(text) {
  try {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const javaneseVoice = voices.find((voice) => voice.lang?.toLowerCase().startsWith('jv'));
    const indonesianVoice = voices.find((voice) => voice.lang?.toLowerCase().startsWith('id'));
    const selectedVoice = javaneseVoice || indonesianVoice;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.lang = selectedVoice?.lang || 'id-ID';
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore unsupported speech synthesis.
  }
}

function prepareResultSounds() {
  if (typeof Audio === 'undefined') return;

  PRELOAD_SOURCES.forEach((src) => {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.load();
  });
}

function playResultVoice(src, fallbackText) {
  playAudioFile(src, {
    onError: () => speakFallback(fallbackText),
  });
}

export function useResultSound() {
  const playApplause = () => {
    playResultVoice(RESULT_AUDIO.perfect, RESULT_FALLBACK_TEXT.perfect);
  };

  const playEncourage = () => {
    playResultVoice(RESULT_AUDIO.success, RESULT_FALLBACK_TEXT.success);
  };

  const playFailed = () => {
    playResultVoice(RESULT_AUDIO.retry, RESULT_FALLBACK_TEXT.retry);
  };

  return { prepareResultSounds, playApplause, playEncourage, playFailed };
}
