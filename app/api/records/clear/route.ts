import { NextRequest } from "next/server";
import { requireWriteAuth } from "@/lib/api-auth";
import { ensureSchema, getSql } from "@/lib/db";

export async function POST(req: NextRequest) {
  const auth = requireWriteAuth(req);
  if (auth) return auth;
  try {
    await ensureSchema();
    const body = await req.json();
    const { sheet_id } = body as { sheet_id?: string };
    if (!sheet_id) {
      return Response.json({ error: "sheet_id required" }, { status: 400 });
    }
    const db = getSql();
    await db`DELETE FROM records WHERE sheet_id = ${sheet_id}`;
    return Response.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
