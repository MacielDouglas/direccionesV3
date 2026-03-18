"use client";

function playTapSound(volume: number, duration: number) {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 800;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    /* silencioso */
  }
}

const PATTERNS = {
  light: { vibrate: [10], volume: 0.04, duration: 0.02 },
  medium: { vibrate: [30], volume: 0.07, duration: 0.04 },
  heavy: { vibrate: [60], volume: 0.12, duration: 0.06 },
  success: { vibrate: [10, 50, 20], volume: 0.06, duration: 0.03 },
  error: { vibrate: [50, 30, 50], volume: 0.1, duration: 0.06 },
};

export function useHaptic() {
  function vibrate(pattern: keyof typeof PATTERNS = "light") {
    const p = PATTERNS[pattern];

    if (navigator.vibrate) {
      // ✅ Android — vibração real
      navigator.vibrate(p.vibrate);
    } else {
      // ✅ iOS — fallback com som sintético
      playTapSound(p.volume, p.duration);
    }
  }

  return { vibrate };
}
