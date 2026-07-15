import Link from "next/link";
import { notFound } from "next/navigation";
import { computeProgress, getCoach, getSessions } from "@/lib/queries";
import { GRAND_TOTAL, formatHours, totalHours } from "@/lib/targets";
import CompactProgress from "@/components/CompactProgress";
import SessionForm from "@/components/SessionForm";
import SessionList from "@/components/SessionList";
import RememberCoach from "@/components/RememberCoach";

export const dynamic = "force-dynamic";

export default async function CoachPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const coach = await getCoach(id);
  if (!coach) notFound();

  const sessions = await getSessions(coach.id);
  const progress = computeProgress(sessions);
  const total = totalHours(progress);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-8">
      <header>
        <Link
          href="/"
          className="text-[13px] text-muted transition-colors hover:text-secondary"
        >
          ← Changer de coach
        </Link>
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{coach.name}</h1>
          <span className="shrink-0 font-mono text-[14px] font-medium tabular-nums text-secondary">
            {formatHours(total)}
            <span className="font-normal text-muted">
              {" "}
              / {formatHours(GRAND_TOTAL)}
            </span>
          </span>
        </div>
      </header>

      <RememberCoach coachId={coach.id} />

      {/* 1. Form first — primary job */}
      <SessionForm coachId={coach.id} progress={progress} />

      {/* 2. Compact progress + remaining (expand for detail) */}
      <CompactProgress progress={progress} />

      {/* 3. History */}
      <section>
        <h2 className="mb-3 text-[16px] font-semibold tracking-tight">
          Historique
        </h2>
        <SessionList sessions={sessions} progress={progress} />
      </section>
    </main>
  );
}
