import type { FieldDef } from "./fields";
import type { RecordRow } from "./types";
import { formatDate, formatPKR, parseNumber } from "./format";

export function exportCsv(filename: string, fields: FieldDef[], records: RecordRow[]) {
  const headers = fields.map((f) => f.label);
  const keys = fields.map((f) => f.key);
  const escape = (v: string) => {
    if (v.includes(",") || v.includes('"') || v.includes("\n")) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  };
  const rows = records.map((r) =>
    keys
      .map((k) => {
        const f = fields.find((x) => x.key === k);
        const val = r[k];
        if (val == null) return "";
        if (f?.type === "date") return formatDate(String(val));
        if (f?.key === "cost" && f.type === "number")
          return formatPKR(parseNumber(val));
        return String(val);
      })
      .map(escape)
      .join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export interface ParsedCsv {
  headers: string[];
  rows: string[][];
}

/**
 * RFC-4180-ish CSV parser: handles quoted fields, escaped quotes (""),
 * embedded commas and newlines, and both CRLF and LF line endings.
 * Returns the first row as headers and the remainder as data rows.
 */
export function parseCsv(text: string): ParsedCsv {
  const records: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  // Strip a leading UTF-8 BOM if present.
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  const endField = () => {
    row.push(field);
    field = "";
  };
  const endRow = () => {
    endField();
    records.push(row);
    row = [];
  };

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      endField();
    } else if (c === "\n") {
      endRow();
    } else if (c === "\r") {
      // swallow; the following \n (if any) triggers endRow
    } else {
      field += c;
    }
  }
  // Flush any trailing field/row that wasn't terminated by a newline.
  if (field !== "" || row.length > 0) endRow();

  // Drop fully-empty trailing rows.
  const nonEmpty = records.filter(
    (r) => !(r.length === 1 && r[0].trim() === "")
  );
  const [headers = [], ...rows] = nonEmpty;
  return { headers: headers.map((h) => h.trim()), rows };
}

/** Normalize a header/label for fuzzy matching: lowercase, alnum only. */
export function normalizeHeader(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Best-effort auto-mapping of CSV headers onto target field keys. Returns a
 * map of fieldKey -> csv column index (or -1 when no confident match).
 *
 * Two passes so exact matches win, and each CSV column is claimed at most once:
 *  1. Exact normalized match on key or label.
 *  2. Loose contains-match for still-unmapped fields, but only for candidates
 *     of 4+ chars — otherwise short keys collide by substring (e.g. the "os"
 *     field would match the "Cost" column because "cost" contains "os").
 */
export function guessColumnMapping(
  csvHeaders: string[],
  fields: { key: string; label: string }[]
): Record<string, number> {
  const norm = csvHeaders.map(normalizeHeader);
  const used = new Set<number>();
  const mapping: Record<string, number> = {};

  for (const f of fields) {
    const candidates = [normalizeHeader(f.key), normalizeHeader(f.label)];
    const idx = norm.findIndex((h, i) => !used.has(i) && candidates.includes(h));
    mapping[f.key] = idx;
    if (idx >= 0) used.add(idx);
  }

  for (const f of fields) {
    if (mapping[f.key] >= 0) continue;
    const candidates = [normalizeHeader(f.key), normalizeHeader(f.label)].filter(
      (c) => c.length >= 4
    );
    if (candidates.length === 0) continue;
    const idx = norm.findIndex(
      (h, i) =>
        !used.has(i) &&
        h &&
        candidates.some((c) => h.includes(c) || c.includes(h))
    );
    if (idx >= 0) {
      mapping[f.key] = idx;
      used.add(idx);
    }
  }

  return mapping;
}
