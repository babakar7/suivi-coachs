type ProgressTrackProps = {
  value: number;
  max: number;
  label: string;
  size?: "sm" | "md" | "lg";
  tone?: "auto" | "accent" | "success" | "on-accent";
  className?: string;
};

const TRACK_HEIGHT = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
} as const;

export default function ProgressTrack({
  value,
  max,
  label,
  size = "md",
  tone = "auto",
  className = "",
}: ProgressTrackProps) {
  const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  const trackClass = tone === "on-accent" ? "bg-white/25" : "bg-track";
  const fillClass =
    tone === "on-accent"
      ? "bg-white"
      : tone === "accent"
        ? "bg-accent"
        : tone === "success"
          ? "bg-success"
          : value >= max
            ? "bg-success"
            : "bg-accent";

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      aria-label={label}
      className={`${TRACK_HEIGHT[size]} overflow-hidden rounded-full ${trackClass} ${className}`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-700 ease-out ${fillClass}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
