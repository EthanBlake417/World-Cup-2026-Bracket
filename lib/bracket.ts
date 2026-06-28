// Static definition of the World Cup 2026 knockout bracket tree.
//
// The tree never changes. A bracket entry (or the official results) is simply a
// map of matchId -> winning team name. Everything else is derived from this file.

export type Round = "R32" | "R16" | "QF" | "SF" | "3RD" | "FINAL";

export type Team = {
  name: string; // e.g. "Brazil"
  code: string; // 2-letter ISO country code for the flag, e.g. "br"
};

// Where a match gets each of its two competitors from.
type Source =
  | { kind: "seed" } // comes from the r32_teams config for this match id
  | { kind: "winner"; match: string } // winner of an earlier match
  | { kind: "loser"; match: string }; // loser of an earlier match (3rd place game)

export type MatchNode = {
  id: string;
  round: Round;
  a: Source;
  b: Source;
};

// Points awarded for each correctly-predicted match winner, by round.
// Edit these to change scoring. Higher rounds are worth more.
export const ROUND_POINTS: Record<Round, number> = {
  R32: 1,
  R16: 2,
  QF: 3,
  SF: 4,
  "3RD": 3,
  FINAL: 5,
};

export const ROUND_LABELS: Record<Round, string> = {
  R32: "Round of 32",
  R16: "Round of 16",
  QF: "Quarterfinals",
  SF: "Semifinals",
  "3RD": "Third Place",
  FINAL: "Final",
};

// Order rounds appear left-to-right in the bracket UI.
export const ROUND_ORDER: Round[] = ["R32", "R16", "QF", "SF", "FINAL", "3RD"];

const seed: Source = { kind: "seed" };
const w = (match: string): Source => ({ kind: "winner", match });
const l = (match: string): Source => ({ kind: "loser", match });

// 16 Round-of-32 matches (teams come from the r32_teams config).
const R32: MatchNode[] = Array.from({ length: 16 }, (_, i) => ({
  id: `M${i + 1}`,
  round: "R32" as const,
  a: seed,
  b: seed,
}));

// Round of 16: pair up consecutive R32 winners.
const R16: MatchNode[] = Array.from({ length: 8 }, (_, i) => ({
  id: `M${17 + i}`,
  round: "R16" as const,
  a: w(`M${2 * i + 1}`),
  b: w(`M${2 * i + 2}`),
}));

// Quarterfinals: pair up consecutive R16 winners.
const QF: MatchNode[] = Array.from({ length: 4 }, (_, i) => ({
  id: `M${25 + i}`,
  round: "QF" as const,
  a: w(`M${17 + 2 * i}`),
  b: w(`M${18 + 2 * i}`),
}));

// Semifinals.
const SF: MatchNode[] = [
  { id: "M29", round: "SF", a: w("M25"), b: w("M26") },
  { id: "M30", round: "SF", a: w("M27"), b: w("M28") },
];

// Final and third-place playoff.
const LATE: MatchNode[] = [
  { id: "M31", round: "FINAL", a: w("M29"), b: w("M30") },
  { id: "M32", round: "3RD", a: l("M29"), b: l("M30") },
];

export const MATCHES: MatchNode[] = [...R32, ...R16, ...QF, ...SF, ...LATE];

export const MATCH_BY_ID: Record<string, MatchNode> = Object.fromEntries(
  MATCHES.map((m) => [m.id, m]),
);

export function matchesInRound(round: Round): MatchNode[] {
  return MATCHES.filter((m) => m.round === round);
}

// Config shapes stored in the `config` table.
export type R32Teams = Record<string, { a: Team | null; b: Team | null }>;
export type Results = Record<string, string>; // matchId -> winning team name
export type Settings = { locked: boolean };

export type Picks = Record<string, string>; // matchId -> picked team name

// Resolve the two competitors sitting in every match, given a set of picks and
// the R32 seeding. Returns null for a slot when it can't be determined yet
// (e.g. an earlier match has no pick).
export type ResolvedMatch = { a: Team | null; b: Team | null };

export function resolveTeams(
  picks: Picks,
  r32Teams: R32Teams,
): Record<string, ResolvedMatch> {
  // Build a name -> Team lookup so we can attach flags to picked winners.
  const teamByName: Record<string, Team> = {};
  for (const slot of Object.values(r32Teams || {})) {
    if (slot?.a) teamByName[slot.a.name] = slot.a;
    if (slot?.b) teamByName[slot.b.name] = slot.b;
  }

  const resolved: Record<string, ResolvedMatch> = {};

  const teamFromSource = (src: Source): Team | null => {
    if (src.kind === "seed") {
      return null; // R32 seeds are handled directly in the loop below
    }
    const ref = resolved[src.match];
    const pick = picks[src.match];
    if (!ref || !pick) return null;
    if (src.kind === "winner") {
      return teamByName[pick] ?? null;
    }
    // loser: the competitor in that match who wasn't picked to win
    const other =
      ref.a && ref.a.name !== pick
        ? ref.a
        : ref.b && ref.b.name !== pick
          ? ref.b
          : null;
    return other;
  };

  for (const m of MATCHES) {
    if (m.round === "R32") {
      const slot = r32Teams?.[m.id] ?? { a: null, b: null };
      resolved[m.id] = { a: slot.a ?? null, b: slot.b ?? null };
    } else {
      resolved[m.id] = {
        a: teamFromSource(m.a),
        b: teamFromSource(m.b),
      };
    }
  }

  return resolved;
}

// Remove any pick that is no longer one of the two teams actually present in
// its match. Used after changing an upstream winner so stale downstream picks
// don't linger. Runs to a fixed point so deep chains are fully cleared.
export function prunePicks(picks: Picks, r32Teams: R32Teams): Picks {
  const current: Picks = { ...picks };
  for (let iter = 0; iter < MATCHES.length; iter++) {
    const resolved = resolveTeams(current, r32Teams);
    let changed = false;
    for (const m of MATCHES) {
      const pick = current[m.id];
      if (!pick) continue;
      const { a, b } = resolved[m.id];
      const valid = (a && a.name === pick) || (b && b.name === pick);
      if (!valid) {
        delete current[m.id];
        changed = true;
      }
    }
    if (!changed) break;
  }
  return current;
}

// True when a bracket has a pick for every match (ready to submit).
export function isComplete(picks: Picks): boolean {
  return MATCHES.every((m) => !!picks[m.id]);
}
