"use client";

import type { FieldDef } from "@/lib/fields";
import type { RecordRow } from "@/lib/types";
import {
  applyFilters,
  isFilterActive,
  platformCounts,
  PLATFORM_COLORS,
  PLATFORMS,
  type FilterState,
} from "@/lib/filter";
import { useMemo } from "react";

export function FilterBar({
  fields,
  records,
  state,
  onChange,
  showPlatform,
  showAssignment,
}: {
  fields: FieldDef[];
  records: RecordRow[];
  state: FilterState;
  onChange: (next: FilterState) => void;
  showPlatform?: boolean;
  showAssignment?: boolean;
}) {
  const selectFields = fields.filter((f) => f.type === "select");

  const filtered = useMemo(
    () => applyFilters(records, fields, state),
    [records, fields, state]
  );

  // Platform chip counts are computed over everything EXCEPT the platform
  // filter, so the numbers stay meaningful while you toggle between buckets.
  const platformBase = useMemo(
    () => applyFilters(records, fields, { ...state, platform: "" }),
    [records, fields, state]
  );
  const pCounts = useMemo(() => platformCounts(platformBase), [platformBase]);

  const set = (patch: Partial<FilterState>) => onChange({ ...state, ...patch });
  const active = isFilterActive(state);

  return (
    <div className="card mb-4 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
          Filters
        </p>
        <p className="text-xs font-semibold text-ink-2">
          Showing{" "}
          <span className="font-mono tabular text-primary">{filtered.length}</span>{" "}
          of <span className="font-mono tabular">{records.length}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Search…"
          aria-label="Search records"
          value={state.q}
          onChange={(e) => set({ q: e.target.value })}
          className="min-w-[200px] flex-1 rounded-[var(--radius-sm)] border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary"
        />

        {selectFields.map((f) => (
          <select
            key={f.key}
            aria-label={`Filter by ${f.label}`}
            value={state.selects[f.key] ?? ""}
            onChange={(e) =>
              set({ selects: { ...state.selects, [f.key]: e.target.value } })
            }
            className="rounded-[var(--radius-sm)] border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink-2 outline-none focus:border-primary"
          >
            <option value="">{f.label}: All</option>
            {(f.options ?? []).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ))}

        {showAssignment && (
          <select
            aria-label="Filter by assignment"
            value={state.assignment}
            onChange={(e) => set({ assignment: e.target.value })}
            className="rounded-[var(--radius-sm)] border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink-2 outline-none focus:border-primary"
          >
            <option value="">Assignment: All</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned / Spare</option>
          </select>
        )}

        {active && (
          <button
            type="button"
            onClick={() =>
              onChange({ q: "", selects: {}, platform: "", assignment: "" })
            }
            className="rounded-[var(--radius-md)] px-3 py-2 text-sm font-semibold text-muted transition hover:text-brand"
          >
            Reset
          </button>
        )}
      </div>

      {showPlatform && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <span className="mr-1 text-[11px] font-extrabold uppercase tracking-wider text-muted">
            Platform
          </span>
          <PlatformChip
            label="All"
            count={platformBase.length}
            color="var(--primary)"
            active={state.platform === ""}
            onClick={() => set({ platform: "" })}
          />
          {PLATFORMS.map((p) => (
            <PlatformChip
              key={p}
              label={p}
              count={pCounts[p]}
              color={PLATFORM_COLORS[p]}
              active={state.platform === p}
              onClick={() => set({ platform: state.platform === p ? "" : p })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PlatformChip({
  label,
  count,
  color,
  active,
  onClick,
}: {
  label: string;
  count: number;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold transition ${
        active
          ? "border-transparent text-white"
          : "border-line bg-surface text-ink-2 hover:border-primary"
      }`}
      style={active ? { backgroundColor: color } : undefined}
    >
      <span
        className="h-[7px] w-[7px] shrink-0 rounded-full"
        style={{ backgroundColor: active ? "#ffffff" : color }}
      />
      {label}
      <span
        className={`font-mono tabular ${active ? "text-white/85" : "text-muted"}`}
      >
        {count}
      </span>
    </button>
  );
}
