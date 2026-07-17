"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { addSession } from "@/app/actions";
import {
  EQUIPMENT_LIST,
  EQUIPMENT_LABELS,
  TYPE_LIST,
  TYPE_LABELS_SHORT,
  equipmentMatters,
  getOvershoot,
  overshootMessage,
} from "@/lib/targets";
import {
  loadFormPrefs,
  localTodayISO,
  localYesterdayISO,
  saveFormPrefs,
} from "@/lib/prefs";
import {
  applySession,
  detectMilestone,
  encouragement,
  type Milestone,
} from "@/lib/milestones";
import CelebrationOverlay from "@/components/CelebrationOverlay";
import { cardClass, segmentClass } from "@/lib/ui";
import type { ActionState, Equipment, Progress, SessionType } from "@/lib/types";

const QUICK_HOURS = ["1", "2", "3", "4"];

type DateChoice = "today" | "yesterday" | "other";

export default function SessionForm({
  coachId,
  progress,
}: {
  coachId: string;
  progress: Progress;
}) {
  const boundAction = addSession.bind(null, coachId);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    boundAction,
    { ok: false }
  );

  const [hydrated, setHydrated] = useState(false);
  const [equipment, setEquipment] = useState<Equipment>("reformer");
  const [sessionType, setSessionType] = useState<SessionType>("pratique");
  const [hours, setHours] = useState("1");
  const [dateChoice, setDateChoice] = useState<DateChoice>("today");
  const [customDate, setCustomDate] = useState(localTodayISO);
  const [saved, setSaved] = useState(false);
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [praise, setPraise] = useState<string | null>(null);
  const submitCount = useRef(0);
  const lastSubmitSeen = useRef(0);
  const pendingSubmit = useRef<{
    before: Progress;
    type: SessionType;
    equipment: Equipment;
    hours: number;
  } | null>(null);

  useEffect(() => {
    const prefs = loadFormPrefs();
    setSessionType(prefs.sessionType);
    setEquipment(prefs.equipment);
    setHours(prefs.hours);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveFormPrefs({ sessionType, equipment, hours });
  }, [hydrated, sessionType, equipment, hours]);

  const needsEquipment = equipmentMatters(sessionType);
  const hoursNum = Number(String(hours).replace(",", "."));

  const sessionDate =
    dateChoice === "today"
      ? localTodayISO()
      : dateChoice === "yesterday"
        ? localYesterdayISO()
        : customDate;

  const overshoot = useMemo(
    () => getOvershoot(progress, sessionType, equipment, hoursNum),
    [progress, sessionType, equipment, hoursNum]
  );

  useEffect(() => {
    if (state.ok && submitCount.current > lastSubmitSeen.current) {
      lastSubmitSeen.current = submitCount.current;
      setSaved(true);

      const snap = pendingSubmit.current;
      pendingSubmit.current = null;
      if (snap) {
        const after = applySession(
          snap.before,
          snap.type,
          snap.equipment,
          snap.hours
        );
        setMilestone(detectMilestone(snap.before, after));
        setPraise(encouragement(after, snap.hours, submitCount.current));
      }

      const timer = setTimeout(() => {
        setSaved(false);
        setPraise(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  function selectType(t: SessionType) {
    setSessionType(t);
  }

  return (
    <form
      id="ajouter-seance"
      action={formAction}
      onSubmit={() => {
        submitCount.current += 1;
        pendingSubmit.current = {
          before: progress,
          type: sessionType,
          equipment,
          hours: hoursNum,
        };
      }}
      className={`${cardClass} p-4 scroll-mt-4`}
    >
      <h2 className="text-lg font-semibold tracking-tight">
        Ajouter une séance
      </h2>

      <div className="mt-4 flex flex-col gap-4">
        <fieldset>
          <legend className="mb-1.5 block text-xs font-medium uppercase tracking-[0.06em] text-secondary">
            Date
          </legend>
          <input type="hidden" name="session_date" value={sessionDate} />
          <div className="flex gap-2">
            {(
              [
                ["today", "Aujourd'hui"],
                ["yesterday", "Hier"],
                ["other", "Autre"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setDateChoice(value);
                  if (value === "other") setCustomDate(localTodayISO());
                }}
                aria-pressed={dateChoice === value}
                className={segmentClass(dateChoice === value)}
              >
                {label}
              </button>
            ))}
          </div>
          {dateChoice === "other" && (
            <input
              type="date"
              required
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-base focus:border-accent"
              aria-label="Choisir une date"
            />
          )}
        </fieldset>

        <fieldset>
          <legend className="mb-1.5 block text-xs font-medium uppercase tracking-[0.06em] text-secondary">
            Type de séance
          </legend>
          <input type="hidden" name="session_type" value={sessionType} />
          <div className="flex flex-wrap gap-2">
            {TYPE_LIST.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => selectType(t)}
                aria-pressed={sessionType === t}
                className={segmentClass(sessionType === t)}
              >
                {TYPE_LABELS_SHORT[t]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1.5 block text-xs font-medium uppercase tracking-[0.06em] text-secondary">
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
            min={1}
            max={12}
            step={1}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="mt-2 min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-base focus:border-accent"
            aria-label="Nombre d'heures"
          />
        </fieldset>

        <input type="hidden" name="equipment" value={equipment} />

        <fieldset>
          <legend className="mb-1.5 block text-xs font-medium uppercase tracking-[0.06em] text-secondary">
            Équipement
          </legend>
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
          {needsEquipment && (
            <p className="mt-2 text-xs text-muted">
              Objectif : 10 h reformer et 10 h sol.
            </p>
          )}
        </fieldset>

        {overshoot && (
          <p
            role="status"
            className="rounded-lg border border-accent/25 bg-accent-soft px-3 py-2 text-sm text-accent-strong"
          >
            {overshootMessage(overshoot)}
          </p>
        )}

        {state.error && (
          <p className="rounded-lg bg-danger/[0.08] px-3 py-2 text-sm text-danger">
            {state.error}
          </p>
        )}

        <button
          key={saved ? "saved" : "idle"}
          type="submit"
          disabled={pending}
          className={`min-h-12 rounded-lg text-base font-medium text-white shadow-sm transition-[background-color,transform] duration-150 ease-out-back active:scale-[0.98] disabled:opacity-60 ${
            saved ? "animate-chip-pop bg-success" : "bg-accent hover:bg-accent-strong"
          }`}
        >
          {pending ? (
            "Enregistrement…"
          ) : saved ? (
            <span className="inline-flex items-center justify-center gap-1.5">
              Séance enregistrée
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path
                  d="M5 13l4 4L19 7"
                  pathLength={24}
                  className="animate-check-draw"
                  style={{ strokeDasharray: 24 }}
                />
              </svg>
            </span>
          ) : overshoot ? (
            "Enregistrer quand même"
          ) : (
            "Enregistrer la séance"
          )}
        </button>

        {praise && !milestone && (
          <p
            role="status"
            className="animate-pop-in text-center text-sm font-medium text-success"
          >
            {praise}
          </p>
        )}
      </div>

      {milestone && (
        <CelebrationOverlay
          milestone={milestone}
          onClose={() => setMilestone(null)}
        />
      )}
    </form>
  );
}
