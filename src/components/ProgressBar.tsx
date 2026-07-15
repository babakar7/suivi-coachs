import { formatHours } from "@/lib/targets";
import ProgressTrack from "@/components/ProgressTrack";

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
  const over = value > target;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-secondary">{label}</span>
        <span
          className={`font-mono text-sm tabular-nums ${
            over
              ? "font-medium text-accent"
              : done
                ? "font-medium text-success"
                : "text-secondary"
          }`}
        >
          {formatHours(value)}
          <span className="text-muted"> / {formatHours(target)}</span>
          {over && (
            <span className="text-accent">
              {" "}
              (+{formatHours(value - target)})
            </span>
          )}
        </span>
      </div>
      <ProgressTrack
        value={value}
        max={target}
        label={label}
        tone={over ? "accent" : "auto"}
        className="mt-1.5"
      />
    </div>
  );
}
