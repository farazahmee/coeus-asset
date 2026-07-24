"use client";

import type { FieldDef } from "@/lib/fields";
import type { RecordRow } from "@/lib/types";
import { useState } from "react";

function buildInit(fields: FieldDef[], record: RecordRow | null) {
  const init: Record<string, string> = {};
  for (const f of fields) {
    const v = record?.[f.key];
    init[f.key] = v != null ? String(v) : "";
  }
  return init;
}

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
  // Reset the form whenever the drawer opens or switches to a different record.
  // Done via the "adjust state during render" pattern (tracking the previous
  // signature) rather than a setState-in-effect.
  const sig = open ? String(record?.id ?? "new") : "closed";
  const [loadedSig, setLoadedSig] = useState(sig);
  const [form, setForm] = useState<Record<string, string>>(() =>
    buildInit(fields, record)
  );
  const [error, setError] = useState("");

  if (sig !== loadedSig) {
    setLoadedSig(sig);
    setForm(buildInit(fields, record));
    setError("");
  }

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
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-surface shadow-2xl animate-slide-in"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="icon-btn"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <p className="rounded-[var(--radius-sm)] bg-danger-tint px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}
          {fields.map((f) => (
            <label key={f.key} className="block">
              <span className="mb-1 block text-xs font-bold text-ink-2">
                {f.label}
                {f.required && <span className="text-brand"> *</span>}
              </span>
              {f.type === "select" ? (
                <select
                  value={form[f.key] || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                  className="field"
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
                  type={
                    f.type === "number"
                      ? "number"
                      : f.type === "date"
                        ? "date"
                        : f.type === "password"
                          ? "password"
                          : "text"
                  }
                  autoComplete={f.type === "password" ? "new-password" : undefined}
                  value={form[f.key] || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                  className={`field ${
                    f.key === "assetTag" ||
                    f.key === "serialNumber" ||
                    f.key === "machineId" ||
                    f.type === "password"
                      ? "font-mono"
                      : ""
                  }`}
                />
              )}
            </label>
          ))}
        </div>
        <div className="flex gap-3 border-t border-line p-5">
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
