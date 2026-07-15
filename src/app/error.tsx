"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 px-4 py-10 text-center">
      <p className="text-5xl" aria-hidden>
        😵‍💫
      </p>
      <h1 className="text-xl font-semibold tracking-tight">
        Oups, quelque chose a coincé
      </h1>
      <p className="text-md text-secondary">
        Impossible de charger la page. Vérifie ta connexion et réessaie.
      </p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="mt-2 min-h-11 rounded-lg bg-accent px-5 text-base font-medium text-white transition-colors duration-150 hover:bg-accent-strong active:scale-[0.98]"
      >
        Réessayer
      </button>
    </main>
  );
}
