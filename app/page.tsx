import Link from "next/link";
import { listBrackets, getResults, getSettings } from "@/lib/db";
import { scoreBracket } from "@/lib/score";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let data: {
    brackets: { id: number; name: string; score: number }[];
    locked: boolean;
  } | null = null;
  let dbError = false;

  try {
    const [brackets, results, settings] = await Promise.all([
      listBrackets(),
      getResults(),
      getSettings(),
    ]);
    data = {
      brackets: brackets
        .map((b) => ({ id: b.id, name: b.name, score: scoreBracket(b.picks, results).total }))
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)),
      locked: settings.locked,
    };
  } catch {
    dbError = true;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl bg-gradient-to-br from-pitch to-pitchdark p-8 text-white shadow">
        <h1 className="text-3xl font-extrabold tracking-tight">Make your knockout bracket</h1>
        <p className="mt-2 max-w-2xl text-emerald-50">
          Pick the winner of every match from the Round of 32 all the way to the Final.
          Submit with just your name, then watch the leaderboard as the real results come in.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/bracket/new"
            className="rounded-lg bg-white px-5 py-2.5 font-semibold text-pitch shadow hover:bg-emerald-50"
          >
            Create your bracket
          </Link>
          <Link
            href="/leaderboard"
            className="rounded-lg border border-white/40 px-5 py-2.5 font-semibold hover:bg-white/10"
          >
            View leaderboard
          </Link>
        </div>
        {data?.locked ? (
          <p className="mt-4 inline-block rounded bg-amber-400/20 px-3 py-1 text-sm text-amber-100">
            🔒 Submissions are locked — the tournament has started.
          </p>
        ) : null}
      </section>

      {dbError ? (
        <SetupNotice />
      ) : (
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-xl font-bold">Submitted brackets</h2>
            <span className="text-sm text-slate-500">{data?.brackets.length ?? 0} total</span>
          </div>
          {data && data.brackets.length > 0 ? (
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {data.brackets.map((b, i) => (
                <li key={b.id}>
                  <Link
                    href={`/bracket/${b.id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-pitch hover:shadow"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-5 text-right text-sm font-semibold text-slate-400">
                        {i + 1}
                      </span>
                      <span className="font-medium">{b.name}</span>
                    </span>
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-sm font-semibold text-pitch">
                      {b.score} pts
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-slate-500">
              No brackets yet. Be the first to{" "}
              <Link href="/bracket/new" className="font-semibold text-pitch underline">
                create one
              </Link>
              .
            </p>
          )}
        </section>
      )}
    </div>
  );
}

function SetupNotice() {
  return (
    <section className="rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-900">
      <h2 className="font-bold">Almost ready — finish setup</h2>
      <p className="mt-1 text-sm">
        The database isn&apos;t initialized yet. Connect a Vercel Postgres database, then open the{" "}
        <Link href="/admin" className="font-semibold underline">
          admin page
        </Link>{" "}
        and click <strong>Initialize database</strong>. See the README for the full deploy steps.
      </p>
    </section>
  );
}
