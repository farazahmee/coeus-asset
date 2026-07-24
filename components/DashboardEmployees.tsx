"use client";

import type { RecordRow } from "@/lib/types";
import { EMPLOYEE_STATUSES, STATUS_COLORS } from "@/lib/fields";
import { BarPanel } from "./BarPanel";
import { KpiCard } from "./KpiCard";
import { RecentList } from "./RecentList";

export function DashboardEmployees({ records }: { records: RecordRow[] }) {
  const total = records.length;
  const teams = new Set(records.map((r) => String(r.team || "").trim()).filter(Boolean)).size;
  const activeRemote = records.filter(
    (r) => r.status === "Active" || r.status === "Remote"
  ).length;
  const withMachine = records.filter((r) => String(r.machineId || "").trim()).length;

  const teamMap = new Map<string, number>();
  for (const r of records) {
    const t = String(r.team || "Unassigned").trim() || "Unassigned";
    teamMap.set(t, (teamMap.get(t) || 0) + 1);
  }
  const byTeam = [...teamMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({
      label,
      count,
      color: "var(--info)",
    }));

  const byStatus = EMPLOYEE_STATUSES.map((st) => ({
    label: st,
    count: records.filter((r) => r.status === st).length,
    color: STATUS_COLORS[st],
  })).filter((x) => x.count > 0);

  const recent = [...records].slice(0, 5).map((r) => ({
    primary: String(r.name || "—"),
    secondary: [r.designation, r.team].filter(Boolean).join(" · ") || "—",
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total People" value={total} tone="primary" icon="#" />
        <KpiCard label="Teams" value={teams} tone="info" icon="T" />
        <KpiCard label="Active / Remote" value={activeRemote} tone="success" icon="✓" />
        <KpiCard label="With Machine" value={withMachine} tone="warning" icon="M" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <BarPanel title="Headcount by Team" items={byTeam} />
        <BarPanel title="By Status" items={byStatus} />
      </div>
      <RecentList title="Recently Added" items={recent} />
    </div>
  );
}
