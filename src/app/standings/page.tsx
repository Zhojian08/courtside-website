import Link from "next/link";
import { clsx } from "clsx";
import { getStandings, getWexmeStandingGroups, getCollections, getWexmeFeed } from "@/lib/courtside";
import type { GameWithTeams, StandingRow } from "@/lib/courtside/types";
import { StandingsTable } from "@/components/tables/StandingsTable";
import { ClubStandings } from "@/components/standings/ClubStandings";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = { title: "Standings" };
export const dynamic = "force-dynamic";

// Compute W/L standings from a set of games (final games only), live from the
// system. Teams are keyed by their stable per-name id, so a team's record
// aggregates across the set; output matches the reference-league standings shape.
function standingsFromGames(games: GameWithTeams[]): StandingRow[] {
  const rec = new Map<string, { team: GameWithTeams["home"]; wins: number; losses: number }>();
  for (const { game, home, away } of games) {
    if (game.status !== "final") continue;
    for (const t of [home, away]) if (!rec.has(t.id)) rec.set(t.id, { team: t, wins: 0, losses: 0 });
    if (game.homeScore === game.awayScore) continue;
    const homeWon = game.homeScore > game.awayScore;
    rec.get(home.id)![homeWon ? "wins" : "losses"]++;
    rec.get(away.id)![homeWon ? "losses" : "wins"]++;
  }
  const sorted = [...rec.values()].sort((a, b) => {
    const pa = a.wins + a.losses ? a.wins / (a.wins + a.losses) : 0;
    const pb = b.wins + b.losses ? b.wins / (b.wins + b.losses) : 0;
    return pb !== pa ? pb - pa : b.wins - a.wins;
  });
  const top = sorted[0];
  return sorted.map((r, i) => ({
    rank: i + 1,
    team: r.team,
    wins: r.wins,
    losses: r.losses,
    pct: r.wins + r.losses ? r.wins / (r.wins + r.losses) : 0,
    gb: top ? (top.wins - r.wins + (r.losses - top.losses)) / 2 : 0,
  }));
}

export default async function StandingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; g?: string }>;
}) {
  const { tab, g } = await searchParams;
  const [wexmeGroups, collections, wexme] = await Promise.all([
    getWexmeStandingGroups(),
    getCollections(),
    getWexmeFeed(),
  ]);

  // Admin-curated clubs (MOWEN, …) are top-level portfolios; auto-derived
  // competitions that aren't clubs stay grouped under WEXME.
  const clubNames = new Set(collections.map((c) => c.name.trim().toUpperCase()));
  const wexmeOnly = wexmeGroups.filter((grp) => !clubNames.has(grp.portfolio.toUpperCase()));

  const tabs = [
    ...(wexmeOnly.length ? [{ key: "WEXME", label: "WEXME" }] : []),
    ...collections.map((c) => ({ key: c.name, label: c.name })),
    { key: "NBA", label: "NBA" },
    { key: "PBA", label: "PBA" },
    { key: "FIBA", label: "FIBA" },
  ];
  const activeKey = tab && tabs.some((t) => t.key === tab) ? tab : tabs[0]?.key ?? "NBA";
  const activeClub = collections.find((c) => c.name === activeKey) ?? null;

  // Active club → per-category standings (+ an "All"), computed from its games.
  let clubGroups: { key: string; label: string; rows: StandingRow[] }[] = [];
  if (activeClub) {
    const finalByCode = new Map(wexme.final.map((m) => [m.game.id, m]));
    const gamesFor = (codes: string[]) =>
      codes.map((c) => finalByCode.get(c)).filter((m): m is GameWithTeams => !!m);
    const allCodes = [...new Set([...activeClub.codes, ...activeClub.categories.flatMap((x) => x.codes)])];
    clubGroups = [
      { key: "all", label: "All", rows: standingsFromGames(gamesFor(allCodes)) },
      ...activeClub.categories.map((cat) => ({
        key: cat.slug,
        label: cat.name,
        rows: standingsFromGames(gamesFor(cat.codes)),
      })),
    ];
  }

  // WEXME tab → the auto-derived competition groups as sub-pills (server-side).
  const activeGroup =
    activeKey === "WEXME"
      ? (g && wexmeOnly.some((x) => x.portfolio === g) ? g : wexmeOnly[0]?.portfolio) ?? null
      : null;
  const wx = activeKey === "WEXME" ? wexmeOnly.find((x) => x.portfolio === activeGroup) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="eyebrow mb-2">The Race</p>
        <h1 className="font-display text-5xl uppercase sm:text-6xl">Standings</h1>
        <p className="mt-3 max-w-xl text-muted">
          Records by league — your WEXME competitions, plus the latest NBA season, the
          PBA Commissioner&apos;s Cup, and the FIBA U18 AmeriCup. Pick a league.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/standings?tab=${encodeURIComponent(t.key)}`}
            className={clsx(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              t.key === activeKey
                ? "bg-accent text-black"
                : "border border-line text-muted hover:text-fg"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {activeClub ? (
        <ClubStandings clubName={activeClub.name} groups={clubGroups} initialKey={g} />
      ) : activeKey === "WEXME" && wexmeOnly.length > 0 ? (
        <>
          <div className="mb-8 -mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs uppercase tracking-wider text-faint">WEXME:</span>
            {wexmeOnly.map((x) => (
              <Link
                key={x.portfolio}
                href={`/standings?tab=WEXME&g=${encodeURIComponent(x.portfolio)}`}
                className={clsx(
                  "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                  x.portfolio === activeGroup
                    ? "bg-accent text-black"
                    : "border border-line text-muted hover:text-fg"
                )}
              >
                {x.portfolio}
              </Link>
            ))}
          </div>
          {wx ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {wx.tables.map((t, i) => (
                <Reveal key={t.league} delay={(i % 2) * 0.08}>
                  <StandingsTable rows={t.rows} title={t.title} />
                </Reveal>
              ))}
            </div>
          ) : null}
        </>
      ) : activeKey === "NBA" ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal>
            <StandingsTable rows={getStandings("NBA", "Eastern")} title="Eastern Conference" />
          </Reveal>
          <Reveal delay={0.1}>
            <StandingsTable rows={getStandings("NBA", "Western")} title="Western Conference" />
          </Reveal>
        </div>
      ) : activeKey === "PBA" ? (
        <Reveal>
          <StandingsTable rows={getStandings("PBA")} title="Elimination Round" />
        </Reveal>
      ) : activeKey === "FIBA" ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal>
            <StandingsTable rows={getStandings("FIBA", "Group A")} title="Group A" />
          </Reveal>
          <Reveal delay={0.1}>
            <StandingsTable rows={getStandings("FIBA", "Group B")} title="Group B" />
          </Reveal>
        </div>
      ) : null}
    </div>
  );
}
