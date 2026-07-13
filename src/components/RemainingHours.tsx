import {
  GRAND_TOTAL,
  formatHours,
  remainingLines,
  totalHours,
} from "@/lib/targets";
import type { Progress } from "@/lib/types";

export default function RemainingHours({ progress }: { progress: Progress }) {
  const lines = remainingLines(progress);
  const totalRemaining = Math.max(0, GRAND_TOTAL - totalHours(progress));
  const allDone = lines.every((l) => l.complete);

  if (allDone) {
    return (
      <section className="rounded-xl border border-success/30 bg-success-soft p-4">
        <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-muted">
          Il me reste
        </h2>
        <p className="mt-2 text-[15px] font-medium text-success">
          Plus rien — objectif atteint&nbsp;!
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border-subtle bg-surface p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-muted">
          Il me reste
        </h2>
        <span className="font-mono text-[14px] font-semibold tabular-nums">
          {formatHours(totalRemaining)}
        </span>
      </div>
      <ul className="mt-3 flex flex-col gap-2">
        {lines.map((line) => (
          <li
            key={line.key}
            className="flex items-baseline justify-between gap-2 text-[14px]"
          >
            <span
              className={
                line.complete ? "text-success line-through decoration-success/40" : "text-secondary"
              }
            >
              {line.label}
            </span>
            <span
              className={`font-mono tabular-nums ${
                line.complete
                  ? "font-medium text-success"
                  : "font-medium text-foreground"
              }`}
            >
              {line.complete ? "✓" : formatHours(line.remaining)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
