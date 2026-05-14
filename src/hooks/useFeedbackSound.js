function speakFeedback(text) {
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
    utterance.pitch = text === 'Benar' ? 1.08 : 0.9;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore unsupported speech synthesis.
  }
}

export function useFeedbackSound() {
  const playCorrect = () => {
    speakFeedback('Benar');
  };

  const playWrong = () => {
    speakFeedback('Salah');
  };

  return { playCorrect, playWrong };
}
