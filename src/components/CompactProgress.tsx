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

export default function CompactProgress({ progress }: { progress: Progress }) {
  const [open, setOpen] = useState(false);
  const total = totalHours(progress);
  const totalPercent = Math.min(100, (total / GRAND_TOTAL) * 100);
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
        <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-muted">
          Progression
        </h2>
        <span className="font-mono text-[15px] font-semibold tabular-nums">
          {formatHours(total)}
          <span className="font-normal text-muted">
            {" "}
            / {formatHours(GRAND_TOTAL)}
          </span>
        </span>
      </div>

      <div className="mt-2 h-3 overflow-hidden rounded-full bg-black/[0.06]">
        <div
          className={`h-full rounded-full ${
            completed ? "bg-success" : "bg-accent"
          }`}
          style={{ width: `${totalPercent}%` }}
        />
      </div>

      {completed ? (
        <p className="mt-3 text-[14px] font-medium text-success">
          🎉 Objectif atteint&nbsp;!
        </p>
      ) : (
        <>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-muted">
              Il me reste
            </p>
            <span className="font-mono text-[13px] font-semibold tabular-nums">
              {formatHours(totalRemaining)}
            </span>
          </div>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {lines.map((line) => (
              <li
                key={line.key}
                className={`rounded-full px-2.5 py-1 text-[12px] tabular-nums ${
                  line.complete
                    ? "bg-success-soft font-medium text-success"
                    : "bg-black/[0.04] text-secondary"
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
        className="mt-3 text-[13px] font-medium text-accent transition-colors hover:text-accent-strong"
        aria-expanded={open}
      >
        {open ? "Masquer le détail" : "Voir le détail"}
      </button>

      {open && (
        <div className="mt-4 flex flex-col gap-4 border-t border-border-subtle pt-4">
          <div>
            <h3 className="text-[14px] font-semibold tracking-tight">
              {TYPE_LABELS.pratique}
            </h3>
            <p className="mt-0.5 text-[12px] text-muted">
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
            <h3 className="text-[14px] font-semibold tracking-tight">
              {TYPE_LABELS.enseignement}
            </h3>
            <p className="mt-0.5 text-[12px] text-muted">
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
            <h3 className="text-[14px] font-semibold tracking-tight">
              {TYPE_LABELS.observation}
            </h3>
            <p className="mt-0.5 text-[12px] text-muted">
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
