"use client";

import { useActionState } from "react";
import { adminLogin } from "@/app/actions";
import { cardClass } from "@/lib/ui";
import type { ActionState } from "@/lib/types";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    adminLogin,
    { ok: false }
  );

  return (
    <form action={formAction} className={`${cardClass} p-4`}>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.06em] text-secondary">
          Mot de passe
        </span>
        <input
          type="password"
          name="password"
          required
          autoFocus
          className="min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-base focus:border-accent"
        />
      </label>

      {state.error && (
        <p className="mt-3 rounded-lg bg-danger/[0.08] px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 min-h-12 w-full rounded-lg bg-accent text-base font-medium text-white transition-colors duration-150 hover:bg-accent-strong disabled:opacity-60"
      >
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
