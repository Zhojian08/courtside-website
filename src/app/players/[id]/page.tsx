import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPlayer, getPlayerLog, getTeam } from "@/lib/courtside";
import { Avatar } from "@/components/ui/Avatar";
import { TeamCrest } from "@/components/ui/TeamCrest";
import { CountUp } from "@/components/ui/CountUp";
import { Reveal } from "@/components/ui/Reveal";
import { PlayerTrendChart } from "@/components/charts/PlayerTrendChart";
import { PlayerRadarChart } from "@/components/charts/PlayerRadarChart";
import { formatDate, pct3 } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getPlayer(id);
  return { title: p ? p.name : "Player" };
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player = await getPlayer(id);
  if (!player) notFound();
  const team = getTeam(player.teamId)!;

  const log = getPlayerLog(player); // newest first
  const trend = [...log].reverse().map((l) => ({
    label: formatDate(l.date),
    pts: l.line.pts,
    reb: l.line.reb,
    ast: l.line.ast,
  }));

  const radar = [
    { stat: "PTS", value: Math.min(100, (player.ppg / 35) * 100) },
    { stat: "REB", value: Math.min(100, (player.rpg / 14) * 100) },
    { stat: "AST", value: Math.min(100, (player.apg / 11) * 100) },
    { stat: "STL", value: Math.min(100, (player.spg / 2.6) * 100) },
    { stat: "BLK", value: Math.min(100, (player.bpg / 3.5) * 100) },
    { stat: "FG%", value: player.fgPct },
  ];

  const bigStats = [
    { label: "PPG", value: player.ppg },
    { label: "RPG", value: player.rpg },
    { label: "APG", value: player.apg },
    { label: "SPG", value: player.spg },
    { label: "BPG", value: player.bpg },
  ];

  return (
    <div>
      {/* HERO */}
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

          <div className="grid gap-8 md:grid-cols-[260px_1fr] md:items-end">
            <Reveal>
              <div className="relative">
                <Avatar
                  name={player.name}
                  src={player.photoUrl}
                  className="aspect-square w-full"
                  rounded="rounded-3xl"
                />
                <div className="absolute -right-3 -top-3">
                  <TeamCrest team={team} className="h-14 w-14 text-base" />
                </div>
              </div>
            </Reveal>

            <div>
              <Reveal>
                <p className="font-display text-2xl text-accent">#{player.number}</p>
                <h1 className="font-display text-5xl uppercase leading-[0.9] sm:text-7xl">
                  {player.name}
                </h1>
                <p className="mt-3 text-muted">
                  {player.position} · {player.height} · {player.age} yrs ·{" "}
                  <span className="text-fg">{team.city} {team.name}</span>
                </p>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {bigStats.map((s) => (
                    <div key={s.label} className="card p-4 text-center">
                      <div className="font-display text-3xl text-fg">
                        <CountUp to={s.value} decimals={1} />
                      </div>
                      <div className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-faint">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-14 sm:px-6 lg:px-8">
        {/* shooting splits */}
        <Reveal>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Split label="FG%" value={pct3(player.fgPct / 100)} />
            <Split label="3P%" value={pct3(player.tpPct / 100)} />
            <Split label="FT%" value={pct3(player.ftPct / 100)} />
            <Split label="MIN" value={player.mpg.toFixed(1)} />
          </div>
        </Reveal>

        {/* charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <div className="card p-6">
              <h2 className="font-display mb-4 text-2xl uppercase">Last 8 Games</h2>
              <PlayerTrendChart data={trend} />
              <div className="mt-3 flex gap-5 text-xs text-muted">
                <Legend color="#ff6a1a" label="PTS" />
                <Legend color="#3d7bff" label="REB" />
                <Legend color="#2fd27a" label="AST" />
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card p-6">
              <h2 className="font-display mb-4 text-2xl uppercase">Profile</h2>
              <PlayerRadarChart data={radar} />
            </div>
          </Reveal>
        </div>

        {/* game log */}
        <Reveal>
          <div className="card overflow-hidden">
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="font-display text-2xl uppercase">Game Log</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-center text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-faint">
                    <th className="px-5 py-3 text-left font-semibold">Date</th>
                    <th className="px-3 py-3 font-semibold">MIN</th>
                    <th className="px-3 py-3 font-semibold">PTS</th>
                    <th className="px-3 py-3 font-semibold">REB</th>
                    <th className="px-3 py-3 font-semibold">AST</th>
                    <th className="px-3 py-3 font-semibold">STL</th>
                    <th className="px-3 py-3 font-semibold">BLK</th>
                    <th className="px-3 py-3 font-semibold">FG</th>
                    <th className="px-3 py-3 font-semibold">3PT</th>
                  </tr>
                </thead>
                <tbody>
                  {log.map((l, i) => (
                    <tr key={i} className="border-t border-line/60 hover:bg-surface-2/40">
                      <td className="px-5 py-3 text-left text-muted">{formatDate(l.date, { year: "numeric" })}</td>
                      <td className="stat-num px-3 py-3 text-muted">{l.line.min}</td>
                      <td className="stat-num px-3 py-3 font-bold text-fg">{l.line.pts}</td>
                      <td className="stat-num px-3 py-3 text-muted">{l.line.reb}</td>
                      <td className="stat-num px-3 py-3 text-muted">{l.line.ast}</td>
                      <td className="stat-num px-3 py-3 text-muted">{l.line.stl}</td>
                      <td className="stat-num px-3 py-3 text-muted">{l.line.blk}</td>
                      <td className="stat-num px-3 py-3 text-muted">{l.line.fgm}-{l.line.fga}</td>
                      <td className="stat-num px-3 py-3 text-muted">{l.line.tpm}-{l.line.tpa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function Split({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5 text-center">
      <div className="stat-num font-display text-3xl text-accent">{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-faint">{label}</div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
