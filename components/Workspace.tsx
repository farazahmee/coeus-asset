"use client";

import {
  clearRecords,
  createSheet,
  deleteRecord,
  deleteSheet,
  fetchRecords,
  fetchSheets,
  saveRecord,
} from "@/lib/api-client";
import { exportCsv } from "@/lib/csv";
import {
  addButtonLabel,
  getFieldsForSheet,
  sheetSubtitle,
} from "@/lib/fields";
import type { RecordRow, Sheet, ViewMode } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";
import { DashboardCustom } from "./DashboardCustom";
import { Header } from "./Header";
import { NewSheetModal } from "./NewSheetModal";
import { RecordDrawer } from "./RecordDrawer";
import { RegisterTable } from "./RegisterTable";
import { SheetIcon } from "./icons";
import { Sidebar } from "./Sidebar";

export function Workspace() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [activeId, setActiveId] = useState("hardware");
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [view, setView] = useState<ViewMode>("dashboard");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<RecordRow | null>(null);
  const [newSheetOpen, setNewSheetOpen] = useState(false);

  const activeSheet = sheets.find((s) => s.id === activeId) ?? sheets[0];
  const fields = activeSheet ? getFieldsForSheet(activeSheet) : [];

  const flashSaving = useCallback(() => {
    setSaving(true);
    const t = setTimeout(() => setSaving(false), 600);
    return () => clearTimeout(t);
  }, []);

  const loadSheets = useCallback(async () => {
    const data = await fetchSheets();
    setSheets(data);
    if (data.length && !data.find((s: Sheet) => s.id === activeId)) {
      setActiveId(data[0].id);
    }
  }, [activeId]);

  const loadRecords = useCallback(async (sheetId: string) => {
    const data = await fetchRecords(sheetId);
    setRecords(data);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await loadSheets();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [loadSheets]);

  useEffect(() => {
    if (!activeId) return;
    loadRecords(activeId).catch((e) =>
      setError(e instanceof Error ? e.message : "Failed to load records")
    );
  }, [activeId, loadRecords]);

  const refresh = async () => {
    await loadSheets();
    if (activeId) await loadRecords(activeId);
  };

  const handleSave = async (data: Record<string, string | number>) => {
    if (!activeSheet) return;
    flashSaving();
    const saved = await saveRecord(activeSheet.id, data);
    setRecords((prev) => {
      const idx = prev.findIndex((r) => r.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    await loadSheets();
    setDrawerOpen(false);
    setEditRecord(null);
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    flashSaving();
    await deleteRecord(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
    await loadSheets();
  };

  const handleClear = async () => {
    if (!activeSheet) return;
    if (!confirm(`Clear all records in "${activeSheet.name}"?`)) return;
    flashSaving();
    await clearRecords(activeSheet.id);
    setRecords([]);
    await loadSheets();
  };

  const handleDeleteSheet = async (id: string) => {
    const s = sheets.find((x) => x.id === id);
    if (!s) return;
    if (!confirm(`Delete sheet "${s.name}" and all its records?`)) return;
    flashSaving();
    await deleteSheet(id);
    await loadSheets();
    if (activeId === id) setActiveId("hardware");
  };

  const handleCreateSheet = async (payload: {
    name: string;
    color: string;
    icon: string;
    type: string;
    fields: Sheet["fields"];
  }) => {
    flashSaving();
    const created = await createSheet(payload);
    await loadSheets();
    setActiveId(created.id);
    setRecords([]);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F4F6] text-[#737B86]">
        Loading workspace…
      </div>
    );
  }

  if (error && !sheets.length) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#F3F4F6] p-6 text-center">
        <p className="font-semibold text-[#C8102E]">{error}</p>
        <p className="max-w-md text-sm text-[#737B86]">
          Set <code className="font-mono">DATABASE_URL</code> in{" "}
          <code className="font-mono">.env.local</code> to your Neon connection string, then restart{" "}
          <code className="font-mono">npm run dev</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F4F6]">
      <Header
        saving={saving}
        onExport={() => {
          if (!activeSheet) return;
          exportCsv(
            `${activeSheet.name.replace(/\s+/g, "_")}.csv`,
            fields,
            records
          );
        }}
      />
      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar
          sheets={sheets}
          activeId={activeId}
          onSelect={setActiveId}
          onDelete={handleDeleteSheet}
          onNew={() => setNewSheetOpen(true)}
        />
        <main className="min-w-0 flex-1 p-4 md:p-6">
          {activeSheet && (
            <>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: activeSheet.color || "#737B86" }}
                  >
                    <SheetIcon name={activeSheet.icon ?? undefined} size={22} />
                  </span>
                  <div>
                    <h2 className="text-xl font-extrabold text-[#16181D]">
                      {activeSheet.name}
                    </h2>
                    <p className="text-sm text-[#737B86]">
                      {sheetSubtitle(activeSheet)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setEditRecord(null);
                    setDrawerOpen(true);
                  }}
                >
                  {addButtonLabel(activeSheet)}
                </button>
              </div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="segmented">
                  <button
                    type="button"
                    className={view === "dashboard" ? "active" : ""}
                    onClick={() => setView("dashboard")}
                  >
                    Dashboard
                  </button>
                  <button
                    type="button"
                    className={view === "register" ? "active" : ""}
                    onClick={() => setView("register")}
                  >
                    Register
                  </button>
                </div>
                {view === "register" && records.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-sm font-semibold text-[#737B86] hover:text-[#C8102E]"
                  >
                    Clear sheet
                  </button>
                )}
              </div>
              {view === "dashboard" ? (
                <DashboardCustom sheet={activeSheet} records={records} />
              ) : (
                <RegisterTable
                  fields={fields}
                  records={records}
                  addLabel={addButtonLabel(activeSheet)}
                  onAdd={() => {
                    setEditRecord(null);
                    setDrawerOpen(true);
                  }}
                  onEdit={(r) => {
                    setEditRecord(r);
                    setDrawerOpen(true);
                  }}
                  onDelete={handleDeleteRecord}
                />
              )}
            </>
          )}
        </main>
      </div>
      <RecordDrawer
        open={drawerOpen}
        fields={fields}
        record={editRecord}
        title={editRecord ? "Edit record" : addButtonLabel(activeSheet!)}
        onClose={() => {
          setDrawerOpen(false);
          setEditRecord(null);
        }}
        onSave={handleSave}
      />
      <NewSheetModal
        open={newSheetOpen}
        onClose={() => setNewSheetOpen(false)}
        onCreate={handleCreateSheet}
      />
    </div>
  );
}
