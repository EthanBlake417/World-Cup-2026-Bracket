import { NextResponse } from "next/server";
import { createBracket, getResults, getSettings, listBrackets } from "@/lib/db";
import { isComplete, type Picks } from "@/lib/bracket";
import { scoreBracket } from "@/lib/score";

export const dynamic = "force-dynamic";

// List all brackets with their current scores (highest first).
export async function GET() {
  try {
    const [brackets, results] = await Promise.all([listBrackets(), getResults()]);
    const withScores = brackets
      .map((b) => ({
        id: b.id,
        name: b.name,
        created_at: b.created_at,
        score: scoreBracket(b.picks, results).total,
      }))
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    return NextResponse.json({ brackets: withScores });
  } catch (e) {
    return NextResponse.json(
      { error: "Database not ready. Run /api/init first.", detail: String(e) },
      { status: 500 },
    );
  }
}

// Create a new bracket. Name + a complete set of picks required.
export async function POST(req: Request) {
  let body: { name?: string; picks?: Picks };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const picks = body.picks ?? {};

  if (!name) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (name.length > 40) {
    return NextResponse.json({ error: "Name is too long (40 char max)." }, { status: 400 });
  }
  if (!isComplete(picks)) {
    return NextResponse.json(
      { error: "Your bracket isn't finished — pick a winner for every match." },
      { status: 400 },
    );
  }

  try {
    const settings = await getSettings();
    if (settings.locked) {
      return NextResponse.json(
        { error: "Submissions are locked — the tournament has started." },
        { status: 403 },
      );
    }
    const id = await createBracket(name, picks);
    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json(
      { error: "Could not save your bracket.", detail: String(e) },
      { status: 500 },
    );
  }
}
