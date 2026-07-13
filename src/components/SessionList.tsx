"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
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
import type {
  ActionState,
  Equipment,
  Progress,
  Session,
  SessionType,
} from "@/lib/types";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return dateFormat.format(new Date(year, month - 1, day));
}

function segmentClass(selected: boolean): string {
  return `min-h-10 flex-1 rounded-lg px-2 text-[13px] font-medium transition-colors duration-150 ${
    selected
      ? "bg-accent text-white"
      : "bg-black/[0.04] text-secondary hover:bg-black/[0.07]"
  }`;
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
    // Close editor once after a successful save (state flips to ok).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to save success
  }, [state.ok]);

  return (
    <form action={formAction} className="flex w-full flex-col gap-3 py-1">
      <label className="block">
        <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-muted">
          Date
        </span>
        <input
          type="date"
          name="session_date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="min-h-10 w-full rounded-lg border border-border bg-surface px-3 text-[14px] outline-none focus:border-accent"
        />
      </label>

      <fieldset>
        <legend className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-muted">
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
              className={segmentClass(sessionType === t)}
            >
              {TYPE_LABELS_SHORT[t]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-muted">
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
              className={segmentClass(equipment === eq)}
            >
              {EQUIPMENT_LABELS[eq]}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-muted">
          Heures
        </span>
        <input
          type="number"
          name="hours"
          required
          min={0.25}
          max={12}
          step={0.25}
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="min-h-10 w-full rounded-lg border border-border bg-surface px-3 text-[14px] outline-none focus:border-accent"
        />
      </label>

      {overshoot && (
        <p
          role="status"
          className="rounded-lg border border-accent/25 bg-accent-soft px-3 py-2 text-[12px] text-accent-strong"
        >
          {overshootMessage(overshoot)}
        </p>
      )}

      {state.error && (
        <p className="rounded-lg bg-danger/[0.08] px-3 py-2 text-[12px] text-danger">
          {state.error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-10 flex-1 rounded-lg border border-border text-[13px] font-medium text-secondary transition-colors hover:bg-black/[0.03]"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={pending}
          className="min-h-10 flex-1 rounded-lg bg-accent text-[13px] font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
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
  showBorder,
}: {
  session: Session;
  progress: Progress;
  showBorder: boolean;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li
        className={`px-4 py-3 ${showBorder ? "border-t border-border-subtle" : ""}`}
      >
        <SessionEditForm
          session={session}
          progress={progress}
          onCancel={() => setEditing(false)}
          onSaved={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li
      className={`flex items-center gap-2 px-4 py-3 ${
        showBorder ? "border-t border-border-subtle" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium">
          {TYPE_LABELS_SHORT[session.session_type]}
          <span className="text-muted"> · </span>
          <span className="font-normal text-secondary">
            {EQUIPMENT_LABELS[session.equipment]}
          </span>
        </p>
        <p className="mt-0.5 text-[12px] text-muted">
          {formatDate(session.session_date)}
        </p>
      </div>
      <span className="font-mono text-[14px] font-medium tabular-nums">
        {formatHours(session.hours)}
      </span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label="Modifier cette séance"
        className="flex size-9 items-center justify-center rounded-lg text-[12px] font-medium text-muted transition-colors duration-150 hover:bg-accent-soft hover:text-accent"
      >
        ✎
      </button>
      <form
        action={deleteSession.bind(null, session.id, session.coach_id)}
        onSubmit={(e) => {
          if (!confirm("Supprimer cette séance ?")) e.preventDefault();
        }}
      >
        <button
          type="submit"
          aria-label="Supprimer cette séance"
          className="flex size-9 items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:bg-danger/[0.08] hover:text-danger"
        >
          ✕
        </button>
      </form>
    </li>
  );
}

export default function SessionList({
  sessions,
  progress,
}: {
  sessions: Session[];
  progress: Progress;
}) {
  if (sessions.length === 0) {
    return (
      <p className="rounded-xl border border-border-subtle bg-surface p-6 text-center text-[14px] text-secondary">
        Aucune séance pour le moment. Ajoutez votre première séance
        ci-dessus&nbsp;!
      </p>
    );
  }

  return (
    <ul className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
      {sessions.map((session, index) => (
        <SessionRow
          key={session.id}
          session={session}
          progress={progress}
          showBorder={index > 0}
        />
      ))}
    </ul>
  );
}
