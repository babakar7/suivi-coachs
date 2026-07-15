import {
  ENSEIGNEMENT_TARGETS,
  GRAND_TOTAL,
  OBSERVATION_TARGET,
  PRATIQUE_TARGET,
  cloneProgress,
  formatHours,
  totalHours,
} from "./targets";
import type { Equipment, Progress, SessionType } from "./types";

export type Milestone =
  | { kind: "grand-finale" }
  | {
      kind: "bucket";
      bucket: "pratique" | "ens-reformer" | "ens-sol" | "observation";
    }
  | { kind: "percent"; percent: 25 | 50 | 75 };

/** Project a saved session onto progress (mirror of subtractSession). */
export function applySession(
  progress: Progress,
  type: SessionType,
  equipment: Equipment,
  hours: number
): Progress {
  const next = cloneProgress(progress);
  if (!Number.isFinite(hours) || hours <= 0) return next;
  if (type === "pratique") {
    next.pratique += hours;
  } else if (type === "observation") {
    next.observation += hours;
  } else {
    next.enseignement[equipment] += hours;
  }
  return next;
}

function crossed(before: number, after: number, threshold: number): boolean {
  return before < threshold && after >= threshold;
}

/**
 * Detect the single most significant milestone crossed between two states.
 * Priority: grand-finale > bucket completion > percent (75 > 50 > 25).
 */
export function detectMilestone(
  before: Progress,
  after: Progress
): Milestone | null {
  const totalBefore = totalHours(before);
  const totalAfter = totalHours(after);

  if (crossed(totalBefore, totalAfter, GRAND_TOTAL)) {
    return { kind: "grand-finale" };
  }

  if (crossed(before.pratique, after.pratique, PRATIQUE_TARGET)) {
    return { kind: "bucket", bucket: "pratique" };
  }
  if (
    crossed(
      before.enseignement.reformer,
      after.enseignement.reformer,
      ENSEIGNEMENT_TARGETS.reformer
    )
  ) {
    return { kind: "bucket", bucket: "ens-reformer" };
  }
  if (
    crossed(
      before.enseignement.sol,
      after.enseignement.sol,
      ENSEIGNEMENT_TARGETS.sol
    )
  ) {
    return { kind: "bucket", bucket: "ens-sol" };
  }
  if (crossed(before.observation, after.observation, OBSERVATION_TARGET)) {
    return { kind: "bucket", bucket: "observation" };
  }

  for (const percent of [75, 50, 25] as const) {
    const threshold = (GRAND_TOTAL * percent) / 100;
    if (crossed(totalBefore, totalAfter, threshold)) {
      return { kind: "percent", percent };
    }
  }

  return null;
}

const BUCKET_COPY: Record<
  Extract<Milestone, { kind: "bucket" }>["bucket"],
  { title: string; body: string }
> = {
  pratique: {
    title: "Pratique personnelle : objectif atteint !",
    body: "20 h de pratique au compteur. Quelle régularité, bravo !",
  },
  "ens-reformer": {
    title: "Enseignement reformer : c'est bouclé !",
    body: "10 h d'enseignement reformer. Beau travail !",
  },
  "ens-sol": {
    title: "Enseignement sol : c'est bouclé !",
    body: "10 h d'enseignement au sol. Bravo !",
  },
  observation: {
    title: "Observation : objectif atteint !",
    body: "10 h d'observation. L'œil est aiguisé !",
  },
};

const PERCENT_COPY: Record<25 | 50 | 75, { title: string; body: string }> = {
  25: {
    title: "Un quart du chemin !",
    body: "12,5 h sur 50 — c'est parti pour de bon.",
  },
  50: {
    title: "À mi-parcours !",
    body: "25 h sur 50 — la moitié est derrière toi.",
  },
  75: {
    title: "75 % — dernière ligne droite !",
    body: "Plus que quelques heures, tu y es presque.",
  },
};

export function milestoneCopy(m: Milestone): {
  emoji: string;
  title: string;
  body: string;
} {
  if (m.kind === "grand-finale") {
    return {
      emoji: "🎉",
      title: "50 heures — objectif atteint !",
      body: "Toutes les heures sont validées. Immense bravo, la certification est à toi !",
    };
  }
  if (m.kind === "bucket") {
    return { emoji: "🌟", ...BUCKET_COPY[m.bucket] };
  }
  const emoji = m.percent === 25 ? "🌱" : m.percent === 50 ? "✨" : "🚀";
  return { emoji, ...PERCENT_COPY[m.percent] };
}

const PRAISE_POOL = [
  "Bien joué ! Encore {reste} au total.",
  "Et hop, {h} de plus au compteur !",
  "Belle séance — ça avance !",
  "Encore un pas vers les 50 h !",
  "Superbe régularité, continue !",
  "C'est noté ! Plus que {reste}.",
];

/** A varied, warm per-session message. `seed` (e.g. submit count) rotates it. */
export function encouragement(
  after: Progress,
  hoursAdded: number,
  seed: number
): string {
  const reste = Math.max(0, GRAND_TOTAL - totalHours(after));
  if (reste <= 0) return "Objectif atteint — profites-en !";
  const template = PRAISE_POOL[Math.abs(seed) % PRAISE_POOL.length];
  return template
    .replace("{reste}", formatHours(reste))
    .replace("{h}", formatHours(hoursAdded));
}
