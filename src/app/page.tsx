import {
  getGamePerformers,
  getLatestGame,
  getSeasonLeaders,
  getSiteStats,
  getStandings,
  getTeam,
  listGames,
} from "@/lib/courtside";
import { Hero } from "@/components/home/Hero";
import { Ticker } from "@/components/home/Ticker";
import { StatStrip } from "@/components/home/StatStrip";
import { LeaderColumn } from "@/components/home/LeaderColumn";
import { GameCard } from "@/components/cards/GameCard";
import { PerformerCard } from "@/components/cards/PerformerCard";
import { StandingsTable } from "@/components/tables/StandingsTable";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

// Reflect freshly uploaded performer photos on every visit.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const latest = getLatestGame();
  const latestHome = getTeam(latest.homeTeamId)!;
  const latestAway = getTeam(latest.awayTeamId)!;

  const recent = listGames({ limit: 10 }).map((g) => ({
    game: g,
    home: getTeam(g.homeTeamId)!,
    away: getTeam(g.awayTeamId)!,
  }));

  const performers = await getGamePerformers(latest);

  const [pts, reb, ast] = await Promise.all([
    getSeasonLeaders("PTS", { limit: 5 }),
    getSeasonLeaders("REB", { limit: 5 }),
    getSeasonLeaders("AST", { limit: 5 }),
  ]);

  const nbaWest = getStandings("NBA", "West").slice(0, 6);
  const pba = getStandings("PBA").slice(0, 6);

  const stats = getSiteStats();

  return (
    <>
      <Hero game={latest} home={latestHome} away={latestAway} />

      <Ticker items={recent} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Performers of the latest game */}
        <section className="py-20">
          <SectionHeading
            eyebrow={`${latestAway.abbr} @ ${latestHome.abbr} · Top Performers`}
            title="Stars of the Night"
            href={`/games/${latest.id}`}
            hrefLabel="Full recap"
          />
          <RevealGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {performers.map((p) => (
              <RevealItem key={p.category}>
                <PerformerCard leader={p} />
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        {/* Latest games */}
        <section className="py-12">
          <SectionHeading eyebrow="Box Scores" title="Latest Games" href="/games" />
          <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.slice(0, 6).map(({ game, home, away }) => (
              <RevealItem key={game.id}>
                <GameCard game={game} home={home} away={away} />
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        {/* Season leaders */}
        <section className="py-12">
          <SectionHeading eyebrow="Who's Cooking" title="Season Leaders" href="/leaders" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <LeaderColumn title="Points" color="#2f7dff" unit="PPG" leaders={pts} />
            <LeaderColumn title="Rebounds" color="#22c3e6" unit="RPG" leaders={reb} />
            <LeaderColumn title="Assists" color="#2fd27a" unit="APG" leaders={ast} />
          </div>
        </section>

        {/* Standings preview */}
        <section className="py-12">
          <SectionHeading eyebrow="The Race" title="Standings" href="/standings" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Reveal>
              <StandingsTable rows={nbaWest} title="NBA · West" />
            </Reveal>
            <Reveal delay={0.1}>
              <StandingsTable rows={pba} title="PBA" />
            </Reveal>
          </div>
        </section>

        {/* Stats strip */}
        <section className="py-12">
          <Reveal>
            <StatStrip
              stats={[
                { label: "Games tracked", value: stats.games },
                { label: "Players", value: stats.players },
                { label: "Teams", value: stats.teams },
                { label: "Leagues", value: stats.leagues },
              ]}
            />
          </Reveal>
        </section>

        {/* CTA */}
        <section className="py-16">
          <Reveal>
            <div className="card noise relative overflow-hidden p-8 text-center sm:p-14">
              <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  background:
                    "radial-gradient(60% 80% at 50% 0%, rgba(47,125,255,0.28), transparent 60%)",
                }}
              />
              <div className="relative">
                <p className="eyebrow mb-3">For statisticians</p>
                <h2 className="font-display mx-auto max-w-2xl text-4xl uppercase sm:text-5xl">
                  Shot the photos? Post them in seconds.
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-muted">
                  Upload a headshot for each game&apos;s top performers — points,
                  rebounds, assists, blocks, steals and the player of the game.
                  They publish to the site instantly.
                </p>
                <a
                  href="/statistician"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-black transition-colors hover:bg-accent-2"
                >
                  Open the upload desk
                </a>
              </div>
            </div>
          </Reveal>
        </section>
      </div>
    </>
  );
}
