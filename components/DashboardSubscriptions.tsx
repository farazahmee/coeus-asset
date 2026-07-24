"use client";

import type { RecordRow } from "@/lib/types";
import { AUTO_RENEW_COLORS, BILLING_CYCLE_COLORS } from "@/lib/fields";
import { formatDate } from "@/lib/format";
import { BarPanel } from "./BarPanel";
import { KpiCard } from "./KpiCard";
import { RecentList } from "./RecentList";

export function DashboardSubscriptions({ records }: { records: RecordRow[] }) {
  const total = records.length;
  const monthly = records.filter((r) => r.billingCycle === "Monthly").length;
  const annual = records.filter((r) => r.billingCycle === "Annual").length;
  const autoOn = records.filter((r) => r.autoRenew === "Yes").length;
  const autoOff = records.filter((r) => r.autoRenew === "No").length;

  const byBilling = [
    { label: "Monthly", count: monthly, color: BILLING_CYCLE_COLORS.Monthly },
    { label: "Annual", count: annual, color: BILLING_CYCLE_COLORS.Annual },
  ].filter((x) => x.count > 0);

  const byAutoRenew = [
    { label: "Yes", count: autoOn, color: AUTO_RENEW_COLORS.Yes },
    { label: "No", count: autoOff, color: AUTO_RENEW_COLORS.No },
  ].filter((x) => x.count > 0);

  const recent = [...records].slice(0, 5).map((r) => ({
    primary: String(r.softwareName || "—"),
    secondary:
      [r.usernameEmail, r.url].filter(Boolean).join(" · ") || "—",
    meta: r.purchaseDate ? formatDate(String(r.purchaseDate)) : undefined,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Subscriptions" value={total} accent="#1FA37A" icon="#" />
        <KpiCard
          label="Monthly"
          value={monthly}
          accent="#2D6CDF"
          icon="M"
        />
        <KpiCard label="Annual" value={annual} accent="#7A4FE0" icon="A" />
        <KpiCard
          label="Auto-Renew On"
          value={autoOn}
          sub={`${autoOff} off`}
          accent="#E08A00"
          icon="↻"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BarPanel
          title="By Billing Cycle"
          items={byBilling}
          emptyLabel="No subscriptions yet"
        />
        <BarPanel
          title="Auto-Renew"
          items={byAutoRenew}
          emptyLabel="No subscriptions yet"
        />
      </div>

      <RecentList title="Recently Added" items={recent} />
    </div>
  );
}
