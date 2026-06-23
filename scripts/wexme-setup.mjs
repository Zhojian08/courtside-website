import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

/* ------------------------------------------------------------------ *
 *  WEXME schema — the contract your main system writes into.
 *  The website reads these tables live (see src/lib/courtside/wexme.ts).
 * ------------------------------------------------------------------ */
await db.batch([
  `CREATE TABLE IF NOT EXISTS wexme_teams (
     id TEXT PRIMARY KEY, name TEXT NOT NULL, abbr TEXT NOT NULL,
     city TEXT DEFAULT '', primary_color TEXT DEFAULT '#2f7dff',
     secondary_color TEXT DEFAULT '#0b46d8', wins INTEGER DEFAULT 0, losses INTEGER DEFAULT 0
   )`,
  `CREATE TABLE IF NOT EXISTS wexme_players (
     id TEXT PRIMARY KEY, team_id TEXT, name TEXT NOT NULL, number INTEGER,
     position TEXT, ppg REAL, rpg REAL, apg REAL
   )`,
  `CREATE TABLE IF NOT EXISTS wexme_games (
     id TEXT PRIMARY KEY,
     status TEXT NOT NULL DEFAULT 'scheduled',   -- scheduled | live | final
     date TEXT,                                   -- yyyy-mm-dd
     starts_at TEXT,                              -- ISO datetime (for scheduled/live)
     home_team_id TEXT, away_team_id TEXT,
     home_score INTEGER DEFAULT 0, away_score INTEGER DEFAULT 0,
     period TEXT,                                 -- e.g. "Q3 04:12" while live
     venue TEXT DEFAULT '', headline TEXT DEFAULT '', recap TEXT DEFAULT ''
   )`,
  `CREATE TABLE IF NOT EXISTS wexme_performers (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     game_id TEXT, player_id TEXT, name TEXT, team_abbr TEXT,
     category TEXT, value REAL, detail TEXT
   )`,
], "write");

// idempotent demo seed (safe to re-run / replace with your real sync)
await db.batch([
  "DELETE FROM wexme_performers",
  "DELETE FROM wexme_games",
  "DELETE FROM wexme_players",
  "DELETE FROM wexme_teams",
], "write");

const today = new Date();
const d = (off) => { const x = new Date(today); x.setDate(x.getDate() + off); return x.toISOString().slice(0, 10); };
const dt = (offDays, h, m) => { const x = new Date(today); x.setDate(x.getDate() + offDays); x.setHours(h, m, 0, 0); return x.toISOString(); };

const teams = [
  ["w-vipers", "Vipers", "VIP", "Riverside", "#16a34a", "#052e16", 7, 1],
  ["w-titans", "Titans", "TTN", "Downtown", "#2f7dff", "#0b1f4d", 6, 2],
  ["w-comets", "Comets", "CMT", "Eastside", "#f59e0b", "#451a03", 4, 4],
  ["w-royals", "Royals", "ROY", "Harbor", "#a855f7", "#2e1065", 2, 6],
];
const players = [
  ["w-vip-1", "w-vipers", "Marcus Vega", 7, "G", 24.6, 3.4, 6.1],
  ["w-vip-2", "w-vipers", "Andre Cole", 23, "F", 18.2, 9.7, 2.1],
  ["w-ttn-1", "w-titans", "Leo Park", 11, "G", 21.0, 4.2, 5.5],
  ["w-ttn-2", "w-titans", "Sam Reyes", 4, "C", 15.8, 11.3, 1.4],
  ["w-cmt-1", "w-comets", "Eli Brooks", 9, "F", 19.4, 6.0, 3.0],
  ["w-roy-1", "w-royals", "Theo Quinn", 3, "G", 17.7, 2.8, 7.2],
];
const games = [
  // LIVE
  ["wexme-live-1", "live", d(0), dt(0, 19, 0), "w-vipers", "w-titans", 58, 53, "Q3 · 05:41", "Riverside Arena", "", ""],
  ["wexme-live-2", "live", d(0), dt(0, 20, 30), "w-comets", "w-royals", 31, 29, "Q2 · 02:10", "Eastside Gym", "", ""],
  // SCHEDULED
  ["wexme-sch-1", "scheduled", d(1), dt(1, 19, 0), "w-titans", "w-comets", 0, 0, "", "Downtown Center", "", ""],
  ["wexme-sch-2", "scheduled", d(2), dt(2, 18, 30), "w-vipers", "w-royals", 0, 0, "", "Riverside Arena", "", ""],
  ["wexme-sch-3", "scheduled", d(3), dt(3, 20, 0), "w-royals", "w-comets", 0, 0, "", "Harbor Court", "", ""],
  // FINAL
  ["wexme-fin-1", "final", d(-1), dt(-1, 19, 0), "w-vipers", "w-comets", 88, 79, "", "Riverside Arena",
    "Vipers pull away from Comets, 88–79", "Marcus Vega's 27 led the Vipers to a comfortable home win."],
  ["wexme-fin-2", "final", d(-2), dt(-2, 19, 0), "w-titans", "w-royals", 95, 91, "", "Downtown Center",
    "Titans edge Royals, 95–91", "Leo Park hit the dagger as the Titans survived a Royals rally."],
  ["wexme-fin-3", "final", d(-3), dt(-3, 18, 30), "w-comets", "w-titans", 72, 84, "", "Eastside Gym",
    "Titans hold off Comets, 84–72", "Sam Reyes posted a double-double to power the Titans."],
];
const performers = [
  ["wexme-live-1", "w-vip-1", "Marcus Vega", "VIP", "PTS", 22, "22 pts"],
  ["wexme-live-1", "w-ttn-1", "Leo Park", "TTN", "PTS", 19, "19 pts"],
  ["wexme-fin-1", "w-vip-1", "Marcus Vega", "VIP", "PTS", 27, "27 pts · 7 ast"],
  ["wexme-fin-1", "w-vip-2", "Andre Cole", "VIP", "REB", 12, "12 reb"],
  ["wexme-fin-2", "w-ttn-1", "Leo Park", "TTN", "PTS", 31, "31 pts"],
  ["wexme-fin-3", "w-ttn-2", "Sam Reyes", "TTN", "REB", 14, "18 pts · 14 reb"],
];

for (const t of teams)
  await db.execute({ sql: "INSERT INTO wexme_teams (id,name,abbr,city,primary_color,secondary_color,wins,losses) VALUES (?,?,?,?,?,?,?,?)", args: t });
for (const p of players)
  await db.execute({ sql: "INSERT INTO wexme_players (id,team_id,name,number,position,ppg,rpg,apg) VALUES (?,?,?,?,?,?,?,?)", args: p });
for (const g of games)
  await db.execute({ sql: "INSERT INTO wexme_games (id,status,date,starts_at,home_team_id,away_team_id,home_score,away_score,period,venue,headline,recap) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", args: g });
for (const pf of performers)
  await db.execute({ sql: "INSERT INTO wexme_performers (game_id,player_id,name,team_abbr,category,value,detail) VALUES (?,?,?,?,?,?,?)", args: pf });

const counts = {};
for (const t of ["wexme_teams", "wexme_players", "wexme_games", "wexme_performers"]) {
  const r = await db.execute(`SELECT COUNT(*) AS n FROM ${t}`);
  counts[t] = r.rows[0].n;
}
console.log("WEXME schema created + seeded:", JSON.stringify(counts));
