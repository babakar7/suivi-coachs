"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LAST_COACH_KEY } from "@/lib/prefs";
import { GRAND_TOTAL, formatHours, totalHours } from "@/lib/targets";
import type { Coach, Progress } from "@/lib/types";

export { LAST_COACH_KEY };

export default function ContinueBanner({
  coaches,
  progressByCoach,
}: {
  coaches: Coach[];
  progressByCoach: Record<string, Progress>;
}) {
  const [lastCoach, setLastCoach] = useState<Coach | null>(null);

  useEffect(() => {
    const id = localStorage.getItem(LAST_COACH_KEY);
    if (!id) return;
    setLastCoach(coaches.find((c) => c.id === id) ?? null);
  }, [coaches]);

  if (!lastCoach) return null;

  const progress = progressByCoach[lastCoach.id];
  const total = progress ? totalHours(progress) : 0;
  const percent = Math.min(100, (total / GRAND_TOTAL) * 100);

  return (
    <Link
      href={`/coach/${lastCoach.id}#ajouter-seance`}
      className="mb-6 block rounded-xl bg-accent px-5 py-4 text-white transition-colors duration-150 hover:bg-accent-strong"
    >
      <div className="flex min-h-6 items-center justify-between gap-2 text-[15px] font-medium">
        <span>Continuer en tant que {lastCoach.name}</span>
        <span aria-hidden>→</span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-white transition-[width] duration-700 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="font-mono text-[12px] tabular-nums text-white/90">
          {formatHours(total)} / {formatHours(GRAND_TOTAL)}
        </span>
      </div>
    </Link>
  );
}
