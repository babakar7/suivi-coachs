"use client";

import { useState } from "react";
import {
  EQUIPMENT_LIST,
  EQUIPMENT_LABELS,
  ENSEIGNEMENT_TARGETS,
  GRAND_TOTAL,
  OBSERVATION_TARGET,
  PRATIQUE_TARGET,
  TYPE_LABELS,
  formatHours,
  remainingLines,
  totalHours,
} from "@/lib/targets";
import type { Progress } from "@/lib/types";
import ProgressBar from "@/components/ProgressBar";
import ProgressTrack from "@/components/ProgressTrack";
import CountUp from "@/components/CountUp";

export default function CompactProgress({ progress }: { progress: Progress }) {
  const [open, setOpen] = useState(false);
  const total = totalHours(progress);
  const completed = total >= GRAND_TOTAL;
  const lines = remainingLines(progress);
  const totalRemaining = Math.max(0, GRAND_TOTAL - total);

  return (
    <section
      className={`rounded-xl border p-4 ${
        completed
          ? "border-success/30 bg-success-soft"
          : "border-border-subtle bg-surface"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium uppercase tracking-[0.06em] text-muted">
          Progression
        </h2>
        <span className="font-mono text-base font-semibold tabular-nums">
          <CountUp value={total} />
          <span className="font-normal text-muted">
            {" "}
            / {formatHours(GRAND_TOTAL)}
          </span>
        </span>
      </div>

      <ProgressTrack
        value={total}
        max={GRAND_TOTAL}
        size="lg"
        label="Progression totale"
        className="mt-2"
      />

      {completed ? (
        <p className="mt-3 text-md font-medium text-success">
          🎉 Objectif atteint&nbsp;!
        </p>
      ) : (
        <>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted">
              Il me reste
            </p>
            <span className="font-mono text-sm font-semibold tabular-nums">
              <CountUp value={totalRemaining} />
            </span>
          </div>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {lines.map((line) => (
              <li
                key={line.key}
                className={`rounded-full px-2.5 py-1 text-xs tabular-nums ${
                  line.complete
                    ? "animate-chip-pop bg-success-soft font-medium text-success"
                    : "bg-chip text-secondary"
                }`}
              >
                {line.complete ? (
                  <>{line.label} ✓</>
                ) : (
                  <>
                    {line.label}{" "}
                    <span className="font-mono font-medium text-foreground">
                      {formatHours(line.remaining)}
                    </span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-3 text-sm font-medium text-accent transition-colors hover:text-accent-strong"
        aria-expanded={open}
      >
        {open ? "Masquer le détail" : "Voir le détail"}
      </button>

      {open && (
        <div className="mt-4 flex flex-col gap-4 border-t border-border-subtle pt-4">
          <div>
            <h3 className="text-md font-semibold tracking-tight">
              {TYPE_LABELS.pratique}
            </h3>
            <p className="mt-0.5 text-xs text-muted">
              Reformer et sol · objectif {formatHours(PRATIQUE_TARGET)}
            </p>
            <div className="mt-2">
              <ProgressBar
                label="Total"
                value={progress.pratique}
                target={PRATIQUE_TARGET}
              />
            </div>
          </div>

          <div>
            <h3 className="text-md font-semibold tracking-tight">
              {TYPE_LABELS.enseignement}
            </h3>
            <p className="mt-0.5 text-xs text-muted">
              10 h reformer et 10 h sol
            </p>
            <div className="mt-2 flex flex-col gap-3">
              {EQUIPMENT_LIST.map((eq) => (
                <ProgressBar
                  key={eq}
                  label={EQUIPMENT_LABELS[eq]}
                  value={progress.enseignement[eq]}
                  target={ENSEIGNEMENT_TARGETS[eq]}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-md font-semibold tracking-tight">
              {TYPE_LABELS.observation}
            </h3>
            <p className="mt-0.5 text-xs text-muted">
              Objectif {formatHours(OBSERVATION_TARGET)}
            </p>
            <div className="mt-2">
              <ProgressBar
                label="Total"
                value={progress.observation}
                target={OBSERVATION_TARGET}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
