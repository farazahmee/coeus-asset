import type { FieldDef } from "./fields";
import type { RecordRow } from "./types";

/** State held by the FilterBar for a single sheet view. */
export interface FilterState {
  q: string;
  /** field key -> exact value to match ("" means "all") */
  selects: Record<string, string>;
  /** OS/platform bucket ("" means "all") */
  platform: string;
  /** "", "assigned", or "unassigned" (hardware only) */
  assignment: string;
}

export const EMPTY_FILTER: FilterState = {
  q: "",
  selects: {},
  platform: "",
  assignment: "",
};

export const PLATFORMS = ["macOS", "Windows", "Linux", "ChromeOS", "Other"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_COLORS: Record<string, string> = {
  macOS: "#475569",
  Windows: "#2D6CDF",
  Linux: "#E08A00",
  ChromeOS: "#1FA37A",
  Other: "#737B86",
};

/** Best-effort platform bucket from a hardware record's OS / model / CPU text. */
export function detectPlatform(r: RecordRow): Platform {
  const hay = `${r.os ?? ""} ${r.model ?? ""} ${r.cpu ?? ""}`.toLowerCase();
  if (/(macbook|imac|mac mini|mac\b|osx|os x|apple|m1|m2|m3|m4)/.test(hay))
    return "macOS";
  if (/win/.test(hay)) return "Windows";
  if (/(linux|ubuntu|fedora|debian|centos|mint|arch)/.test(hay)) return "Linux";
  if (/chrome/.test(hay)) return "ChromeOS";
  return "Other";
}

export function isAssigned(r: RecordRow): boolean {
  return String(r.assignedTo ?? "").trim() !== "";
}

/** Apply the full filter state to a record set. */
export function applyFilters(
  records: RecordRow[],
  fields: FieldDef[],
  state: FilterState
): RecordRow[] {
  const s = state.q.trim().toLowerCase();
  return records.filter((r) => {
    if (
      s &&
      !fields.some((f) => String(r[f.key] ?? "").toLowerCase().includes(s))
    ) {
      return false;
    }
    for (const [key, val] of Object.entries(state.selects)) {
      if (val && String(r[key] ?? "") !== val) return false;
    }
    if (state.platform && detectPlatform(r) !== state.platform) return false;
    if (state.assignment === "assigned" && !isAssigned(r)) return false;
    if (state.assignment === "unassigned" && isAssigned(r)) return false;
    return true;
  });
}

/** Count records per platform bucket (used for the live chips). */
export function platformCounts(records: RecordRow[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const p of PLATFORMS) out[p] = 0;
  for (const r of records) out[detectPlatform(r)]++;
  return out;
}

export function isFilterActive(state: FilterState): boolean {
  return (
    state.q.trim() !== "" ||
    state.platform !== "" ||
    state.assignment !== "" ||
    Object.values(state.selects).some((v) => v !== "")
  );
}
