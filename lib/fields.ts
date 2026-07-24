import type { CustomField, Sheet, SheetType } from "./types";

export const BUILTIN_IDS = new Set(["hardware", "employees", "subscriptions"]);

// Built-in sheets have a fixed, code-defined field schema: their fields cannot
// be edited and the sheet itself cannot be deleted.
export const READONLY_SHEET_IDS = BUILTIN_IDS;

export const HARDWARE_CATEGORIES = [
  "Laptop",
  "Desktop",
  "Monitor",
  "Mobile",
  "Tablet",
  "Peripheral",
  "Other",
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Laptop: "#C8102E",
  Desktop: "#2D6CDF",
  Monitor: "#1FA37A",
  Mobile: "#7A4FE0",
  Tablet: "#0EA5B5",
  Peripheral: "#E08A00",
  Other: "#737B86",
};

export const EMPLOYEE_STATUSES = [
  "Active",
  "Remote",
  "Contractor",
  "On Leave",
  "Resigned",
] as const;

export const STATUS_COLORS: Record<string, string> = {
  Active: "#1FA37A",
  Remote: "#2D6CDF",
  Contractor: "#E08A00",
  "On Leave": "#7A4FE0",
  Resigned: "#737B86",
};

export const BILLING_CYCLES = ["Monthly", "Annual"] as const;

export const BILLING_CYCLE_COLORS: Record<string, string> = {
  Monthly: "#2D6CDF",
  Annual: "#7A4FE0",
};

export const AUTO_RENEW_OPTIONS = ["Yes", "No"] as const;

export const AUTO_RENEW_COLORS: Record<string, string> = {
  Yes: "#1FA37A",
  No: "#737B86",
};

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "password";
  required?: boolean;
  options?: string[];
  palette?: Record<string, string>;
}

const hardwareFields: FieldDef[] = [
  { key: "assetTag", label: "Asset Tag", type: "text", required: true },
  {
    key: "category",
    label: "Category",
    type: "select",
    required: true,
    options: [...HARDWARE_CATEGORIES],
    palette: CATEGORY_COLORS,
  },
  { key: "model", label: "Model", type: "text", required: true },
  { key: "cpu", label: "CPU", type: "text" },
  { key: "ram", label: "RAM", type: "text" },
  { key: "storage", label: "Storage", type: "text" },
  { key: "display", label: "Display", type: "text" },
  { key: "os", label: "OS", type: "text" },
  { key: "serialNumber", label: "Serial Number", type: "text" },
  { key: "purchaseDate", label: "Purchase Date", type: "date" },
  { key: "cost", label: "Cost (PKR)", type: "number" },
  { key: "assignedTo", label: "Assigned To", type: "text" },
];

const employeeFields: FieldDef[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "designation", label: "Designation", type: "text" },
  { key: "team", label: "Team", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "machineId", label: "Machine ID", type: "text" },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [...EMPLOYEE_STATUSES],
    palette: STATUS_COLORS,
  },
  { key: "joiningDate", label: "Joining Date", type: "date" },
];

const subscriptionFields: FieldDef[] = [
  { key: "softwareName", label: "Software", type: "text", required: true },
  { key: "url", label: "URL", type: "text" },
  { key: "usernameEmail", label: "Username / Email", type: "text" },
  { key: "password", label: "Password", type: "password" },
  {
    key: "billingCycle",
    label: "Billing",
    type: "select",
    options: [...BILLING_CYCLES],
    palette: BILLING_CYCLE_COLORS,
  },
  { key: "purchaseDate", label: "Purchase Date", type: "date" },
  {
    key: "autoRenew",
    label: "Auto-Renew",
    type: "select",
    options: [...AUTO_RENEW_OPTIONS],
    palette: AUTO_RENEW_COLORS,
  },
];

export function effectiveSheetType(sheet: Sheet): SheetType {
  if (sheet.type === "hardware" || sheet.id === "hardware") return "hardware";
  if (sheet.type === "employees" || sheet.id === "employees") return "employees";
  if (sheet.type === "subscriptions" || sheet.id === "subscriptions")
    return "subscriptions";
  return "custom";
}

export function getFieldsForSheet(sheet: Sheet): FieldDef[] {
  const t = effectiveSheetType(sheet);
  if (t === "hardware") return hardwareFields;
  if (t === "employees") return employeeFields;
  if (t === "subscriptions") return subscriptionFields;
  return (sheet.fields || []).map((f) => ({
    key: f.key,
    label: f.label,
    type: f.type,
    options: f.options,
  }));
}

export function labelFromKey(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export function addButtonLabel(sheet: Sheet): string {
  const t = effectiveSheetType(sheet);
  if (t === "hardware") return "Add Asset";
  if (t === "employees") return "Add Person";
  if (t === "subscriptions") return "Add Subscription";
  return "Add Item";
}

export function sheetSubtitle(sheet: Sheet): string {
  const t = effectiveSheetType(sheet);
  if (t === "hardware") return "IT hardware inventory and spend tracking";
  if (t === "employees") return "People, teams, and machine assignments";
  if (t === "subscriptions")
    return "Software subscriptions, logins, and billing";
  return "Custom register for this sheet";
}

export function resolveNewSheetType(
  type: string,
  fields: CustomField[]
): { type: SheetType; fields: CustomField[] } {
  if (type === "assets") return { type: "hardware", fields: [] };
  if (type === "people") return { type: "employees", fields: [] };
  return { type: "custom", fields };
}
