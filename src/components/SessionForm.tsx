"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addSession } from "@/app/actions";
import {
  EQUIPMENT_LIST,
  EQUIPMENT_LABELS,
  TYPE_LIST,
  TYPE_LABELS_SHORT,
} from "@/lib/targets";
import type { ActionState, Equipment, SessionType } from "@/lib/types";

const QUICK_HOURS = ["0,5", "1", "1,5", "2"];

function localToday(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function segmentClass(selected: boolean): string {
  return `min-h-11 flex-1 rounded-lg px-2 text-[14px] font-medium transition-colors duration-150 ${
    selected
      ? "bg-accent text-white"
      : "bg-black/[0.04] text-secondary hover:bg-black/[0.07]"
  }`;
}

export default function SessionForm({ coachId }: { coachId: string }) {
  const boundAction = addSession.bind(null, coachId);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    boundAction,
    { ok: false }
  );

  const [equipment, setEquipment] = useState<Equipment>("reformer");
  const [sessionType, setSessionType] = useState<SessionType>("pratique");
  const [hours, setHours] = useState("1");
  const [saved, setSaved] = useState(false);
  const submitCount = useRef(0);
  const lastSubmitSeen = useRef(0);

  useEffect(() => {
    if (state.ok && submitCount.current > lastSubmitSeen.current) {
      lastSubmitSeen.current = submitCount.current;
      setSaved(true);
      const timer = setTimeout(() => setSaved(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <form
      action={formAction}
      onSubmit={() => {
        submitCount.current += 1;
      }}
      className="rounded-xl border border-border-subtle bg-surface p-4"
    >
      <h2 className="text-[16px] font-semibold tracking-tight">
        Ajouter une séance
      </h2>

      <div className="mt-4 flex flex-col gap-4">
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-muted">
            Date
          </span>
          <input
            type="date"
            name="session_date"
            required
            defaultValue={localToday()}
            suppressHydrationWarning
            className="min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-[15px] outline-none focus:border-accent"
          />
        </label>

        <fieldset>
          <legend className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-muted">
            Équipement
          </legend>
          <input type="hidden" name="equipment" value={equipment} />
          <div className="flex gap-2">
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

        <fieldset>
          <legend className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-muted">
            Type de séance
          </legend>
          <input type="hidden" name="session_type" value={sessionType} />
          <div className="flex gap-2">
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
          <legend className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-muted">
            Heures
          </legend>
          <div className="flex gap-2">
            {QUICK_HOURS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHours(h.replace(",", "."))}
                aria-pressed={hours === h.replace(",", ".")}
                className={segmentClass(hours === h.replace(",", "."))}
              >
                {h}&nbsp;h
              </button>
            ))}
          </div>
          <input
            type="number"
            name="hours"
            required
            min={0.25}
            max={12}
            step={0.25}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="mt-2 min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-[15px] outline-none focus:border-accent"
            aria-label="Nombre d'heures"
          />
        </fieldset>

        {state.error && (
          <p className="rounded-lg bg-danger/[0.08] px-3 py-2 text-[13px] text-danger">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className={`min-h-12 rounded-lg text-[15px] font-medium text-white transition-colors duration-150 disabled:opacity-60 ${
            saved ? "bg-success" : "bg-accent hover:bg-accent-strong"
          }`}
        >
          {pending
            ? "Enregistrement…"
            : saved
              ? "Séance enregistrée ✓"
              : "Enregistrer la séance"}
        </button>
      </div>
    </form>
  );
}
