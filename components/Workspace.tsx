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
  ASSIGNED_LAPTOPS_ID,
  addButtonLabel,
  buildAssignedLaptopsSheet,
  effectiveSheetType,
  getFieldsForSheet,
  isAssignedLaptop,
  sheetSubtitle,
} from "@/lib/fields";
import { applyFilters, EMPTY_FILTER, type FilterState } from "@/lib/filter";
import type { RecordRow, Sheet, ViewMode } from "@/lib/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DashboardCustom } from "./DashboardCustom";
import { FilterBar } from "./FilterBar";
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
  const [hardwareRecords, setHardwareRecords] = useState<RecordRow[]>([]);
  const [view, setView] = useState<ViewMode>("dashboard");
  const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<RecordRow | null>(null);
  const [newSheetOpen, setNewSheetOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  // Derived "Assigned Laptops" view, computed from the Hardware sheet.
  const assignedLaptops = useMemo(
    () => hardwareRecords.filter((r) => isAssignedLaptop(r)),
    [hardwareRecords]
  );

  // Server sheets + the injected virtual sheet, in display order.
  const allSheets = useMemo<Sheet[]>(() => {
    const virtual = buildAssignedLaptopsSheet(assignedLaptops.length);
    return [...sheets, virtual].sort((a, b) => a.sort - b.sort);
  }, [sheets, assignedLaptops.length]);

  const activeSheet =
    allSheets.find((s) => s.id === activeId) ?? allSheets[0];
  const isVirtual = activeSheet?.id === ASSIGNED_LAPTOPS_ID;
  const isHardwareSheet = activeSheet?.id === "hardware";
  const fields = activeSheet ? getFieldsForSheet(activeSheet) : [];

  // Which records back the active view.
  const displayRecords = isVirtual
    ? assignedLaptops
    : isHardwareSheet
    ? hardwareRecords
    : records;

  const filtered = useMemo(
    () => applyFilters(displayRecords, fields, filter),
    [displayRecords, fields, filter]
  );

  const flashSaving = useCallback(() => {
    setSaving(true);
    const t = setTimeout(() => setSaving(false), 600);
    return () => clearTimeout(t);
  }, []);

  const loadSheets = useCallback(async () => {
    const data = await fetchSheets();
    setSheets(data);
  }, []);

  const loadHardware = useCallback(async () => {
    const data = await fetchRecords("hardware");
    setHardwareRecords(data);
  }, []);

  const loadRecords = useCallback(async (sheetId: string) => {
    const data = await fetchRecords(sheetId);
    setRecords(data);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await Promise.all([loadSheets(), loadHardware()]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [loadSheets, loadHardware]);

  // Load records for the active sheet (hardware + virtual reuse hardwareRecords).
  useEffect(() => {
    if (!activeId) return;
    setFilter(EMPTY_FILTER);
    if (activeId === "hardware" || activeId === ASSIGNED_LAPTOPS_ID) {
      loadHardware().catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load records")
      );
      return;
    }
    loadRecords(activeId).catch((e) =>
      setError(e instanceof Error ? e.message : "Failed to load records")
    );
  }, [activeId, loadRecords, loadHardware]);

  const handleSave = async (data: Record<string, string | number>) => {
    if (!activeSheet || isVirtual) return;
    flashSaving();
    const saved = await saveRecord(activeSheet.id, data);
    const upsert = (prev: RecordRow[]) => {
      const idx = prev.findIndex((r) => r.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    };
    if (isHardwareSheet) setHardwareRecords(upsert);
    else setRecords(upsert);
    await loadSheets();
    setDrawerOpen(false);
    showToast(editRecord ? "Saved" : "Added");
    setEditRecord(null);
  };

  const handleDeleteRecord = async (id: string) => {
    if (isVirtual) return;
    if (!confirm("Delete this record?")) return;
    flashSaving();
    await deleteRecord(id);
    if (isHardwareSheet)
      setHardwareRecords((prev) => prev.filter((r) => r.id !== id));
    else setRecords((prev) => prev.filter((r) => r.id !== id));
    await loadSheets();
    showToast("Deleted");
  };

  const handleClear = async () => {
    if (!activeSheet || isVirtual) return;
    if (!confirm(`Clear all records in "${activeSheet.name}"?`)) return;
    flashSaving();
    await clearRecords(activeSheet.id);
    if (isHardwareSheet) setHardwareRecords([]);
    else setRecords([]);
    await loadSheets();
    showToast("Cleared");
  };

  const handleDeleteSheet = async (id: string) => {
    const s = allSheets.find((x) => x.id === id);
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

  const showFilters = view === "register";

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F4F6]">
      <Header
        saving={saving}
        onExport={() => {
          if (!activeSheet) return;
          // Export exactly what is on screen — i.e. the filtered set.
          exportCsv(
            `${activeSheet.name.replace(/\s+/g, "_")}.csv`,
            fields,
            view === "register" ? filtered : displayRecords
          );
        }}
      />
      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar
          sheets={allSheets}
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
                      {isVirtual
                        ? "Laptops currently assigned to a person (auto-generated from Hardware)"
                        : sheetSubtitle(activeSheet)}
                    </p>
                  </div>
                </div>
                {!isVirtual && (
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
                )}
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
                {view === "register" && !isVirtual && displayRecords.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-sm font-semibold text-[#737B86] hover:text-[#C8102E]"
                  >
                    Clear sheet
                  </button>
                )}
              </div>

              {showFilters && (
                <FilterBar
                  fields={fields}
                  records={displayRecords}
                  state={filter}
                  onChange={setFilter}
                  showPlatform={effectiveSheetType(activeSheet) === "hardware"}
                  showAssignment={isHardwareSheet}
                />
              )}

              {view === "dashboard" ? (
                <div className="space-y-6">
                  <DashboardCustom sheet={activeSheet} records={displayRecords} />
                  <div>
                    <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-[#737B86]">
                      All {activeSheet.name} — full details
                    </h3>
                    <RegisterTable
                      fields={fields}
                      records={displayRecords}
                      readOnly={isVirtual}
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
                  </div>
                </div>
              ) : (
                <RegisterTable
                  fields={fields}
                  records={filtered}
                  totalRecords={displayRecords.length}
                  readOnly={isVirtual}
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
      {toast && (
        <div className="fixed bottom-5 right-5 z-[100] flex animate-slide-in items-center gap-2 rounded-xl bg-[#16181D] px-4 py-3 text-sm font-semibold text-white shadow-lg">
          <span className="inline-block h-2 w-2 rounded-full bg-[#3ECF8E]" />
          {toast}
        </div>
      )}
    </div>
  );
}
