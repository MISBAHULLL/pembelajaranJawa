import { useEffect } from 'react';
import { playNaturalJavaneseSpeech, prepareNaturalJavaneseSpeech } from './useNaturalJavaneseSpeech.js';

const CORRECT_TEXT = 'Bener. Jawabanmu wis trep.';
const WRONG_TEXT = 'Durung trep. Ayo dicoba maneh.';
const CORRECT_TTS_OPTIONS = {
  voice: 'Leda',
  instructions:
    'Say this as short cheerful Javanese quiz feedback for an SMP student. Keep it natural, not dramatic.',
};
const WRONG_TTS_OPTIONS = {
  voice: 'Kore',
  instructions:
    'Say this as gentle Javanese quiz feedback for an SMP student. Keep it supportive and clear.',
};

function speakFeedback(text) {
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

    utterance.lang = selectedVoice?.lang || 'jv-ID';
    utterance.rate = 0.95;
    utterance.pitch = text === 'Bener' ? 1.08 : 0.9;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore unsupported speech synthesis.
  }
}

export function useFeedbackSound() {
  useEffect(() => {
    prepareNaturalJavaneseSpeech(CORRECT_TEXT, { ttsOptions: CORRECT_TTS_OPTIONS });
    prepareNaturalJavaneseSpeech(WRONG_TEXT, { ttsOptions: WRONG_TTS_OPTIONS });
  }, []);

  const playCorrect = () => {
    playNaturalJavaneseSpeech(CORRECT_TEXT, {
      ttsOptions: CORRECT_TTS_OPTIONS,
      onError: () => speakFeedback('Bener'),
    });
  };

  const playWrong = () => {
    playNaturalJavaneseSpeech(WRONG_TEXT, {
      ttsOptions: WRONG_TTS_OPTIONS,
      onError: () => speakFeedback('Salah'),
    });
  };

  return { playCorrect, playWrong };
}
