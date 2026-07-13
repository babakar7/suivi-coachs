export type Equipment = "reformer" | "sol";
export type SessionType = "pratique" | "enseignement" | "observation";

export interface Coach {
  id: string;
  name: string;
  active: boolean;
}

export interface Session {
  id: string;
  coach_id: string;
  session_date: string; // YYYY-MM-DD
  equipment: Equipment;
  session_type: SessionType;
  hours: number;
}

/**
 * Accumulated hours.
 * - pratique: total across reformer + sol (target 20h)
 * - enseignement: per equipment (10h reformer + 10h sol)
 * - observation: total across reformer + sol (target 10h)
 */
export interface Progress {
  pratique: number;
  enseignement: Record<Equipment, number>;
  observation: number;
}

export interface ActionState {
  ok: boolean;
  error?: string;
}
