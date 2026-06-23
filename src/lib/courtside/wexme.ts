import "server-only";
import { createClient, type Client } from "@libsql/client";
import type { Game, GamePerformer, GameStatus, GameWithTeams, Player, Team } from "./types";

export type { GameWithTeams };

/**
 * WEXME = your main system's live data, read directly from your Turso database.
 * The website re-reads on every request (dynamic) so it stays in sync; the
 * home Live board also polls /api/wexme/live for second-by-second updates.
 *
 * Requires env: TURSO_DATABASE_URL, TURSO_AUTH_TOKEN (set in .env.local locally
 * and in your Vercel project settings for production).
 */

const SOURCE = "https://courtside-live.onrender.com";

let _client: Client | null = null;
function client(): Client | null {
  if (_client) return _client;
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) return null;
  _client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return _client;
}

const n = (v: unknown) => Number(v ?? 0);
const s = (v: unknown) => (v == null ? "" : String(v));

function mapTeam(r: Record<string, unknown>): Team {
  return {
    id: s(r.id),
    league: "WEXME",
    city: s(r.city),
    name: s(r.name),
    abbr: s(r.abbr),
    conference: "WEXME",
    primary: s(r.primary_color) || "#2f7dff",
    secondary: s(r.secondary_color) || "#0b46d8",
    wins: n(r.wins),
    losses: n(r.losses),
    source: SOURCE,
  };
}

function headlineFor(g: Game, home: Team, away: Team): string {
  if (g.headline) return g.headline;
  if (g.status === "final") {
    const winner = g.homeScore > g.awayScore ? home : away;
    const loser = g.homeScore > g.awayScore ? away : home;
    const ws = Math.max(g.homeScore, g.awayScore);
    const ls = Math.min(g.homeScore, g.awayScore);
    return `${winner.name} def. ${loser.name}, ${ws}–${ls}`;
  }
  return `${away.name} vs ${home.name}`;
}

async function teamMap(): Promise<Map<string, Team>> {
  const db = client();
  if (!db) return new Map();
  const res = await db.execute("SELECT * FROM wexme_teams");
  return new Map(res.rows.map((r) => [s(r.id), mapTeam(r as Record<string, unknown>)]));
}

async function performersFor(gameIds: string[]): Promise<Map<string, GamePerformer[]>> {
  const db = client();
  const out = new Map<string, GamePerformer[]>();
  if (!db || gameIds.length === 0) return out;
  const placeholders = gameIds.map(() => "?").join(",");
  const res = await db.execute({
    sql: `SELECT * FROM wexme_performers WHERE game_id IN (${placeholders})`,
    args: gameIds,
  });
  for (const r of res.rows) {
    const gid = s(r.game_id);
    const arr = out.get(gid) ?? [];
    arr.push({
      playerId: r.player_id ? s(r.player_id) : undefined,
      name: s(r.name),
      teamAbbr: s(r.team_abbr),
      category: (s(r.category) || "PTS") as GamePerformer["category"],
      value: n(r.value),
      detail: r.detail ? s(r.detail) : undefined,
    });
  }
  return out;
}

function mapGameRow(r: Record<string, unknown>, perf: GamePerformer[], teams: Map<string, Team>): GameWithTeams | null {
  const home = teams.get(s(r.home_team_id));
  const away = teams.get(s(r.away_team_id));
  if (!home || !away) return null;
  const game: Game = {
    id: s(r.id),
    league: "WEXME",
    date: s(r.date),
    homeTeamId: s(r.home_team_id),
    awayTeamId: s(r.away_team_id),
    homeScore: n(r.home_score),
    awayScore: n(r.away_score),
    venue: s(r.venue),
    headline: s(r.headline),
    recap: s(r.recap),
    source: SOURCE,
    performers: perf,
    status: (s(r.status) || "scheduled") as GameStatus,
    startsAt: r.starts_at ? s(r.starts_at) : undefined,
    period: r.period ? s(r.period) : undefined,
  };
  game.headline = headlineFor(game, home, away);
  return { game, home, away };
}

/** All WEXME games grouped by status (live / scheduled / final). */
export async function getWexmeFeed(): Promise<{
  live: GameWithTeams[];
  scheduled: GameWithTeams[];
  final: GameWithTeams[];
}> {
  const db = client();
  if (!db) return { live: [], scheduled: [], final: [] };
  const [rowsRes, teams] = await Promise.all([
    db.execute("SELECT * FROM wexme_games"),
    teamMap(),
  ]);
  const rows = rowsRes.rows as unknown as Record<string, unknown>[];
  const perfMap = await performersFor(rows.map((r) => s(r.id)));
  const mapped = rows
    .map((r) => mapGameRow(r, perfMap.get(s(r.id)) ?? [], teams))
    .filter((x): x is GameWithTeams => x !== null);

  const live = mapped.filter((m) => m.game.status === "live")
    .sort((a, b) => (a.game.startsAt ?? "").localeCompare(b.game.startsAt ?? ""));
  const scheduled = mapped.filter((m) => m.game.status === "scheduled")
    .sort((a, b) => (a.game.startsAt ?? "").localeCompare(b.game.startsAt ?? ""));
  const final = mapped.filter((m) => m.game.status === "final")
    .sort((a, b) => b.game.date.localeCompare(a.game.date));
  return { live, scheduled, final };
}

export async function getWexmeGameDetail(id: string): Promise<GameWithTeams | null> {
  const db = client();
  if (!db) return null;
  const res = await db.execute({ sql: "SELECT * FROM wexme_games WHERE id = ?", args: [id] });
  if (res.rows.length === 0) return null;
  const teams = await teamMap();
  const perf = await performersFor([id]);
  return mapGameRow(res.rows[0] as Record<string, unknown>, perf.get(id) ?? [], teams);
}

export async function getWexmeTeam(id: string): Promise<Team | null> {
  return (await teamMap()).get(id) ?? null;
}

export async function getWexmeRoster(teamId: string): Promise<Player[]> {
  const db = client();
  if (!db) return [];
  const res = await db.execute({ sql: "SELECT * FROM wexme_players WHERE team_id = ?", args: [teamId] });
  return res.rows.map((r) => ({
    id: s(r.id),
    teamId: s(r.team_id),
    league: "WEXME" as const,
    name: s(r.name),
    number: r.number != null ? n(r.number) : undefined,
    position: r.position ? s(r.position) : undefined,
    photoUrl: null,
    stats: {
      ppg: r.ppg != null ? n(r.ppg) : undefined,
      rpg: r.rpg != null ? n(r.rpg) : undefined,
      apg: r.apg != null ? n(r.apg) : undefined,
    },
    statContext: "WEXME · season averages",
    source: SOURCE,
  }));
}
