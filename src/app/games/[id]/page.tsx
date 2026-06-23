import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, ExternalLink } from "lucide-react";
import { getGame, getGamePerformers, getTeam, listGames } from "@/lib/courtside";
import type { Team } from "@/lib/courtside/types";
import { TeamCrest } from "@/components/ui/TeamCrest";
import { LeagueTag } from "@/components/ui/SectionHeading";
import { CountUp } from "@/components/ui/CountUp";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { PerformerCard } from "@/components/cards/PerformerCard";
import { formatDateLong } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = getGame(id);
  return { title: game ? game.headline : "Game" };
}

export default async function GameRecapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = getGame(id);
  if (!game) notFound();

  const home = getTeam(game.homeTeamId)!;
  const away = getTeam(game.awayTeamId)!;
  const performers = getGamePerformers(game);
  const homeWon = game.homeScore > game.awayScore;

  const more = listGames({ league: game.league })
    .filter((g) => g.id !== game.id)
    .slice(0, 3);

  return (
    <article>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="court-lines pointer-events-none absolute inset-0" />
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background: `radial-gradient(60% 80% at 15% 0%, ${away.primary}33, transparent 55%), radial-gradient(60% 80% at 85% 0%, ${home.primary}33, transparent 55%)`,
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            href="/games"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" /> All games
          </Link>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <LeagueTag league={game.league} />
            {game.series && <span className="text-sm font-semibold text-fg">{game.series}</span>}
            <span className="text-sm text-faint">{formatDateLong(game.date)} · FINAL</span>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-8">
            <TeamSide team={away} score={game.awayScore} won={!homeWon} align="start" />
            <p className="font-display text-2xl text-muted">VS</p>
            <TeamSide team={home} score={game.homeScore} won={homeWon} align="end" />
          </div>

          <Reveal>
            <h1 className="font-display mt-10 text-center text-4xl uppercase leading-[0.95] sm:text-6xl">
              {game.headline}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {game.venue}
              </span>
              <a
                href={game.source}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-accent"
              >
                <ExternalLink className="h-4 w-4" /> Source
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:px-6 lg:px-8">
        {/* PERFORMERS */}
        {performers.length > 0 && (
          <section>
            <Reveal>
              <h2 className="font-display mb-6 text-3xl uppercase sm:text-4xl">Stars of the Game</h2>
            </Reveal>
            <RevealGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {performers.map((p, i) => (
                <RevealItem key={i}>
                  <PerformerCard performer={p} />
                </RevealItem>
              ))}
            </RevealGroup>
          </section>
        )}

        {/* RECAP */}
        <Reveal>
          <div className="card noise relative overflow-hidden p-8 sm:p-10">
            <p className="eyebrow mb-3">The Story</p>
            <p className="max-w-3xl text-lg leading-relaxed text-fg/90">{game.recap}</p>
            <a
              href={game.source}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-2"
            >
              <ExternalLink className="h-4 w-4" /> Verify this result at the source
            </a>
          </div>
        </Reveal>

        {/* MORE GAMES */}
        {more.length > 0 && (
          <section>
            <Reveal>
              <h2 className="font-display mb-6 text-3xl uppercase sm:text-4xl">More {game.league}</h2>
            </Reveal>
            <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {more.map((g) => {
                const h = getTeam(g.homeTeamId)!;
                const a = getTeam(g.awayTeamId)!;
                const hWon = g.homeScore > g.awayScore;
                return (
                  <RevealItem key={g.id}>
                    <Link href={`/games/${g.id}`} className="card card-hover block p-5">
                      <p className="mb-3 text-xs text-faint">{g.series}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className={!hWon ? "font-semibold text-fg" : "text-muted"}>{a.abbr}</span>
                        <span className="stat-num font-display text-xl">{g.awayScore}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-sm">
                        <span className={hWon ? "font-semibold text-fg" : "text-muted"}>{h.abbr}</span>
                        <span className="stat-num font-display text-xl">{g.homeScore}</span>
                      </div>
                    </Link>
                  </RevealItem>
                );
              })}
            </RevealGroup>
          </section>
        )}
      </div>
    </article>
  );
}

function TeamSide({
  team,
  score,
  won,
  align,
}: {
  team: Team;
  score: number;
  won: boolean;
  align: "start" | "end";
}) {
  return (
    <div className={`flex flex-col items-center gap-3 ${align === "end" ? "sm:items-end" : "sm:items-start"}`}>
      <TeamCrest team={team} className="h-14 w-14 text-base sm:h-20 sm:w-20 sm:text-2xl" />
      <div className={`text-center ${align === "end" ? "sm:text-right" : "sm:text-left"}`}>
        <p className={`font-display text-xl uppercase sm:text-2xl ${won ? "text-fg" : "text-muted"}`}>
          {team.name}
        </p>
        {team.city && <p className="text-xs text-faint">{team.city}</p>}
      </div>
      <div className={`font-display leading-none ${won ? "text-accent" : "text-muted"}`}>
        <CountUp to={score} className="text-6xl sm:text-8xl" />
      </div>
    </div>
  );
}
