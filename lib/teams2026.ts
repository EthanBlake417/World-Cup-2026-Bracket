import type { R32Teams } from "./bracket";

// Actual 2026 World Cup Round of 32 matchups, seeded into the bracket tree in
// the order that reproduces the real single-elimination bracket. The two teams
// in each match (a/b) are placed so that the Round-of-16 / Quarterfinal / etc.
// adjacencies in lib/bracket.ts match FIFA's official bracket.
//
// Source bracket (Wikipedia "2026 FIFA World Cup knockout stage"):
//   R16 M89 = W74 vs W77   -> tree M1 vs M2
//   R16 M90 = W73 vs W75   -> tree M3 vs M4
//   R16 M93 = W83 vs W84   -> tree M5 vs M6
//   R16 M94 = W81 vs W82   -> tree M7 vs M8
//   R16 M91 = W76 vs W78   -> tree M9 vs M10
//   R16 M92 = W79 vs W80   -> tree M11 vs M12
//   R16 M95 = W86 vs W88   -> tree M13 vs M14
//   R16 M96 = W85 vs W87   -> tree M15 vs M16
//
// Flag codes are 2-letter ISO codes used by flagcdn.com (England uses gb-eng so
// it shows the St George's cross rather than the Union Jack).
export const TEAMS_2026: R32Teams = {
  M1: { a: { name: "Germany", code: "de" }, b: { name: "Paraguay", code: "py" } },
  M2: { a: { name: "France", code: "fr" }, b: { name: "Sweden", code: "se" } },
  M3: { a: { name: "South Africa", code: "za" }, b: { name: "Canada", code: "ca" } },
  M4: { a: { name: "Netherlands", code: "nl" }, b: { name: "Morocco", code: "ma" } },
  M5: { a: { name: "Portugal", code: "pt" }, b: { name: "Croatia", code: "hr" } },
  M6: { a: { name: "Spain", code: "es" }, b: { name: "Austria", code: "at" } },
  M7: { a: { name: "United States", code: "us" }, b: { name: "Bosnia and Herzegovina", code: "ba" } },
  M8: { a: { name: "Belgium", code: "be" }, b: { name: "Senegal", code: "sn" } },
  M9: { a: { name: "Brazil", code: "br" }, b: { name: "Japan", code: "jp" } },
  M10: { a: { name: "Ivory Coast", code: "ci" }, b: { name: "Norway", code: "no" } },
  M11: { a: { name: "Mexico", code: "mx" }, b: { name: "Ecuador", code: "ec" } },
  M12: { a: { name: "England", code: "gb-eng" }, b: { name: "DR Congo", code: "cd" } },
  M13: { a: { name: "Argentina", code: "ar" }, b: { name: "Cape Verde", code: "cv" } },
  M14: { a: { name: "Australia", code: "au" }, b: { name: "Egypt", code: "eg" } },
  M15: { a: { name: "Switzerland", code: "ch" }, b: { name: "Algeria", code: "dz" } },
  M16: { a: { name: "Colombia", code: "co" }, b: { name: "Ghana", code: "gh" } },
};
