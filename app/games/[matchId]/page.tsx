import Link from "next/link";
import { notFound } from "next/navigation";
import MatchCard from "@/components/MatchCard";
import { listBrackets, getR32Teams, getResults } from "@/lib/db";
import {
  MATCH_BY_ID,
  matchesInRound,
  resolveTeams,
  ROUND_LABELS,
} from "@/lib/bracket";

export const dynamic = "force-dynamic";

export default async function GameDetailPage({
  params,
}: {
  params: { matchId: string };
}) {
  const match = MATCH_BY_ID[params.matchId];
  if (!match) notFound();

  let brackets: Awaited<ReturnType<typeof listBrackets>>;
  let r32Teams: Awaited<ReturnType<typeof getR32Teams>>;
  let results: Awaited<ReturnType<typeof getResults>>;
  try {
    [brackets, r32Teams, results] = await Promise.all([
      listBrackets(),
      getR32Teams(),
      getResults(),
    ]);
  } catch {
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

  // Human title: the real teams once official results decide the matchup,
  // otherwise a generic round + index label. `results` shares the same shape
  // as a bracket's picks, so resolving it yields the official teams.
  const indexInRound = matchesInRound(match.round).findIndex(
    (m) => m.id === match.id,
  );
  const official = resolveTeams(results, r32Teams)[match.id];
  const title =
    official && (official.a || official.b)
      ? `${official.a?.name ?? "TBD"} vs ${official.b?.name ?? "TBD"}`
      : `${ROUND_LABELS[match.round]} — Match ${indexInRound + 1}`;

  const actual = results[match.id];

  const rows = brackets
    .map((b) => {
      const resolved = resolveTeams(b.picks, r32Teams)[match.id];
      return {
        id: b.id,
        name: b.name,
        a: resolved?.a ?? null,
        b: resolved?.b ?? null,
        picked: b.picks[match.id],
      };
    })
    .sort((x, y) => x.name.localeCompare(y.name));

  return (
    <div className="space-y-5">
      <div>
        <Link href="/games" className="text-sm text-pitch hover:underline">
          ← Games
        </Link>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-slate-500">
          {ROUND_LABELS[match.round]} · who everyone picked
        </p>
      </div>

      {rows.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {rows.map((row) => (
            <div key={row.id} className="space-y-1">
              <Link
                href={`/bracket/${row.id}`}
                className="block max-w-44 truncate text-sm font-medium text-pitch hover:underline"
              >
                {row.name}
              </Link>
              <MatchCard
                a={row.a}
                b={row.b}
                picked={row.picked}
                actual={actual}
                mode="view"
              />
            </div>
          ))}
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
    </div>
  );
}
