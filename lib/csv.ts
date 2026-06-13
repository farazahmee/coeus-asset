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
        let val = r[k];
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
