"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { isUuid } from "@/lib/queries";
import { setAdminCookie, clearAdminCookie, isAdmin } from "@/lib/adminAuth";
import type { ActionState, Equipment, SessionType } from "@/lib/types";
import { EQUIPMENT_LIST, TYPE_LIST } from "@/lib/targets";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function addSession(
  coachId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!isUuid(coachId)) return { ok: false, error: "Coach introuvable." };

  const date = String(formData.get("session_date") ?? "");
  const equipment = String(formData.get("equipment") ?? "") as Equipment;
  const sessionType = String(formData.get("session_type") ?? "") as SessionType;
  const hours = Number(String(formData.get("hours") ?? "").replace(",", "."));

  if (!DATE_RE.test(date) || Number.isNaN(new Date(date).getTime())) {
    return { ok: false, error: "Veuillez choisir une date valide." };
  }
  if (date > todayISO()) {
    return { ok: false, error: "La date ne peut pas être dans le futur." };
  }
  if (date < "2020-01-01") {
    return { ok: false, error: "Cette date semble trop ancienne." };
  }
  if (!EQUIPMENT_LIST.includes(equipment)) {
    return { ok: false, error: "Veuillez choisir un équipement." };
  }
  if (!TYPE_LIST.includes(sessionType)) {
    return { ok: false, error: "Veuillez choisir un type de séance." };
  }
  if (!Number.isFinite(hours) || hours <= 0 || hours > 12) {
    return {
      ok: false,
      error: "Le nombre d'heures doit être entre 0,25 et 12.",
    };
  }

  await query(
    `insert into sessions (coach_id, session_date, equipment, session_type, hours)
     values ($1, $2, $3, $4, $5)`,
    [coachId, date, equipment, sessionType, hours]
  );

  revalidatePath(`/coach/${coachId}`);
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteSession(
  sessionId: string,
  coachId: string
): Promise<void> {
  if (!isUuid(sessionId) || !isUuid(coachId)) return;
  await query("delete from sessions where id = $1 and coach_id = $2", [
    sessionId,
    coachId,
  ]);
  revalidatePath(`/coach/${coachId}`);
  revalidatePath("/admin");
}

export async function addCoach(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await isAdmin())) return { ok: false, error: "Accès refusé." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Veuillez saisir un prénom." };
  if (name.length > 60) return { ok: false, error: "Ce nom est trop long." };

  const existing = await query(
    "select 1 from coaches where lower(name) = lower($1)",
    [name]
  );
  if (existing.length > 0) {
    return { ok: false, error: "Cette coach existe déjà." };
  }

  await query("insert into coaches (name) values ($1)", [name]);
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true };
}

export async function setCoachActive(
  coachId: string,
  active: boolean
): Promise<void> {
  if (!(await isAdmin()) || !isUuid(coachId)) return;
  await query("update coaches set active = $2 where id = $1", [
    coachId,
    active,
  ]);
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function adminLogin(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return { ok: false, error: "Mot de passe incorrect." };
  }
  await setAdminCookie();
  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  await clearAdminCookie();
  redirect("/");
}
