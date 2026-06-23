import type { League, SeasonLeader, StatCategory } from "./types";

const NBA_SZN = "https://en.wikipedia.org/wiki/2025%E2%80%9326_NBA_season";
const PBA = "https://en.wikipedia.org/wiki/2026_PBA_Commissioner%27s_Cup";
const FIBA = "https://en.wikipedia.org/wiki/2026_FIBA_U18_AmeriCup";

type Raw = Omit<SeasonLeader, "rank">;

/** Real, reported statistical leaders. Ranked per (league, category) in index.ts. */
export const LEADERS: Raw[] = [
  // NBA — 2025-26 season
  { name: "Luka Dončić", teamAbbr: "LAL", league: "NBA", category: "PTS", value: 33.5, context: "2025–26 PPG", playerId: "nba-lal-doncic", source: NBA_SZN },
  { name: "Nikola Jokić", teamAbbr: "DEN", league: "NBA", category: "REB", value: 12.9, context: "2025–26 RPG", playerId: "nba-den-jokic", source: NBA_SZN },
  { name: "Nikola Jokić", teamAbbr: "DEN", league: "NBA", category: "AST", value: 10.7, context: "2025–26 APG", playerId: "nba-den-jokic", source: NBA_SZN },

  // PBA — Season 50 Commissioner's Cup
  { name: "Bol Bol", teamAbbr: "TNT", league: "PBA", category: "PTS", value: 38.2, context: "Comm's Cup PPG (import)", playerId: "pba-tnt-bolbol", source: PBA },
  { name: "RJ Abarrientos", teamAbbr: "GIN", league: "PBA", category: "PTS", value: 21.5, context: "Comm's Cup PPG (local)", playerId: "pba-gin-abarrientos", source: PBA },
  { name: "June Mar Fajardo", teamAbbr: "SMB", league: "PBA", category: "REB", value: 14.8, context: "Comm's Cup RPG", playerId: "pba-smb-fajardo", source: PBA },
  { name: "Johnathan Williams", teamAbbr: "PHO", league: "PBA", category: "REB", value: 16.7, context: "Comm's Cup RPG (import)", playerId: "pba-pho-williams", source: PBA },
  { name: "Robert Bolick", teamAbbr: "NLX", league: "PBA", category: "AST", value: 8.8, context: "Comm's Cup APG", playerId: "pba-nlx-bolick", source: PBA },

  // FIBA — U18 AmeriCup 2026
  { name: "Marlon Martinez", teamAbbr: "DOM", league: "FIBA", category: "PTS", value: 19.0, context: "U18 AmeriCup PPG", playerId: "fiba-dom-martinez", source: FIBA },
  { name: "Quentin Coleman", teamAbbr: "USA", league: "FIBA", category: "REB", value: 11.4, context: "U18 AmeriCup RPG", playerId: "fiba-usa-coleman", source: FIBA },
  { name: "Javion Tyndale", teamAbbr: "CAN", league: "FIBA", category: "AST", value: 6.0, context: "U18 AmeriCup APG", playerId: "fiba-can-tyndale", source: FIBA },
];

export function rankedLeaders(category: StatCategory, league?: League): SeasonLeader[] {
  return LEADERS.filter((l) => l.category === category && (!league || l.league === league))
    .sort((a, b) => b.value - a.value)
    .map((l, i) => ({ ...l, rank: i + 1 }));
}
