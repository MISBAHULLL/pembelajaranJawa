/**
 * useClickSound — plays a short UI click sound using Web Audio API.
 * No external audio file needed; generates the tone programmatically.
 *
 * Usage:
 *   const playClick = useClickSound();
 *   <button onClick={() => { playClick(); doSomething(); }}>...</button>
 */
export function useClickSound({ frequency = 520, duration = 0.08, volume = 0.18 } = {}) {
  const play = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      // Slight pitch drop for a natural "tap" feel
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.75, ctx.currentTime + duration);

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      // Quick fade-out to avoid click artifacts
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);

      // Clean up AudioContext after sound finishes
      oscillator.onended = () => ctx.close();
    } catch {
      // Silently ignore if Web Audio API is not supported
    }
  };

  return play;
}
