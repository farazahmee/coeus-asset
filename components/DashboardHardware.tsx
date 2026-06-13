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

export function DashboardHardware({ records }: { records: RecordRow[] }) {
  const total = records.length;
  const totalValue = records.reduce((s, r) => s + parseNumber(r.cost), 0);
  const categories = new Set(
    records.map((r) => String(r.category || "")).filter(Boolean)
  ).size;
  const assigned = records.filter((r) => String(r.assignedTo || "").trim()).length;
  const spare = total - assigned;

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

  const yearMap = new Map<string, number>();
  for (const r of records) {
    const y = purchaseYear(String(r.purchaseDate || ""));
    yearMap.set(y, (yearMap.get(y) || 0) + parseNumber(r.cost));
  }
  const byYear = [...yearMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, count]) => ({
      label,
      count,
      color: "#C8102E",
    }));

  const recent = [...records]
    .slice(0, 5)
    .map((r) => ({
      primary: String(r.model || "—"),
      secondary: `${r.assetTag || "—"} · ${r.category || "—"}`,
      meta: r.cost ? formatPKR(parseNumber(r.cost)) : undefined,
    }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Assets" value={total} accent="#C8102E" icon="#" />
        <KpiCard
          label="Total Value"
          value={abbreviatePKR(totalValue)}
          accent="#C8102E"
          icon="Rs"
        />
        <KpiCard label="Categories" value={categories} accent="#C8102E" icon="◆" />
        <KpiCard
          label="Assigned"
          value={assigned}
          sub={`${spare} spare / unassigned`}
          accent="#C8102E"
          icon="→"
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <BarPanel title="Assets by Category" items={byCategory} />
        <BarPanel
          title="Spend by Purchase Year"
          items={byYear}
          horizontal={false}
        />
      </div>
      <RecentList title="Recently Added" items={recent} />
    </div>
  );
}
