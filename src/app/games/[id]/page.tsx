import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Users } from "lucide-react";
import {
  getGame,
  getGamePerformers,
  getPlayerOfGame,
  getRoster,
  getTeam,
} from "@/lib/courtside";
import type { BoxEntry, Player, Team } from "@/lib/courtside/types";
import { TeamCrest } from "@/components/ui/TeamCrest";
import { LeagueTag } from "@/components/ui/SectionHeading";
import { CountUp } from "@/components/ui/CountUp";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { PerformerCard } from "@/components/cards/PerformerCard";
import { PlayerOfGameCard } from "@/components/cards/PlayerOfGameCard";
import { BoxScoreTable, type BoxRow } from "@/components/tables/BoxScoreTable";
import { CompareBar } from "@/components/games/CompareBar";
import { QuartersChart } from "@/components/charts/QuartersChart";
import { formatDateLong, pct3 } from "@/lib/format";

// Render on demand so newly uploaded performer photos appear immediately.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = getGame(id);
  return { title: game ? game.headline : "Game" };
}

function totals(box: BoxEntry[]) {
  return box.reduce(
    (a, b) => ({
      pts: a.pts + b.pts, reb: a.reb + b.reb, ast: a.ast + b.ast,
      stl: a.stl + b.stl, blk: a.blk + b.blk, tov: a.tov + b.tov,
      fgm: a.fgm + b.fgm, fga: a.fga + b.fga,
      tpm: a.tpm + b.tpm, tpa: a.tpa + b.tpa,
    }),
    { pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, tov: 0, fgm: 0, fga: 0, tpm: 0, tpa: 0 }
  );
}

export default async function GameRecapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = getGame(id);
  if (!game) notFound();

  const home = getTeam(game.homeTeamId)!;
  const away = getTeam(game.awayTeamId)!;

  const [homeRoster, awayRoster] = await Promise.all([
    getRoster(home.id),
    getRoster(away.id),
  ]);
  const pmap = new Map<string, Player>();
  [...homeRoster, ...awayRoster].forEach((p) => pmap.set(p.id, p));

  const split = (team: Team): BoxRow[] =>
    game.box
      .filter((b) => b.playerId.startsWith(`${team.id}-p`))
      .sort((a, b) => Number(b.starter) - Number(a.starter) || b.min - a.min)
      .map((line) => ({ player: pmap.get(line.playerId)!, line }));

  const homeRows = split(home);
  const awayRows = split(away);
  const homeT = totals(homeRows.map((r) => r.line));
  const awayT = totals(awayRows.map((r) => r.line));

  const performers = await getGamePerformers(game);
  const pog = await getPlayerOfGame(game);

  const homeWon = game.homeScore > game.awayScore;

  const quarterRows: { q: string; [k: string]: string | number }[] = (
    [
      ["Q1", game.awayLine.q1, game.homeLine.q1],
      ["Q2", game.awayLine.q2, game.homeLine.q2],
      ["Q3", game.awayLine.q3, game.homeLine.q3],
      ["Q4", game.awayLine.q4, game.homeLine.q4],
    ] as const
  ).map(([q, a, h]) => ({ q, [away.abbr]: a, [home.abbr]: h }));

  const compares = [
    { label: "Points", away: awayT.pts, home: homeT.pts },
    { label: "Rebounds", away: awayT.reb, home: homeT.reb },
    { label: "Assists", away: awayT.ast, home: homeT.ast },
    { label: "Steals", away: awayT.stl, home: homeT.stl },
    { label: "Blocks", away: awayT.blk, home: homeT.blk },
    { label: "Turnovers", away: awayT.tov, home: homeT.tov },
  ];
  const pctCompares = [
    {
      label: "FG%",
      away: awayT.fga ? (awayT.fgm / awayT.fga) * 100 : 0,
      home: homeT.fga ? (homeT.fgm / homeT.fga) * 100 : 0,
    },
    {
      label: "3P%",
      away: awayT.tpa ? (awayT.tpm / awayT.tpa) * 100 : 0,
      home: homeT.tpa ? (homeT.tpm / homeT.tpa) * 100 : 0,
    },
  ];

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

          <div className="mb-6 flex items-center gap-3">
            <LeagueTag league={game.league} />
            <span className="text-sm text-faint">{formatDateLong(game.date)} · FINAL</span>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-8">
            <TeamSide team={away} score={game.awayScore} won={!homeWon} align="start" />
            <div className="text-center">
              <p className="font-display text-xs tracking-[0.3em] text-faint">FINAL</p>
              <p className="mt-1 font-display text-2xl text-muted">VS</p>
            </div>
            <TeamSide team={home} score={game.homeScore} won={homeWon} align="end" />
          </div>

          <Reveal>
            <h1 className="font-display mt-10 text-center text-4xl uppercase leading-[0.9] sm:text-6xl">
              {game.headline}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {game.venue}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4" /> {game.attendance.toLocaleString()} fans
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:px-6 lg:px-8">
        {/* PLAYER OF THE GAME */}
        <Reveal>
          <PlayerOfGameCard player={pog.player} team={pog.team} line={pog.line} photoUrl={pog.photoUrl} />
        </Reveal>

        {/* STARS / PERFORMERS */}
        <section>
          <Reveal>
            <h2 className="font-display mb-6 text-3xl uppercase sm:text-4xl">Stars of the Night</h2>
          </Reveal>
          <RevealGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {performers.map((p) => (
              <RevealItem key={p.category}>
                <PerformerCard leader={p} />
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        {/* QUARTERS + LINE SCORE */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="card p-6">
              <h3 className="font-display mb-4 text-2xl uppercase">By the Quarter</h3>
              <QuartersChart
                data={quarterRows}
                awayKey={away.abbr}
                homeKey={home.abbr}
                awayColor={away.primary === home.primary ? "#3a4256" : away.primary}
                homeColor={home.primary}
              />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[360px] text-center text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wider text-faint">
                      <th className="px-4 py-3 text-left font-semibold">Team</th>
                      <th className="px-2 py-3 font-semibold">Q1</th>
                      <th className="px-2 py-3 font-semibold">Q2</th>
                      <th className="px-2 py-3 font-semibold">Q3</th>
                      <th className="px-2 py-3 font-semibold">Q4</th>
                      <th className="px-4 py-3 font-semibold text-accent">T</th>
                    </tr>
                  </thead>
                  <tbody>
                    <LineRow team={away} line={game.awayLine} total={game.awayScore} won={!homeWon} />
                    <LineRow team={home} line={game.homeLine} total={game.homeScore} won={homeWon} />
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </section>

        {/* TEAM COMPARISON */}
        <section>
          <Reveal>
            <h2 className="font-display mb-6 text-3xl uppercase sm:text-4xl">Team vs Team</h2>
          </Reveal>
          <Reveal>
            <div className="card p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between text-sm font-semibold">
                <span className="flex items-center gap-2">
                  <TeamCrest team={away} className="h-7 w-7 text-[0.6rem]" /> {away.abbr}
                </span>
                <span className="flex items-center gap-2">
                  {home.abbr} <TeamCrest team={home} className="h-7 w-7 text-[0.6rem]" />
                </span>
              </div>
              <div className="space-y-5">
                {compares.map((c) => (
                  <CompareBar
                    key={c.label}
                    label={c.label}
                    away={c.away}
                    home={c.home}
                    awayColor={away.primary === home.primary ? "#3a4256" : away.primary}
                    homeColor={home.primary}
                  />
                ))}
                {pctCompares.map((c) => (
                  <CompareBar
                    key={c.label}
                    label={c.label}
                    away={c.away}
                    home={c.home}
                    decimals={1}
                    suffix="%"
                    awayColor={away.primary === home.primary ? "#3a4256" : away.primary}
                    homeColor={home.primary}
                  />
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* BOX SCORES */}
        <section className="space-y-8">
          <Reveal>
            <h2 className="font-display text-3xl uppercase sm:text-4xl">Box Score</h2>
          </Reveal>
          {[
            { team: away, rows: awayRows, t: awayT },
            { team: home, rows: homeRows, t: homeT },
          ].map(({ team, rows, t }) => (
            <Reveal key={team.id}>
              <div className="card overflow-hidden">
                <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <TeamCrest team={team} className="h-9 w-9 text-sm" />
                    <h3 className="font-display text-xl uppercase">{team.city} {team.name}</h3>
                  </div>
                  <div className="text-sm text-muted">
                    <span className="stat-num">{pct3(t.fga ? t.fgm / t.fga : 0)}</span> FG ·{" "}
                    <span className="stat-num">{t.ast}</span> AST
                  </div>
                </div>
                <BoxScoreTable rows={rows} />
              </div>
            </Reveal>
          ))}
        </section>

        {/* RECAP */}
        <Reveal>
          <div className="card noise relative overflow-hidden p-8 sm:p-10">
            <p className="eyebrow mb-3">The Story</p>
            <p className="max-w-3xl text-lg leading-relaxed text-fg/90">{game.recap}</p>
          </div>
        </Reveal>
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
        <p className="text-xs text-faint">{team.city}</p>
      </div>
      <div className={`font-display leading-none ${won ? "text-accent" : "text-muted"}`}>
        <CountUp to={score} className="text-6xl sm:text-8xl" />
      </div>
    </div>
  );
}

function LineRow({
  team,
  line,
  total,
  won,
}: {
  team: Team;
  line: { q1: number; q2: number; q3: number; q4: number };
  total: number;
  won: boolean;
}) {
  return (
    <tr className="border-t border-line/70">
      <td className="px-4 py-3 text-left">
        <span className={`font-semibold ${won ? "text-fg" : "text-muted"}`}>{team.abbr}</span>
      </td>
      <td className="stat-num px-2 py-3 text-muted">{line.q1}</td>
      <td className="stat-num px-2 py-3 text-muted">{line.q2}</td>
      <td className="stat-num px-2 py-3 text-muted">{line.q3}</td>
      <td className="stat-num px-2 py-3 text-muted">{line.q4}</td>
      <td className={`stat-num px-4 py-3 font-display text-xl ${won ? "text-accent" : "text-fg"}`}>
        {total}
      </td>
    </tr>
  );
}
