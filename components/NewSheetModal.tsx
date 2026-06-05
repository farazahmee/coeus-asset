"use client";

import { ICON_OPTIONS, SheetIcon } from "./icons";
import { labelFromKey } from "@/lib/fields";
import type { CustomField, FieldType } from "@/lib/types";
import { useState } from "react";

const COLORS = [
  "#C8102E",
  "#97091F",
  "#2D6CDF",
  "#1FA37A",
  "#7A4FE0",
  "#0EA5B5",
  "#E08A00",
  "#737B86",
];

type SheetTemplate = "custom" | "assets" | "people";

export function NewSheetModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: {
    name: string;
    color: string;
    icon: string;
    type: string;
    fields: CustomField[];
  }) => void;
}) {
  const [name, setName] = useState("");
  const [template, setTemplate] = useState<SheetTemplate>("custom");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState<string>("folder");
  const [fieldRows, setFieldRows] = useState<{ label: string; type: FieldType }[]>([
    { label: "Name", type: "text" },
  ]);

  if (!open) return null;

  const addField = () =>
    setFieldRows((r) => [...r, { label: "", type: "text" }]);
  const removeField = (i: number) =>
    setFieldRows((r) => r.filter((_, idx) => idx !== i));

  const submit = () => {
    if (!name.trim()) return;
    let type = "custom";
    let fields: CustomField[] = [];
    if (template === "assets") type = "hardware";
    else if (template === "people") type = "employees";
    else {
      fields = fieldRows
        .filter((r) => r.label.trim())
        .map((r) => ({
          key: labelFromKey(r.label),
          label: r.label.trim(),
          type: r.type,
          ...(r.type === "select"
            ? { options: ["Option A", "Option B", "Other"] }
            : {}),
        }));
    }
    onCreate({ name: name.trim(), color, icon, type, fields });
    setName("");
    setTemplate("custom");
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-[#16181D]/50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(520px,94vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[14px] border border-[#E6E9ED] bg-white p-6 shadow-2xl">
        <h2 className="mb-4 text-lg font-bold text-[#16181D]">New sheet</h2>
        <label className="mb-4 block">
          <span className="mb-1 block text-xs font-bold text-[#3A4049]">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-[#E6E9ED] px-3 py-2 text-sm"
            placeholder="e.g. Software Licenses"
          />
        </label>
        <p className="mb-2 text-xs font-bold text-[#3A4049]">Type</p>
        <div className="mb-4 grid grid-cols-3 gap-2">
          {(
            [
              ["custom", "Custom", "Define your own columns"],
              ["assets", "Assets", "Same as Hardware"],
              ["people", "People", "Same as Employees"],
            ] as const
          ).map(([id, title, sub]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTemplate(id)}
              className={`rounded-lg border p-3 text-left text-xs transition ${
                template === id
                  ? "border-[#C8102E] bg-red-50 ring-1 ring-[#C8102E]"
                  : "border-[#E6E9ED] hover:border-[#737B86]"
              }`}
            >
              <span className="block font-bold text-[#16181D]">{title}</span>
              <span className="text-[#737B86]">{sub}</span>
            </button>
          ))}
        </div>
        <p className="mb-2 text-xs font-bold text-[#3A4049]">Color</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-8 w-8 rounded-full border-2 ${
                color === c ? "border-[#16181D] scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <p className="mb-2 text-xs font-bold text-[#3A4049]">Icon</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {ICON_OPTIONS.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => setIcon(ic)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
                icon === ic ? "border-[#C8102E] bg-red-50" : "border-[#E6E9ED]"
              }`}
            >
              <SheetIcon name={ic} size={18} />
            </button>
          ))}
        </div>
        {template === "custom" && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-bold text-[#3A4049]">Fields</p>
            <div className="space-y-2">
              {fieldRows.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={row.label}
                    onChange={(e) => {
                      const next = [...fieldRows];
                      next[i] = { ...next[i], label: e.target.value };
                      setFieldRows(next);
                    }}
                    placeholder="Field name"
                    className="flex-1 rounded-lg border border-[#E6E9ED] px-3 py-2 text-sm"
                  />
                  <select
                    value={row.type}
                    onChange={(e) => {
                      const next = [...fieldRows];
                      next[i] = {
                        ...next[i],
                        type: e.target.value as FieldType,
                      };
                      setFieldRows(next);
                    }}
                    className="rounded-lg border border-[#E6E9ED] px-2 py-2 text-sm"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="select">Select</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeField(i)}
                    className="rounded px-2 text-[#737B86] hover:text-[#C8102E]"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addField}
              className="mt-2 text-sm font-semibold text-[#2D6CDF]"
            >
              + Add field
            </button>
          </div>
        )}
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="button" onClick={submit} className="btn-primary flex-1" disabled={!name.trim()}>
            Create
          </button>
        </div>
      </div>
    </>
  );
}
