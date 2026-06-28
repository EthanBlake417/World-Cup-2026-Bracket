import { NextResponse } from "next/server";
import { setResults } from "@/lib/db";
import { adminFromRequest } from "@/lib/auth";
import type { Results } from "@/lib/bracket";

export const dynamic = "force-dynamic";

// Replace the official results map (matchId -> winning team name).
// An empty string / missing key means "not played yet".
export async function POST(req: Request) {
  let body: { password?: string; results?: Results } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (!adminFromRequest(req, body.password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!body.results || typeof body.results !== "object") {
    return NextResponse.json({ error: "Missing results." }, { status: 400 });
  }
  // Drop blank entries so "not played" stays absent.
  const cleaned: Results = {};
  for (const [k, v] of Object.entries(body.results)) {
    if (typeof v === "string" && v.trim()) cleaned[k] = v;
  }
  try {
    await setResults(cleaned);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Save failed.", detail: String(e) }, { status: 500 });
  }
}
