import Link from "next/link";
import type { StandingRow } from "@/lib/courtside/types";
import { TeamCrest } from "@/components/ui/TeamCrest";
import { pct3 } from "@/lib/format";

export function StandingsTable({ rows, title }: { rows: StandingRow[]; title?: string }) {
  return (
    <div className="card overflow-hidden">
      {title && (
        <div className="border-b border-line px-5 py-3.5">
          <h3 className="font-display text-xl uppercase tracking-wide">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-faint">
              <th className="px-5 py-3 font-semibold">#</th>
              <th className="py-3 font-semibold">Team</th>
              <th className="px-3 py-3 text-center font-semibold">W</th>
              <th className="px-3 py-3 text-center font-semibold">L</th>
              <th className="px-3 py-3 text-center font-semibold">PCT</th>
              <th className="px-4 py-3 text-center font-semibold">GB</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.team.id}
                className="border-t border-line/70 transition-colors hover:bg-surface-2/50"
              >
                <td className="px-5 py-3">
                  <span
                    className={`stat-num font-semibold ${r.rank <= 4 ? "text-accent" : "text-muted"}`}
                  >
                    {r.rank}
                  </span>
                </td>
                <td className="py-2.5">
                  <Link href={`/teams/${r.team.id}`} className="flex items-center gap-3 group">
                    <TeamCrest team={r.team} className="h-8 w-8 text-xs" />
                    <span className="font-semibold text-fg group-hover:text-accent">
                      {r.team.name}
                    </span>
                    <span className="hidden text-xs text-faint sm:inline">{r.team.city}</span>
                  </Link>
                </td>
                <td className="stat-num px-3 py-3 text-center text-fg">{r.wins}</td>
                <td className="stat-num px-3 py-3 text-center text-muted">{r.losses}</td>
                <td className="stat-num px-3 py-3 text-center text-fg">{pct3(r.pct)}</td>
                <td className="stat-num px-4 py-3 text-center text-muted">
                  {r.gb === 0 ? "—" : r.gb.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
