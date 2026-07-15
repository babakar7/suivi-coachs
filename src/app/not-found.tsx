import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 px-4 py-10 text-center">
      <p className="text-5xl" aria-hidden>
        🤔
      </p>
      <h1 className="text-xl font-semibold tracking-tight">Page introuvable</h1>
      <p className="text-md text-secondary">
        Cette coach n&apos;existe pas, ou la page a été déplacée.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex min-h-11 items-center rounded-lg bg-accent px-5 text-base font-medium text-white transition-colors duration-150 hover:bg-accent-strong"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
