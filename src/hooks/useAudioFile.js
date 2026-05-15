export function playAudioFile(src, { volume = 1, onLoadStart, onStart, onEnd, onError } = {}) {
  if (!src || typeof Audio === 'undefined') {
    onError?.(new Error('Audio source is not available.'));
    return { stop: () => {} };
  }

  let stopped = false;
  let failed = false;
  const audio = new Audio(src);

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

  onLoadStart?.();
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

