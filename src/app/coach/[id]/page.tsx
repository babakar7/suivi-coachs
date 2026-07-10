import Link from "next/link";
import { notFound } from "next/navigation";
import { computeProgress, getCoach, getSessions } from "@/lib/queries";
import {
  EQUIPMENT_LIST,
  EQUIPMENT_LABELS,
  TARGETS,
  GRAND_TOTAL,
  TYPE_LABELS,
  formatHours,
  totalHours,
} from "@/lib/targets";
import ProgressBar from "@/components/ProgressBar";
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
  const totalPercent = Math.min(100, (total / GRAND_TOTAL) * 100);
  const completed = total >= GRAND_TOTAL;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <header>
        <Link
          href="/"
          className="text-[13px] text-muted transition-colors hover:text-secondary"
        >
          ← Changer de coach
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          {coach.name}
        </h1>
      </header>

      <RememberCoach coachId={coach.id} />

      <section
        className={`rounded-xl border p-4 ${
          completed
            ? "border-success/30 bg-success-soft"
            : "border-border-subtle bg-surface"
        }`}
      >
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-muted">
            Progression totale
          </h2>
          <span className="font-mono text-[15px] font-semibold tabular-nums">
            {formatHours(total)}
            <span className="font-normal text-muted">
              {" "}
              / {formatHours(GRAND_TOTAL)}
            </span>
          </span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-black/[0.06]">
          <div
            className={`h-full rounded-full ${
              completed ? "bg-success" : "bg-accent"
            }`}
            style={{ width: `${totalPercent}%` }}
          />
        </div>
        {completed && (
          <p className="mt-3 text-[14px] font-medium text-success">
            🎉 Félicitations, objectif atteint&nbsp;!
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        {EQUIPMENT_LIST.map((eq) => (
          <div
            key={eq}
            className="rounded-xl border border-border-subtle bg-surface p-4"
          >
            <h3 className="text-[15px] font-semibold tracking-tight">
              {EQUIPMENT_LABELS[eq]}
            </h3>
            <div className="mt-3 flex flex-col gap-3">
              <ProgressBar
                label={TYPE_LABELS.pratique}
                value={progress[eq].pratique}
                target={TARGETS[eq].pratique}
              />
              <ProgressBar
                label={TYPE_LABELS.observation}
                value={progress[eq].observation}
                target={TARGETS[eq].observation}
              />
            </div>
          </div>
        ))}
      </section>

      <SessionForm coachId={coach.id} />

      <section>
        <h2 className="mb-3 text-[16px] font-semibold tracking-tight">
          Historique
        </h2>
        <SessionList sessions={sessions} />
      </section>
    </main>
  );
}
