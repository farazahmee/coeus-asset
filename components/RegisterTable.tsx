"use client";

import type { FieldDef } from "@/lib/fields";
import { formatDate, formatPKR, parseNumber } from "@/lib/format";
import type { RecordRow } from "@/lib/types";
import { Pill } from "./Pill";
import { useState, type ReactNode } from "react";

const monoKeys = new Set([
  "assetTag",
  "serialNumber",
  "machineId",
  "cost",
  "email",
  "usernameEmail",
  "url",
  "password",
]);

export function RegisterTable({
  fields,
  records,
  totalRecords,
  onEdit,
  onDelete,
  onAdd,
  addLabel,
  readOnly = false,
  editableKeys,
  onInlineSave,
  filterNotice,
}: {
  fields: FieldDef[];
  /** Rows to display (already filtered by the parent). */
  records: RecordRow[];
  /** Total rows in the sheet before filtering — distinguishes an empty sheet
   *  from a filtered-to-nothing view. Defaults to records.length. */
  totalRecords?: number;
  onEdit: (r: RecordRow) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  addLabel: string;
  /** Read-only sheets (e.g. the virtual Assigned Laptops view). */
  readOnly?: boolean;
  /** Keys that can be edited inline (ignored when readOnly). */
  editableKeys?: Set<string>;
  onInlineSave?: (data: Record<string, string | number>) => void | Promise<void>;
  /** Optional banner above the table (e.g. active "missing cost" filter). */
  filterNotice?: ReactNode;
}) {
  const total = totalRecords ?? records.length;
  const canEditInline = !readOnly && !!onInlineSave;

  const [editing, setEditing] = useState<{ id: string; key: string } | null>(null);
  const [draft, setDraft] = useState("");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const toggleReveal = (id: string) =>
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Truly empty sheet (no underlying data at all).
  if (total === 0 && !filterNotice) {
    return (
      <div className="card flex flex-col items-center justify-center py-16">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-muted">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
        <p className="mb-1 font-semibold text-ink">No records yet</p>
        <p className="mb-4 text-sm text-muted">
          {readOnly
            ? "Records will appear here automatically."
            : "Add your first entry to this sheet."}
        </p>
        {!readOnly && (
          <button type="button" onClick={onAdd} className="btn-primary">
            {addLabel}
          </button>
        )}
      </div>
    );
  }

  function commit(r: RecordRow, f: FieldDef) {
    const current = r[f.key] == null ? "" : String(r[f.key]);
    if (draft === current) {
      setEditing(null);
      return;
    }
    const payload: Record<string, string | number> = { id: r.id };
    for (const fd of fields) {
      if (fd.key === f.key) continue;
      const v = r[fd.key];
      if (v == null || v === "") continue;
      payload[fd.key] = fd.type === "number" ? parseNumber(v) : String(v);
    }
    const trimmed = draft.trim();
    if (trimmed !== "") {
      payload[f.key] = f.type === "number" ? parseNumber(trimmed) : trimmed;
    }
    setEditing(null);
    void onInlineSave?.(payload);
  }

  function startEdit(r: RecordRow, f: FieldDef) {
    setEditing({ id: r.id, key: f.key });
    const v = r[f.key];
    setDraft(v == null ? "" : String(v));
  }

  function renderEditor(r: RecordRow, f: FieldDef) {
    if (f.type === "select") {
      return (
        <select
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => commit(r, f)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit(r, f);
            if (e.key === "Escape") setEditing(null);
          }}
          className="field"
        >
          <option value="">—</option>
          {(f.options || []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    }
    return (
      <input
        autoFocus
        type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => commit(r, f)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit(r, f);
          if (e.key === "Escape") setEditing(null);
        }}
        className={`field ${f.type === "number" ? "font-mono tabular" : ""}`}
      />
    );
  }

  function display(f: FieldDef, r: RecordRow): ReactNode {
    const v = r[f.key];
    if (v == null || v === "") return "—";
    if (f.type === "date") return formatDate(String(v));
    if (f.key === "cost" && f.type === "number") return formatPKR(parseNumber(v));
    if (f.type === "password") {
      const shown = revealed.has(r.id);
      return (
        <span className="inline-flex items-center gap-1.5">
          <span>{shown ? String(v) : "••••••••"}</span>
          <button
            type="button"
            onClick={() => toggleReveal(r.id)}
            className="rounded p-0.5 text-muted transition hover:text-ink"
            aria-label={shown ? "Hide password" : "Show password"}
          >
            {shown ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <path d="M1 1l22 22" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </span>
      );
    }
    if (f.key === "url") {
      const raw = String(v);
      const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-info hover:underline"
        >
          {raw}
        </a>
      );
    }
    if (f.type === "select" && f.palette) {
      return <Pill label={String(v)} color={f.palette[String(v)] || "var(--muted)"} />;
    }
    return String(v);
  }

  function cell(f: FieldDef, r: RecordRow): ReactNode {
    const isEditable = canEditInline && !!editableKeys?.has(f.key);
    const isEditing = editing?.id === r.id && editing.key === f.key;
    if (isEditing) return renderEditor(r, f);
    if (isEditable) {
      const empty = r[f.key] == null || r[f.key] === "";
      return (
        <button
          type="button"
          onClick={() => startEdit(r, f)}
          title="Click to edit"
          className={`-mx-1 flex min-h-[24px] items-center gap-1 rounded px-1 text-left transition hover:bg-primary-tint ${
            empty ? "text-primary" : ""
          }`}
        >
          {empty ? "＋ Add" : display(f, r)}
        </button>
      );
    }
    return display(f, r);
  }

  const actions = (r: RecordRow) => (
    <>
      <button
        type="button"
        onClick={() => onEdit(r)}
        className="icon-btn"
        aria-label="Edit record"
        title="Edit"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => onDelete(r.id)}
        className="icon-btn hover:!text-brand"
        aria-label="Delete record"
        title="Delete"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
    </>
  );

  return (
    <div className="card">
      {filterNotice && (
        <div className="border-b border-line px-4 py-3">{filterNotice}</div>
      )}

      {/* Desktop / tablet: table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-2 text-[10px] font-extrabold uppercase tracking-wider text-muted">
              {fields.map((f) => (
                <th key={f.key} scope="col" className="px-4 py-3">
                  {f.label}
                </th>
              ))}
              {!readOnly && (
                <th scope="col" className="px-4 py-3 text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr
                key={r.id}
                className="border-b border-line last:border-0 hover:bg-surface-2"
              >
                {fields.map((f) => (
                  <td
                    key={f.key}
                    className={`px-4 py-3 text-ink-2 ${
                      monoKeys.has(f.key) ? "font-mono tabular" : ""
                    }`}
                  >
                    {cell(f, r)}
                  </td>
                ))}
                {!readOnly && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">{actions(r)}</div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: card list */}
      <ul className="divide-y divide-[var(--line)] md:hidden">
        {records.map((r) => {
          const titleField = fields[0];
          return (
            <li key={r.id} className="p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div
                  className={`font-semibold text-ink ${
                    titleField && monoKeys.has(titleField.key) ? "font-mono tabular" : ""
                  }`}
                >
                  {titleField ? cell(titleField, r) : "—"}
                </div>
                {!readOnly && <div className="flex shrink-0 gap-1">{actions(r)}</div>}
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                {fields.slice(1).map((f) => (
                  <div key={f.key} className="contents">
                    <dt className="text-[10px] font-extrabold uppercase tracking-wider text-muted">
                      {f.label}
                    </dt>
                    <dd
                      className={`text-ink-2 ${
                        monoKeys.has(f.key) ? "font-mono tabular" : ""
                      }`}
                    >
                      {cell(f, r)}
                    </dd>
                  </div>
                ))}
              </dl>
            </li>
          );
        })}
      </ul>

      {records.length === 0 && total > 0 && (
        <p className="p-6 text-center text-sm text-muted">
          No records match the current filters.
        </p>
      )}
    </div>
  );
}
