import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/adminAuth";
import { getAllCoaches, getAllProgress } from "@/lib/queries";
import {
  EQUIPMENT_LIST,
  EQUIPMENT_LABELS,
  ENSEIGNEMENT_TARGETS,
  GRAND_TOTAL,
  OBSERVATION_TARGET,
  PRATIQUE_TARGET,
  TYPE_LABELS_SHORT,
  emptyProgress,
  formatHours,
  totalHours,
} from "@/lib/targets";
import { adminLogout, setCoachActive } from "@/app/actions";
import AddCoachForm from "@/components/AddCoachForm";

export const dynamic = "force-dynamic";

const percentFormat = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const [coaches, progressByCoach] = await Promise.all([
    getAllCoaches(),
    getAllProgress(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex items-baseline justify-between gap-2">
        <div>
          <Link
            href="/"
            className="text-[13px] text-muted transition-colors hover:text-secondary"
          >
            ← Accueil
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            Tableau de bord
          </h1>
        </div>
        <form action={adminLogout}>
          <button
            type="submit"
            className="text-[13px] text-muted transition-colors hover:text-secondary"
          >
            Se déconnecter
          </button>
        </form>
      </header>

      {coaches.length === 0 ? (
        <p className="rounded-xl border border-border-subtle bg-surface p-6 text-center text-[14px] text-secondary">
          Aucune coach pour le moment. Ajoutez la première ci-dessous.
        </p>
      ) : (
        <section className="flex flex-col gap-3">
          {coaches.map((coach) => {
            const progress = progressByCoach.get(coach.id) ?? emptyProgress();
            const total = totalHours(progress);
            const percent = Math.min(100, (total / GRAND_TOTAL) * 100);
            const completed = total >= GRAND_TOTAL;

            return (
              <article
                key={coach.id}
                className={`rounded-xl border border-border-subtle bg-surface p-4 ${
                  coach.active ? "" : "opacity-55"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-[16px] font-semibold tracking-tight">
                    <Link
                      href={`/coach/${coach.id}`}
                      className="transition-colors hover:text-accent"
                    >
                      {coach.name}
                    </Link>
                    {!coach.active && (
                      <span className="ml-2 text-[12px] font-normal text-muted">
                        (archivée)
                      </span>
                    )}
                  </h2>
                  <span
                    className={`font-mono text-[14px] font-medium tabular-nums ${
                      completed ? "text-success" : ""
                    }`}
                  >
                    {formatHours(total)}
                    <span className="font-normal text-muted">
                      {" "}
                      / {formatHours(GRAND_TOTAL)} ·{" "}
                      {percentFormat.format(percent)}&nbsp;%
                    </span>
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/[0.06]">
                  <div
                    className={`h-full rounded-full ${
                      completed ? "bg-success" : "bg-accent"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-black/[0.03] px-2.5 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">
                      {TYPE_LABELS_SHORT.pratique}
                    </p>
                    <p
                      className={`mt-1 font-mono text-[12px] tabular-nums ${
                        progress.pratique >= PRATIQUE_TARGET
                          ? "text-success"
                          : "text-secondary"
                      }`}
                    >
                      {formatHours(progress.pratique)} /{" "}
                      {formatHours(PRATIQUE_TARGET)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted">Ref. + sol</p>
                  </div>

                  <div className="rounded-lg bg-black/[0.03] px-2.5 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">
                      {TYPE_LABELS_SHORT.enseignement}
                    </p>
                    {EQUIPMENT_LIST.map((eq) => {
                      const done =
                        progress.enseignement[eq] >= ENSEIGNEMENT_TARGETS[eq];
                      return (
                        <p
                          key={eq}
                          className={`mt-1 font-mono text-[12px] tabular-nums ${
                            done ? "text-success" : "text-secondary"
                          }`}
                        >
                          {EQUIPMENT_LABELS[eq].slice(0, 3)}.{" "}
                          {formatHours(progress.enseignement[eq])} /{" "}
                          {formatHours(ENSEIGNEMENT_TARGETS[eq])}
                        </p>
                      );
                    })}
                  </div>

                  <div className="rounded-lg bg-black/[0.03] px-2.5 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">
                      {TYPE_LABELS_SHORT.observation}
                    </p>
                    <p
                      className={`mt-1 font-mono text-[12px] tabular-nums ${
                        progress.observation >= OBSERVATION_TARGET
                          ? "text-success"
                          : "text-secondary"
                      }`}
                    >
                      {formatHours(progress.observation)} /{" "}
                      {formatHours(OBSERVATION_TARGET)}
                    </p>
                  </div>
                </div>

                <form
                  action={setCoachActive.bind(null, coach.id, !coach.active)}
                  className="mt-3 text-right"
                >
                  <button
                    type="submit"
                    className="text-[12px] text-muted transition-colors hover:text-secondary"
                  >
                    {coach.active ? "Archiver" : "Réactiver"}
                  </button>
                </form>
              </article>
            );
          })}
        </section>
      )}

      <AddCoachForm />
    </main>
  );
}
