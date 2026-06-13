import { NextRequest } from "next/server";

export function requireWriteAuth(req: NextRequest): Response | null {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  const header = req.headers.get("x-app-key");
  if (header !== apiKey) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
