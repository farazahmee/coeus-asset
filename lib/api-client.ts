// All requests are gated by HTTP Basic Auth in proxy.ts; the browser attaches
// the Authorization header automatically once the user has authenticated, so
// no application-level key is needed here.
function headers(): HeadersInit {
  return { "Content-Type": "application/json" };
}

export async function fetchSheets() {
  const res = await fetch("/api/sheets");
  if (!res.ok) throw new Error((await res.json()).error || "Failed to load sheets");
  return res.json();
}

export async function createSheet(body: unknown) {
  const res = await fetch("/api/sheets", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to create sheet");
  return res.json();
}

export async function deleteSheet(id: string) {
  const res = await fetch(`/api/sheets?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to delete sheet");
  return res.json();
}

export async function fetchRecords(sheetId: string) {
  const res = await fetch(`/api/records?sheet_id=${encodeURIComponent(sheetId)}`);
  if (!res.ok) throw new Error((await res.json()).error || "Failed to load records");
  return res.json();
}

export async function saveRecord(sheetId: string, record: Record<string, unknown>) {
  const res = await fetch("/api/records", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ sheet_id: sheetId, record }),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to save record");
  return res.json();
}

export async function deleteRecord(id: string) {
  const res = await fetch(`/api/records?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to delete record");
  return res.json();
}

export async function clearRecords(sheetId: string) {
  const res = await fetch("/api/records/clear", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ sheet_id: sheetId }),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to clear sheet");
  return res.json();
}
