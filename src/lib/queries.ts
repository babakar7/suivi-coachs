import { query } from "./db";
import { emptyProgress } from "./targets";
import type { Coach, Equipment, Progress, Session, SessionType } from "./types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export async function getActiveCoaches(): Promise<Coach[]> {
  return query<Coach & Record<string, unknown>>(
    "select id, name, active from coaches where active order by name"
  );
}

export async function getAllCoaches(): Promise<Coach[]> {
  return query<Coach & Record<string, unknown>>(
    "select id, name, active from coaches order by active desc, name"
  );
}

export async function getCoach(id: string): Promise<Coach | null> {
  if (!isUuid(id)) return null;
  const rows = await query<Coach & Record<string, unknown>>(
    "select id, name, active from coaches where id = $1",
    [id]
  );
  return rows[0] ?? null;
}

export async function getSessions(coachId: string): Promise<Session[]> {
  return query<Session & Record<string, unknown>>(
    `select id, coach_id, session_date, equipment, session_type, hours
     from sessions where coach_id = $1
     order by session_date desc, created_at desc`,
    [coachId]
  );
}

export function computeProgress(sessions: Session[]): Progress {
  const progress = emptyProgress();
  for (const s of sessions) {
    progress[s.equipment][s.session_type] += s.hours;
  }
  return progress;
}

/** Aggregated hours for every coach, keyed by coach id (admin overview). */
export async function getAllProgress(): Promise<Map<string, Progress>> {
  const rows = await query<{
    coach_id: string;
    equipment: Equipment;
    session_type: SessionType;
    total: number;
  }>(
    `select coach_id, equipment, session_type, sum(hours)::numeric as total
     from sessions group by coach_id, equipment, session_type`
  );
  const map = new Map<string, Progress>();
  for (const row of rows) {
    const progress = map.get(row.coach_id) ?? emptyProgress();
    progress[row.equipment][row.session_type] = row.total;
    map.set(row.coach_id, progress);
  }
  return map;
}
