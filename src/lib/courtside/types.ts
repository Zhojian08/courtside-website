/**
 * Courtside data model — REAL, sourced data.
 *
 * Every game, team, player and stat in this app is drawn from public sources
 * (NBA.com / Basketball-Reference, PBA.ph / Wikipedia, FIBA.basketball) and
 * each record carries a `source` URL for traceability. No fabricated games.
 */

export type League = "NBA" | "PBA" | "FIBA" | "WEXME";

export type GameStatus = "scheduled" | "live" | "final";

export type StatCategory = "PTS" | "REB" | "AST" | "BLK" | "STL";

export interface Team {
  id: string;
  league: League;
  city: string;
  name: string;
  abbr: string;
  conference: string; // "Eastern"/"Western" (NBA), "PBA" (PBA), "Group A"/"Group B" (FIBA)
  primary: string;
  secondary: string;
  wins: number;
  losses: number;
  source?: string;
}

export interface PlayerStats {
  ppg?: number;
  rpg?: number;
  apg?: number;
  bpg?: number;
  spg?: number;
  fgPct?: number;
}

export interface Player {
  id: string;
  teamId: string;
  league: League;
  name: string;
  number?: number;
  position?: string;
  photoUrl: string | null;
  stats: PlayerStats;
  statContext: string; // e.g. "2026 NBA Finals" or "2025–26 season"
  source?: string;
}

/** A real, reported standout from a single game. */
export interface GamePerformer {
  playerId?: string;
  name: string;
  teamAbbr: string;
  category: StatCategory;
  value: number;
  detail?: string; // e.g. "45 PTS" or "30 pts · 8 ast"
}

export interface Game {
  id: string;
  league: League;
  date: string; // ISO yyyy-mm-dd
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  venue: string;
  series?: string; // e.g. "NBA Finals · Game 5"
  headline: string;
  recap: string;
  source: string;
  performers: GamePerformer[];
  status?: GameStatus; // WEXME live data; static leagues are "final"
  startsAt?: string; // ISO datetime for scheduled/live games
  period?: string; // e.g. "Q3 · 05:41" while live
}

export interface GameWithTeams {
  game: Game;
  home: Team;
  away: Team;
}

export interface StandingRow {
  rank: number;
  team: Team;
  wins: number;
  losses: number;
  pct: number;
  gb: number;
}

export interface SeasonLeader {
  rank: number;
  name: string;
  teamAbbr: string;
  league: League;
  category: StatCategory;
  value: number;
  context: string;
  playerId?: string;
  source?: string;
}
