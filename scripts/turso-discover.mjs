import { createClient } from "@libsql/client";

const token = process.env.TURSO_PLATFORM_TOKEN;
if (!token) { console.error("missing TURSO_PLATFORM_TOKEN"); process.exit(1); }
const API = "https://api.turso.tech";
const h = { Authorization: `Bearer ${token}` };

const pick = (o, ...keys) => { for (const k of keys) if (o[k] != null) return o[k]; return undefined; };

const orgsRes = await fetch(`${API}/v1/organizations`, { headers: h });
if (!orgsRes.ok) { console.error("orgs error", orgsRes.status, await orgsRes.text()); process.exit(1); }
const orgs = await orgsRes.json();
console.log("organizations:", orgs.map((o) => pick(o, "slug", "name")).join(", "));

for (const org of orgs) {
  const slug = pick(org, "slug", "name");
  const dbRes = await fetch(`${API}/v1/organizations/${slug}/databases`, { headers: h });
  if (!dbRes.ok) { console.log(`  [${slug}] databases error`, dbRes.status); continue; }
  const dbs = (await dbRes.json()).databases ?? [];
  console.log(`\n=== ORG ${slug}: ${dbs.length} database(s) ===`);
  for (const db of dbs) {
    const name = pick(db, "Name", "name");
    const host = pick(db, "Hostname", "hostname");
    let tableInfo = "(could not read)";
    try {
      const tkRes = await fetch(`${API}/v1/organizations/${slug}/databases/${name}/auth/tokens?expiration=30m`, { method: "POST", headers: h });
      const jwt = (await tkRes.json()).jwt;
      const dbc = createClient({ url: `libsql://${host}`, authToken: jwt });
      const t = await dbc.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
      const names = t.rows.map((r) => r.name);
      // row counts for a few likely tables
      const counts = [];
      for (const tn of names.slice(0, 40)) {
        try { const c = await dbc.execute(`SELECT COUNT(*) AS n FROM "${tn}"`); counts.push(`${tn}(${c.rows[0].n})`); }
        catch { counts.push(`${tn}(?)`); }
      }
      tableInfo = names.length ? counts.join(", ") : "(no tables)";
    } catch (e) { tableInfo = "ERR: " + e.message; }
    console.log(`  • ${name}  [${host}]`);
    console.log(`      tables: ${tableInfo}`);
  }
}
