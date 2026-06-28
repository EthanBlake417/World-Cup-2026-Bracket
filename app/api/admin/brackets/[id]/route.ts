import { NextResponse } from "next/server";
import { deleteBracket } from "@/lib/db";
import { adminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Delete a single bracket (admin only).
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!adminFromRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Bad id." }, { status: 400 });
  }
  try {
    const deleted = await deleteBracket(id);
    if (!deleted) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Delete failed.", detail: String(e) }, { status: 500 });
  }
}
