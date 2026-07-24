"use client";

import Image from "next/image";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

export function Header({
  saving,
  onExport,
  onMenuClick,
}: {
  saving: boolean;
  onExport: () => void;
  onMenuClick: () => void;
}) {
  const [imgOk, setImgOk] = useState(true);

  return (
    <header className="sticky top-0 z-30 border-b-2 border-brand bg-[var(--sidebar-bg)] px-4 py-3 md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="icon-btn -ml-1 text-white/80 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Open sheets menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <div className="flex shrink-0 items-center justify-center rounded-lg bg-white p-2 shadow-md">
            {imgOk ? (
              <Image
                src="/logo.png"
                alt="Coeus"
                width={36}
                height={36}
                className="h-9 w-auto object-contain"
                onError={() => setImgOk(false)}
              />
            ) : (
              <span className="px-1 text-xs font-extrabold text-brand">COEUS</span>
            )}
          </div>
          <div className="hidden h-8 w-px bg-white/20 sm:block" />
          <div className="min-w-0">
            <h1 className="font-display truncate text-base font-extrabold text-white md:text-lg">
              Asset Workspace
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">
              Coeus Solutions
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold sm:inline-flex ${
              saving
                ? "bg-amber-500/20 text-amber-200"
                : "bg-emerald-500/15 text-emerald-200"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                saving ? "animate-pulse bg-amber-400" : "bg-emerald-400"
              }`}
            />
            {saving ? "Saving…" : "Cloud synced"}
          </span>
          <ThemeToggle />
          <button type="button" onClick={onExport} className="btn-ghost">
            Export CSV
          </button>
        </div>
      </div>
    </header>
  );
}
