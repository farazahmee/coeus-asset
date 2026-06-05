"use client";

import { BUILTIN_IDS } from "@/lib/fields";
import type { Sheet } from "@/lib/types";
import { SheetIcon } from "./icons";

export function Sidebar({
  sheets,
  activeId,
  onSelect,
  onDelete,
  onNew,
}: {
  sheets: Sheet[];
  activeId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <aside className="flex w-full shrink-0 flex-col bg-[#1b1e23] md:w-[248px] md:min-h-[calc(100vh-57px)]">
      <div className="hidden flex-col md:flex md:flex-1">
        <p className="px-4 pt-4 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-white/40">
          Sheets
        </p>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
          {sheets.map((s) => {
            const active = s.id === activeId;
            const builtin = BUILTIN_IDS.has(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelect(s.id)}
                className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/75 hover:bg-white/5 hover:text-white"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r bg-[#C8102E]" />
                )}
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: s.color || "#737B86" }}
                >
                  <SheetIcon name={s.icon ?? undefined} size={18} />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                  {s.name}
                </span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] tabular-nums text-white/80">
                  {s.cnt ?? 0}
                </span>
                {!builtin && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(s.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.stopPropagation();
                        onDelete(s.id);
                      }
                    }}
                    className="hidden rounded p-1 text-white/40 hover:bg-white/10 hover:text-white group-hover:block"
                    title="Delete sheet"
                  >
                    ×
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="p-3">
          <button
            type="button"
            onClick={onNew}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/25 py-2.5 text-sm font-semibold text-white/70 transition hover:border-white/40 hover:text-white"
          >
            + New sheet
          </button>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto p-2 md:hidden">
        {sheets.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold ${
              s.id === activeId
                ? "bg-[#C8102E] text-white"
                : "bg-white/10 text-white/80"
            }`}
          >
            {s.name} ({s.cnt ?? 0})
          </button>
        ))}
        <button
          type="button"
          onClick={onNew}
          className="shrink-0 rounded-lg border border-dashed border-white/30 px-3 py-2 text-sm text-white/70"
        >
          +
        </button>
      </div>
    </aside>
  );
}
