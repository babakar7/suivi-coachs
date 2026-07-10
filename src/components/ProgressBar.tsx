import { formatHours } from "@/lib/targets";

export default function ProgressBar({
  label,
  value,
  target,
}: {
  label: string;
  value: number;
  target: number;
}) {
  const done = value >= target;
  const percent = Math.min(100, (value / target) * 100);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-medium text-secondary">{label}</span>
        <span
          className={`font-mono text-[13px] tabular-nums ${
            done ? "font-medium text-success" : "text-secondary"
          }`}
        >
          {formatHours(value)}
          <span className="text-muted"> / {formatHours(target)}</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-black/[0.06]">
        <div
          className={`h-full rounded-full transition-[width] duration-200 ${
            done ? "bg-success" : "bg-accent"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
