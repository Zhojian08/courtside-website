import "server-only";
import { dataset, genPlayerLog } from "./generate";
import { TEAMS, TEAMS_BY_ID } from "./teams";
import {
  performerPhoto,
  readOverrides,
  type OverrideStore,
} from "./overrides";
import type {
  BoxEntry,
  Game,
  League,
  PerformerLeader,
  Player,
  SeasonLeader,
  StandingRow,
  StatCategory,
  Team,
} from "./types";

export type { Game, Player, Team, PerformerLeader, SeasonLeader, StandingRow, BoxEntry, League, StatCategory };

/* ============================================================
 *  ADAPTER BOUNDARY
 *  ---------------------------------------------------------
 *  Everything below reads from the deterministic sample
 *  dataset. To go live, replace the bodies of these functions
 *  with `fetch(`${process.env.COURTSIDE_API_URL}/...`)` calls
 *  (Courtside Live exposes a private /api — add a read token).
 *  Keep the return shapes identical and the whole site works.
 * ============================================================ */

function withPhoto(p: Player, store: OverrideStore): Player {
  const url = store.players[p.id];
  return url ? { ...p, photoUrl: url } : p;
}

const CATS: StatCategory[] = ["PTS", "REB", "AST", "BLK", "STL"];
const STAT_OF: Record<StatCategory, keyof BoxEntry> = {
  PTS: "pts",
  REB: "reb",
  AST: "ast",
  BLK: "blk",
  STL: "stl",
};
const AVG_OF: Record<StatCategory, keyof Player> = {
  PTS: "ppg",
  REB: "rpg",
  AST: "apg",
  BLK: "bpg",
  STL: "spg",
};

export const CATEGORY_LABEL: Record<StatCategory, string> = {
  PTS: "Points",
  REB: "Rebounds",
  AST: "Assists",
  BLK: "Blocks",
  STL: "Steals",
};

/* ---------------- Teams ---------------- */
export function getTeam(id: string): Team | undefined {
  return TEAMS_BY_ID[id];
}
export function getTeams(league?: League): Team[] {
  return league ? TEAMS.filter((t) => t.league === league) : TEAMS;
}

export async function getRoster(teamId: string): Promise<Player[]> {
  const { playersByTeam } = dataset();
  const store = await readOverrides();
  return (playersByTeam.get(teamId) ?? [])
    .map((p) => withPhoto(p, store))
    .sort((a, b) => b.ppg - a.ppg);
}

/* ---------------- Players ---------------- */
export async function getPlayer(id: string): Promise<Player | undefined> {
  const { players } = dataset();
  const store = await readOverrides();
  const p = players.find((x) => x.id === id);
  return p ? withPhoto(p, store) : undefined;
}

export function getPlayerLog(player: Player) {
  return genPlayerLog(player, 8);
}

/* ---------------- Games ---------------- */
export function listGames(opts?: { league?: League; limit?: number }): Game[] {
  const { games } = dataset();
  let g = games;
  if (opts?.league) g = g.filter((x) => x.league === opts.league);
  return opts?.limit ? g.slice(0, opts.limit) : g;
}

export function getGame(id: string): Game | undefined {
  return dataset().games.find((g) => g.id === id);
}

export function getLatestGame(league?: League): Game {
  return listGames(league ? { league } : undefined)[0];
}

export async function getBoxPlayer(playerId: string): Promise<Player | undefined> {
  return getPlayer(playerId);
}

/** Player-of-the-game card data for a game. */
export async function getPlayerOfGame(game: Game) {
  const store = await readOverrides();
  const line = game.box.find((b) => b.playerId === game.playerOfGameId)!;
  const player = (await getPlayer(game.playerOfGameId))!;
  const team = getTeam(player.teamId)!;
  const photoUrl = performerPhoto(store, game.id, "POG", player.id);
  return { player: { ...player, photoUrl: photoUrl ?? player.photoUrl }, team, line, photoUrl };
}

/** The 5 statistical leaders (PTS/REB/AST/BLK/STL) within a game. */
export async function getGamePerformers(game: Game): Promise<PerformerLeader[]> {
  const store = await readOverrides();
  const { players } = dataset();
  const find = (id: string) => players.find((p) => p.id === id)!;

  return CATS.map((category) => {
    const key = STAT_OF[category];
    let best = game.box[0];
    for (const row of game.box) {
      if ((row[key] as number) > (best[key] as number)) best = row;
    }
    const player = find(best.playerId);
    const team = getTeam(player.teamId)!;
    const photoUrl = performerPhoto(store, game.id, category, player.id);
    return {
      category,
      player: { ...player, photoUrl: photoUrl ?? player.photoUrl },
      team,
      value: best[key] as number,
      line: best,
      photoUrl,
    } satisfies PerformerLeader;
  });
}

/* ---------------- Season leaders ---------------- */
export async function getSeasonLeaders(
  category: StatCategory,
  opts?: { league?: League; limit?: number }
): Promise<SeasonLeader[]> {
  const { players } = dataset();
  const store = await readOverrides();
  const key = AVG_OF[category];
  let pool = players;
  if (opts?.league) pool = pool.filter((p) => p.league === opts.league);
  return [...pool]
    .sort((a, b) => (b[key] as number) - (a[key] as number))
    .slice(0, opts?.limit ?? 10)
    .map((p, i) => ({
      rank: i + 1,
      player: withPhoto(p, store),
      team: getTeam(p.teamId)!,
      value: p[key] as number,
    }));
}

/* ---------------- Standings ---------------- */
function streakFor(team: Team): string {
  // deterministic pseudo-streak from record
  const n = ((team.wins * 7 + team.losses * 3) % 5) + 1;
  return team.wins >= team.losses ? `W${n}` : `L${n}`;
}

export function getStandings(league: League, conference?: string): StandingRow[] {
  let teams = TEAMS.filter((t) => t.league === league);
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
    gb: ((top.wins - team.wins) + (team.losses - top.losses)) / 2,
    streak: streakFor(team),
  }));
}

export function getConferences(league: League): string[] {
  return Array.from(new Set(TEAMS.filter((t) => t.league === league).map((t) => t.conference)));
}

/* ---------------- Home / misc ---------------- */
export function getSiteStats() {
  const { players, games } = dataset();
  return {
    teams: TEAMS.length,
    players: players.length,
    games: games.length,
    leagues: new Set(TEAMS.map((t) => t.league)).size,
  };
}
