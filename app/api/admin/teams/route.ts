import { NextResponse } from "next/server";
import { setR32Teams } from "@/lib/db";
import { adminFromRequest } from "@/lib/auth";
import type { R32Teams } from "@/lib/bracket";

export const dynamic = "force-dynamic";

// Set the 16 Round-of-32 matchups (team name + flag code per slot).
export async function POST(req: Request) {
  let body: { password?: string; r32Teams?: R32Teams } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (!adminFromRequest(req, body.password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!body.r32Teams || typeof body.r32Teams !== "object") {
    return NextResponse.json({ error: "Missing r32Teams." }, { status: 400 });
  }
  try {
    await setR32Teams(body.r32Teams);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Save failed.", detail: String(e) }, { status: 500 });
  }
}
