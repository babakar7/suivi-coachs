"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Coach } from "@/lib/types";

export const LAST_COACH_KEY = "derniere-coach";

export default function ContinueBanner({ coaches }: { coaches: Coach[] }) {
  const [lastCoach, setLastCoach] = useState<Coach | null>(null);

  useEffect(() => {
    const id = localStorage.getItem(LAST_COACH_KEY);
    if (!id) return;
    setLastCoach(coaches.find((c) => c.id === id) ?? null);
  }, [coaches]);

  if (!lastCoach) return null;

  return (
    <Link
      href={`/coach/${lastCoach.id}`}
      className="mb-6 flex min-h-14 items-center justify-between rounded-xl bg-accent px-5 py-4 text-[15px] font-medium text-white transition-colors duration-150 hover:bg-accent-strong"
    >
      Continuer en tant que {lastCoach.name}
      <span aria-hidden>→</span>
    </Link>
  );
}
