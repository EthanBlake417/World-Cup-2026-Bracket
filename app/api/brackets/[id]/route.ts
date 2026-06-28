import { NextResponse } from "next/server";
import { getBracket } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Bad id." }, { status: 400 });
  }
  try {
    const bracket = await getBracket(id);
    if (!bracket) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    return NextResponse.json({ bracket });
  } catch (e) {
    return NextResponse.json(
      { error: "Database error.", detail: String(e) },
      { status: 500 },
    );
  }
}
