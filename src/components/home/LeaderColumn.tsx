import Link from "next/link";
import type { SeasonLeader } from "@/lib/courtside/types";
import { Avatar } from "@/components/ui/Avatar";

export function LeaderColumn({
  title,
  color,
  unit,
  leaders,
}: {
  title: string;
  color: string;
  unit: string;
  leaders: SeasonLeader[];
}) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        <h3 className="font-display text-xl uppercase tracking-wide">{title}</h3>
      </div>
      <ol className="space-y-1">
        {leaders.map((l) => {
          const row = (
            <div className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-2/60">
              <span className="stat-num w-4 text-sm text-faint">{l.rank}</span>
              <Avatar name={l.name} className="h-9 w-9" rounded="rounded-lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fg">{l.name}</p>
                <p className="text-xs text-faint">{l.teamAbbr} · {l.league}</p>
              </div>
              <span className="stat-num font-display text-xl" style={{ color }}>
                {l.value.toFixed(1)}
                <span className="ml-1 text-[0.6rem] text-faint">{unit}</span>
              </span>
            </div>
          );
          return (
            <li key={`${l.name}-${l.rank}`}>
              {l.playerId ? <Link href={`/players/${l.playerId}`}>{row}</Link> : row}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
