/**
 * Courtside data model.
 *
 * These types describe the shape the public site consumes. They are
 * intentionally close to what a box-score / stats API (like Courtside Live)
 * would return, so swapping the sample-data source in `index.ts` for live
 * `fetch()` calls is a localized change.
 */

export type League = "NBA" | "PBA";

export type Position = "PG" | "SG" | "SF" | "PF" | "C";

export type StatCategory = "PTS" | "REB" | "AST" | "BLK" | "STL";

export interface Team {
  id: string;
  league: League;
  city: string;
  name: string;
  abbr: string;
  conference: string; // "East" | "West" for NBA, "PBA" for PBA
  primary: string;
  secondary: string;
  wins: number;
  losses: number;
}

export interface Player {
  id: string;
  teamId: string;
  league: League;
  name: string;
  number: number;
  position: Position;
  height: string;
  age: number;
  photoUrl: string | null;
  // season per-game averages
  ppg: number;
  rpg: number;
  apg: number;
  bpg: number;
  spg: number;
  mpg: number;
  fgPct: number; // 0-100
  tpPct: number;
  ftPct: number;
  gamesPlayed: number;
}

export interface StatLine {
  min: number;
  pts: number;
  reb: number;
  ast: number;
  blk: number;
  stl: number;
  tov: number;
  pf: number;
  fgm: number;
  fga: number;
  tpm: number;
  tpa: number;
  ftm: number;
  fta: number;
}

export interface BoxEntry extends StatLine {
  playerId: string;
  starter: boolean;
}

export interface Quarters {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  ot: number;
}

export interface Game {
  id: string;
  league: League;
  date: string; // ISO (yyyy-mm-dd)
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  homeLine: Quarters;
  awayLine: Quarters;
  venue: string;
  attendance: number;
  box: BoxEntry[]; // both teams
  playerOfGameId: string;
  headline: string;
  recap: string;
}

/** A category leader within a single game (used on the recap pages). */
export interface PerformerLeader {
  category: StatCategory;
  player: Player;
  team: Team;
  value: number;
  line: BoxEntry;
  photoUrl: string | null;
}

/** A season-long leaderboard entry. */
export interface SeasonLeader {
  rank: number;
  player: Player;
  team: Team;
  value: number;
}

export interface StandingRow {
  rank: number;
  team: Team;
  wins: number;
  losses: number;
  pct: number;
  gb: number;
  streak: string;
}
