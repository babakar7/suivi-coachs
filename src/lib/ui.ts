/** Shared style for segmented toggle buttons (form + edit form). */
export function segmentClass(selected: boolean, size: "sm" | "md" = "md"): string {
  return `${size === "md" ? "min-h-11" : "min-h-10"} flex-1 rounded-lg px-2 text-sm font-medium transition-[background-color,color,transform] duration-150 ease-out-back active:scale-[0.95] ${
    selected
      ? "bg-accent text-white"
      : "bg-chip text-secondary hover:bg-chip-strong"
  }`;
}
