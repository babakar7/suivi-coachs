import type { Equipment, SessionType } from "./types";
import { EQUIPMENT_LIST, TYPE_LIST } from "./targets";

export const LAST_COACH_KEY = "derniere-coach";

const FORM_PREFS_KEY = "session-form-prefs";

export interface FormPrefs {
  sessionType: SessionType;
  equipment: Equipment;
  hours: string;
}

const DEFAULT_PREFS: FormPrefs = {
  sessionType: "pratique",
  equipment: "reformer",
  hours: "1",
};

export function loadFormPrefs(): FormPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(FORM_PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<FormPrefs>;
    const sessionType = TYPE_LIST.includes(parsed.sessionType as SessionType)
      ? (parsed.sessionType as SessionType)
      : DEFAULT_PREFS.sessionType;
    const equipment = EQUIPMENT_LIST.includes(parsed.equipment as Equipment)
      ? (parsed.equipment as Equipment)
      : DEFAULT_PREFS.equipment;
    const hours =
      typeof parsed.hours === "string" && parsed.hours.length > 0
        ? parsed.hours
        : DEFAULT_PREFS.hours;
    return { sessionType, equipment, hours };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function saveFormPrefs(prefs: FormPrefs): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FORM_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // ignore quota / private mode
  }
}

function toLocalISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function localTodayISO(): string {
  return toLocalISO(new Date());
}

export function localYesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toLocalISO(d);
}
