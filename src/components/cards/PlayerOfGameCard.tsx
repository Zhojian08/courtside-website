import Link from "next/link";
import { Star } from "lucide-react";
import type { BoxEntry, Player, Team } from "@/lib/courtside/types";
import { Avatar } from "@/components/ui/Avatar";
import { pct3 } from "@/lib/format";

export function PlayerOfGameCard({
  player,
  team,
  line,
  photoUrl,
}: {
  player: Player;
  team: Team;
  line: BoxEntry;
  photoUrl: string | null;
}) {
  const stats: { label: string; value: string }[] = [
    { label: "PTS", value: String(line.pts) },
    { label: "REB", value: String(line.reb) },
    { label: "AST", value: String(line.ast) },
    { label: "STL", value: String(line.stl) },
    { label: "BLK", value: String(line.blk) },
    { label: "FG", value: `${line.fgm}/${line.fga}` },
    { label: "3PT", value: `${line.tpm}/${line.tpa}` },
    { label: "FG%", value: pct3(line.fga ? line.fgm / line.fga : 0) },
  ];

  return (
    <div
      className="card noise relative overflow-hidden p-0"
      style={{ boxShadow: "0 30px 80px -40px rgba(255,176,32,0.5)" }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{ background: `radial-gradient(80% 60% at 80% 10%, ${team.primary}, transparent 60%)` }}
      />
      <div className="relative grid gap-0 md:grid-cols-[300px_1fr]">
        {/* photo */}
        <div className="relative aspect-square md:aspect-auto">
          <Avatar
            name={player.name}
            src={photoUrl ?? player.photoUrl}
            rounded="rounded-none"
            className="h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface md:bg-gradient-to-r" />
        </div>

        {/* details */}
        <div className="p-6 sm:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent-2/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-2">
            <Star className="h-3.5 w-3.5 fill-accent-2" />
            Player of the Game
          </div>

          <Link href={`/players/${player.id}`}>
            <h3 className="font-display text-4xl uppercase leading-none hover:text-accent-2 sm:text-5xl">
              {player.name}
            </h3>
          </Link>
          <p className="mt-2 text-sm text-muted">
            #{player.number} · {player.position} · {team.city} {team.name}
          </p>

          <div className="mt-6 grid grid-cols-4 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl bg-ink/50 p-3 text-center">
                <div className="stat-num font-display text-2xl text-fg">{s.value}</div>
                <div className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-faint">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
