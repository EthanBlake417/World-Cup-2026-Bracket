import { NextResponse } from "next/server";
import { getR32Teams, getResults, getSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

// Public config used by the builder and viewers: the R32 seeding, official
// results so far, and whether submissions are locked.
export async function GET() {
  try {
    const [r32Teams, results, settings] = await Promise.all([
      getR32Teams(),
      getResults(),
      getSettings(),
    ]);
    return NextResponse.json({ r32Teams, results, settings });
  } catch (e) {
    return NextResponse.json(
      { error: "Database not ready. Run /api/init first.", detail: String(e) },
      { status: 500 },
    );
  }
}
