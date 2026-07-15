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
import type { ActionState, Equipment, Progress, SessionType } from "@/lib/types";

const QUICK_HOURS = ["1", "2", "3", "4"];

type DateChoice = "today" | "yesterday" | "other";

function segmentClass(selected: boolean): string {
  return `min-h-11 flex-1 rounded-lg px-2 text-[13px] font-medium transition-colors duration-150 ${
    selected
      ? "bg-accent text-white"
      : "bg-black/[0.04] text-secondary hover:bg-black/[0.07]"
  }`;
}

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
  const [showEquipment, setShowEquipment] = useState(false);
  const [saved, setSaved] = useState(false);
  const submitCount = useRef(0);
  const lastSubmitSeen = useRef(0);

  useEffect(() => {
    const prefs = loadFormPrefs();
    setSessionType(prefs.sessionType);
    setEquipment(prefs.equipment);
    setHours(prefs.hours);
    if (equipmentMatters(prefs.sessionType)) setShowEquipment(true);
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
      const timer = setTimeout(() => setSaved(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [state]);

  function selectType(t: SessionType) {
    setSessionType(t);
    if (equipmentMatters(t)) setShowEquipment(true);
  }

  return (
    <form
      id="ajouter-seance"
      action={formAction}
      onSubmit={() => {
        submitCount.current += 1;
      }}
      className="rounded-xl border border-border-subtle bg-surface p-4 scroll-mt-4"
    >
      <h2 className="text-[16px] font-semibold tracking-tight">
        Ajouter une séance
      </h2>

      <div className="mt-4 flex flex-col gap-4">
        <fieldset>
          <legend className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-muted">
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
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-[15px] outline-none focus:border-accent"
              aria-label="Choisir une date"
            />
          )}
        </fieldset>

        <fieldset>
          <legend className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-muted">
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
            min={1}
            max={12}
            step={1}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="mt-2 min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-[15px] outline-none focus:border-accent"
            aria-label="Nombre d'heures"
          />
        </fieldset>

        <input type="hidden" name="equipment" value={equipment} />

        {(needsEquipment || showEquipment) && (
          <fieldset>
            <legend className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-muted">
              Équipement
              {needsEquipment && (
                <span className="ml-1 font-normal normal-case tracking-normal text-muted">
                  (requis pour l&apos;enseignement)
                </span>
              )}
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
              <p className="mt-2 text-[12px] text-muted">
                Objectif : 10 h reformer et 10 h sol.
              </p>
            )}
          </fieldset>
        )}

        {!needsEquipment && !showEquipment && (
          <button
            type="button"
            onClick={() => setShowEquipment(true)}
            className="self-start text-[13px] font-medium text-accent transition-colors hover:text-accent-strong"
          >
            Préciser l&apos;équipement (optionnel)
          </button>
        )}

        {overshoot && (
          <p
            role="status"
            className="rounded-lg border border-accent/25 bg-accent-soft px-3 py-2 text-[13px] text-accent-strong"
          >
            {overshootMessage(overshoot)}
          </p>
        )}

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
              : overshoot
                ? "Enregistrer quand même"
                : "Enregistrer la séance"}
        </button>
      </div>
    </form>
  );
}
