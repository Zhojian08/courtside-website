import type {
  BoxEntry,
  Game,
  Player,
  Position,
  Quarters,
  StatLine,
  Team,
} from "./types";
import { TEAMS } from "./teams";
import { NBA_FIRST, NBA_LAST, PBA_FIRST, PBA_LAST } from "./names";

/* ------------------------------------------------------------------ */
/*  Deterministic RNG                                                  */
/* ------------------------------------------------------------------ */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function strSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
type RNG = () => number;
const rint = (r: RNG, lo: number, hi: number) => Math.floor(r() * (hi - lo + 1)) + lo;
const rfloat = (r: RNG, lo: number, hi: number) => r() * (hi - lo) + lo;
const pick = <T>(r: RNG, arr: T[]) => arr[Math.floor(r() * arr.length)];
const gauss = (r: RNG, mean: number, sd: number) => {
  const u = Math.max(1e-9, r());
  const v = r();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};
const r1 = (x: number) => Math.round(x * 10) / 10;
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/* ------------------------------------------------------------------ */
/*  Position helpers                                                   */
/* ------------------------------------------------------------------ */
const ROSTER_POS: Position[] = [
  "PG", "SG", "SF", "PF", "C", "PG", "SG", "SF", "PF", "C", "SG", "SF",
];

const REB_W: Record<Position, number> = { PG: 0.6, SG: 0.75, SF: 1.05, PF: 1.45, C: 1.7 };
const AST_W: Record<Position, number> = { PG: 1.9, SG: 1.15, SF: 0.9, PF: 0.6, C: 0.5 };
const BLK_W: Record<Position, number> = { PG: 0.18, SG: 0.3, SF: 0.6, PF: 1.25, C: 1.9 };
const STL_W: Record<Position, number> = { PG: 1.35, SG: 1.2, SF: 1.0, PF: 0.7, C: 0.5 };

function heightFor(r: RNG, pos: Position, league: string): string {
  const base: Record<Position, [number, number]> = {
    PG: [73, 76], SG: [75, 78], SF: [78, 81], PF: [80, 82], C: [82, 85],
  };
  let [lo, hi] = base[pos];
  if (league === "PBA") { lo -= 2; hi -= 2; }
  const inches = rint(r, lo, hi);
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
}

/* ------------------------------------------------------------------ */
/*  Player generation                                                  */
/* ------------------------------------------------------------------ */
function makePlayers(team: Team): Player[] {
  const r = mulberry32(strSeed(team.id + "roster"));
  const firsts = team.league === "PBA" ? PBA_FIRST : NBA_FIRST;
  const lasts = team.league === "PBA" ? PBA_LAST : NBA_LAST;
  const scale = team.league === "PBA" ? 0.86 : 1;

  const usedNums = new Set<number>();
  const usedNames = new Set<string>();

  return ROSTER_POS.map((pos, i) => {
    // role rank: 0 = best scorer, declining down the rotation
    const rank = i;
    let name = `${pick(r, firsts)} ${pick(r, lasts)}`;
    let guard = 0;
    while (usedNames.has(name) && guard++ < 12) name = `${pick(r, firsts)} ${pick(r, lasts)}`;
    usedNames.add(name);

    let num = rint(r, 0, 55);
    while (usedNums.has(num)) num = rint(r, 0, 55);
    usedNums.add(num);

    // tuned so a 9-man rotation sums to a realistic team total (~100-125)
    const ppg = clamp(gauss(r, (21 - rank * 2.2) * scale, 1.3), team.league === "PBA" ? 2.5 : 3, 29);
    const rpg = clamp(gauss(r, (3.2 + REB_W[pos] * (4.4 - rank * 0.18)) * scale, 0.9), 1.5, 13.5);
    const apg = clamp(gauss(r, (1.6 + AST_W[pos] * (3.0 - rank * 0.12)) * scale, 0.8), 0.6, 11);
    const bpg = clamp(gauss(r, BLK_W[pos] * (0.9 - rank * 0.02) * scale, 0.25), 0.1, 3.2);
    const spg = clamp(gauss(r, STL_W[pos] * (0.9 - rank * 0.015) * scale, 0.25), 0.2, 2.6);
    const mpg = clamp(gauss(r, 34 - rank * 1.9, 2), 12, 38);

    const fgPct = clamp(gauss(r, pos === "C" ? 58 : pos === "PF" ? 53 : 47, 3), 40, 64);
    const tpPct = clamp(gauss(r, pos === "PG" || pos === "SG" ? 38 : 33, 3.5), 26, 45);
    const ftPct = clamp(gauss(r, 78 - (pos === "C" ? 8 : 0), 6), 55, 93);

    return {
      id: `${team.id}-p${i}`,
      teamId: team.id,
      league: team.league,
      name,
      number: num,
      position: pos,
      height: heightFor(r, pos, team.league),
      age: rint(r, 19, 36),
      photoUrl: null,
      ppg: r1(ppg),
      rpg: r1(rpg),
      apg: r1(apg),
      bpg: r1(bpg),
      spg: r1(spg),
      mpg: r1(mpg),
      fgPct: r1(fgPct),
      tpPct: r1(tpPct),
      ftPct: r1(ftPct),
      gamesPlayed: team.league === "PBA" ? rint(r, 8, 11) : rint(r, 44, 58),
    } satisfies Player;
  });
}

/* ------------------------------------------------------------------ */
/*  Box-score line generation (internally consistent points)          */
/* ------------------------------------------------------------------ */
function makeLine(r: RNG, p: Player, minutes: number): StatLine {
  const f = clamp(minutes / Math.max(18, p.mpg), 0.55, 1.3);
  // cap a single player's outing so a hot-shooting roll can't balloon team totals
  const cap = p.ppg * 1.8 + 8;
  const ptsExp = clamp(gauss(r, p.ppg * f, p.ppg * 0.2 + 1.4), 0, cap);

  // free throws first
  const ftm = clamp(Math.round(gauss(r, ptsExp * 0.16, 1.5)), 0, 14);
  const fta = ftm + (ftm > 0 ? rint(r, 0, 3) : rint(r, 0, 1));

  // threes
  const tpm = clamp(Math.round(gauss(r, (ptsExp * (p.tpPct > 35 ? 0.26 : 0.16)) / 3, 1.1)), 0, 9);
  // remaining points from two-point makes
  const remaining = Math.max(0, ptsExp - ftm - tpm * 3);
  const twoMade = Math.max(0, Math.round(remaining / 2));
  const fgm = twoMade + tpm;

  const pts = 2 * fgm + tpm + ftm;

  const fga = Math.max(fgm, Math.round(fgm / clamp(p.fgPct / 100, 0.38, 0.65)) + rint(r, 0, 2));
  const tpa = clamp(
    Math.max(tpm, Math.round(tpm / clamp(p.tpPct / 100, 0.27, 0.45)) + rint(r, 0, 2)),
    tpm,
    fga
  );

  const reb = clamp(Math.round(gauss(r, p.rpg * f, p.rpg * 0.35 + 1)), 0, 22);
  const ast = clamp(Math.round(gauss(r, p.apg * f, p.apg * 0.35 + 1)), 0, 18);
  const blk = clamp(Math.round(gauss(r, p.bpg * f, p.bpg * 0.6 + 0.4)), 0, 8);
  const stl = clamp(Math.round(gauss(r, p.spg * f, p.spg * 0.6 + 0.4)), 0, 8);
  const tov = clamp(Math.round(gauss(r, 1.6 * f, 1)), 0, 7);
  const pf = clamp(Math.round(gauss(r, 2.1, 1)), 0, 6);

  return { min: minutes, pts, reb, ast, blk, stl, tov, pf, fgm, fga, tpm, tpa, ftm, fta };
}

function teamBox(r: RNG, players: Player[]): BoxEntry[] {
  // rotation of 9
  const rotation = [...players].sort((a, b) => b.mpg - a.mpg).slice(0, 9);
  // minutes: 5 starters ~ 30-37, bench ~ 14-22, total ~ 240
  const starterMin = [37, 35, 34, 32, 30];
  const benchMin = [22, 20, 17, 13];
  const rows: BoxEntry[] = rotation.map((p, idx) => {
    const isStarter = idx < 5;
    const base = isStarter ? starterMin[idx] : benchMin[idx - 5];
    const minutes = clamp(Math.round(base + gauss(r, 0, 2)), 8, 40);
    return { playerId: p.id, starter: isStarter, ...makeLine(r, p, minutes) };
  });

  // keep team totals in a believable band by scaling makes (percentages preserved)
  const total = rows.reduce((a, b) => a + b.pts, 0);
  const target = clamp(total, 88, 134);
  if (target !== total && total > 0) {
    const k = target / total;
    for (const row of rows) {
      row.fgm = Math.round(row.fgm * k);
      row.tpm = Math.min(row.fgm, Math.round(row.tpm * k));
      row.ftm = Math.round(row.ftm * k);
      row.fga = Math.max(row.fgm, Math.round(row.fga * k));
      row.tpa = clamp(Math.round(row.tpa * k), row.tpm, row.fga);
      row.fta = Math.max(row.ftm, Math.round(row.fta * k));
      row.pts = 2 * row.fgm + row.tpm + row.ftm;
    }
  }
  return rows;
}

function splitQuarters(r: RNG, total: number): Quarters {
  const w = [rfloat(r, 0.9, 1.1), rfloat(r, 0.9, 1.1), rfloat(r, 0.9, 1.1), rfloat(r, 0.9, 1.1)];
  const s = w.reduce((a, b) => a + b, 0);
  const q1 = Math.round((total * w[0]) / s);
  const q2 = Math.round((total * w[1]) / s);
  const q3 = Math.round((total * w[2]) / s);
  const q4 = total - q1 - q2 - q3;
  return { q1, q2, q3, q4, ot: 0 };
}

function gameScore(l: StatLine): number {
  return (
    l.pts +
    0.4 * l.fgm -
    0.7 * l.fga -
    0.4 * (l.fta - l.ftm) +
    0.7 * l.reb +
    0.7 * l.ast +
    l.stl +
    0.7 * l.blk -
    0.4 * l.pf -
    l.tov
  );
}

const ARENAS: Record<string, string> = {
  "nba-bos": "TD Garden",
  "nba-nyk": "Madison Square Garden",
  "nba-lal": "Crypto.com Arena",
  "nba-gsw": "Chase Center",
  "nba-den": "Ball Arena",
  "nba-okc": "Paycom Center",
  "pba-gin": "Smart Araneta Coliseum",
  "pba-smb": "Mall of Asia Arena",
  "pba-tnt": "PhilSports Arena",
};

function buildGame(idx: number, home: Team, away: Team, dateISO: string, playersByTeam: Map<string, Player[]>): Game {
  const r = mulberry32(strSeed(`${home.id}-${away.id}-${idx}`));
  const homePlayers = playersByTeam.get(home.id)!;
  const awayPlayers = playersByTeam.get(away.id)!;

  const homeRows = teamBox(r, homePlayers);
  const awayRows = teamBox(r, awayPlayers);

  let homeScore = homeRows.reduce((a, b) => a + b.pts, 0);
  let awayScore = awayRows.reduce((a, b) => a + b.pts, 0);

  // break ties by giving the home crowd a late dagger
  if (homeScore === awayScore) {
    const top = homeRows.reduce((m, x) => (x.pts > m.pts ? x : m), homeRows[0]);
    top.pts += 3; top.fgm += 1; top.tpm += 1; top.fga += 1; top.tpa += 1;
    homeScore += 3;
  }

  const box = [...homeRows, ...awayRows];
  const homeWon = homeScore > awayScore;

  // player of the game — best game score, biased toward the winner
  let pog = box[0];
  let best = -Infinity;
  for (const row of box) {
    const onHome = homeRows.includes(row);
    const score = gameScore(row) + (onHome === homeWon ? 3 : 0);
    if (score > best) { best = score; pog = row; }
  }

  const allPlayers = [...homePlayers, ...awayPlayers];
  const pogPlayer = allPlayers.find((p) => p.id === pog.playerId)!;

  const winner = homeWon ? home : away;
  const loser = homeWon ? away : home;
  const ws = Math.max(homeScore, awayScore);
  const ls = Math.min(homeScore, awayScore);
  const margin = ws - ls;
  const verb =
    margin <= 4 ? "edge" : margin <= 9 ? "hold off" : margin <= 18 ? "pull away from" : "rout";

  const topScorer = box.reduce((m, x) => (x.pts > m.pts ? x : m), box[0]);
  const topScorerP = allPlayers.find((p) => p.id === topScorer.playerId)!;

  const headline = `${winner.name} ${verb} ${loser.name}, ${ws}–${ls}`;
  const recap =
    `${pogPlayer.name} powered ${winner.city} ${winner.name} past the ${loser.name} ` +
    `with ${pog.pts} points, ${pog.reb} rebounds and ${pog.ast} assists. ` +
    `${topScorerP.name} led all scorers with ${topScorer.pts}. ` +
    (margin <= 6
      ? `It came down to the wire before ${winner.name} sealed it in the fourth.`
      : `${winner.name} controlled the tempo from the opening tip.`);

  return {
    id: `g${idx + 1}-${home.abbr}-${away.abbr}`.toLowerCase(),
    league: home.league,
    date: dateISO,
    homeTeamId: home.id,
    awayTeamId: away.id,
    homeScore,
    awayScore,
    homeLine: splitQuarters(r, homeScore),
    awayLine: splitQuarters(r, awayScore),
    venue: ARENAS[home.id] ?? `${home.city} Arena`,
    attendance: rint(r, home.league === "PBA" ? 6000 : 14000, home.league === "PBA" ? 15000 : 20800),
    box,
    playerOfGameId: pog.playerId,
    headline,
    recap,
  };
}

function addDays(baseISO: string, delta: number): string {
  const d = new Date(baseISO + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function buildSchedule(playersByTeam: Map<string, Player[]>): Game[] {
  const BASE = "2026-06-20";
  const games: Game[] = [];

  const make = (league: "NBA" | "PBA", count: number, startIdx: number) => {
    const teams = TEAMS.filter((t) => t.league === league);
    const r = mulberry32(strSeed(league + "schedule"));
    let prev = "";
    for (let i = 0; i < count; i++) {
      let home = pick(r, teams);
      let away = pick(r, teams);
      let guard = 0;
      while ((away.id === home.id || `${home.id}${away.id}` === prev) && guard++ < 20) {
        away = pick(r, teams);
        if (guard > 10) home = pick(r, teams);
      }
      prev = `${home.id}${away.id}`;
      const date = addDays(BASE, -Math.floor(i / 2));
      games.push(buildGame(startIdx + i, home, away, date, playersByTeam));
    }
  };

  make("NBA", 16, 0);
  make("PBA", 10, 100);

  // newest first
  return games.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/* ------------------------------------------------------------------ */
/*  Per-player recent game log (for profile trend charts)             */
/* ------------------------------------------------------------------ */
export function genPlayerLog(player: Player, count = 8): { date: string; line: StatLine }[] {
  const r = mulberry32(strSeed(player.id + "log"));
  const out: { date: string; line: StatLine }[] = [];
  for (let i = 0; i < count; i++) {
    const minutes = clamp(Math.round(player.mpg + gauss(r, 0, 3)), 14, 40);
    out.push({ date: addDays("2026-06-19", -i * 3), line: makeLine(r, player, minutes) });
  }
  return out; // newest first
}

/* ------------------------------------------------------------------ */
/*  Memoized dataset                                                   */
/* ------------------------------------------------------------------ */
let _cache: { players: Player[]; games: Game[]; playersByTeam: Map<string, Player[]> } | null = null;

export function dataset() {
  if (_cache) return _cache;
  const playersByTeam = new Map<string, Player[]>();
  const players: Player[] = [];
  for (const team of TEAMS) {
    const roster = makePlayers(team);
    playersByTeam.set(team.id, roster);
    players.push(...roster);
  }
  const games = buildSchedule(playersByTeam);
  _cache = { players, games, playersByTeam };
  return _cache;
}
