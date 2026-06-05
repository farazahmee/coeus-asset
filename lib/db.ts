import { neon } from "@neondatabase/serverless";

let sql: ReturnType<typeof neon> | null = null;

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!sql) sql = neon(url);
  return sql;
}

let migrated = false;

export async function ensureSchema() {
  if (migrated) return;
  const db = getSql();

  await db`
    CREATE TABLE IF NOT EXISTS sheets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT,
      icon TEXT,
      type TEXT,
      fields JSONB DEFAULT '[]',
      sort INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  await db`
    CREATE TABLE IF NOT EXISTS records (
      id TEXT PRIMARY KEY,
      sheet_id TEXT NOT NULL,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  await db`
    CREATE INDEX IF NOT EXISTS idx_records_sheet ON records(sheet_id)
  `;

  const existing = rows<{ c: number }>(
    await db`SELECT COUNT(*)::int AS c FROM sheets`
  );
  const count = existing[0]?.c ?? 0;
  if (count === 0) {
    await db`
      INSERT INTO sheets (id, name, color, icon, type, fields, sort)
      VALUES
        ('hardware', 'Hardware', '#C8102E', 'laptop', 'hardware', '[]', 1),
        ('employees', 'Employees', '#2D6CDF', 'users', 'employees', '[]', 2)
    `;
  }

  migrated = true;
}

export function newId(): string {
  return crypto.randomUUID().slice(0, 12);
}

/** Neon query results need narrowing for TypeScript */
export function rows<T>(result: unknown): T[] {
  return result as T[];
}
