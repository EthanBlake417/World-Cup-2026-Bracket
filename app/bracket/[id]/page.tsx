import Link from "next/link";
import { notFound } from "next/navigation";
import Bracket from "@/components/Bracket";
import { getBracket, getR32Teams, getResults } from "@/lib/db";
import { scoreBracket } from "@/lib/score";
import { ROUND_LABELS, ROUND_ORDER } from "@/lib/bracket";

export const dynamic = "force-dynamic";

export default async function ViewBracketPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();

  const [bracket, r32Teams, results] = await Promise.all([
    getBracket(id),
    getR32Teams(),
    getResults(),
  ]);
  if (!bracket) notFound();

  const score = scoreBracket(bracket.picks, results);
  const hasResults = Object.keys(results).length > 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/leaderboard" className="text-sm text-pitch hover:underline">
            ← Leaderboard
          </Link>
          <h1 className="text-2xl font-bold">{bracket.name}&apos;s bracket</h1>
        </div>
        <div className="rounded-lg bg-pitch px-5 py-3 text-center text-white shadow">
          <div className="text-2xl font-extrabold leading-none">{score.total}</div>
          <div className="text-xs uppercase tracking-wide text-emerald-100">points</div>
        </div>
      </div>

      {hasResults ? (
        <div className="flex flex-wrap gap-2 text-sm">
          {ROUND_ORDER.map((r) => {
            const rb = score.byRound[r];
            if (rb.total === 0) return null;
            return (
              <span
                key={r}
                className="rounded-full border border-slate-200 bg-white px-3 py-1"
              >
                {ROUND_LABELS[r]}:{" "}
                <strong>
                  {rb.correct}/{rb.total}
                </strong>{" "}
                <span className="text-slate-400">({rb.points} pts)</span>
              </span>
            );
          })}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
          Your picks show in{" "}
          <span className="font-semibold text-blue-700">blue</span>. Once matches are
          played, correct picks turn{" "}
          <span className="font-semibold text-green-700">green</span> and wrong ones turn{" "}
          <span className="font-semibold text-red-700">red</span>.
        </p>
      )}

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <Bracket r32Teams={r32Teams} picks={bracket.picks} mode="view" results={results} />
      </div>
    </div>
  );
}
