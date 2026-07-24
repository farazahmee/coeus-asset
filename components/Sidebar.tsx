"use client";

import { READONLY_SHEET_IDS } from "@/lib/fields";
import type { Sheet } from "@/lib/types";
import { SheetIcon } from "./icons";

export function Sidebar({
  sheets,
  activeId,
  onSelect,
  onDelete,
  onNew,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: {
  sheets: Sheet[];
  activeId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const select = (id: string) => {
    onSelect(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden
        />
      )}

      <aside
        aria-label="Sheets"
        className={`fixed left-0 top-0 z-50 flex h-full flex-col bg-[var(--sidebar-bg)] text-[var(--sidebar-fg)] transition-[transform,width] duration-200 ease-out lg:sticky lg:top-[57px] lg:z-auto lg:h-[calc(100dvh-57px)] lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } w-[260px] ${collapsed ? "lg:w-[72px]" : "lg:w-[248px]"}`}
      >
        <div className="flex items-center justify-between px-3 pb-2 pt-4">
          {!collapsed && (
            <p className="px-1 text-[10px] font-extrabold uppercase tracking-widest text-[var(--sidebar-muted)]">
              Sheets
            </p>
          )}
          <div className="flex items-center gap-1">
            {/* Desktop collapse toggle */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden rounded-md p-1.5 text-[var(--sidebar-muted)] transition hover:bg-white/10 hover:text-white lg:inline-flex"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand" : "Collapse"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                {collapsed ? (
                  <path d="M9 18l6-6-6-6" />
                ) : (
                  <path d="M15 18l-6-6 6-6" />
                )}
              </svg>
            </button>
            {/* Mobile close */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="rounded-md p-1.5 text-[var(--sidebar-muted)] transition hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Close menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-2" aria-label="Sheet list">
          {sheets.map((s) => {
            const active = s.id === activeId;
            const builtin = READONLY_SHEET_IDS.has(s.id);
            return (
              <div key={s.id} className="group relative">
                <button
                  type="button"
                  onClick={() => select(s.id)}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? s.name : undefined}
                  className={`flex w-full items-center gap-3 rounded-lg py-2.5 text-left transition ${
                    collapsed ? "justify-center px-2" : "px-3"
                  } ${
                    active
                      ? "bg-[var(--sidebar-active)] text-white"
                      : "text-[var(--sidebar-fg)]/85 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {active && (
                    <span
                      className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r"
                      style={{ backgroundColor: s.color || "var(--primary)" }}
                      aria-hidden
                    />
                  )}
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: s.color || "#737B86" }}
                  >
                    <SheetIcon name={s.icon ?? undefined} size={18} />
                  </span>
                  {!collapsed && (
                    <>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                        {s.name}
                      </span>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] tabular text-white/80">
                        {s.cnt ?? 0}
                      </span>
                    </>
                  )}
                </button>
                {!builtin && !collapsed && (
                  <button
                    type="button"
                    onClick={() => onDelete(s.id)}
                    className="absolute right-1.5 top-1/2 hidden -translate-y-1/2 rounded p-1 text-white/40 transition hover:bg-white/10 hover:text-white focus-visible:block group-hover:block"
                    aria-label={`Delete sheet ${s.name}`}
                    title="Delete sheet"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-3">
          <button
            type="button"
            onClick={onNew}
            className={`flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/25 py-2.5 text-sm font-semibold text-[var(--sidebar-fg)]/70 transition hover:border-white/40 hover:text-white ${
              collapsed ? "px-0" : ""
            }`}
            aria-label="Create new sheet"
            title={collapsed ? "New sheet" : undefined}
          >
            <span className="text-lg leading-none">+</span>
            {!collapsed && <span>New sheet</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
