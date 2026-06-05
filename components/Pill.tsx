export function Pill({
  label,
  color = "#737B86",
}: {
  label: string;
  color?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-xs font-bold text-[#3A4049]">
      <span
        className="h-[7px] w-[7px] shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label || "—"}
    </span>
  );
}
