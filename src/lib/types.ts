export type Equipment = "reformer" | "tapis" | "chaise";
export type SessionType = "pratique" | "observation";

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

/** Hours accumulated per equipment and session type. */
export type Progress = Record<Equipment, Record<SessionType, number>>;

export interface ActionState {
  ok: boolean;
  error?: string;
}
