import "server-only";
import { cache } from "react";
import type { Row } from "@libsql/client";
import { wexmeDb } from "./db";
import type {
  Game,
  GamePerformer,
  GameStatus,
  GameWithTeams,
  League,
  Player,
  SeasonLeader,
  StandingRow,
  StatCategory,
  Team,
} from "./types";

export type { GameWithTeams };

/**
 * WEXME = your Courtside Live main system. The whole site reads it here.
 *
 * Primary source: the **shared Turso database** the main system writes to
 * (set TURSO_DATABASE_URL / TURSO_AUTH_TOKEN to the same DB the Render service
 * uses). We read its games/teams/players tables directly and derive everything
 * the website shows — games, box scores, standings, season leaders, team pages
 * and player profiles — by aggregating across games.
 *
 * Fallback: if no DB is configured, the DB is empty, or a read fails, we read
 * the main system's public HTTP feed (GET /api/feed/games) instead, so the site
 * always shows whatever is live. Both sources produce the same normalized model.
 */

const MAIN = "https://courtside-live.onrender.com";
const FEED = `${MAIN}/api/feed/games`;
const LEAGUE: League = "WEXME";

/* ----------------------------- normalized model ---------------------------- */

interface RawPlayer {
  name: string;
  jersey: string;
  position: string;
  pts: number;
  fgm: number;
  fga: number;
  tpm: number;
  tpa: number;
  ftm: number;
  fta: number;
  oreb: number;
  dreb: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  pf: number;
  seconds: number;
}
interface RawTeam {
  name: string;
  abbr: string;
  color: string;
  score: number;
  players: RawPlayer[];
}
interface RawGame {
  code: string;
  title: string;
  competition: string; // the main system's per-game "league" label
  venue: string;
  status: GameStatus;
  date: string; // yyyy-mm-dd
  startsAt: string; // ISO
  period: string | null; // e.g. "Q3 · 05:41" while live
  home: RawTeam;
  away: RawTeam;
}

/* -------------------------------- helpers ---------------------------------- */

const n = (v: unknown): number => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};
const s = (v: unknown): string => (v == null ? "" : String(v));

function slug(v: string): string {
  return (
    v
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "x"
  );
}
// Identity is keyed on the slugified display name (team name, and player name
// within a team). The main system stores teams/players per game with only a
// per-game autoincrement id — there is NO stable cross-game id for a franchise
// or a person — so name-based keying is the only way to build season-level
// franchises and player profiles. Consequence: two distinct people with the
// exact same name on the same club merge into one profile, and a club that
// changes its name spelling between games splits in two. Acceptable for a single
// league; revisit if the main system ever exposes stable team/person ids.
const teamId = (name: string) => `wx-t-${slug(name)}`;
const playerId = (teamName: string, name: string) => `wx-p-${slug(teamName)}-${slug(name)}`;

function abbrOf(name: string, abbr?: string): string {
  return (abbr && abbr.trim()) || name.slice(0, 3).toUpperCase();
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

function fmtClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function mapStatus(v: string): GameStatus {
  if (v === "live") return "live";
  if (v === "final") return "final";
  return "scheduled"; // "setup" and anything else
}

function ptsOf(p: { fgm: number; tpm: number; ftm: number }): number {
  return 2 * p.fgm + p.tpm + p.ftm;
}

/* ----------------------------- source: shared DB --------------------------- */

// Defensive upper bound on a single-season read so an unexpectedly huge history
// can't pull an unbounded result set into memory on every request.
const GAMES_LIMIT = 500;
// A hung Turso read must not block the page forever — race it and fall back.
const DB_TIMEOUT_MS = 4500;

const GAME_COLS =
  "id, public_code, title, league, venue, status, period, period_label, game_clock_ms, scheduled_at, created_at";
const TEAM_COLS = "id, game_id, side, name, abbreviation, color, score";
const PLAYER_COLS =
  "team_id, name, jersey, position, fgm, fga, tpm, tpa, ftm, fta, oreb, dreb, ast, stl, blk, tov, pf, seconds_played";

/** Resolve `p` but give up after `ms`, resolving `fallback` instead (also on rejection). */
function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(fallback), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      () => {
        clearTimeout(t);
        resolve(fallback);
      }
    );
  });
}

function mapPlayerRow(r: Row): RawPlayer {
  const fgm = n(r.fgm);
  const tpm = n(r.tpm);
  const ftm = n(r.ftm);
  const oreb = n(r.oreb);
  const dreb = n(r.dreb);
  return {
    name: s(r.name),
    jersey: s(r.jersey),
    position: s(r.position),
    fgm,
    fga: n(r.fga),
    tpm,
    tpa: n(r.tpa),
    ftm,
    fta: n(r.fta),
    oreb,
    dreb,
    reb: oreb + dreb,
    ast: n(r.ast),
    stl: n(r.stl),
    blk: n(r.blk),
    tov: n(r.tov),
    pf: n(r.pf),
    seconds: n(r.seconds_played),
    pts: ptsOf({ fgm, tpm, ftm }),
  };
}

function groupPlayersByTeam(rows: Row[]): Map<number, RawPlayer[]> {
  const byTeam = new Map<number, RawPlayer[]>();
  for (const r of rows) {
    const key = n(r.team_id);
    const arr = byTeam.get(key);
    if (arr) arr.push(mapPlayerRow(r));
    else byTeam.set(key, [mapPlayerRow(r)]);
  }
  return byTeam;
}

function buildTeamSides(
  teamRows: Row[],
  playersByTeam: Map<number, RawPlayer[]>
): Map<number, Map<string, RawTeam>> {
  const teamsByGame = new Map<number, Map<string, RawTeam>>();
  for (const r of teamRows) {
    const gid = n(r.game_id);
    const name = s(r.name);
    const rt: RawTeam = {
      name,
      abbr: abbrOf(name, s(r.abbreviation)),
      color: s(r.color) || "#2f7dff",
      score: n(r.score),
      players: playersByTeam.get(n(r.id)) ?? [],
    };
    const m = teamsByGame.get(gid) ?? new Map<string, RawTeam>();
    m.set(s(r.side), rt);
    teamsByGame.set(gid, m);
  }
  return teamsByGame;
}

function mapGameRow(g: Row, sides: Map<string, RawTeam> | undefined): RawGame | null {
  const home = sides?.get("home");
  const away = sides?.get("away");
  if (!home || !away) return null;
  const status = mapStatus(s(g.status));
  const startsAt = s(g.scheduled_at) || s(g.created_at);
  const periodLabel = s(g.period_label) || "Q";
  return {
    code: s(g.public_code),
    title: s(g.title),
    competition: s(g.league),
    venue: s(g.venue),
    status,
    date: startsAt.slice(0, 10),
    startsAt,
    period:
      status === "live"
        ? `${periodLabel[0]}${n(g.period)} · ${fmtClock(n(g.game_clock_ms))}`
        : null,
    home,
    away,
  };
}

async function loadFromDb(): Promise<RawGame[] | null> {
  const db = wexmeDb();
  if (!db) return null;
  try {
    const gamesRes = await db.execute(
      `SELECT ${GAME_COLS} FROM games
         ORDER BY COALESCE(scheduled_at, created_at) DESC LIMIT ${GAMES_LIMIT}`
    );
    if (gamesRes.rows.length === 0) return null; // empty DB → let caller fall back

    // Only load teams/players for the games we actually selected (bounded set).
    const ids = gamesRes.rows.map((g) => n(g.id));
    const ph = ids.map(() => "?").join(",");
    const teamsRes = await db.execute({
      sql: `SELECT ${TEAM_COLS} FROM teams WHERE game_id IN (${ph})`,
      args: ids,
    });
    const playersRes = await db.execute({
      sql: `SELECT ${PLAYER_COLS} FROM players
              WHERE team_id IN (SELECT id FROM teams WHERE game_id IN (${ph}))`,
      args: ids,
    });

    const teamsByGame = buildTeamSides(teamsRes.rows, groupPlayersByTeam(playersRes.rows));
    const out: RawGame[] = [];
    for (const g of gamesRes.rows) {
      const rg = mapGameRow(g, teamsByGame.get(n(g.id)));
      if (rg) out.push(rg);
    }
    return out;
  } catch {
    // Table missing / unreachable / auth issue → fall back to the public feed.
    return null;
  }
}

/**
 * A single game by public code — for the detail / box-score pages, so they read
 * one game instead of scanning the whole history. Returns null (→ caller falls
 * back to the full feed) when the DB is unset, the game isn't found, or it errors.
 */
async function loadOneGameFromDb(code: string): Promise<RawGame | null> {
  const db = wexmeDb();
  if (!db) return null;
  try {
    const gRes = await db.execute({
      sql: `SELECT ${GAME_COLS} FROM games WHERE public_code = ? LIMIT 1`,
      args: [code],
    });
    const g = gRes.rows[0];
    if (!g) return null;
    const gid = n(g.id);
    const teamsRes = await db.execute({
      sql: `SELECT ${TEAM_COLS} FROM teams WHERE game_id = ?`,
      args: [gid],
    });
    const playersRes = await db.execute({
      sql: `SELECT ${PLAYER_COLS} FROM players WHERE team_id IN (SELECT id FROM teams WHERE game_id = ?)`,
      args: [gid],
    });
    const teamsByGame = buildTeamSides(teamsRes.rows, groupPlayersByTeam(playersRes.rows));
    return mapGameRow(g, teamsByGame.get(gid));
  } catch {
    return null;
  }
}

/* ----------------------------- source: HTTP feed --------------------------- */

interface FeedTeam {
  name: string;
  abbr: string;
  color: string;
  score: number;
}
interface FeedPlayer {
  name: string;
  jersey: string;
  teamAbbr: string;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  fgm: number;
  fga: number;
  tpm: number;
  tpa: number;
  ftm: number;
  fta: number;
  tov: number;
  pf: number;
}
interface FeedGame {
  code: string;
  title: string;
  league: string;
  venue: string;
  status: string;
  scheduledAt: string;
  period: string | null;
  home: FeedTeam | null;
  away: FeedTeam | null;
  players?: FeedPlayer[];
}

function feedPlayer(p: FeedPlayer): RawPlayer {
  return {
    name: s(p.name),
    jersey: s(p.jersey),
    position: "",
    pts: n(p.pts),
    fgm: n(p.fgm),
    fga: n(p.fga),
    tpm: n(p.tpm),
    tpa: n(p.tpa),
    ftm: n(p.ftm),
    fta: n(p.fta),
    oreb: 0,
    dreb: 0,
    reb: n(p.reb),
    ast: n(p.ast),
    stl: n(p.stl),
    blk: n(p.blk),
    tov: n(p.tov),
    pf: n(p.pf),
    seconds: 0,
  };
}

function feedTeam(t: FeedTeam, players: FeedPlayer[]): RawTeam {
  const abbr = abbrOf(t.name, t.abbr);
  return {
    name: t.name,
    abbr,
    color: t.color || "#2f7dff",
    score: n(t.score),
    players: players.filter((p) => s(p.teamAbbr) === abbr).map(feedPlayer),
  };
}

async function loadFromFeed(): Promise<RawGame[]> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(FEED, { signal: ctrl.signal, cache: "no-store" });
    clearTimeout(timer);
    if (!res.ok) return [];
    const data = (await res.json()) as { games?: FeedGame[] };
    const out: RawGame[] = [];
    for (const fg of data.games ?? []) {
      if (!fg.home || !fg.away) continue;
      const players = fg.players ?? [];
      const status = mapStatus(s(fg.status));
      const startsAt = s(fg.scheduledAt);
      out.push({
        code: s(fg.code),
        title: s(fg.title),
        competition: s(fg.league),
        venue: s(fg.venue),
        status,
        date: startsAt.slice(0, 10),
        startsAt,
        period: status === "live" ? fg.period || null : null,
        home: feedTeam(fg.home, players),
        away: feedTeam(fg.away, players),
      });
    }
    return out;
  } catch {
    return [];
  }
}

/**
 * All games from the main system, normalized. DB first, HTTP feed as fallback.
 * Cached per request so a single page render reads the source only once.
 */
const loadRawGames = cache(async (): Promise<RawGame[]> => {
  const fromDb = await withTimeout(loadFromDb(), DB_TIMEOUT_MS, null);
  if (fromDb && fromDb.length) return fromDb;
  return loadFromFeed();
});

/** One game by code: bounded DB read first, then the full feed as a fallback. */
const loadOneGame = cache(async (code: string): Promise<RawGame | null> => {
  const one = await withTimeout(loadOneGameFromDb(code), DB_TIMEOUT_MS, null);
  if (one) return one;
  return (await loadRawGames()).find((g) => g.code === code) ?? null;
});

/* ------------------------------- builders ---------------------------------- */

function buildTeam(rt: RawTeam): Team {
  const color = rt.color || "#2f7dff";
  return {
    id: teamId(rt.name),
    league: LEAGUE,
    city: "",
    name: rt.name,
    abbr: rt.abbr,
    conference: "WEXME",
    primary: color,
    secondary: darken(color),
    wins: 0,
    losses: 0,
    source: `${MAIN}`,
  };
}

/** Top statistical standouts of a single game → "Stars of the Game" cards. */
function performersOf(rg: RawGame): GamePerformer[] {
  if (rg.status === "scheduled") return [];
  const all = [
    ...rg.home.players.map((p) => ({ p, team: rg.home })),
    ...rg.away.players.map((p) => ({ p, team: rg.away })),
  ].filter(({ p }) => p.pts > 0 || p.reb > 0 || p.ast > 0);

  const out: GamePerformer[] = [];
  const used = new Set<string>();
  const add = (
    cat: StatCategory,
    pick: (x: { p: RawPlayer; team: RawTeam }) => number,
    detail: (p: RawPlayer) => string,
    max: number
  ) => {
    const ranked = [...all].filter((x) => pick(x) > 0).sort((a, b) => pick(b) - pick(a));
    let added = 0;
    for (const x of ranked) {
      const key = `${x.team.name}|${x.p.name}`;
      if (used.has(key)) continue;
      used.add(key);
      out.push({
        playerId: playerId(x.team.name, x.p.name),
        name: x.p.name,
        teamAbbr: x.team.abbr,
        category: cat,
        value: pick(x),
        detail: detail(x.p),
      });
      if (++added >= max) break;
    }
  };

  add("PTS", (x) => x.p.pts, (p) => `${p.pts} PTS`, 3);
  add("REB", (x) => x.p.reb, (p) => `${p.reb} REB`, 1);
  add("AST", (x) => x.p.ast, (p) => `${p.ast} AST`, 1);
  return out.slice(0, 5);
}

function toGameWithTeams(rg: RawGame): GameWithTeams {
  const home = buildTeam(rg.home);
  const away = buildTeam(rg.away);
  const game: Game = {
    id: rg.code,
    league: LEAGUE,
    date: rg.date,
    homeTeamId: home.id,
    awayTeamId: away.id,
    homeScore: rg.home.score,
    awayScore: rg.away.score,
    venue: rg.venue,
    series: rg.competition || undefined,
    headline: rg.title || `${rg.away.name} vs ${rg.home.name}`,
    recap: "",
    source: `${MAIN}/stats/${rg.code}`,
    performers: performersOf(rg),
    status: rg.status,
    startsAt: rg.startsAt || undefined,
    period: rg.status === "live" ? rg.period || undefined : undefined,
  };
  return { game, home, away };
}

/* ------------------------------ aggregation -------------------------------- */

interface PlayerAgg {
  id: string;
  teamId: string;
  teamName: string;
  teamAbbr: string;
  name: string;
  jersey: string;
  position: string;
  gp: number;
  pts: number;
  reb: number;
  ast: number;
  blk: number;
  stl: number;
  fgm: number;
  fga: number;
  tpm: number;
  tpa: number;
  ftm: number;
  fta: number;
  lastCode: string;
}
interface TeamAgg {
  id: string;
  name: string;
  abbr: string;
  color: string;
  wins: number;
  losses: number;
  playerIds: Set<string>;
  lastDate: string;
}
interface Aggregates {
  teams: Map<string, TeamAgg>;
  players: Map<string, PlayerAgg>;
}

const played = (p: RawPlayer): boolean =>
  p.seconds > 0 ||
  p.pts > 0 ||
  p.reb > 0 ||
  p.ast > 0 ||
  p.blk > 0 ||
  p.stl > 0 ||
  p.fga > 0 ||
  p.fta > 0 ||
  p.pf > 0 ||
  p.tov > 0;

const buildAggregates = cache(async (): Promise<Aggregates> => {
  const games = await loadRawGames();
  const teams = new Map<string, TeamAgg>();
  const players = new Map<string, PlayerAgg>();

  const ensureTeam = (rt: RawTeam, date: string): TeamAgg => {
    const id = teamId(rt.name);
    let ta = teams.get(id);
    if (!ta) {
      ta = {
        id,
        name: rt.name,
        abbr: rt.abbr,
        color: rt.color,
        wins: 0,
        losses: 0,
        playerIds: new Set(),
        lastDate: date,
      };
      teams.set(id, ta);
    } else if (date > ta.lastDate) {
      ta.lastDate = date;
      ta.abbr = rt.abbr;
      ta.color = rt.color;
    }
    return ta;
  };

  for (const g of games) {
    const homeT = ensureTeam(g.home, g.date);
    const awayT = ensureTeam(g.away, g.date);

    if (g.status === "final") {
      if (g.home.score > g.away.score) {
        homeT.wins++;
        awayT.losses++;
      } else if (g.away.score > g.home.score) {
        awayT.wins++;
        homeT.losses++;
      }
    }

    const hasStats = g.status === "live" || g.status === "final";
    for (const [rt, ta] of [
      [g.home, homeT],
      [g.away, awayT],
    ] as const) {
      for (const rp of rt.players) {
        const id = playerId(rt.name, rp.name);
        ta.playerIds.add(id);
        let pa = players.get(id);
        if (!pa) {
          pa = {
            id,
            teamId: ta.id,
            teamName: rt.name,
            teamAbbr: rt.abbr,
            name: rp.name,
            jersey: rp.jersey,
            position: rp.position,
            gp: 0,
            pts: 0,
            reb: 0,
            ast: 0,
            blk: 0,
            stl: 0,
            fgm: 0,
            fga: 0,
            tpm: 0,
            tpa: 0,
            ftm: 0,
            fta: 0,
            lastCode: g.code,
          };
          players.set(id, pa);
        }
        if (!pa.position && rp.position) pa.position = rp.position;
        if (hasStats && played(rp)) {
          pa.gp++;
          pa.pts += rp.pts;
          pa.reb += rp.reb;
          pa.ast += rp.ast;
          pa.blk += rp.blk;
          pa.stl += rp.stl;
          pa.fgm += rp.fgm;
          pa.fga += rp.fga;
          pa.tpm += rp.tpm;
          pa.tpa += rp.tpa;
          pa.ftm += rp.ftm;
          pa.fta += rp.fta;
          pa.lastCode = g.code;
        }
      }
    }
  }
  return { teams, players };
});

const round1 = (v: number): number => Math.round(v * 10) / 10;

function playerToProfile(pa: PlayerAgg): Player {
  const gp = Math.max(1, pa.gp);
  const stats: Player["stats"] = {};
  if (pa.gp > 0) {
    stats.ppg = round1(pa.pts / gp);
    stats.rpg = round1(pa.reb / gp);
    stats.apg = round1(pa.ast / gp);
    if (pa.blk > 0) stats.bpg = round1(pa.blk / gp);
    if (pa.stl > 0) stats.spg = round1(pa.stl / gp);
    if (pa.fga > 0) stats.fgPct = round1((pa.fgm / pa.fga) * 100);
  }
  const num = parseInt(pa.jersey, 10);
  return {
    id: pa.id,
    teamId: pa.teamId,
    league: LEAGUE,
    name: pa.name,
    number: Number.isFinite(num) ? num : undefined,
    position: pa.position || undefined,
    photoUrl: null,
    stats,
    statContext: pa.gp > 0 ? `${pa.gp} game${pa.gp === 1 ? "" : "s"} · WEXME` : "WEXME · upcoming",
    source: `${MAIN}/stats/${pa.lastCode}`,
  };
}

function teamAggToTeam(ta: TeamAgg): Team {
  const color = ta.color || "#2f7dff";
  return {
    id: ta.id,
    league: LEAGUE,
    city: "",
    name: ta.name,
    abbr: ta.abbr,
    conference: "WEXME",
    primary: color,
    secondary: darken(color),
    wins: ta.wins,
    losses: ta.losses,
    source: `${MAIN}`,
  };
}

/* --------------------------------- public API ------------------------------ */

export async function getWexmeFeed(): Promise<{
  live: GameWithTeams[];
  scheduled: GameWithTeams[];
  final: GameWithTeams[];
}> {
  const all = (await loadRawGames()).map(toGameWithTeams);
  const live = all.filter((m) => m.game.status === "live");
  const scheduled = all
    .filter((m) => m.game.status === "scheduled")
    .sort((a, b) => (a.game.startsAt ?? "").localeCompare(b.game.startsAt ?? ""));
  const final = all
    .filter((m) => m.game.status === "final")
    .sort((a, b) =>
      (b.game.startsAt ?? b.game.date).localeCompare(a.game.startsAt ?? a.game.date)
    );
  return { live, scheduled, final };
}

export async function getWexmeGameDetail(code: string): Promise<GameWithTeams | null> {
  const rg = await loadOneGame(code);
  return rg ? toGameWithTeams(rg) : null;
}

export interface BoxScoreRow {
  playerId: string;
  name: string;
  jersey: string;
  position: string;
  pts: number;
  reb: number;
  oreb: number;
  dreb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  pf: number;
  fgm: number;
  fga: number;
  tpm: number;
  tpa: number;
  ftm: number;
  fta: number;
}
export interface BoxScoreTeam {
  team: Team;
  score: number;
  rows: BoxScoreRow[];
}
export interface WexmeBoxScore {
  home: BoxScoreTeam;
  away: BoxScoreTeam;
}

function boxTeam(rt: RawTeam): BoxScoreTeam {
  const rows: BoxScoreRow[] = rt.players.map((p) => ({
    playerId: playerId(rt.name, p.name),
    name: p.name,
    jersey: p.jersey,
    position: p.position,
    pts: p.pts,
    reb: p.reb,
    oreb: p.oreb,
    dreb: p.dreb,
    ast: p.ast,
    stl: p.stl,
    blk: p.blk,
    tov: p.tov,
    pf: p.pf,
    fgm: p.fgm,
    fga: p.fga,
    tpm: p.tpm,
    tpa: p.tpa,
    ftm: p.ftm,
    fta: p.fta,
  }));
  return { team: buildTeam(rt), score: rt.score, rows };
}

export async function getWexmeBoxScore(code: string): Promise<WexmeBoxScore | null> {
  const rg = await loadOneGame(code);
  if (!rg) return null;
  // No box score for not-yet-played games.
  const hasStats = rg.status === "live" || rg.status === "final";
  if (!hasStats) return null;
  return { home: boxTeam(rg.home), away: boxTeam(rg.away) };
}

export async function getWexmeTeams(): Promise<Team[]> {
  const { teams } = await buildAggregates();
  return [...teams.values()]
    .map(teamAggToTeam)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getWexmeTeam(id: string): Promise<Team | null> {
  const { teams } = await buildAggregates();
  const ta = teams.get(id);
  return ta ? teamAggToTeam(ta) : null;
}

export async function getWexmeRoster(teamId: string): Promise<Player[]> {
  const { teams, players } = await buildAggregates();
  const ta = teams.get(teamId);
  if (!ta) return [];
  return [...ta.playerIds]
    .map((pid) => players.get(pid))
    .filter((p): p is PlayerAgg => !!p)
    .map(playerToProfile)
    .sort((a, b) => (b.stats.ppg ?? 0) - (a.stats.ppg ?? 0));
}

export async function getWexmePlayer(id: string): Promise<Player | null> {
  const { players } = await buildAggregates();
  const pa = players.get(id);
  return pa ? playerToProfile(pa) : null;
}

export async function getWexmePlayerGames(id: string): Promise<GameWithTeams[]> {
  const { players } = await buildAggregates();
  const pa = players.get(id);
  if (!pa) return [];
  const games = await loadRawGames();
  return games
    .filter((g) => {
      // Match only the side that IS this player's franchise, and require a
      // same-named player on THAT side — so a same-named opponent doesn't pull
      // an unrelated game into this player's history.
      const side =
        g.home.name === pa.teamName ? g.home : g.away.name === pa.teamName ? g.away : null;
      return !!side && side.players.some((p) => p.name === pa.name);
    })
    .map(toGameWithTeams)
    .sort((a, b) => (b.game.date ?? "").localeCompare(a.game.date ?? ""));
}

export async function getWexmeTeamGames(teamId: string): Promise<GameWithTeams[]> {
  const games = await loadRawGames();
  return games
    .filter((g) => teamId === `wx-t-${slug(g.home.name)}` || teamId === `wx-t-${slug(g.away.name)}`)
    .map(toGameWithTeams)
    .sort((a, b) => (b.game.date ?? "").localeCompare(a.game.date ?? ""));
}

export async function getWexmeStandings(): Promise<StandingRow[]> {
  const teams = await getWexmeTeams();
  const sorted = [...teams].sort((a, b) => {
    const pa = a.wins + a.losses ? a.wins / (a.wins + a.losses) : 0;
    const pb = b.wins + b.losses ? b.wins / (b.wins + b.losses) : 0;
    if (pb !== pa) return pb - pa;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.name.localeCompare(b.name);
  });
  // Games-behind is measured from the leader and never negative (teams may have
  // played a different number of games, so a raw formula could go below zero).
  const top = sorted[0];
  return sorted.map((team, i) => ({
    rank: i + 1,
    team,
    wins: team.wins,
    losses: team.losses,
    pct: team.wins + team.losses ? team.wins / (team.wins + team.losses) : 0,
    gb: top ? Math.max(0, (top.wins - team.wins + (team.losses - top.losses)) / 2) : 0,
  }));
}

const CAT_KEY: Record<StatCategory, keyof PlayerAgg> = {
  PTS: "pts",
  REB: "reb",
  AST: "ast",
  BLK: "blk",
  STL: "stl",
};

export async function getWexmeLeaders(
  category: StatCategory,
  opts?: { limit?: number }
): Promise<SeasonLeader[]> {
  const { players } = await buildAggregates();
  const key = CAT_KEY[category];
  const ranked = [...players.values()]
    .filter((p) => p.gp > 0)
    .map((p) => ({ p, avg: round1((p[key] as number) / p.gp) }))
    .filter((x) => x.avg > 0)
    .sort((a, b) => b.avg - a.avg);
  const rows: SeasonLeader[] = ranked.map((x, i) => ({
    rank: i + 1,
    name: x.p.name,
    teamAbbr: x.p.teamAbbr,
    league: LEAGUE,
    category,
    value: x.avg,
    context: `${x.p.gp} GP · WEXME`,
    playerId: x.p.id,
    source: `${MAIN}/stats/${x.p.lastCode}`,
  }));
  return opts?.limit ? rows.slice(0, opts.limit) : rows;
}

export async function getWexmeSiteStats(): Promise<{
  games: number;
  players: number;
  teams: number;
}> {
  const { teams, players } = await buildAggregates();
  const games = await loadRawGames();
  return { games: games.length, players: players.size, teams: teams.size };
}
