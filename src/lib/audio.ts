// Global audio context so we don't exhaust the hardware limit
let audioCtx: AudioContext | null = null;

export const initAudio = () => {
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (Ctx) {
      audioCtx = new Ctx();
    }
  }
  // Resume context if suspended (common in mobile browsers)
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const beep = (freq = 440, durationMs = 200) => {
  try {
    initAudio();
    if (!audioCtx) return;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.frequency.value = freq;
    oscillator.type = 'square';

    oscillator.start();
    // Smooth ramp to avoid clipping clicks
    gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + durationMs / 1000);

    setTimeout(() => {
      oscillator.stop();
    }, durationMs + 50);
  } catch (e) {
    console.error('Audio playback failed', e);
  }
};
