"use client";

import { useEffect, useRef } from "react";
import { fireGrandFinale, fireMilestoneBurst } from "@/lib/confetti";
import { milestoneCopy, type Milestone } from "@/lib/milestones";

export default function CelebrationOverlay({
  milestone,
  onClose,
}: {
  milestone: Milestone;
  onClose: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isFinale = milestone.kind === "grand-finale";
  const { emoji, title, body } = milestoneCopy(milestone);

  useEffect(() => {
    buttonRef.current?.focus();

    const cleanupConfetti = isFinale
      ? fireGrandFinale()
      : (fireMilestoneBurst(), undefined);

    const timer = setTimeout(onClose, isFinale ? 9000 : 6000);

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      cleanupConfetti?.();
    };
  }, [isFinale, onClose]);

  return (
    <div
      className="animate-overlay-in fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-6 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="celebration-title"
        aria-describedby="celebration-body"
        className="animate-pop-in w-full max-w-xs rounded-2xl border border-border-subtle bg-background p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-5xl" aria-hidden>
          {emoji}
        </div>
        <h2
          id="celebration-title"
          className="mt-3 text-xl font-semibold tracking-tight"
        >
          {title}
        </h2>
        <p id="celebration-body" className="mt-2 text-[14px] text-secondary">
          {body}
        </p>
        <button
          ref={buttonRef}
          type="button"
          onClick={onClose}
          className="mt-5 min-h-11 w-full rounded-lg bg-accent text-[15px] font-medium text-white transition-colors duration-150 hover:bg-accent-strong active:scale-[0.98]"
        >
          {isFinale ? "Merci !" : "Continuer"}
        </button>
      </div>
    </div>
  );
}
