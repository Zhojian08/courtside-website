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

export const dynamic = "force-dynamic";

export default function HomePage() {
  const latest = getLatestGame();
  const latestHome = getTeam(latest.homeTeamId)!;
  const latestAway = getTeam(latest.awayTeamId)!;

  const recent = listGames({ limit: 12 }).map((g) => ({
    game: g,
    home: getTeam(g.homeTeamId)!,
    away: getTeam(g.awayTeamId)!,
  }));

  const performers = getGamePerformers(latest);

  const pts = getSeasonLeaders("PTS", { limit: 5 });
  const reb = getSeasonLeaders("REB", { limit: 5 });
  const ast = getSeasonLeaders("AST", { limit: 5 });

  const nba = getStandings("NBA", "Western").slice(0, 6);
  const pba = getStandings("PBA");
  const fiba = getStandings("FIBA", "Group B");

  const stats = getSiteStats();

  return (
    <>
      <Hero game={latest} home={latestHome} away={latestAway} />

      <Ticker items={recent} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Performers of the latest game */}
        {performers.length > 0 && (
          <section className="py-24 sm:py-32">
            <SectionHeading
              index="01"
              eyebrow={`${latestAway.abbr} @ ${latestHome.abbr} · Top Performers`}
              title="Stars of the Game"
              href={`/games/${latest.id}`}
              hrefLabel="Full recap"
            />
            <RevealGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {performers.map((p, i) => (
                <RevealItem key={i}>
                  <PerformerCard performer={p} />
                </RevealItem>
              ))}
            </RevealGroup>
          </section>
        )}

        {/* Latest games */}
        <section className="py-16 sm:py-24">
          <SectionHeading index="02" eyebrow="Real Results" title="Latest Games" href="/games" />
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
          <SectionHeading index="03" eyebrow="Who's Cooking" title="Stat Leaders" href="/leaders" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <LeaderColumn title="Points" color="#2f7dff" unit="PPG" leaders={pts} />
            <LeaderColumn title="Rebounds" color="#22c3e6" unit="RPG" leaders={reb} />
            <LeaderColumn title="Assists" color="#2fd27a" unit="APG" leaders={ast} />
          </div>
        </section>

        {/* Standings preview */}
        <section className="py-16 sm:py-24">
          <SectionHeading index="04" eyebrow="The Race" title="Standings" href="/standings" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Reveal>
              <StandingsTable rows={nba} title="NBA · West" />
            </Reveal>
            <Reveal delay={0.08}>
              <StandingsTable rows={pba} title="PBA · Comm's Cup" />
            </Reveal>
            <Reveal delay={0.16}>
              <StandingsTable rows={fiba} title="FIBA U18 · Group B" />
            </Reveal>
          </div>
        </section>

        {/* Stats strip */}
        <section className="py-16 sm:py-24">
          <Reveal>
            <StatStrip
              stats={[
                { label: "Real games", value: stats.games },
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
