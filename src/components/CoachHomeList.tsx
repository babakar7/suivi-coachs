import Link from "next/link";
import {
  GRAND_TOTAL,
  emptyProgress,
  formatHours,
  totalHours,
} from "@/lib/targets";
import type { Coach, Progress } from "@/lib/types";
import ProgressTrack from "@/components/ProgressTrack";

export default function CoachHomeList({
  coaches,
  progressByCoach,
}: {
  coaches: Coach[];
  progressByCoach: Map<string, Progress>;
}) {
  return (
    <ul className="flex flex-col gap-3">
      {coaches.map((coach) => {
        const progress = progressByCoach.get(coach.id) ?? emptyProgress();
        const total = totalHours(progress);
        const completed = total >= GRAND_TOTAL;

        return (
          <li key={coach.id}>
            <Link
              href={`/coach/${coach.id}#ajouter-seance`}
              className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-surface px-5 py-4 transition-colors duration-150 hover:border-accent/40 active:bg-accent-soft"
            >
              <div className="flex min-h-6 items-center justify-between gap-3">
                <span className="text-lg font-medium">{coach.name}</span>
                <span
                  className={`shrink-0 font-mono text-sm tabular-nums ${
                    completed ? "font-medium text-success" : "text-secondary"
                  }`}
                >
                  {formatHours(total)}
                  <span className="text-muted">
                    {" "}
                    / {formatHours(GRAND_TOTAL)}
                  </span>
                </span>
              </div>
              <ProgressTrack
                value={total}
                max={GRAND_TOTAL}
                size="sm"
                label={`Progression de ${coach.name}`}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
