"use client";

import type { RecordRow, Sheet } from "@/lib/types";
import { effectiveSheetType, getFieldsForSheet } from "@/lib/fields";
import { parseNumber } from "@/lib/format";
import { DashboardEmployees } from "./DashboardEmployees";
import { DashboardHardware } from "./DashboardHardware";
import { BarPanel } from "./BarPanel";
import { KpiCard } from "./KpiCard";
import { RecentList } from "./RecentList";

export function DashboardCustom({
  sheet,
  records,
  onShowMissingCost,
}: {
  sheet: Sheet;
  records: RecordRow[];
  onShowMissingCost?: () => void;
}) {
  const t = effectiveSheetType(sheet);
  if (t === "hardware")
    return (
      <DashboardHardware records={records} onShowMissingCost={onShowMissingCost} />
    );
  if (t === "employees") return <DashboardEmployees records={records} />;

  const fields = getFieldsForSheet(sheet);
  const numberField = fields.find((f) => f.type === "number");
  const groupField =
    fields.find((f) => f.type === "select") || fields.find((f) => f.type === "text");

  const total = records.length;
  const sum = numberField
    ? records.reduce((s, r) => s + parseNumber(r[numberField.key]), 0)
    : 0;
  const avg = numberField && total ? sum / total : 0;
  const distinctGroup = groupField
    ? new Set(records.map((r) => String(r[groupField.key] || "")).filter(Boolean)).size
    : 0;

  const groupMap = new Map<string, number>();
  if (groupField) {
    for (const r of records) {
      const k = String(r[groupField.key] || "—").trim() || "—";
      groupMap.set(k, (groupMap.get(k) || 0) + 1);
    }
  }
  const accent = sheet.color || "#737B86";
  const barItems = [...groupMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({
      label,
      count,
      color: accent,
    }));

  const firstKey = fields[0]?.key;
  const recent = [...records].slice(0, 5).map((r) => ({
    primary: firstKey ? String(r[firstKey] || "—") : "—",
    secondary: fields[1] ? String(r[fields[1].key] || "—") : "—",
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Records" value={total} accent={accent} icon="#" />
        {numberField && (
          <>
            <KpiCard
              label={`Sum (${numberField.label})`}
              value={sum.toLocaleString()}
              accent={accent}
              icon="Σ"
            />
            <KpiCard
              label={`Average (${numberField.label})`}
              value={avg.toFixed(1)}
              accent={accent}
              icon="μ"
            />
          </>
        )}
        {groupField && (
          <KpiCard
            label={`Distinct ${groupField.label}`}
            value={distinctGroup}
            accent={accent}
            icon="◆"
          />
        )}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {groupField && (
          <BarPanel title={`By ${groupField.label}`} items={barItems} />
        )}
        <RecentList title="Recently Added" items={recent} />
      </div>
    </div>
  );
}
