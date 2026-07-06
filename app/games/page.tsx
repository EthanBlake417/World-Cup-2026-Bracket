import Link from "next/link";
import Flag from "@/components/Flag";
import { getR32Teams, getResults } from "@/lib/db";
import {
  matchesInRound,
  resolveTeams,
  ROUND_LABELS,
  ROUND_ORDER,
} from "@/lib/bracket";

export const dynamic = "force-dynamic";

export default async function GamesPage() {
  let official: ReturnType<typeof resolveTeams> | null = null;
  let dbError = false;

  try {
    const [r32Teams, results] = await Promise.all([getR32Teams(), getResults()]);
    // Resolve the real teams sitting in every match from the official results
    // (results share the same shape as a bracket's picks). Later-round slots
    // fill in as the admin enters the winners that feed them.
    official = resolveTeams(results, r32Teams);
  } catch {
    dbError = true;
  }

  if (dbError || !official) {
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

  const teams = official;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Games</h1>
        <p className="text-sm text-slate-500">
          Pick a game to see who everyone picked to win it.
        </p>
      </div>

      {ROUND_ORDER.map((round) => (
        <section key={round} className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {ROUND_LABELS[round]}
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {matchesInRound(round).map((m, i) => {
              const slot = teams[m.id];
              // Show the real teams once at least one is known; otherwise a
              // generic label until upstream results decide the matchup.
              const known = slot && (slot.a || slot.b);
              return (
                <Link
                  key={m.id}
                  href={`/games/${m.id}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition hover:border-pitch hover:bg-emerald-50"
                >
                  {known ? (
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="flex items-center gap-1.5">
                        <Flag code={slot.a?.code} />
                        <span className="truncate font-medium">
                          {slot.a?.name ?? "TBD"}
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Flag code={slot.b?.code} />
                        <span className="truncate font-medium">
                          {slot.b?.name ?? "TBD"}
                        </span>
                      </span>
                    </span>
                  ) : (
                    <span className="font-medium">
                      {ROUND_LABELS[round]} — Match {i + 1}
                    </span>
                  )}
                  <span className="shrink-0 text-slate-300">→</span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
