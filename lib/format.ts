export function formatPKR(value: number): string {
  if (!Number.isFinite(value)) return "Rs 0";
  return `Rs ${Math.round(value).toLocaleString("en-PK")}`;
}

export function abbreviatePKR(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "Rs 0";
  const abs = Math.abs(value);
  if (abs >= 1e7) {
    return `Rs ${(value / 1e7).toFixed(2)} Cr`;
  }
  if (abs >= 1e5) {
    return `Rs ${(value / 1e5).toFixed(2)} L`;
  }
  return formatPKR(value);
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function parseNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function purchaseYear(dateStr?: string): string {
  if (!dateStr) return "Unknown";
  const y = new Date(dateStr).getFullYear();
  return Number.isFinite(y) ? String(y) : "Unknown";
}
