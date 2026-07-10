import type { Equipment, Progress, SessionType } from "./types";

export const TARGETS: Record<Equipment, Record<SessionType, number>> = {
  reformer: { pratique: 22, observation: 5 },
  tapis: { pratique: 12, observation: 3 },
  chaise: { pratique: 12, observation: 3 },
};

export const GRAND_TOTAL = 57; // 46 h pratique + 11 h observation

export const EQUIPMENT_LIST: Equipment[] = ["reformer", "tapis", "chaise"];
export const TYPE_LIST: SessionType[] = ["pratique", "observation"];

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  reformer: "Reformer",
  tapis: "Tapis",
  chaise: "Chaise",
};

export const TYPE_LABELS: Record<SessionType, string> = {
  pratique: "Pratique personnelle",
  observation: "Observation",
};

export const TYPE_LABELS_SHORT: Record<SessionType, string> = {
  pratique: "Pratique",
  observation: "Observation",
};

const hoursFormat = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 2,
});

export function formatHours(hours: number): string {
  return `${hoursFormat.format(hours)} h`;
}

export function emptyProgress(): Progress {
  return {
    reformer: { pratique: 0, observation: 0 },
    tapis: { pratique: 0, observation: 0 },
    chaise: { pratique: 0, observation: 0 },
  };
}

export function totalHours(progress: Progress): number {
  return EQUIPMENT_LIST.reduce(
    (sum, eq) => sum + progress[eq].pratique + progress[eq].observation,
    0
  );
}
