import { createClient } from "@libsql/client";
const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
// Remove the demo tables I seeded earlier; the site now reads courtside-live's
// real schema (games/teams/players). This does NOT touch courtside-live's tables.
for (const t of ["wexme_performers", "wexme_games", "wexme_players", "wexme_teams"]) {
  try { await db.execute(`DROP TABLE IF EXISTS ${t}`); console.log("dropped", t); }
  catch (e) { console.log("skip", t, e.message); }
}
const left = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
console.log("remaining tables:", left.rows.map((r) => r.name).join(", ") || "(none)");
