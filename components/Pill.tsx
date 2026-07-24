export function Pill({
  label,
  color = "var(--muted)",
}: {
  label: string;
  color?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-bold text-ink-2">
      <span
        className="h-[7px] w-[7px] shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label || "—"}
    </span>
  );
}
