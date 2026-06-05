"use client";

import { useEffect, useState } from "react";

export interface BarItem {
  label: string;
  count: number;
  value?: number;
  color: string;
  sub?: string;
}

export function BarPanel({
  title,
  items,
  horizontal = true,
  valueFormatter,
}: {
  title: string;
  items: BarItem[];
  horizontal?: boolean;
  valueFormatter?: (n: number) => string;
}) {
  const max = Math.max(...items.map((i) => i.count), 1);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!horizontal) {
    return (
      <div className="animate-rise rounded-[14px] border border-[#E6E9ED] bg-white p-5 shadow-[0_1px_3px_rgba(22,24,29,0.06)]">
        <h3 className="mb-4 text-sm font-bold text-[#16181D]">{title}</h3>
        <div className="flex h-48 items-end gap-2">
          {items.map((item) => (
            <div key={item.label} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full max-w-[48px] rounded-t-md transition-all duration-700 ease-out"
                style={{
                  height: mounted ? `${(item.count / max) * 100}%` : "0%",
                  minHeight: item.count ? 8 : 0,
                  backgroundColor: item.color,
                }}
              />
              <span className="font-mono text-[10px] text-[#737B86]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-rise rounded-[14px] border border-[#E6E9ED] bg-white p-5 shadow-[0_1px_3px_rgba(22,24,29,0.06)]">
      <h3 className="mb-4 text-sm font-bold text-[#16181D]">{title}</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-semibold text-[#3A4049]">{item.label}</span>
              <span className="font-mono text-[#737B86]">
                {item.sub ??
                  (valueFormatter && item.value != null
                    ? `${item.count} · ${valueFormatter(item.value)}`
                    : String(item.count))}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#F3F4F6]">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: mounted ? `${(item.count / max) * 100}%` : "0%",
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-[#737B86]">No data yet</p>
        )}
      </div>
    </div>
  );
}
