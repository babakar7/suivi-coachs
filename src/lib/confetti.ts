import type { Options } from "canvas-confetti";

// Doit rester synchronisé avec la palette @theme de src/app/globals.css
const REVIVE_COLORS = [
  "#7c547d",
  "#a98baa",
  "#e8d9e4",
  "#5f3d60",
  "#3f7d4e",
  "#f2e7e2",
];

const BASE: Options = {
  colors: REVIVE_COLORS,
  zIndex: 100,
  disableForReducedMotion: true,
};

async function getConfetti() {
  return (await import("canvas-confetti")).default;
}

/** Two mirrored bursts for a bucket / percent milestone. */
export async function fireMilestoneBurst(): Promise<void> {
  const confetti = await getConfetti();
  confetti({
    ...BASE,
    particleCount: 70,
    spread: 65,
    startVelocity: 45,
    angle: 60,
    origin: { x: 0.2, y: 0.65 },
  });
  confetti({
    ...BASE,
    particleCount: 70,
    spread: 65,
    startVelocity: 45,
    angle: 120,
    origin: { x: 0.8, y: 0.65 },
  });
}

/** Sustained ~2.5s celebration for the grand finale. Returns a cleanup fn. */
export function fireGrandFinale(): () => void {
  let interval: ReturnType<typeof setInterval> | null = null;
  let stopped = false;

  getConfetti().then((confetti) => {
    if (stopped) return;
    confetti({
      ...BASE,
      particleCount: 140,
      spread: 100,
      startVelocity: 50,
      scalar: 1.1,
      origin: { y: 0.55 },
    });

    const end = 2500;
    let elapsed = 0;
    let left = true;
    interval = setInterval(() => {
      elapsed += 250;
      confetti({
        ...BASE,
        particleCount: 40,
        spread: 80,
        startVelocity: 45,
        scalar: 1.1,
        angle: left ? 60 : 120,
        origin: { x: left ? 0 : 1, y: 0.7 },
      });
      left = !left;
      if (elapsed >= end && interval) {
        clearInterval(interval);
        interval = null;
      }
    }, 250);
  });

  return () => {
    stopped = true;
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  };
}
