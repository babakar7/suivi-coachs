import Link from "next/link";
import { getActiveCoaches } from "@/lib/queries";
import ContinueBanner from "@/components/ContinueBanner";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const coaches = await getActiveCoaches();

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-10">
      <header className="mb-8 text-center">
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
          Suivi des heures
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Qui êtes-vous&nbsp;?
        </h1>
      </header>

      <ContinueBanner coaches={coaches} />

      {coaches.length === 0 ? (
        <p className="rounded-xl border border-border-subtle bg-surface p-6 text-center text-[14px] text-secondary">
          Aucune coach pour le moment. Les coachs sont ajoutées depuis la page
          admin.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {coaches.map((coach) => (
            <li key={coach.id}>
              <Link
                href={`/coach/${coach.id}`}
                className="flex min-h-14 items-center justify-between rounded-xl border border-border-subtle bg-surface px-5 py-4 text-[16px] font-medium transition-colors duration-150 hover:border-accent/40 active:bg-accent-soft"
              >
                {coach.name}
                <span aria-hidden className="text-muted">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <footer className="mt-auto pt-12 text-center">
        <Link
          href="/admin"
          className="text-[12px] text-muted transition-colors hover:text-secondary"
        >
          Admin
        </Link>
      </footer>
    </main>
  );
}
