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
    <div className="mb-4 rounded-[14px] border border-[#E6E9ED] bg-white p-4 shadow-[0_1px_3px_rgba(22,24,29,0.06)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#737B86]">
          Filters
        </p>
        <p className="text-xs font-semibold text-[#3A4049]">
          Showing{" "}
          <span className="font-mono tabular-nums text-[#C8102E]">
            {filtered.length}
          </span>{" "}
          of <span className="font-mono tabular-nums">{records.length}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Search…"
          value={state.q}
          onChange={(e) => set({ q: e.target.value })}
          className="min-w-[200px] flex-1 rounded-lg border border-[#E6E9ED] px-3 py-2 text-sm outline-none focus:border-[#C8102E]"
        />

        {selectFields.map((f) => (
          <select
            key={f.key}
            value={state.selects[f.key] ?? ""}
            onChange={(e) =>
              set({ selects: { ...state.selects, [f.key]: e.target.value } })
            }
            className="rounded-lg border border-[#E6E9ED] bg-white px-3 py-2 text-sm font-semibold text-[#3A4049] outline-none focus:border-[#C8102E]"
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
            value={state.assignment}
            onChange={(e) => set({ assignment: e.target.value })}
            className="rounded-lg border border-[#E6E9ED] bg-white px-3 py-2 text-sm font-semibold text-[#3A4049] outline-none focus:border-[#C8102E]"
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
            className="rounded-lg px-3 py-2 text-sm font-semibold text-[#737B86] hover:text-[#C8102E]"
          >
            Reset
          </button>
        )}
      </div>

      {showPlatform && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#F3F4F6] pt-3">
          <span className="mr-1 text-[11px] font-extrabold uppercase tracking-wider text-[#737B86]">
            Platform
          </span>
          <PlatformChip
            label="All"
            count={platformBase.length}
            color="#C8102E"
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
              onClick={() =>
                set({ platform: state.platform === p ? "" : p })
              }
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
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold transition ${
        active
          ? "border-transparent text-white"
          : "border-[#E6E9ED] bg-white text-[#3A4049] hover:border-[#C8102E]"
      }`}
      style={active ? { backgroundColor: color } : undefined}
    >
      <span
        className="h-[7px] w-[7px] shrink-0 rounded-full"
        style={{ backgroundColor: active ? "#ffffff" : color }}
      />
      {label}
      <span
        className={`font-mono tabular-nums ${
          active ? "text-white/85" : "text-[#737B86]"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
