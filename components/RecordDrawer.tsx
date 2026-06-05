"use client";

import type { FieldDef } from "@/lib/fields";
import type { RecordRow } from "@/lib/types";
import { useEffect, useState } from "react";

export function RecordDrawer({
  open,
  fields,
  record,
  title,
  onClose,
  onSave,
}: {
  open: boolean;
  fields: FieldDef[];
  record: RecordRow | null;
  title: string;
  onClose: () => void;
  onSave: (data: Record<string, string | number>) => void;
}) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const init: Record<string, string> = {};
    for (const f of fields) {
      const v = record?.[f.key];
      init[f.key] = v != null ? String(v) : "";
    }
    setForm(init);
    setError("");
  }, [open, record, fields]);

  if (!open) return null;

  const submit = () => {
    for (const f of fields) {
      if (f.required && !String(form[f.key] || "").trim()) {
        setError(`${f.label} is required`);
        return;
      }
    }
    const out: Record<string, string | number> = {};
    for (const f of fields) {
      const raw = form[f.key] ?? "";
      if (f.type === "number") {
        const n = parseFloat(raw);
        if (raw.trim()) out[f.key] = Number.isFinite(n) ? n : 0;
      } else if (raw.trim()) {
        out[f.key] = raw.trim();
      }
    }
    if (record?.id) out.id = record.id;
    onSave(out);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-[#16181D]/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden
      />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-slide-in">
        <div className="flex items-center justify-between border-b border-[#E6E9ED] px-5 py-4">
          <h2 className="text-lg font-bold text-[#16181D]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-2 text-[#737B86] hover:bg-[#F3F4F6]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[#C8102E]">{error}</p>
          )}
          {fields.map((f) => (
            <label key={f.key} className="block">
              <span className="mb-1 block text-xs font-bold text-[#3A4049]">
                {f.label}
                {f.required && <span className="text-[#C8102E]"> *</span>}
              </span>
              {f.type === "select" ? (
                <select
                  value={form[f.key] || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                  className="w-full rounded-lg border border-[#E6E9ED] px-3 py-2 text-sm"
                >
                  <option value="">—</option>
                  {(f.options || []).map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                  value={form[f.key] || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                  className={`w-full rounded-lg border border-[#E6E9ED] px-3 py-2 text-sm ${
                    f.key === "assetTag" || f.key === "serialNumber" || f.key === "machineId"
                      ? "font-mono"
                      : ""
                  }`}
                />
              )}
            </label>
          ))}
        </div>
        <div className="flex gap-3 border-t border-[#E6E9ED] p-5">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="button" onClick={submit} className="btn-primary flex-1">
            Save
          </button>
        </div>
      </aside>
    </>
  );
}
