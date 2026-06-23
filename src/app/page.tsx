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
        <section className="py-24 sm:py-32">
          <SectionHeading
            index="01"
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
        <section className="py-16 sm:py-24">
          <SectionHeading index="02" eyebrow="Box Scores" title="Latest Games" href="/games" />
          <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.slice(0, 6).map(({ game, home, away }) => (
              <RevealItem key={game.id}>
                <GameCard game={game} home={home} away={away} />
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        {/* Season leaders */}
        <section className="py-16 sm:py-24">
          <SectionHeading index="03" eyebrow="Who's Cooking" title="Season Leaders" href="/leaders" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <LeaderColumn title="Points" color="#2f7dff" unit="PPG" leaders={pts} />
            <LeaderColumn title="Rebounds" color="#22c3e6" unit="RPG" leaders={reb} />
            <LeaderColumn title="Assists" color="#2fd27a" unit="APG" leaders={ast} />
          </div>
        </section>

        {/* Standings preview */}
        <section className="py-16 sm:py-24">
          <SectionHeading index="04" eyebrow="The Race" title="Standings" href="/standings" />
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
        <section className="py-16 sm:py-24">
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

      </div>
    </>
  );
}
