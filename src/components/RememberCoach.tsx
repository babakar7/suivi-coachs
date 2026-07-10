"use client";

import { useEffect } from "react";
import { LAST_COACH_KEY } from "./ContinueBanner";

export default function RememberCoach({ coachId }: { coachId: string }) {
  useEffect(() => {
    localStorage.setItem(LAST_COACH_KEY, coachId);
  }, [coachId]);

  return null;
}
