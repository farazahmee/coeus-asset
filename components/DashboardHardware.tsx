"use client";

import type { RecordRow } from "@/lib/types";
import {
  CATEGORY_COLORS,
  HARDWARE_CATEGORIES,
} from "@/lib/fields";
import { abbreviatePKR, formatPKR, parseNumber, purchaseYear } from "@/lib/format";
import { BarPanel } from "./BarPanel";
import { KpiCard } from "./KpiCard";
import { RecentList } from "./RecentList";

/** A record has "no cost recorded" when the cost field is empty/absent. */
export function hasNoCost(r: RecordRow): boolean {
  const v = r.cost;
  return v == null || String(v).trim() === "";
}

export function DashboardHardware({
  records,
  onShowMissingCost,
}: {
  records: RecordRow[];
  onShowMissingCost?: () => void;
}) {
  const total = records.length;
  const totalValue = records.reduce((s, r) => s + parseNumber(r.cost), 0);
  const categories = new Set(
    records.map((r) => String(r.category || "")).filter(Boolean)
  ).size;
  const assigned = records.filter((r) => String(r.assignedTo || "").trim()).length;
  const spare = total - assigned;
  const missingCost = records.filter(hasNoCost).length;

  const byCategory = HARDWARE_CATEGORIES.map((cat) => {
    const subset = records.filter((r) => r.category === cat);
    const value = subset.reduce((s, r) => s + parseNumber(r.cost), 0);
    return {
      label: cat,
      count: subset.length,
      value,
      color: CATEGORY_COLORS[cat],
      sub: `${subset.length} · ${abbreviatePKR(value)}`,
    };
  }).filter((x) => x.count > 0);

  // Spend (PKR) per purchase year — the bar metric is the cost total, carried
  // in `value` (not `count`), so BarPanel scales heights by spend and labels
  // each bar with abbreviatePKR.
  const yearMap = new Map<string, { count: number; cost: number }>();
  for (const r of records) {
    const y = purchaseYear(String(r.purchaseDate || ""));
    const cur = yearMap.get(y) || { count: 0, cost: 0 };
    cur.count += 1;
    cur.cost += parseNumber(r.cost);
    yearMap.set(y, cur);
  }
  const byYear = [...yearMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, { count, cost }]) => ({
      label,
      count,
      value: cost,
      color: "var(--primary)",
    }))
    .filter((x) => x.value > 0);

  const recent = [...records]
    .slice(0, 5)
    .map((r) => ({
      primary: String(r.model || "—"),
      secondary: `${r.assetTag || "—"} · ${r.category || "—"}`,
      meta: hasNoCost(r) ? undefined : formatPKR(parseNumber(r.cost)),
    }));

  return (
    <div className="space-y-6">
      {missingCost > 0 && (
        <div className="animate-rise flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] bg-danger-tint px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
              !
            </span>
            <span className="font-semibold text-ink">
              {missingCost} {missingCost === 1 ? "asset has" : "assets have"} no
              cost recorded
            </span>
            <span className="text-muted">
              — Total Value and Spend by Year are understated.
            </span>
          </div>
          {onShowMissingCost && (
            <button
              type="button"
              onClick={onShowMissingCost}
              className="shrink-0 rounded-[var(--radius-md)] bg-brand px-3 py-1.5 text-xs font-bold text-white transition hover:bg-brand-strong"
            >
              Review {missingCost} {missingCost === 1 ? "asset" : "assets"} →
            </button>
          )}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Assets" value={total} tone="primary" icon="#" />
        <KpiCard
          label="Total Value"
          value={abbreviatePKR(totalValue)}
          sub={missingCost > 0 ? `excludes ${missingCost} with no cost` : undefined}
          tone="success"
          icon="Rs"
        />
        <KpiCard label="Categories" value={categories} tone="info" icon="◆" />
        <KpiCard
          label="Assigned"
          value={assigned}
          sub={`${spare} spare / unassigned`}
          tone="warning"
          icon="→"
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <BarPanel
          title="Assets by Category"
          items={byCategory}
          emptyLabel="No categorised assets yet"
        />
        <BarPanel
          title="Spend by Purchase Year"
          items={byYear}
          horizontal={false}
          valueFormatter={abbreviatePKR}
          emptyLabel="No cost data yet — import or add costs to see spend"
        />
      </div>
      <RecentList title="Recently Added" items={recent} />
    </div>
  );
}
