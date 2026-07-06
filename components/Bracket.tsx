"use client";

import { useMemo } from "react";
import MatchCard from "./MatchCard";
import {
  ROUND_LABELS,
  matchesInRound,
  resolveTeams,
  type Picks,
  type R32Teams,
  type Results,
  type Round,
} from "@/lib/bracket";

const COLUMNS: Round[] = ["R32", "R16", "QF", "SF", "FINAL"];

type Props = {
  r32Teams: R32Teams;
  picks: Picks;
  mode: "build" | "view";
  results?: Results;
  onPick?: (matchId: string, name: string) => void;
};

export default function Bracket({ r32Teams, picks, mode, results, onPick }: Props) {
  const resolved = useMemo(() => resolveTeams(picks, r32Teams), [picks, r32Teams]);

  return (
    <div className="bracket-scroll overflow-x-auto pb-4">
      <div className="flex min-w-max items-stretch gap-6 md:gap-10">
        {COLUMNS.map((round) => (
          <div key={round} className="flex flex-col">
            <h3 className="mb-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
              {ROUND_LABELS[round]}
            </h3>
            <div className="flex flex-1 flex-col justify-around gap-3">
              {matchesInRound(round).map((m) => (
                <MatchCard
                  key={m.id}
                  a={resolved[m.id]?.a ?? null}
                  b={resolved[m.id]?.b ?? null}
                  picked={picks[m.id]}
                  actual={results?.[m.id]}
                  mode={mode}
                  href={mode === "view" ? `/games/${m.id}` : undefined}
                  onPick={(name) => onPick?.(m.id, name)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Third-place playoff sits on its own row beneath the main bracket. */}
      <div className="mt-6 border-t border-slate-200 pt-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {ROUND_LABELS["3RD"]}
        </h3>
        <MatchCard
          a={resolved["M32"]?.a ?? null}
          b={resolved["M32"]?.b ?? null}
          picked={picks["M32"]}
          actual={results?.["M32"]}
          mode={mode}
          href={mode === "view" ? "/games/M32" : undefined}
          onPick={(name) => onPick?.("M32", name)}
        />
      </div>
    </div>
  );
}
