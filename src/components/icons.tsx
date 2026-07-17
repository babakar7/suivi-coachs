type IconProps = {
  className?: string;
};

function Base({
  className = "h-4 w-4",
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable={false}
    >
      {children}
    </svg>
  );
}

export function ChevronRight({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="m9 18 6-6-6-6" />
    </Base>
  );
}

export function ChevronDown({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="m6 9 6 6 6-6" />
    </Base>
  );
}

export function ArrowLeft({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </Base>
  );
}

export function Pencil({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </Base>
  );
}

export function Trash2({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </Base>
  );
}

export function Plus({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </Base>
  );
}

export function Check({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M20 6 9 17l-5-5" />
    </Base>
  );
}
