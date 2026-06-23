# 🏀 WeXmE — United Arab Emirates

Pro-grade coverage for UAE amateur basketball — box scores, standings, leaderboards,
player graphs and cinematic game-night recaps. Built to be powered by
[Courtside Live](https://courtside-live.onrender.com).

Currently runs on **realistic sample data** (NBA + PBA franchises, generated
rosters and box scores) behind a clean adapter, so the whole UI works today and
the real Courtside Live API can be wired in later by editing a single file.

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
| `/statistician` | **Upload desk** — pick a game, upload a photo for each performer; it publishes to the site instantly |

Tech: Next.js (App Router) · TypeScript · Tailwind v4 · Framer Motion · Recharts.

## The statistician upload

1. Open `/statistician` and enter the passcode (demo: `courtside`, configurable
   via `COURTSIDE_UPLOAD_CODE`).
2. Pick a game, then choose a photo for the player of the game and the leaders in
   points / rebounds / assists / blocks / steals.
3. On upload the image is saved to `public/uploads/`, recorded in
   `.data/overrides.json`, and immediately shown on the public game page,
   performer cards and that player's profile.

> Note: on hosts with an ephemeral filesystem (e.g. Render free tier) uploaded
> files don't persist across restarts. For production, swap the write in
> `src/app/api/upload/route.ts` for object storage (S3/R2/Cloudinary) — the rest
> of the flow stays the same.

## Going live with Courtside Live

All data is read through one module: [`src/lib/courtside/index.ts`](src/lib/courtside/index.ts).
Each function (`listGames`, `getGame`, `getSeasonLeaders`, `getStandings`,
`getRoster`, `getPlayer`, …) currently returns sample data. To go live:

1. Expose a read-only endpoint (or API token) on Courtside Live's existing
   private `/api`.
2. Set `COURTSIDE_API_URL` / `COURTSIDE_API_TOKEN` (see `.env.example`).
3. Replace the function bodies in `index.ts` with `fetch()` calls, keeping the
   return types in [`src/lib/courtside/types.ts`](src/lib/courtside/types.ts)
   identical. Every page keeps working unchanged.

Sample data generation lives in `src/lib/courtside/generate.ts` (deterministic,
seeded) and team identities in `src/lib/courtside/teams.ts`.
