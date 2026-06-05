"use client";

import type { FieldDef } from "@/lib/fields";
import { formatDate, formatPKR, parseNumber } from "@/lib/format";
import type { RecordRow } from "@/lib/types";
import { Pill } from "./Pill";
import { useMemo, useState } from "react";

export function RegisterTable({
  fields,
  records,
  onEdit,
  onDelete,
  onAdd,
  addLabel,
}: {
  fields: FieldDef[];
  records: RecordRow[];
  onEdit: (r: RecordRow) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  addLabel: string;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return records;
    return records.filter((r) =>
      fields.some((f) => String(r[f.key] ?? "").toLowerCase().includes(s))
    );
  }, [records, fields, q]);

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[14px] border border-[#E6E9ED] bg-white py-16 shadow-[0_1px_3px_rgba(22,24,29,0.06)]">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#F3F4F6] text-[#737B86]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
        <p className="mb-1 font-semibold text-[#16181D]">No records yet</p>
        <p className="mb-4 text-sm text-[#737B86]">Add your first entry to this sheet.</p>
        <button type="button" onClick={onAdd} className="btn-primary">
          {addLabel}
        </button>
      </div>
    );
  }

  const monoKeys = new Set([
    "assetTag",
    "serialNumber",
    "machineId",
    "cost",
    "email",
  ]);

  function cellValue(f: FieldDef, r: RecordRow) {
    const v = r[f.key];
    if (v == null || v === "") return "—";
    if (f.type === "date") return formatDate(String(v));
    if (f.key === "cost" && f.type === "number") return formatPKR(parseNumber(v));
    if (f.type === "select" && f.palette) {
      return (
        <Pill
          label={String(v)}
          color={f.palette[String(v)] || "#737B86"}
        />
      );
    }
    return String(v);
  }

  return (
    <div className="rounded-[14px] border border-[#E6E9ED] bg-white shadow-[0_1px_3px_rgba(22,24,29,0.06)]">
      <div className="flex flex-wrap items-center gap-3 border-b border-[#E6E9ED] p-4">
        <input
          type="search"
          placeholder="Search records…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="min-w-[200px] flex-1 rounded-lg border border-[#E6E9ED] px-3 py-2 text-sm outline-none focus:border-[#C8102E]"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#E6E9ED] bg-[#F9FAFB] text-[10px] font-extrabold uppercase tracking-wider text-[#737B86]">
              {fields.map((f) => (
                <th key={f.key} className="px-4 py-3">
                  {f.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.id}
                className="border-b border-[#E6E9ED] last:border-0 hover:bg-[#FAFBFC]"
              >
                {fields.map((f) => (
                  <td
                    key={f.key}
                    className={`px-4 py-3 text-[#3A4049] ${
                      monoKeys.has(f.key) ? "font-mono tabular-nums" : ""
                    }`}
                  >
                    {cellValue(f, r)}
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onEdit(r)}
                    className="mr-2 rounded p-1.5 text-[#737B86] hover:bg-[#F3F4F6] hover:text-[#16181D]"
                    title="Edit"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(r.id)}
                    className="rounded p-1.5 text-[#737B86] hover:bg-red-50 hover:text-[#C8102E]"
                    title="Delete"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && q && (
        <p className="p-4 text-center text-sm text-[#737B86]">No matches for &quot;{q}&quot;</p>
      )}
    </div>
  );
}
