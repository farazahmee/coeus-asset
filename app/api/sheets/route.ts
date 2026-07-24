import { NextRequest } from "next/server";
import { ensureSchema, getSql, newId, rows } from "@/lib/db";
import type { CustomField } from "@/lib/types";

export async function GET() {
  try {
    await ensureSchema();
    const db = getSql();
    const list = rows<Record<string, unknown>>(
      await db`
      SELECT s.*,
        (SELECT COUNT(*)::int FROM records r WHERE r.sheet_id = s.id) AS cnt
      FROM sheets s
      ORDER BY s.sort ASC, s.created_at ASC
    `
    );
    return Response.json(list);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const body = await req.json();
    const { name, color, icon, type, fields } = body as {
      name: string;
      color?: string;
      icon?: string;
      type: string;
      fields?: CustomField[];
    };
    if (!name?.trim()) {
      return Response.json({ error: "Name required" }, { status: 400 });
    }
    const id = newId();
    const db = getSql();
    const maxSort = rows<{ m: number }>(
      await db`SELECT COALESCE(MAX(sort), 0)::int AS m FROM sheets`
    );
    const sort = (maxSort[0]?.m ?? 0) + 1;
    await db`
      INSERT INTO sheets (id, name, color, icon, type, fields, sort)
      VALUES (
        ${id},
        ${name.trim()},
        ${color ?? "#737B86"},
        ${icon ?? "folder"},
        ${type},
        ${JSON.stringify(fields ?? [])}::jsonb,
        ${sort}
      )
    `;
    const created = rows<Record<string, unknown>>(
      await db`
      SELECT s.*, 0::int AS cnt FROM sheets s WHERE s.id = ${id}
    `
    );
    return Response.json(created[0]);
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
    if (id === "hardware" || id === "employees") {
      return Response.json(
        { error: "Built-in sheets cannot be deleted" },
        { status: 403 }
      );
    }
    const db = getSql();
    await db`DELETE FROM records WHERE sheet_id = ${id}`;
    await db`DELETE FROM sheets WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
