import "server-only";
import { createClient, type Client, type InValue } from "@libsql/client";
import type { Game, GamePerformer, GameStatus, GameWithTeams, Player, Team } from "./types";

export type { GameWithTeams };

/**
 * WEXME = your courtside-live main system, read live from its Turso database.
 *
 * courtside-live's real schema (server/db.js):
 *   games(public_code, title, league, venue, status[setup|live|final],
 *         period, period_label, game_clock_ms, scheduled_at, created_at, accent_color)
 *   teams(game_id, side[home|away], name, abbreviation, color, score)
 *   players(team_id, name, fgm, tpm, ftm, ...)  // pts = 2*fgm + tpm + ftm
 *
 * The site re-reads on every request (dynamic) and the home Live board polls
 * /api/wexme/live, so live scores update in near real-time. Reads are resilient:
 * if courtside-live hasn't created its tables in this DB yet, we return empty.
 */

const MAIN = "https://courtside-live.onrender.com";

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

function abbr(name: string, given?: unknown): string {
  const g = s(given).trim();
  if (g) return g.toUpperCase();
  return name.replace(/[^a-zA-Z ]/g, "").split(/\s+/).map((w) => w[0] ?? "").join("").slice(0, 3).toUpperCase() || name.slice(0, 3).toUpperCase();
}

function darken(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return "#0b1f4d";
  const num = parseInt(m[1], 16);
  const r = Math.max(0, ((num >> 16) & 255) * 0.45) | 0;
  const g = Math.max(0, ((num >> 8) & 255) * 0.45) | 0;
  const b = Math.max(0, (num & 255) * 0.45) | 0;
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function teamFromRow(r: Record<string, unknown>, accent: string): Team {
  const name = s(r.name);
  const color = s(r.color) || accent || "#2f7dff";
  return {
    id: `wx-team-${s(r.id)}`,
    league: "WEXME",
    city: "",
    name,
    abbr: abbr(name, r.abbreviation),
    conference: "WEXME",
    primary: color,
    secondary: darken(color),
    wins: 0,
    losses: 0,
    source: MAIN,
  };
}

function mapStatus(v: string): GameStatus {
  if (v === "live") return "live";
  if (v === "final") return "final";
  return "scheduled"; // 'setup' and anything else
}

function periodString(r: Record<string, unknown>): string | undefined {
  if (s(r.status) !== "live") return undefined;
  const label = s(r.period_label) || "Quarter";
  const init = label[0]?.toUpperCase() ?? "Q";
  const ms = n(r.game_clock_ms);
  const total = Math.floor(ms / 1000);
  const mm = Math.floor(total / 60);
  const ss = String(total % 60).padStart(2, "0");
  return `${init}${n(r.period) || 1} · ${mm}:${ss}`;
}

function buildGame(
  gameRow: Record<string, unknown>,
  teamRows: Record<string, unknown>[],
  playerRows: Record<string, unknown>[]
): GameWithTeams | null {
  const accent = s(gameRow.accent_color) || "#2f7dff";
  const home = teamRows.find((t) => s(t.side) === "home");
  const away = teamRows.find((t) => s(t.side) === "away");
  if (!home || !away) return null;

  const homeTeam = teamFromRow(home, accent);
  const awayTeam = teamFromRow(away, accent);
  const status = mapStatus(s(gameRow.status));

  // top scorers (both teams) for live/final games
  const teamSideAbbr = new Map<string, string>([
    [s(home.id), homeTeam.abbr],
    [s(away.id), awayTeam.abbr],
  ]);
  let performers: GamePerformer[] = [];
  if (status !== "scheduled") {
    performers = playerRows
      .map((p) => {
        const pts = 2 * n(p.fgm) + n(p.tpm) + n(p.ftm);
        return { name: s(p.name), teamAbbr: teamSideAbbr.get(s(p.team_id)) ?? "", pts };
      })
      .filter((p) => p.pts > 0 && p.name)
      .sort((a, b) => b.pts - a.pts)
      .slice(0, 3)
      .map((p) => ({ name: p.name, teamAbbr: p.teamAbbr, category: "PTS" as const, value: p.pts, detail: `${p.pts} PTS` }));
  }

  const when = s(gameRow.scheduled_at) || s(gameRow.created_at);
  const code = s(gameRow.public_code);

  const game: Game = {
    id: code || `wx-${s(gameRow.id)}`,
    league: "WEXME",
    date: when.slice(0, 10),
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeScore: n(home.score),
    awayScore: n(away.score),
    venue: s(gameRow.venue),
    series: s(gameRow.league) || undefined,
    headline: s(gameRow.title) || `${awayTeam.name} vs ${homeTeam.name}`,
    recap: "",
    source: code ? `${MAIN}/board/${code}` : MAIN,
    performers,
    status,
    startsAt: when || undefined,
    period: periodString(gameRow),
  };
  return { game, home: homeTeam, away: awayTeam };
}

async function loadGames(where: string, args: InValue[] = []): Promise<GameWithTeams[]> {
  const db = client();
  if (!db) return [];
  try {
    const gamesRes = await db.execute({ sql: `SELECT * FROM games ${where}`, args });
    const games = gamesRes.rows as unknown as Record<string, unknown>[];
    if (games.length === 0) return [];
    const gameIds = games.map((g) => g.id) as InValue[];

    const ph = gameIds.map(() => "?").join(",");
    const teamsRes = await db.execute({ sql: `SELECT * FROM teams WHERE game_id IN (${ph})`, args: gameIds });
    const teams = teamsRes.rows as unknown as Record<string, unknown>[];
    const teamsByGame = new Map<string, Record<string, unknown>[]>();
    const teamIds: InValue[] = [];
    for (const t of teams) {
      teamIds.push(t.id as InValue);
      const k = s(t.game_id);
      (teamsByGame.get(k) ?? teamsByGame.set(k, []).get(k)!).push(t);
    }

    const playersByTeam = new Map<string, Record<string, unknown>[]>();
    if (teamIds.length) {
      const tph = teamIds.map(() => "?").join(",");
      const pRes = await db.execute({ sql: `SELECT team_id, name, fgm, tpm, ftm FROM players WHERE team_id IN (${tph})`, args: teamIds });
      for (const p of pRes.rows as unknown as Record<string, unknown>[]) {
        const k = s(p.team_id);
        (playersByTeam.get(k) ?? playersByTeam.set(k, []).get(k)!).push(p);
      }
    }

    const out: GameWithTeams[] = [];
    for (const g of games) {
      const tr = teamsByGame.get(s(g.id)) ?? [];
      const pr = tr.flatMap((t) => playersByTeam.get(s(t.id)) ?? []);
      const built = buildGame(g, tr, pr);
      if (built) out.push(built);
    }
    return out;
  } catch {
    // courtside-live hasn't created its tables in this DB yet → publish nothing
    return [];
  }
}

export async function getWexmeFeed(): Promise<{
  live: GameWithTeams[];
  scheduled: GameWithTeams[];
  final: GameWithTeams[];
}> {
  const all = await loadGames("");
  const live = all.filter((m) => m.game.status === "live")
    .sort((a, b) => (a.game.startsAt ?? "").localeCompare(b.game.startsAt ?? ""));
  const scheduled = all.filter((m) => m.game.status === "scheduled")
    .sort((a, b) => (a.game.startsAt ?? "").localeCompare(b.game.startsAt ?? ""));
  const final = all.filter((m) => m.game.status === "final")
    .sort((a, b) => (b.game.startsAt ?? b.game.date).localeCompare(a.game.startsAt ?? a.game.date));
  return { live, scheduled, final };
}

export async function getWexmeGameDetail(code: string): Promise<GameWithTeams | null> {
  const games = await loadGames("WHERE public_code = ?", [code]);
  return games[0] ?? null;
}

/* courtside-live teams are per-game, so there's no global team/roster page. */
export async function getWexmeTeam(): Promise<Team | null> {
  return null;
}
export async function getWexmeRoster(): Promise<Player[]> {
  return [];
}
