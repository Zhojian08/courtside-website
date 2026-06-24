import {
  getSeasonLeaders,
  getSiteStats,
  getStandings,
  getTeam,
  getWexmeFeed,
  getWexmeLeaders,
  getWexmeStandings,
  getWexmeSiteStats,
  listGames,
} from "@/lib/courtside";
import type { GameWithTeams, SeasonLeader, StandingRow } from "@/lib/courtside/types";
import { Hero } from "@/components/home/Hero";
import { Ticker } from "@/components/home/Ticker";
import { StatStrip } from "@/components/home/StatStrip";
import { LeaderColumn } from "@/components/home/LeaderColumn";
import { LiveBoard } from "@/components/home/LiveBoard";
import { GameCard } from "@/components/cards/GameCard";
import { PerformerCard } from "@/components/cards/PerformerCard";
import { StandingsTable } from "@/components/tables/StandingsTable";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const wexme = await getWexmeFeed();

  const staticFinals: GameWithTeams[] = listGames().map((g) => ({
    game: g,
    home: getTeam(g.homeTeamId)!,
    away: getTeam(g.awayTeamId)!,
  }));

  // WEXME finals join the real-results feed, newest first
  const allFinals = [...wexme.final, ...staticFinals].sort((a, b) =>
    b.game.date.localeCompare(a.game.date)
  );

  const latest = allFinals[0];
  const recent = allFinals.slice(0, 12);
  const performers = latest.game.performers;

  const [wPts, wReb, wAst, wexmeStandings, wexmeStats] = await Promise.all([
    getWexmeLeaders("PTS"),
    getWexmeLeaders("REB"),
    getWexmeLeaders("AST"),
    getWexmeStandings(),
    getWexmeSiteStats(),
  ]);
  const top5 = (rows: SeasonLeader[]): SeasonLeader[] =>
    [...rows].sort((a, b) => b.value - a.value).map((r, i) => ({ ...r, rank: i + 1 })).slice(0, 5);
  const pts = top5([...wPts, ...getSeasonLeaders("PTS")]);
  const reb = top5([...wReb, ...getSeasonLeaders("REB")]);
  const ast = top5([...wAst, ...getSeasonLeaders("AST")]);

  const nba = getStandings("NBA", "Western").slice(0, 6);
  const pba = getStandings("PBA");
  const fiba = getStandings("FIBA", "Group B");
  const standingsCards: { rows: StandingRow[]; title: string }[] = [
    ...(wexmeStandings.length
      ? [{ rows: wexmeStandings.slice(0, 8), title: "WEXME · Your League" }]
      : []),
    { rows: nba, title: "NBA · West" },
    { rows: pba, title: "PBA · Comm's Cup" },
    { rows: fiba, title: "FIBA U18 · Group B" },
  ].slice(0, 3);

  const stats = getSiteStats();
  const hasLive = wexme.live.length > 0 || wexme.scheduled.length > 0;

  return (
    <>
      <Hero game={latest.game} home={latest.home} away={latest.away} />

      <Ticker items={recent} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* WEXME live & upcoming */}
        {hasLive && (
          <section className="py-20 sm:py-28">
            <SectionHeading
              index="01"
              eyebrow="WEXME · Synced from your system"
              title="Live & Upcoming"
              href="/games?league=WEXME"
              hrefLabel="All WEXME games"
            />
            <Reveal>
              <LiveBoard initialLive={wexme.live} initialScheduled={wexme.scheduled} />
            </Reveal>
          </section>
        )}

        {/* Top performers from the latest result */}
        {performers.length > 0 && (
          <section className="py-16 sm:py-24">
            <SectionHeading
              index="02"
              eyebrow={`${latest.away.abbr} @ ${latest.home.abbr} · Top Performers`}
              title="Stars of the Game"
              href={`/games/${latest.game.id}`}
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

        {/* Latest games (WEXME finals + NBA/PBA/FIBA) */}
        <section className="py-16 sm:py-24">
          <SectionHeading index="03" eyebrow="Real Results" title="Latest Games" href="/games" />
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
          <SectionHeading index="04" eyebrow="Who's Cooking" title="Stat Leaders" href="/leaders" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <LeaderColumn title="Points" color="#2f7dff" unit="PPG" leaders={pts} />
            <LeaderColumn title="Rebounds" color="#22c3e6" unit="RPG" leaders={reb} />
            <LeaderColumn title="Assists" color="#2fd27a" unit="APG" leaders={ast} />
          </div>
        </section>

        {/* Standings preview */}
        <section className="py-16 sm:py-24">
          <SectionHeading index="05" eyebrow="The Race" title="Standings" href="/standings" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {standingsCards.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.08}>
                <StandingsTable rows={c.rows} title={c.title} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* Stats strip */}
        <section className="py-16 sm:py-24">
          <Reveal>
            <StatStrip
              stats={[
                { label: "Real games", value: stats.games + wexmeStats.games },
                { label: "Players", value: stats.players + wexmeStats.players },
                { label: "Teams", value: stats.teams + wexmeStats.teams },
                { label: "Leagues", value: stats.leagues },
              ]}
            />
          </Reveal>
        </section>
      </div>
    </>
  );
}
