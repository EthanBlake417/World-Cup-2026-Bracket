import {
  MATCHES,
  ROUND_POINTS,
  ROUND_ORDER,
  type Picks,
  type Results,
  type Round,
} from "./bracket";

export type ScoreBreakdown = {
  total: number;
  correct: number; // number of correctly-picked matches
  byRound: Record<Round, { points: number; correct: number; total: number }>;
};

// Compare a bracket's picks against the official results, awarding round points
// for each match where the picked winner matches the actual winner.
export function scoreBracket(picks: Picks, results: Results): ScoreBreakdown {
  const byRound = {} as ScoreBreakdown["byRound"];
  for (const r of ROUND_ORDER) {
    byRound[r] = { points: 0, correct: 0, total: 0 };
  }

  let total = 0;
  let correct = 0;

  for (const m of MATCHES) {
    const actual = results[m.id];
    if (!actual) continue; // match not played / not entered yet
    byRound[m.round].total += 1;
    if (picks[m.id] && picks[m.id] === actual) {
      const pts = ROUND_POINTS[m.round];
      total += pts;
      correct += 1;
      byRound[m.round].points += pts;
      byRound[m.round].correct += 1;
    }
  }

  return { total, correct, byRound };
}
