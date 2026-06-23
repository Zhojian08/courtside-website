import "server-only";
import type { Game, GamePerformer, GameStatus, GameWithTeams, Player, Team } from "./types";

export type { GameWithTeams };

/**
 * WEXME = your courtside-live main system, read live from its public feed:
 *   GET https://courtside-live.onrender.com/api/feed/games
 * (a read-only summary of every game — scheduled / live / final — with scores
 * and top scorers, cached 3s on courtside-live's side).
 *
 * The site re-reads on every request and the home Live board polls
 * /api/wexme/live, so live scores update in near real-time. No database
 * credentials needed — it just reads your system's public endpoint.
 */

const MAIN = "https://courtside-live.onrender.com";
const FEED = `${MAIN}/api/feed/games`;

interface FeedTeam {
  name: string;
  abbr: string;
  color: string;
  score: number;
}
interface FeedGame {
  code: string;
  title: string;
  league: string;
  venue: string;
  status: string; // setup | live | final
  scheduledAt: string;
  period: string | null;
  home: FeedTeam | null;
  away: FeedTeam | null;
  performers: { name: string; teamAbbr: string; pts: number }[];
}

function darken(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return "#0b1f4d";
  const num = parseInt(m[1], 16);
  const r = (((num >> 16) & 255) * 0.45) | 0;
  const g = (((num >> 8) & 255) * 0.45) | 0;
  const b = ((num & 255) * 0.45) | 0;
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function mapStatus(v: string): GameStatus {
  if (v === "live") return "live";
  if (v === "final") return "final";
  return "scheduled";
}

function teamOf(code: string, side: "home" | "away", t: FeedTeam): Team {
  const color = t.color || "#2f7dff";
  return {
    id: `wx-${code}-${side}`,
    league: "WEXME",
    city: "",
    name: t.name,
    abbr: t.abbr || t.name.slice(0, 3).toUpperCase(),
    conference: "WEXME",
    primary: color,
    secondary: darken(color),
    wins: 0,
    losses: 0,
    source: MAIN,
  };
}

function mapGame(fg: FeedGame): GameWithTeams | null {
  if (!fg.home || !fg.away) return null;
  const home = teamOf(fg.code, "home", fg.home);
  const away = teamOf(fg.code, "away", fg.away);
  const status = mapStatus(fg.status);
  const performers: GamePerformer[] = (fg.performers || []).map((p) => ({
    name: p.name,
    teamAbbr: p.teamAbbr,
    category: "PTS",
    value: p.pts,
    detail: `${p.pts} PTS`,
  }));
  const game: Game = {
    id: fg.code,
    league: "WEXME",
    date: (fg.scheduledAt || "").slice(0, 10),
    homeTeamId: home.id,
    awayTeamId: away.id,
    homeScore: fg.home.score,
    awayScore: fg.away.score,
    venue: fg.venue || "",
    series: fg.league || undefined,
    headline: fg.title || `${away.name} vs ${home.name}`,
    recap: "",
    source: `${MAIN}/board/${fg.code}`,
    performers,
    status,
    startsAt: fg.scheduledAt || undefined,
    period: status === "live" ? fg.period || undefined : undefined,
  };
  return { game, home, away };
}

async function fetchFeed(): Promise<GameWithTeams[]> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(FEED, { signal: ctrl.signal, cache: "no-store" });
    clearTimeout(timer);
    if (!res.ok) return [];
    const data = (await res.json()) as { games?: FeedGame[] };
    return (data.games ?? []).map(mapGame).filter((x): x is GameWithTeams => x !== null);
  } catch {
    // courtside-live unreachable (e.g. free-tier cold start) → publish nothing
    return [];
  }
}

export async function getWexmeFeed(): Promise<{
  live: GameWithTeams[];
  scheduled: GameWithTeams[];
  final: GameWithTeams[];
}> {
  const all = await fetchFeed();
  const live = all.filter((m) => m.game.status === "live");
  const scheduled = all
    .filter((m) => m.game.status === "scheduled")
    .sort((a, b) => (a.game.startsAt ?? "").localeCompare(b.game.startsAt ?? ""));
  const final = all
    .filter((m) => m.game.status === "final")
    .sort((a, b) => (b.game.startsAt ?? b.game.date).localeCompare(a.game.startsAt ?? a.game.date));
  return { live, scheduled, final };
}

export async function getWexmeGameDetail(code: string): Promise<GameWithTeams | null> {
  const all = await fetchFeed();
  return all.find((m) => m.game.id === code) ?? null;
}

/* courtside-live teams are per-game, so there's no global team/roster page. */
export async function getWexmeTeam(): Promise<Team | null> {
  return null;
}
export async function getWexmeRoster(): Promise<Player[]> {
  return [];
}
