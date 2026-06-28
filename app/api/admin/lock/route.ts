import { NextResponse } from "next/server";
import { setSettings } from "@/lib/db";
import { adminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Toggle whether new bracket submissions are accepted.
export async function POST(req: Request) {
  let body: { password?: string; locked?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (!adminFromRequest(req, body.password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await setSettings({ locked: !!body.locked });
    return NextResponse.json({ ok: true, locked: !!body.locked });
  } catch (e) {
    return NextResponse.json({ error: "Save failed.", detail: String(e) }, { status: 500 });
  }
}
