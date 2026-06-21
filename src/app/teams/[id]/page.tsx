import { notFound } from "next/navigation";
import Link from "next/link";
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
  return { title: t ? `${t.city} ${t.name}` : "Team" };
}

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const team = getTeam(id);
  if (!team) notFound();

  const roster = await getRoster(team.id);
  const games = listGames({ league: team.league })
    .filter((g) => g.homeTeamId === team.id || g.awayTeamId === team.id)
    .slice(0, 6);

  const pct = team.wins / (team.wins + team.losses);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{ background: `radial-gradient(60% 100% at 15% -20%, ${team.primary}, transparent 60%)` }}
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <TeamCrest team={team} className="h-24 w-24 text-3xl sm:h-32 sm:w-32 sm:text-4xl" />
          <div>
            <p className="eyebrow mb-2">{team.league} · {team.conference}</p>
            <h1 className="font-display text-5xl uppercase leading-[0.9] sm:text-7xl">
              {team.city} {team.name}
            </h1>
            <p className="mt-3 text-lg text-muted">
              <span className="stat-num font-semibold text-fg">{team.wins}–{team.losses}</span> ·{" "}
              <span className="stat-num">{pct3(pct)}</span> win pct
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-10 sm:px-6 lg:px-8">
        {/* ROSTER */}
        <section>
          <Reveal>
            <h2 className="font-display mb-6 text-3xl uppercase sm:text-4xl">Roster</h2>
          </Reveal>
          <Reveal>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wider text-faint">
                      <th className="px-5 py-3 text-left font-semibold">Player</th>
                      <th className="px-3 py-3 text-center font-semibold">Pos</th>
                      <th className="px-3 py-3 text-center font-semibold">HT</th>
                      <th className="px-3 py-3 text-center font-semibold">PPG</th>
                      <th className="px-3 py-3 text-center font-semibold">RPG</th>
                      <th className="px-3 py-3 text-center font-semibold">APG</th>
                      <th className="px-3 py-3 text-center font-semibold">FG%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map((p) => (
                      <tr key={p.id} className="border-t border-line/60 hover:bg-surface-2/40">
                        <td className="px-5 py-2.5 text-left">
                          <Link href={`/players/${p.id}`} className="group flex items-center gap-3">
                            <Avatar name={p.name} src={p.photoUrl} className="h-9 w-9" rounded="rounded-lg" />
                            <span>
                              <span className="font-medium text-fg group-hover:text-accent">{p.name}</span>
                              <span className="ml-2 text-xs text-faint">#{p.number}</span>
                            </span>
                          </Link>
                        </td>
                        <td className="px-3 py-2.5 text-center text-muted">{p.position}</td>
                        <td className="px-3 py-2.5 text-center text-muted">{p.height}</td>
                        <td className="stat-num px-3 py-2.5 text-center font-bold text-fg">{p.ppg.toFixed(1)}</td>
                        <td className="stat-num px-3 py-2.5 text-center text-muted">{p.rpg.toFixed(1)}</td>
                        <td className="stat-num px-3 py-2.5 text-center text-muted">{p.apg.toFixed(1)}</td>
                        <td className="stat-num px-3 py-2.5 text-center text-muted">{pct3(p.fgPct / 100)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </section>

        {/* RECENT GAMES */}
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
      </div>
    </div>
  );
}
