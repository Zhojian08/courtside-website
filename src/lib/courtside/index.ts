import { TEAMS, TEAMS_BY_ID } from "./teams";
import { PLAYERS, PLAYERS_BY_ID } from "./players";
import { GAMES } from "./games";
import { rankedLeaders } from "./leaders";
import type {
  Game,
  GamePerformer,
  League,
  Player,
  SeasonLeader,
  StandingRow,
  StatCategory,
  Team,
} from "./types";

export type { Game, GamePerformer, Player, Team, SeasonLeader, StandingRow, League, StatCategory };

/* ============================================================
 *  Real, sourced data adapter.
 *  Everything below is backed by the static datasets in
 *  teams.ts / players.ts / games.ts / leaders.ts, each row of
 *  which carries a `source` URL (NBA, PBA, FIBA). No generated
 *  games. Swap these arrays for live API calls and the UI is
 *  unchanged.
 * ============================================================ */

export const LEAGUES: League[] = ["NBA", "PBA", "FIBA", "WEXME"];

export const LEAGUE_LABEL: Record<League, string> = {
  NBA: "NBA",
  PBA: "PBA",
  FIBA: "FIBA",
  WEXME: "WEXME",
};

export {
  getWexmeFeed,
  getWexmeGameDetail,
  getWexmeBoxScore,
  getWexmeStandings,
  getWexmeStandingGroups,
  getWexmeLeaders,
  getWexmeTeams,
  getWexmeTeam,
  getWexmeRoster,
  getWexmeTeamGames,
  getWexmePlayer,
  getWexmePlayerGames,
  getWexmeSiteStats,
  getCollections,
  type GameWithTeams,
  type WexmeBoxScore,
  type BoxScoreTeam,
  type BoxScoreRow,
  type CollectionTab,
  type WexmeStandingPortfolio,
  type WexmeStandingTable,
} from "./wexme";

/* ---------------- Teams ---------------- */
export function getTeam(id: string): Team | undefined {
  return TEAMS_BY_ID[id];
}
export function getTeams(league?: League): Team[] {
  return league ? TEAMS.filter((t) => t.league === league) : TEAMS;
}

/* ---------------- Players ---------------- */
export function getPlayer(id: string): Player | undefined {
  return PLAYERS_BY_ID[id];
}
export function getRoster(teamId: string): Player[] {
  return PLAYERS.filter((p) => p.teamId === teamId);
}

/* ---------------- Games ---------------- */
function byDateDesc(a: Game, b: Game) {
  return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
}
export function listGames(opts?: { league?: League; limit?: number }): Game[] {
  let g = [...GAMES].sort(byDateDesc);
  if (opts?.league) g = g.filter((x) => x.league === opts.league);
  return opts?.limit ? g.slice(0, opts.limit) : g;
}
export function getGame(id: string): Game | undefined {
  return GAMES.find((g) => g.id === id);
}
export function getLatestGame(league?: League): Game {
  return listGames(league ? { league } : undefined)[0];
}

/** Real reported standouts for a game (variable count). */
export function getGamePerformers(game: Game): GamePerformer[] {
  return game.performers;
}

/** Games a player was a reported standout in (for their profile). */
export function getPlayerGames(playerId: string): Game[] {
  return listGames().filter((g) => g.performers.some((p) => p.playerId === playerId));
}

/* ---------------- Standings ---------------- */
export function getConferences(league: League): string[] {
  return Array.from(new Set(getTeams(league).map((t) => t.conference)));
}

export function getStandings(league: League, conference?: string): StandingRow[] {
  let teams = getTeams(league);
  if (conference) teams = teams.filter((t) => t.conference === conference);
  const sorted = [...teams].sort(
    (a, b) => b.wins / (b.wins + b.losses) - a.wins / (a.wins + a.losses)
  );
  const top = sorted[0];
  return sorted.map((team, i) => ({
    rank: i + 1,
    team,
    wins: team.wins,
    losses: team.losses,
    pct: team.wins / (team.wins + team.losses),
    gb: top ? (top.wins - team.wins + (team.losses - top.losses)) / 2 : 0,
  }));
}

/* ---------------- Leaders ---------------- */
export function getSeasonLeaders(
  category: StatCategory,
  opts?: { league?: League; limit?: number }
): SeasonLeader[] {
  const rows = rankedLeaders(category, opts?.league);
  return opts?.limit ? rows.slice(0, opts.limit) : rows;
}

/* ---------------- Misc ---------------- */
export function getSiteStats() {
  return {
    games: GAMES.length,
    players: PLAYERS.length,
    teams: TEAMS.length,
    leagues: LEAGUES.length,
  };
}
