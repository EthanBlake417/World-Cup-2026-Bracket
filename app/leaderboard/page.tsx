import Link from "next/link";
import { listBrackets, getResults } from "@/lib/db";
import { scoreBracket } from "@/lib/score";
import { ROUND_LABELS, ROUND_ORDER } from "@/lib/bracket";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  let rows:
    | { id: number; name: string; total: number; correct: number; byRound: Record<string, number> }[]
    | null = null;
  let dbError = false;

  try {
    const [brackets, results] = await Promise.all([listBrackets(), getResults()]);
    rows = brackets
      .map((b) => {
        const s = scoreBracket(b.picks, results);
        const byRound: Record<string, number> = {};
        for (const r of ROUND_ORDER) byRound[r] = s.byRound[r].correct;
        return { id: b.id, name: b.name, total: s.total, correct: s.correct, byRound };
      })
      .sort((a, b) => b.total - a.total || b.correct - a.correct || a.name.localeCompare(b.name));
  } catch {
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-900">
        Database isn&apos;t ready yet. See the{" "}
        <Link href="/admin" className="underline">
          admin page
        </Link>
        .
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Leaderboard</h1>

      {rows && rows.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Name</th>
                {ROUND_ORDER.map((r) => (
                  <th key={r} className="hidden px-2 py-2 text-center sm:table-cell" title={ROUND_LABELS[r]}>
                    {shortRound(r)}
                  </th>
                ))}
                <th className="px-3 py-2 text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-3 py-2 font-semibold text-slate-400">{i + 1}</td>
                  <td className="px-3 py-2 font-medium">
                    <Link href={`/bracket/${row.id}`} className="text-pitch hover:underline">
                      {row.name}
                    </Link>
                  </td>
                  {ROUND_ORDER.map((r) => (
                    <td key={r} className="hidden px-2 py-2 text-center text-slate-500 sm:table-cell">
                      {row.byRound[r] || "–"}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right font-bold">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-slate-500">
          No brackets yet.{" "}
          <Link href="/bracket/new" className="font-semibold text-pitch underline">
            Create one
          </Link>
          .
        </p>
      )}

      <p className="text-xs text-slate-400">
        Columns show correct picks per round. Scoring: R32 = 1, R16 = 2, QF = 3, SF = 4, 3rd = 3,
        Final = 5 points per correct pick.
      </p>
    </div>
  );
}

function shortRound(r: string): string {
  return { R32: "R32", R16: "R16", QF: "QF", SF: "SF", FINAL: "F", "3RD": "3rd" }[r] ?? r;
}
