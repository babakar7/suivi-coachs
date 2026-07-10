"use client";

import { useActionState, useEffect, useRef } from "react";
import { addCoach } from "@/app/actions";
import type { ActionState } from "@/lib/types";

export default function AddCoachForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    addCoach,
    { ok: false }
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.ok && inputRef.current) inputRef.current.value = "";
  }, [state]);

  return (
    <form
      action={formAction}
      className="rounded-xl border border-border-subtle bg-surface p-4"
    >
      <h2 className="text-[16px] font-semibold tracking-tight">
        Ajouter une coach
      </h2>
      <div className="mt-3 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          name="name"
          required
          maxLength={60}
          placeholder="Prénom (et nom)"
          className="min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-[15px] outline-none placeholder:text-muted focus:border-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 shrink-0 rounded-lg bg-accent px-4 text-[14px] font-medium text-white transition-colors duration-150 hover:bg-accent-strong disabled:opacity-60"
        >
          {pending ? "Ajout…" : "Ajouter"}
        </button>
      </div>
      {state.error && (
        <p className="mt-3 rounded-lg bg-danger/[0.08] px-3 py-2 text-[13px] text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}
