import { playAudioFile } from './useAudioFile.js';

<<<<<<< HEAD
const FEEDBACK_AUDIO = {
  correct: '/assets/sounds/feedback-benar.mp3',
  wrong: '/assets/sounds/feedback-salah.mp3',
=======
const CORRECT_TEXT = 'Bener. Jawabanmu wis trep.';
const WRONG_TEXT = 'Durung trep. Ayo dicoba maneh.';
const CORRECT_SOUND_SRC = '/assets/sounds/feedback-benar.mp3';
const WRONG_SOUND_SRC = '/assets/sounds/feedback-salah.mp3';
const CORRECT_TTS_OPTIONS = {
  voice: 'Leda',
  instructions:
    'Say this as short cheerful Javanese quiz feedback for an SMP student. Keep it natural, not dramatic.',
};
const WRONG_TTS_OPTIONS = {
  voice: 'Kore',
  instructions:
    'Say this as gentle Javanese quiz feedback for an SMP student. Keep it supportive and clear.',
>>>>>>> 81158be57ea706fbc03e13a1f6c488a4628d7d30
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

export function useFeedbackSound() {
<<<<<<< HEAD
  const playCorrect = () => {
    playAudioFile(FEEDBACK_AUDIO.correct, {
      onError: () => speakFeedback('Bener'),
=======
  useEffect(() => {
    prepareNaturalJavaneseSpeech(CORRECT_TEXT, { ttsOptions: CORRECT_TTS_OPTIONS });
    prepareNaturalJavaneseSpeech(WRONG_TEXT, { ttsOptions: WRONG_TTS_OPTIONS });

    [CORRECT_SOUND_SRC, WRONG_SOUND_SRC].forEach((src) => {
      const audio = new Audio(src);
      audio.preload = 'auto';
    });
  }, []);

  const playCorrect = () => {
    playSoundEffect(CORRECT_SOUND_SRC, () => {
      playNaturalJavaneseSpeech(CORRECT_TEXT, {
        ttsOptions: CORRECT_TTS_OPTIONS,
        onError: () => speakFeedback('Bener'),
      });
>>>>>>> 81158be57ea706fbc03e13a1f6c488a4628d7d30
    });
  };

  const playWrong = () => {
<<<<<<< HEAD
    playAudioFile(FEEDBACK_AUDIO.wrong, {
      onError: () => speakFeedback('Salah'),
=======
    playSoundEffect(WRONG_SOUND_SRC, () => {
      playNaturalJavaneseSpeech(WRONG_TEXT, {
        ttsOptions: WRONG_TTS_OPTIONS,
        onError: () => speakFeedback('Salah'),
      });
>>>>>>> 81158be57ea706fbc03e13a1f6c488a4628d7d30
    });
  };

  return { playCorrect, playWrong };
}
