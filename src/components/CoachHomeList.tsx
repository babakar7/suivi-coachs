import Link from "next/link";
import {
  GRAND_TOTAL,
  emptyProgress,
  formatHours,
  totalHours,
} from "@/lib/targets";
import type { Coach, Progress } from "@/lib/types";
import { cardClass } from "@/lib/ui";
import ProgressTrack from "@/components/ProgressTrack";
import { ChevronRight } from "@/components/icons";

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
              className={`${cardClass} flex items-center gap-3 px-4 py-3.5 transition-[box-shadow,background-color] duration-150 hover:shadow-pop active:bg-accent-soft`}
            >
              <span
                aria-hidden
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-semibold ${
                  completed
                    ? "bg-success-soft text-success"
                    : "bg-accent-soft text-accent-strong"
                }`}
              >
                {coach.name.trim().charAt(0).toUpperCase()}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex min-h-6 items-center justify-between gap-3">
                  <span className="truncate text-lg font-medium">
                    {coach.name}
                  </span>
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
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
