import type { ReactNode } from "react";

export function KpiCard({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  accent: string;
  icon?: ReactNode;
}) {
  return (
    <div
      className="animate-rise rounded-[14px] border border-[#E6E9ED] bg-white p-4 shadow-[0_1px_3px_rgba(22,24,29,0.06)]"
      style={{ borderLeftWidth: 4, borderLeftColor: accent }}
    >
      <div className="mb-2 flex items-center gap-2">
        {icon && (
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold"
            style={{ backgroundColor: `${accent}18`, color: accent }}
          >
            {icon}
          </span>
        )}
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#737B86]">
          {label}
        </span>
      </div>
      <div className="font-mono text-2xl font-semibold tabular-nums text-[#16181D]">
        {value}
      </div>
      {sub && (
        <p className="mt-1 text-xs text-[#737B86]">{sub}</p>
      )}
    </div>
  );
}
