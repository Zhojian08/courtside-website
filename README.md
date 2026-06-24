# 🏀 WeXmE

Pro-grade coverage for basketball leagues of all ages — box scores, standings, leaderboards,
player graphs and cinematic game-night recaps. Powered live by
[Courtside Live](https://courtside-live.onrender.com).

Every tab — games, box scores, standings, season leaders, team pages and player
profiles — is driven by the **shared Turso database** that the Courtside Live
main system writes to (see [Going live](#going-live-with-courtside-live)). The
public NBA / PBA / FIBA reference data is kept alongside your live league.

## Run it

```bash
npm install      # first time only
npm run dev      # http://localhost:3000
```

Build for production:

```bash
npm run build && npm start
```

## What's inside

| Route | What it shows |
|-------|---------------|
| `/` | Cinematic home — hero, live results ticker, top performers, latest games, season leaders, standings |
| `/games` | All games, filterable by league, grouped by date |
| `/games/[id]` | Full game recap: huge final score, player of the game, performer grid, quarter chart, team-vs-team bars, box scores, story |
| `/standings` | NBA (East/West) and PBA standings |
| `/leaders` | Season leaderboards (PTS/REB/AST/BLK/STL) with bar charts |
| `/players/[id]` | Player profile — averages, shooting splits, trend chart, radar, game log |
| `/teams/[id]` | Team page — roster table and recent games |

Tech: Next.js (App Router) · TypeScript · Tailwind v4 · Framer Motion · Recharts.

## Going live with Courtside Live

The website and the main system **share one Turso (libSQL) database in real time.**
Courtside Live writes every game, team, player and stat; the website reads those
same tables and derives the games list, box scores, standings, season leaders,
team pages and player profiles by aggregating across games. Score updates are
forwarded to the cloud primary on write, so the site reflects them in seconds.

How it's wired:

- [`src/lib/courtside/db.ts`](src/lib/courtside/db.ts) — one `@libsql/client`
  connection to the shared database.
- [`src/lib/courtside/wexme.ts`](src/lib/courtside/wexme.ts) — reads
  `games` / `teams` / `players` directly and exposes `getWexmeFeed`,
  `getWexmeGameDetail`, `getWexmeBoxScore`, `getWexmeStandings`,
  `getWexmeLeaders`, `getWexmeTeam(s)`, `getWexmeRoster`, `getWexmePlayer`, …
  If the database is unset or unreachable it **falls back** to the main system's
  public feed (`/api/feed/games`), so the site always shows whatever is live.
- The pages combine that live WEXME data with the NBA/PBA/FIBA reference data.

### Point both apps at the same database

1. **Create a Turso database** (free) and copy its URL + an auth token.
2. **Courtside Live (Render) → Environment** — set, then redeploy:
   - `TURSO_DATABASE_URL = libsql://<your-db>-<org>.turso.io`
   - `TURSO_AUTH_TOKEN = <token>`
   The main system now persists to that shared DB instead of an ephemeral file.
3. **This website (Vercel) → Settings → Environment Variables** — set the **same
   two values**, then redeploy.

Locally, the same two vars live in `.env.local` (already git-ignored).
