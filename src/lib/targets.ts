import type { Equipment, Progress, SessionType } from "./types";

/** Pratique personnelle: 20h total (reformer + sol). */
export const PRATIQUE_TARGET = 20;

/** Enseignement: 10h reformer + 10h sol. */
export const ENSEIGNEMENT_TARGETS: Record<Equipment, number> = {
  reformer: 10,
  sol: 10,
};

/** Observation: 10h total. */
export const OBSERVATION_TARGET = 10;

export const GRAND_TOTAL =
  PRATIQUE_TARGET +
  ENSEIGNEMENT_TARGETS.reformer +
  ENSEIGNEMENT_TARGETS.sol +
  OBSERVATION_TARGET; // 50 h

export const EQUIPMENT_LIST: Equipment[] = ["reformer", "sol"];
export const TYPE_LIST: SessionType[] = [
  "pratique",
  "enseignement",
  "observation",
];

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  reformer: "Reformer",
  sol: "Sol",
};

export const TYPE_LABELS: Record<SessionType, string> = {
  pratique: "Pratique personnelle",
  enseignement: "Enseignement",
  observation: "Observation",
};

export const TYPE_LABELS_SHORT: Record<SessionType, string> = {
  pratique: "Pratique",
  enseignement: "Enseignement",
  observation: "Observation",
};

/** Whether equipment is tracked toward a per-equipment target. */
export function equipmentMatters(type: SessionType): boolean {
  return type === "enseignement";
}

const hoursFormat = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 2,
});

export function formatHours(hours: number): string {
  return `${hoursFormat.format(hours)} h`;
}

export function emptyProgress(): Progress {
  return {
    pratique: 0,
    enseignement: { reformer: 0, sol: 0 },
    observation: 0,
  };
}

export function totalHours(progress: Progress): number {
  return (
    progress.pratique +
    progress.enseignement.reformer +
    progress.enseignement.sol +
    progress.observation
  );
}

/** Hours currently counted in a given bucket. */
export function hoursInBucket(
  progress: Progress,
  type: SessionType,
  equipment: Equipment
): number {
  if (type === "pratique") return progress.pratique;
  if (type === "observation") return progress.observation;
  return progress.enseignement[equipment];
}

export function targetForBucket(
  type: SessionType,
  equipment: Equipment
): number {
  if (type === "pratique") return PRATIQUE_TARGET;
  if (type === "observation") return OBSERVATION_TARGET;
  return ENSEIGNEMENT_TARGETS[equipment];
}

export function bucketLabel(
  type: SessionType,
  equipment: Equipment
): string {
  if (type === "pratique") return TYPE_LABELS.pratique;
  if (type === "observation") return TYPE_LABELS.observation;
  return `${TYPE_LABELS.enseignement} ${EQUIPMENT_LABELS[equipment].toLowerCase()}`;
}

export function cloneProgress(progress: Progress): Progress {
  return {
    pratique: progress.pratique,
    enseignement: {
      reformer: progress.enseignement.reformer,
      sol: progress.enseignement.sol,
    },
    observation: progress.observation,
  };
}

/** Remove a session's hours from progress (e.g. before projecting an edit). */
export function subtractSession(
  progress: Progress,
  type: SessionType,
  equipment: Equipment,
  hours: number
): Progress {
  const next = cloneProgress(progress);
  if (type === "pratique") {
    next.pratique = Math.max(0, next.pratique - hours);
  } else if (type === "observation") {
    next.observation = Math.max(0, next.observation - hours);
  } else {
    next.enseignement[equipment] = Math.max(
      0,
      next.enseignement[equipment] - hours
    );
  }
  return next;
}

export interface RemainingLine {
  key: string;
  label: string;
  remaining: number;
  target: number;
  done: number;
  complete: boolean;
}

/** Per-bucket remaining hours for the "il me reste" panel. */
export function remainingLines(progress: Progress): RemainingLine[] {
  return [
    {
      key: "pratique",
      label: "Pratique",
      remaining: Math.max(0, PRATIQUE_TARGET - progress.pratique),
      target: PRATIQUE_TARGET,
      done: progress.pratique,
      complete: progress.pratique >= PRATIQUE_TARGET,
    },
    {
      key: "enseignement-reformer",
      label: "Ens. reformer",
      remaining: Math.max(
        0,
        ENSEIGNEMENT_TARGETS.reformer - progress.enseignement.reformer
      ),
      target: ENSEIGNEMENT_TARGETS.reformer,
      done: progress.enseignement.reformer,
      complete:
        progress.enseignement.reformer >= ENSEIGNEMENT_TARGETS.reformer,
    },
    {
      key: "enseignement-sol",
      label: "Ens. sol",
      remaining: Math.max(
        0,
        ENSEIGNEMENT_TARGETS.sol - progress.enseignement.sol
      ),
      target: ENSEIGNEMENT_TARGETS.sol,
      done: progress.enseignement.sol,
      complete: progress.enseignement.sol >= ENSEIGNEMENT_TARGETS.sol,
    },
    {
      key: "observation",
      label: "Observation",
      remaining: Math.max(0, OBSERVATION_TARGET - progress.observation),
      target: OBSERVATION_TARGET,
      done: progress.observation,
      complete: progress.observation >= OBSERVATION_TARGET,
    },
  ];
}

export interface OvershootInfo {
  label: string;
  projected: number;
  target: number;
  overshoot: number;
}

/**
 * Soft warning if adding `hours` to a bucket would exceed its target.
 * Pass `exclude` when editing so the session's current hours are not double-counted.
 */
export function getOvershoot(
  progress: Progress,
  type: SessionType,
  equipment: Equipment,
  hours: number,
  exclude?: { type: SessionType; equipment: Equipment; hours: number }
): OvershootInfo | null {
  if (!Number.isFinite(hours) || hours <= 0) return null;

  let base = progress;
  if (exclude) {
    base = subtractSession(
      progress,
      exclude.type,
      exclude.equipment,
      exclude.hours
    );
  }

  const projected = hoursInBucket(base, type, equipment) + hours;
  const target = targetForBucket(type, equipment);
  if (projected <= target) return null;

  return {
    label: bucketLabel(type, equipment),
    projected,
    target,
    overshoot: projected - target,
  };
}

export function overshootMessage(info: OvershootInfo): string {
  return `Cette séance porterait « ${info.label} » à ${formatHours(info.projected)} (objectif ${formatHours(info.target)}, dépassement de ${formatHours(info.overshoot)}). Tu peux tout de même enregistrer.`;
}
