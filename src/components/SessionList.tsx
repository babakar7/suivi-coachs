"use client";

import { deleteSession } from "@/app/actions";
import {
  EQUIPMENT_LABELS,
  TYPE_LABELS_SHORT,
  formatHours,
} from "@/lib/targets";
import type { Session } from "@/lib/types";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return dateFormat.format(new Date(year, month - 1, day));
}

export default function SessionList({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) {
    return (
      <p className="rounded-xl border border-border-subtle bg-surface p-6 text-center text-[14px] text-secondary">
        Aucune séance pour le moment. Ajoutez votre première séance
        ci-dessus&nbsp;!
      </p>
    );
  }

  return (
    <ul className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
      {sessions.map((session, index) => (
        <li
          key={session.id}
          className={`flex items-center gap-3 px-4 py-3 ${
            index > 0 ? "border-t border-border-subtle" : ""
          }`}
        >
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-medium">
              {EQUIPMENT_LABELS[session.equipment]}
              <span className="text-muted"> · </span>
              <span className="font-normal text-secondary">
                {TYPE_LABELS_SHORT[session.session_type]}
              </span>
            </p>
            <p className="mt-0.5 text-[12px] text-muted">
              {formatDate(session.session_date)}
            </p>
          </div>
          <span className="font-mono text-[14px] font-medium tabular-nums">
            {formatHours(session.hours)}
          </span>
          <form
            action={deleteSession.bind(null, session.id, session.coach_id)}
            onSubmit={(e) => {
              if (!confirm("Supprimer cette séance ?")) e.preventDefault();
            }}
          >
            <button
              type="submit"
              aria-label="Supprimer cette séance"
              className="flex size-9 items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:bg-danger/[0.08] hover:text-danger"
            >
              ✕
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}
