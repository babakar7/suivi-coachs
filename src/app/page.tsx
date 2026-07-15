import Link from "next/link";
import { getActiveCoaches, getAllProgress } from "@/lib/queries";
import ContinueBanner from "@/components/ContinueBanner";
import CoachHomeList from "@/components/CoachHomeList";
import type { Progress } from "@/lib/types";

export const dynamic = "force-dynamic";

function progressToRecord(
  map: Map<string, Progress>
): Record<string, Progress> {
  const record: Record<string, Progress> = {};
  for (const [id, progress] of map) {
    record[id] = progress;
  }
  return record;
}

export default async function HomePage() {
  const [coaches, progressByCoach] = await Promise.all([
    getActiveCoaches(),
    getAllProgress(),
  ]);
  const progressRecord = progressToRecord(progressByCoach);

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

      <ContinueBanner coaches={coaches} progressByCoach={progressRecord} />

      {coaches.length === 0 ? (
        <p className="rounded-xl border border-border-subtle bg-surface p-6 text-center text-[14px] text-secondary">
          Aucune coach pour le moment. Les coachs sont ajoutées depuis la page
          admin.
        </p>
      ) : (
        <CoachHomeList coaches={coaches} progressByCoach={progressByCoach} />
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
