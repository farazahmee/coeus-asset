"use client";

import Image from "next/image";
import { useState } from "react";

export function Header({
  saving,
  onExport,
}: {
  saving: boolean;
  onExport: () => void;
}) {
  const [imgOk, setImgOk] = useState(true);

  return (
    <header className="sticky top-0 z-30 border-b-[3px] border-[#C8102E] bg-gradient-to-r from-[#16181D] to-[#1f2228] px-4 py-3 md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
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
              <span className="px-1 text-xs font-extrabold text-[#C8102E]">COEUS</span>
            )}
          </div>
          <div className="hidden h-8 w-px bg-white/20 sm:block" />
          <div className="min-w-0">
            <h1 className="truncate text-base font-extrabold text-white md:text-lg">
              Asset Workspace
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">
              Coeus Solutions
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
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
          <button type="button" onClick={onExport} className="btn-ghost">
            Export CSV
          </button>
        </div>
      </div>
    </header>
  );
}
