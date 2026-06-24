import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import {
  getPlayer,
  getPlayerGames,
  getTeam,
  getWexmePlayer,
  getWexmePlayerGames,
  getWexmeTeam,
} from "@/lib/courtside";
import type { GameWithTeams, Player, Team } from "@/lib/courtside/types";
import { Avatar } from "@/components/ui/Avatar";
import { TeamCrest } from "@/components/ui/TeamCrest";
import { CountUp } from "@/components/ui/CountUp";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { GameCard } from "@/components/cards/GameCard";

export const dynamic = "force-dynamic";

interface PlayerView {
  player: Player;
  team: Team;
  games: GameWithTeams[];
}

async function resolve(id: string): Promise<PlayerView | null> {
  if (id.startsWith("wx-")) {
    const player = await getWexmePlayer(id);
    if (!player) return null;
    const team = await getWexmeTeam(player.teamId);
    if (!team) return null;
    const games = await getWexmePlayerGames(id);
    return { player, team, games };
  }
  const player = getPlayer(id);
  if (!player) return null;
  const team = getTeam(player.teamId);
  if (!team) return null;
  const games = getPlayerGames(player.id).map((g) => ({
    game: g,
    home: getTeam(g.homeTeamId)!,
    away: getTeam(g.awayTeamId)!,
  }));
  return { player, team, games };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = id.startsWith("wx-") ? await getWexmePlayer(id) : getPlayer(id);
  return { title: p ? p.name : "Player" };
}

const STAT_LABELS: { key: keyof Player["stats"]; label: string; suffix?: string }[] = [
  { key: "ppg", label: "PPG" },
  { key: "rpg", label: "RPG" },
  { key: "apg", label: "APG" },
  { key: "bpg", label: "BPG" },
  { key: "spg", label: "SPG" },
  { key: "fgPct", label: "FG%", suffix: "%" },
];

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = await resolve(id);
  if (!view) notFound();
  const { player, team, games } = view;

  const bigStats = STAT_LABELS.filter((s) => player.stats[s.key] !== undefined).map((s) => ({
    label: s.label,
    value: player.stats[s.key] as number,
    suffix: s.suffix,
  }));

  return (
    <div>
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{ background: `radial-gradient(70% 90% at 20% -10%, ${team.primary}, transparent 55%)` }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href={`/teams/${team.id}`}
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" /> {team.city} {team.name}
          </Link>

          <div className="grid gap-8 md:grid-cols-[240px_1fr] md:items-end">
            <Reveal>
              <div className="relative">
                <Avatar name={player.name} className="aspect-square w-full" rounded="rounded-3xl" />
                <div className="absolute -right-3 -top-3">
                  <TeamCrest team={team} className="h-14 w-14 text-base" />
                </div>
              </div>
            </Reveal>

            <div>
              <Reveal>
                {player.number !== undefined && (
                  <p className="font-display text-2xl text-accent">#{player.number}</p>
                )}
                <h1 className="font-display text-5xl uppercase leading-[0.95] sm:text-7xl">
                  {player.name}
                </h1>
                <p className="mt-3 text-muted">
                  {player.position ? `${player.position} · ` : ""}
                  <span className="text-fg">{team.city} {team.name}</span> · {player.league}
                </p>
                <p className="mt-1 text-sm text-faint">{player.statContext}</p>
              </Reveal>

              {bigStats.length > 0 && (
                <Reveal delay={0.1}>
                  <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {bigStats.map((s) => (
                      <div key={s.label} className="card p-4 text-center">
                        <div className="font-display text-3xl text-fg">
                          <CountUp to={s.value} decimals={1} suffix={s.suffix} />
                        </div>
                        <div className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-faint">
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </Reveal>
              )}

              {player.source && (
                <Reveal delay={0.15}>
                  <a
                    href={player.source}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-2"
                  >
                    <ExternalLink className="h-4 w-4" /> Source
                  </a>
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        {games.length > 0 ? (
          <>
            <Reveal>
              <h2 className="font-display mb-6 text-3xl uppercase sm:text-4xl">Featured In</h2>
            </Reveal>
            <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {games.map(({ game, home, away }) => (
                <RevealItem key={game.id}>
                  <GameCard game={game} home={home} away={away} />
                </RevealItem>
              ))}
            </RevealGroup>
          </>
        ) : (
          <p className="text-muted">No featured games on record yet for {player.name}.</p>
        )}
      </div>
    </div>
  );
}
