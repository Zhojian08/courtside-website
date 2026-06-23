import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
console.log("url present:", !!url, "token present:", !!authToken);

try {
  const db = createClient({ url, authToken });
  const ping = await db.execute("SELECT 1 AS ok");
  console.log("connection ok:", JSON.stringify(ping.rows));

  const tables = await db.execute(
    "SELECT name FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY name"
  );
  console.log("table count:", tables.rows.length);

  for (const row of tables.rows) {
    const name = row.name;
    let count = "?";
    try {
      const c = await db.execute(`SELECT COUNT(*) AS n FROM "${name}"`);
      count = c.rows[0].n;
    } catch (e) { count = "err:" + e.message; }

    const cols = await db.execute(`PRAGMA table_info("${name}")`);
    const colDesc = cols.rows.map((c) => `${c.name}:${c.type}`).join(", ");
    console.log(`\n=== TABLE ${name}  (rows: ${count}) ===`);
    console.log("  cols: " + colDesc);

    try {
      const sample = await db.execute(`SELECT * FROM "${name}" LIMIT 2`);
      sample.rows.forEach((r, i) => {
        const obj = {};
        for (const k of Object.keys(r)) {
          let v = r[k];
          if (typeof v === "string" && v.length > 90) v = v.slice(0, 90) + "…";
          obj[k] = v;
        }
        console.log(`  sample[${i}]: ` + JSON.stringify(obj));
      });
    } catch (e) { console.log("  sample err: " + e.message); }
  }
} catch (e) {
  console.error("FATAL:", e?.message, "\n", e?.stack);
}
