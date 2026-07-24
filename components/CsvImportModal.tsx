"use client";

import type { FieldDef } from "@/lib/fields";
import type { RecordRow } from "@/lib/types";
import { formatPKR, parseNumber } from "@/lib/format";
import {
  guessColumnMapping,
  normalizeHeader,
  parseCsv,
  type ParsedCsv,
} from "@/lib/csv";
import { useMemo, useRef, useState } from "react";

type Step = "upload" | "map" | "preview";

interface FieldChange {
  key: string;
  label: string;
  oldDisplay: string;
  newDisplay: string;
}

interface RowResult {
  status: "update" | "nochange" | "unmatched";
  matchValue: string;
  matched?: RecordRow;
  changes: FieldChange[];
  payload?: Record<string, string | number>;
}

export function CsvImportModal({
  open,
  onClose,
  fields,
  records,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  fields: FieldDef[];
  records: RecordRow[];
  onApply: (updates: Record<string, string | number>[]) => Promise<void>;
}) {
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [mapping, setMapping] = useState<Record<string, number>>({});
  const [matchKey, setMatchKey] = useState("assetTag");
  const [applying, setApplying] = useState(false);
  const [parseError, setParseError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Only fields present in this sheet can be import targets. Match candidates
  // are the identity fields the spec calls out.
  const matchCandidates = fields.filter(
    (f) => f.key === "assetTag" || f.key === "serialNumber"
  );

  function reset() {
    setStep("upload");
    setFileName("");
    setParsed(null);
    setMapping({});
    setMatchKey("assetTag");
    setParseError("");
    setApplying(false);
  }

  function close() {
    reset();
    onClose();
  }

  async function handleFile(file: File) {
    setParseError("");
    try {
      const text = await file.text();
      const p = parseCsv(text);
      if (p.headers.length === 0 || p.rows.length === 0) {
        setParseError("That file has no data rows.");
        return;
      }
      setFileName(file.name);
      setParsed(p);
      const guessed = guessColumnMapping(p.headers, fields);
      setMapping(guessed);
      // Default the match key to whichever identity column was detected.
      if (guessed["assetTag"] >= 0) setMatchKey("assetTag");
      else if (guessed["serialNumber"] >= 0) setMatchKey("serialNumber");
      setStep("map");
    } catch {
      setParseError("Could not read that file.");
    }
  }

  // Build an index of existing records by the normalized match value.
  const results = useMemo<RowResult[]>(() => {
    if (!parsed) return [];
    const matchCol = mapping[matchKey];
    const index = new Map<string, RecordRow>();
    if (matchCol != null && matchCol >= 0) {
      for (const r of records) {
        const key = normalizeHeader(String(r[matchKey] ?? ""));
        if (key) index.set(key, r);
      }
    }
    const mappedFields = fields.filter(
      (f) => mapping[f.key] != null && mapping[f.key] >= 0
    );

    return parsed.rows.map<RowResult>((row) => {
      const rawMatch = matchCol >= 0 ? (row[matchCol] ?? "").trim() : "";
      const matched = rawMatch ? index.get(normalizeHeader(rawMatch)) : undefined;
      if (!matched) {
        return { status: "unmatched", matchValue: rawMatch, changes: [] };
      }

      const changes: FieldChange[] = [];
      const payload: Record<string, string | number> = { id: matched.id };
      // Preserve existing non-empty field values.
      for (const f of fields) {
        const v = matched[f.key];
        if (v != null && v !== "") {
          payload[f.key] = f.type === "number" ? parseNumber(v) : String(v);
        }
      }
      // Apply mapped, non-empty CSV values as overrides.
      for (const f of mappedFields) {
        if (f.key === matchKey) continue;
        const raw = (row[mapping[f.key]] ?? "").trim();
        if (raw === "") continue;
        const newVal = f.type === "number" ? parseNumber(raw) : raw;
        const oldRaw = matched[f.key];
        const oldNorm =
          oldRaw == null
            ? ""
            : f.type === "number"
              ? String(parseNumber(oldRaw))
              : String(oldRaw).trim();
        const newNorm = f.type === "number" ? String(newVal) : String(newVal).trim();
        if (oldNorm === newNorm) continue;
        payload[f.key] = newVal;
        changes.push({
          key: f.key,
          label: f.label,
          oldDisplay: displayVal(f, oldRaw),
          newDisplay: displayVal(f, newVal),
        });
      }

      if (changes.length === 0) {
        return { status: "nochange", matchValue: rawMatch, matched, changes: [] };
      }
      return { status: "update", matchValue: rawMatch, matched, changes, payload };
    });
  }, [parsed, mapping, matchKey, fields, records]);

  const updates = results.filter((r) => r.status === "update");
  const unmatched = results.filter((r) => r.status === "unmatched");
  const nochange = results.filter((r) => r.status === "nochange");

  async function confirm() {
    setApplying(true);
    try {
      await onApply(updates.map((u) => u.payload!));
      close();
    } finally {
      setApplying(false);
    }
  }

  if (!open) return null;

  const matchColMissing = mapping[matchKey] == null || mapping[matchKey] < 0;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
        onClick={close}
        aria-hidden
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="flex max-h-[88vh] w-full max-w-3xl flex-col rounded-[var(--radius-lg)] bg-surface shadow-2xl animate-rise">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-ink">Import from CSV</h2>
              <p className="text-xs text-muted">
                Match rows to existing assets and update them — no duplicates.
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              className="rounded p-2 text-muted hover:bg-surface-2"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            {step === "upload" && (
              <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-muted">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <path d="M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-ink">Choose a CSV file</p>
                  <p className="text-sm text-muted">
                    First row must be column headers.
                  </p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => fileRef.current?.click()}
                >
                  Select CSV
                </button>
                {parseError && (
                  <p className="text-sm font-semibold text-danger">{parseError}</p>
                )}
              </div>
            )}

            {step === "map" && parsed && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-ink-2">
                    <span className="font-semibold">{fileName}</span> —{" "}
                    {parsed.rows.length} rows, {parsed.headers.length} columns
                  </p>
                  <button
                    type="button"
                    className="text-xs font-semibold text-muted transition hover:text-brand"
                    onClick={reset}
                  >
                    Choose different file
                  </button>
                </div>

                <div className="rounded-lg border border-line p-4">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted">
                    Match existing assets by
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {matchCandidates.map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setMatchKey(f.key)}
                        className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${
                          matchKey === f.key
                            ? "border-primary bg-primary-tint text-primary"
                            : "border-line text-ink-2"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  {matchColMissing && (
                    <p className="mt-2 text-xs font-semibold text-danger">
                      Map a CSV column to “{fieldLabel(fields, matchKey)}” below so
                      rows can be matched.
                    </p>
                  )}
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
                    Column mapping
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {fields.map((f) => (
                      <label
                        key={f.key}
                        className="flex items-center justify-between gap-2 rounded-lg border border-line px-3 py-2"
                      >
                        <span className="text-sm font-semibold text-ink-2">
                          {f.label}
                          {f.key === matchKey && (
                            <span className="ml-1 rounded bg-primary-tint px-1.5 py-0.5 text-[10px] font-bold text-primary">
                              MATCH
                            </span>
                          )}
                        </span>
                        <select
                          value={mapping[f.key] ?? -1}
                          onChange={(e) =>
                            setMapping((prev) => ({
                              ...prev,
                              [f.key]: Number(e.target.value),
                            }))
                          }
                          className="max-w-[55%] rounded border border-line bg-surface px-2 py-1 text-sm text-ink"
                        >
                          <option value={-1}>— skip —</option>
                          {parsed.headers.map((h, i) => (
                            <option key={i} value={i}>
                              {h || `Column ${i + 1}`}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === "preview" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <SummaryStat label="Will update" value={updates.length} tone="update" />
                  <SummaryStat label="No changes" value={nochange.length} tone="muted" />
                  <SummaryStat label="No match" value={unmatched.length} tone="muted" />
                </div>

                {updates.length === 0 ? (
                  <p className="rounded-lg bg-surface-2 px-4 py-6 text-center text-sm text-muted">
                    Nothing to update — no matched rows had changed values.
                  </p>
                ) : (
                  <div className="overflow-hidden rounded-lg border border-line">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-line bg-surface-2 text-[10px] font-extrabold uppercase tracking-wider text-muted">
                          <th className="px-3 py-2">Asset</th>
                          <th className="px-3 py-2">Changes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {updates.map((u, i) => (
                          <tr key={i} className="border-b border-line last:border-0 align-top">
                            <td className="px-3 py-2">
                              <span className="font-mono text-xs font-semibold text-ink">
                                {String(u.matched?.assetTag || u.matchValue)}
                              </span>
                              <div className="text-xs text-muted">
                                {String(u.matched?.model || "")}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <ul className="space-y-0.5">
                                {u.changes.map((c) => (
                                  <li key={c.key} className="text-xs">
                                    <span className="font-semibold text-ink-2">
                                      {c.label}:
                                    </span>{" "}
                                    <span className="text-muted line-through">
                                      {c.oldDisplay}
                                    </span>{" "}
                                    <span className="text-muted">→</span>{" "}
                                    <span className="font-semibold text-success">
                                      {c.newDisplay}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {unmatched.length > 0 && (
                  <p className="text-xs text-muted">
                    {unmatched.length} row{unmatched.length === 1 ? "" : "s"} had no
                    matching {fieldLabel(fields, matchKey)} and will be skipped (no
                    new rows are inserted).
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-line p-5">
            <div className="text-xs text-muted">
              {step === "preview" &&
                `${updates.length} update${updates.length === 1 ? "" : "s"} ready`}
            </div>
            <div className="flex gap-3">
              {step === "map" && (
                <>
                  <button type="button" onClick={close} className="btn-secondary">
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={matchColMissing}
                    onClick={() => setStep("preview")}
                  >
                    Preview changes
                  </button>
                </>
              )}
              {step === "preview" && (
                <>
                  <button
                    type="button"
                    onClick={() => setStep("map")}
                    className="btn-secondary"
                    disabled={applying}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={applying || updates.length === 0}
                    onClick={confirm}
                  >
                    {applying
                      ? "Applying…"
                      : `Apply ${updates.length} update${updates.length === 1 ? "" : "s"}`}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "update" | "muted";
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-3 text-center ${
        tone === "update"
          ? "border-line bg-success-tint"
          : "border-line bg-surface-2"
      }`}
    >
      <div
        className={`font-mono text-2xl font-semibold tabular-nums ${
          tone === "update" ? "text-success" : "text-ink"
        }`}
      >
        {value}
      </div>
      <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted">
        {label}
      </div>
    </div>
  );
}

function fieldLabel(fields: FieldDef[], key: string): string {
  return fields.find((f) => f.key === key)?.label ?? key;
}

function displayVal(f: FieldDef, raw: unknown): string {
  if (raw == null || raw === "") return "—";
  if (f.key === "cost" && f.type === "number") return formatPKR(parseNumber(raw));
  return String(raw);
}
