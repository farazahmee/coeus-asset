"use client";

import { useEffect, useState } from "react";

export interface BarItem {
  label: string;
  count: number;
  value?: number;
  color: string;
  sub?: string;
}

function EmptyPanel({ title, emptyLabel }: { title: string; emptyLabel: string }) {
  return (
    <div className="card animate-rise p-5">
      <h3 className="mb-4 text-sm font-bold text-ink">{title}</h3>
      <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-muted">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18" />
            <path d="M18 17V9M13 17V5M8 17v-3" />
          </svg>
        </span>
        <p className="text-sm font-medium text-muted">{emptyLabel}</p>
      </div>
    </div>
  );
}

export function BarPanel({
  title,
  items,
  horizontal = true,
  valueFormatter,
  emptyLabel = "No data yet",
}: {
  title: string;
  items: BarItem[];
  horizontal?: boolean;
  valueFormatter?: (n: number) => string;
  emptyLabel?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (items.length === 0) {
    return <EmptyPanel title={title} emptyLabel={emptyLabel} />;
  }

  // Vertical bars can be scaled by a monetary `value` (e.g. spend) rather than
  // a raw `count`. When a valueFormatter is supplied and items carry a value,
  // we scale heights by value and print the formatted amount under each bar.
  const useValue =
    valueFormatter != null && items.some((i) => i.value != null);
  const metricOf = (i: BarItem) => (useValue ? i.value ?? 0 : i.count);

  if (!horizontal) {
    const max = Math.max(...items.map(metricOf), 1);
    return (
      <div className="card animate-rise p-5">
        <h3 className="mb-4 text-sm font-bold text-ink">{title}</h3>
        <div className="flex h-48 items-end gap-2">
          {items.map((item) => {
            const m = metricOf(item);
            return (
              <div key={item.label} className="flex flex-1 flex-col items-center gap-1">
                {useValue && (
                  <span className="font-mono text-[10px] font-semibold tabular text-ink-2">
                    {valueFormatter!(item.value ?? 0)}
                  </span>
                )}
                <div
                  className="w-full max-w-[48px] rounded-t-md transition-all duration-700 ease-out"
                  title={useValue ? valueFormatter!(item.value ?? 0) : String(item.count)}
                  style={{
                    height: mounted ? `${(m / max) * 100}%` : "0%",
                    minHeight: m ? 8 : 0,
                    backgroundColor: item.color,
                  }}
                />
                <span className="font-mono text-[10px] text-muted">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Width scales by value when a valueFormatter is supplied (e.g. spend charts),
  // otherwise by count. No formatter -> count, so count-based charts are
  // unchanged.
  const max = Math.max(...items.map(metricOf), 1);
  return (
    <div className="card animate-rise p-5">
      <h3 className="mb-4 text-sm font-bold text-ink">{title}</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-semibold text-ink-2">{item.label}</span>
              <span className="font-mono tabular text-muted">
                {item.sub ??
                  (valueFormatter && item.value != null
                    ? `${item.count} · ${valueFormatter(item.value)}`
                    : String(item.count))}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: mounted ? `${(metricOf(item) / max) * 100}%` : "0%",
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
