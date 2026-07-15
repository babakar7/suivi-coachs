"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { deleteSession, updateSession } from "@/app/actions";
import {
  EQUIPMENT_LIST,
  EQUIPMENT_LABELS,
  TYPE_LIST,
  TYPE_LABELS_SHORT,
  formatHours,
  getOvershoot,
  overshootMessage,
} from "@/lib/targets";
import { segmentClass } from "@/lib/ui";
import type {
  ActionState,
  Equipment,
  Progress,
  Session,
  SessionType,
} from "@/lib/types";

type Filter = "all" | SessionType;

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const monthFormat = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
});

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return dateFormat.format(new Date(year, month - 1, day));
}

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  const label = monthFormat.format(new Date(year, month - 1, 1));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function SessionEditForm({
  session,
  progress,
  onCancel,
  onSaved,
}: {
  session: Session;
  progress: Progress;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const boundAction = updateSession.bind(null, session.id, session.coach_id);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    boundAction,
    { ok: false }
  );

  const [equipment, setEquipment] = useState<Equipment>(session.equipment);
  const [sessionType, setSessionType] = useState<SessionType>(
    session.session_type
  );
  const [hours, setHours] = useState(String(session.hours));
  const [date, setDate] = useState(session.session_date);

  const hoursNum = Number(String(hours).replace(",", "."));
  const overshoot = useMemo(
    () =>
      getOvershoot(progress, sessionType, equipment, hoursNum, {
        type: session.session_type,
        equipment: session.equipment,
        hours: session.hours,
      }),
    [
      progress,
      sessionType,
      equipment,
      hoursNum,
      session.session_type,
      session.equipment,
      session.hours,
    ]
  );

  useEffect(() => {
    if (state.ok) onSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to save success
  }, [state.ok]);

  return (
    <form action={formAction} className="flex w-full flex-col gap-3 py-1">
      <label className="block">
        <span className="mb-1 block text-2xs font-medium uppercase tracking-[0.06em] text-muted">
          Date
        </span>
        <input
          type="date"
          name="session_date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="min-h-10 w-full rounded-lg border border-border bg-surface px-3 text-md focus:border-accent"
        />
      </label>

      <fieldset>
        <legend className="mb-1 block text-2xs font-medium uppercase tracking-[0.06em] text-muted">
          Type
        </legend>
        <input type="hidden" name="session_type" value={sessionType} />
        <div className="flex flex-wrap gap-1.5">
          {TYPE_LIST.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSessionType(t)}
              aria-pressed={sessionType === t}
              className={segmentClass(sessionType === t, "sm")}
            >
              {TYPE_LABELS_SHORT[t]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-1 block text-2xs font-medium uppercase tracking-[0.06em] text-muted">
          Équipement
        </legend>
        <input type="hidden" name="equipment" value={equipment} />
        <div className="flex gap-1.5">
          {EQUIPMENT_LIST.map((eq) => (
            <button
              key={eq}
              type="button"
              onClick={() => setEquipment(eq)}
              aria-pressed={equipment === eq}
              className={segmentClass(equipment === eq, "sm")}
            >
              {EQUIPMENT_LABELS[eq]}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="mb-1 block text-2xs font-medium uppercase tracking-[0.06em] text-muted">
          Heures
        </span>
        <input
          type="number"
          name="hours"
          required
          min={1}
          max={12}
          step={1}
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="min-h-10 w-full rounded-lg border border-border bg-surface px-3 text-md focus:border-accent"
        />
      </label>

      {overshoot && (
        <p
          role="status"
          className="rounded-lg border border-accent/25 bg-accent-soft px-3 py-2 text-xs text-accent-strong"
        >
          {overshootMessage(overshoot)}
        </p>
      )}

      {state.error && (
        <p className="rounded-lg bg-danger/[0.08] px-3 py-2 text-xs text-danger">
          {state.error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-10 flex-1 rounded-lg border border-border text-sm font-medium text-secondary transition-colors hover:bg-chip"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={pending}
          className="min-h-10 flex-1 rounded-lg bg-accent text-sm font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {pending
            ? "…"
            : overshoot
              ? "Enregistrer quand même"
              : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

function SessionRow({
  session,
  progress,
}: {
  session: Session;
  progress: Progress;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (editing) {
    return (
      <li className="border-t border-border-subtle px-4 py-3 first:border-t-0">
        <SessionEditForm
          session={session}
          progress={progress}
          onCancel={() => setEditing(false)}
          onSaved={() => setEditing(false)}
        />
      </li>
    );
  }

  if (confirmDelete) {
    return (
      <li className="border-t border-border-subtle px-4 py-3 first:border-t-0">
        <p className="text-md text-secondary">
          Supprimer cette séance de{" "}
          <span className="font-medium text-foreground">
            {formatHours(session.hours)}
          </span>
          &nbsp;?
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setConfirmDelete(false);
              setDeleteError(null);
            }}
            disabled={pending}
            className="min-h-10 flex-1 rounded-lg border border-border text-sm font-medium text-secondary transition-colors hover:bg-chip"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                setDeleteError(null);
                try {
                  const result = await deleteSession(
                    session.id,
                    session.coach_id
                  );
                  if (!result.ok) {
                    setDeleteError(
                      result.error ?? "La suppression a échoué. Réessaie."
                    );
                  }
                } catch {
                  setDeleteError("La suppression a échoué. Réessaie.");
                }
              });
            }}
            className="min-h-10 flex-1 rounded-lg bg-danger text-sm font-medium text-white transition-opacity disabled:opacity-60"
          >
            {pending ? "…" : "Confirmer"}
          </button>
        </div>
        {deleteError && (
          <p className="mt-2 rounded-lg bg-danger/[0.08] px-3 py-2 text-sm text-danger">
            {deleteError}
          </p>
        )}
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2 border-t border-border-subtle px-4 py-3 first:border-t-0">
      <div className="min-w-0 flex-1">
        <p className="text-md font-medium">
          {TYPE_LABELS_SHORT[session.session_type]}
          <span className="text-muted"> · </span>
          <span className="font-normal text-secondary">
            {EQUIPMENT_LABELS[session.equipment]}
          </span>
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {formatDate(session.session_date)}
        </p>
      </div>
      <span className="font-mono text-md font-medium tabular-nums">
        {formatHours(session.hours)}
      </span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="min-h-9 shrink-0 rounded-lg px-2.5 text-xs font-medium text-accent transition-colors hover:bg-accent-soft"
      >
        Modifier
      </button>
      <button
        type="button"
        onClick={() => setConfirmDelete(true)}
        className="min-h-9 shrink-0 rounded-lg px-2.5 text-xs font-medium text-muted transition-colors hover:bg-danger/[0.08] hover:text-danger"
      >
        Supprimer
      </button>
    </li>
  );
}

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Tout" },
  { id: "pratique", label: "Pratique" },
  { id: "enseignement", label: "Ens." },
  { id: "observation", label: "Obs." },
];

export default function SessionList({
  sessions,
  progress,
}: {
  sessions: Session[];
  progress: Progress;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return sessions;
    return sessions.filter((s) => s.session_type === filter);
  }, [sessions, filter]);

  const groups = useMemo(() => {
    const map = new Map<string, Session[]>();
    for (const s of filtered) {
      const key = monthKey(s.session_date);
      const list = map.get(key) ?? [];
      list.push(s);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [filtered]);

  if (sessions.length === 0) {
    return (
      <p className="rounded-xl border border-border-subtle bg-surface p-6 text-center text-md text-secondary">
        Aucune séance pour le moment. Ajoute ta première séance
        ci-dessus&nbsp;!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex gap-1.5 overflow-x-auto pb-0.5"
        role="tablist"
        aria-label="Filtrer l'historique"
      >
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`min-h-9 shrink-0 rounded-full px-3 text-sm font-medium transition-[background-color,color,transform] duration-150 ease-out-back active:scale-[0.95] ${
              filter === f.id
                ? "bg-accent text-white"
                : "bg-chip text-secondary hover:bg-chip-strong"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-border-subtle bg-surface p-6 text-center text-md text-secondary">
          Aucune séance dans ce filtre.
        </p>
      ) : (
        groups.map(([key, groupSessions]) => (
          <div key={key}>
            <h3 className="mb-2 px-1 text-xs font-medium uppercase tracking-[0.06em] text-muted">
              {monthLabel(key)}
            </h3>
            <ul className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
              {groupSessions.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  progress={progress}
                />
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
