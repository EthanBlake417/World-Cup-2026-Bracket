import { NextResponse } from "next/server";
import { ensureSchema } from "@/lib/db";
import { adminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

// One-time (idempotent) setup: creates tables and seeds default config.
export async function POST(req: Request) {
  let body: { password?: string } = {};
  try {
    body = await req.json();
  } catch {
    // no body is fine; header may carry the password
  }
  if (!adminFromRequest(req, body.password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await ensureSchema();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: "Database not configured or unreachable.", detail: String(e) },
      { status: 500 },
    );
  }
}
