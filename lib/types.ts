export type SheetType = "hardware" | "employees" | "subscriptions" | "custom";

export type FieldType = "text" | "number" | "date" | "select" | "password";

export interface CustomField {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
}

export interface Sheet {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  type: SheetType;
  fields: CustomField[];
  sort: number;
  created_at?: string;
  cnt?: number;
}

export interface RecordRow {
  id: string;
  [key: string]: string | number | undefined;
}

export type ViewMode = "dashboard" | "register";
