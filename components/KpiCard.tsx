import type { ReactNode } from "react";

export type KpiTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "brand";

const TONES: Record<KpiTone, { fg: string; tint: string }> = {
  primary: { fg: "var(--primary)", tint: "var(--primary-tint)" },
  success: { fg: "var(--success)", tint: "var(--success-tint)" },
  warning: { fg: "var(--warning)", tint: "var(--warning-tint)" },
  danger: { fg: "var(--danger)", tint: "var(--danger-tint)" },
  info: { fg: "var(--info)", tint: "var(--info-tint)" },
  brand: { fg: "var(--brand)", tint: "var(--brand-tint)" },
};

export function KpiCard({
  label,
  value,
  sub,
  tone = "primary",
  icon,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  tone?: KpiTone;
  icon?: ReactNode;
}) {
  const { fg, tint } = TONES[tone];
  return (
    <div className="card animate-rise relative flex flex-col gap-1.5 overflow-hidden p-4">
      <span
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ backgroundColor: fg }}
        aria-hidden
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
          {label}
        </span>
        {icon && (
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold"
            style={{ backgroundColor: tint, color: fg }}
            aria-hidden
          >
            {icon}
          </span>
        )}
      </div>
      <div className="font-mono text-[26px] font-semibold leading-none tabular text-ink">
        {value}
      </div>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  );
}
