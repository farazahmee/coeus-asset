import { NextRequest } from "next/server";
import { ensureSchema, getSql, newId, rows } from "@/lib/db";

function mergeRecord(row: { id: string; data: Record<string, unknown> }) {
  const { id, data } = row;
  return { ...data, id };
}

export async function GET(req: NextRequest) {
  try {
    await ensureSchema();
    const sheetId = req.nextUrl.searchParams.get("sheet_id");
    if (!sheetId) {
      return Response.json({ error: "sheet_id required" }, { status: 400 });
    }
    const db = getSql();
    const list = rows<{ id: string; data: Record<string, unknown>; updated_at: string }>(
      await db`
      SELECT id, data, updated_at
      FROM records
      WHERE sheet_id = ${sheetId}
      ORDER BY updated_at DESC
    `
    );
    return Response.json(
      list.map((r) => ({
        ...mergeRecord({
          id: r.id as string,
          data: r.data as Record<string, unknown>,
        }),
        updated_at: r.updated_at,
      }))
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const body = await req.json();
    const { sheet_id, record } = body as {
      sheet_id: string;
      record: Record<string, unknown> & { id?: string };
    };
    if (!sheet_id || !record) {
      return Response.json({ error: "sheet_id and record required" }, { status: 400 });
    }
    const id = (record.id as string) || newId();
    const { id: _drop, ...data } = record;
    const db = getSql();
    await db`
      INSERT INTO records (id, sheet_id, data, updated_at)
      VALUES (${id}, ${sheet_id}, ${JSON.stringify(data)}::jsonb, now())
      ON CONFLICT (id) DO UPDATE SET
        data = EXCLUDED.data,
        updated_at = now()
    `;
    const saved = rows<{ id: string; data: Record<string, unknown> }>(
      await db`SELECT id, data FROM records WHERE id = ${id}`
    );
    const row = saved[0];
    if (!row) {
      return Response.json({ error: "Save failed" }, { status: 500 });
    }
    return Response.json(mergeRecord(row));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await ensureSchema();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return Response.json({ error: "id required" }, { status: 400 });
    }
    const db = getSql();
    await db`DELETE FROM records WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
