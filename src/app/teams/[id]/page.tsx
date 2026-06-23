import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getRoster, getTeam, listGames } from "@/lib/courtside";
import { TeamCrest } from "@/components/ui/TeamCrest";
import { Avatar } from "@/components/ui/Avatar";
import { GameCard } from "@/components/cards/GameCard";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pct3 } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = getTeam(id);
  return { title: t ? `${t.city} ${t.name}`.trim() : "Team" };
}

const num = (v?: number) => (v === undefined ? "—" : v.toFixed(1));

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const team = getTeam(id);
  if (!team) notFound();

  const roster = getRoster(team.id);
  const games = listGames({ league: team.league })
    .filter((g) => g.homeTeamId === team.id || g.awayTeamId === team.id)
    .slice(0, 6);

  const pct = team.wins / (team.wins + team.losses);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{ background: `radial-gradient(60% 100% at 15% -20%, ${team.primary}, transparent 60%)` }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <Link
            href="/standings"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" /> Standings
          </Link>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <TeamCrest team={team} className="h-24 w-24 text-3xl sm:h-32 sm:w-32 sm:text-4xl" />
            <div>
              <p className="eyebrow mb-2">{team.league} · {team.conference}</p>
              <h1 className="font-display text-5xl uppercase leading-[0.95] sm:text-7xl">
                {team.city} {team.name}
              </h1>
              <p className="mt-3 text-lg text-muted">
                <span className="stat-num font-semibold text-fg">{team.wins}–{team.losses}</span> ·{" "}
                <span className="stat-num">{pct3(pct)}</span> win pct
              </p>
              {team.source && (
                <a
                  href={team.source}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-2"
                >
                  <ExternalLink className="h-4 w-4" /> Source
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-10 sm:px-6 lg:px-8">
        {roster.length > 0 && (
          <section>
            <Reveal>
              <h2 className="font-display mb-6 text-3xl uppercase sm:text-4xl">Featured Players</h2>
            </Reveal>
            <Reveal>
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-wider text-faint">
                        <th className="px-5 py-3 text-left font-semibold">Player</th>
                        <th className="px-3 py-3 text-center font-semibold">Pos</th>
                        <th className="px-3 py-3 text-center font-semibold">PPG</th>
                        <th className="px-3 py-3 text-center font-semibold">RPG</th>
                        <th className="px-3 py-3 text-center font-semibold">APG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roster.map((p) => (
                        <tr key={p.id} className="border-t border-line/60 hover:bg-surface-2/40">
                          <td className="px-5 py-2.5 text-left">
                            <Link href={`/players/${p.id}`} className="group flex items-center gap-3">
                              <Avatar name={p.name} className="h-9 w-9" rounded="rounded-lg" />
                              <span className="font-medium text-fg group-hover:text-accent">{p.name}</span>
                            </Link>
                          </td>
                          <td className="px-3 py-2.5 text-center text-muted">{p.position ?? "—"}</td>
                          <td className="stat-num px-3 py-2.5 text-center font-bold text-fg">{num(p.stats.ppg)}</td>
                          <td className="stat-num px-3 py-2.5 text-center text-muted">{num(p.stats.rpg)}</td>
                          <td className="stat-num px-3 py-2.5 text-center text-muted">{num(p.stats.apg)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Reveal>
          </section>
        )}

        {games.length > 0 && (
          <section>
            <SectionHeading eyebrow="Recent" title="Games" href="/games" />
            <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {games.map((g) => (
                <RevealItem key={g.id}>
                  <GameCard game={g} home={getTeam(g.homeTeamId)!} away={getTeam(g.awayTeamId)!} />
                </RevealItem>
              ))}
            </RevealGroup>
          </section>
        )}

        {roster.length === 0 && games.length === 0 && (
          <p className="text-muted">
            Standings record shown above. Detailed roster and game data for this team
            isn&apos;t in the current dataset.
          </p>
        )}
      </div>
    </div>
  );
}
