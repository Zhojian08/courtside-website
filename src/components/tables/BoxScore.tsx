import Link from "next/link";
import type { BoxScoreTeam } from "@/lib/courtside/wexme";
import { TeamCrest } from "@/components/ui/TeamCrest";

const COLS = [
  { key: "pts", label: "PTS", strong: true },
  { key: "reb", label: "REB", strong: false },
  { key: "ast", label: "AST", strong: false },
  { key: "stl", label: "STL", strong: false },
  { key: "blk", label: "BLK", strong: false },
  { key: "tov", label: "TO", strong: false },
  { key: "pf", label: "PF", strong: false },
] as const;

function sum(rows: BoxScoreTeam["rows"], key: (typeof COLS)[number]["key"]): number {
  return rows.reduce((t, r) => t + (r[key] as number), 0);
}

function TeamBox({ side }: { side: BoxScoreTeam }) {
  const { team, rows, score } = side;
  // Players who logged the action first, then the rest.
  const ordered = [...rows].sort((a, b) => b.pts - a.pts);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <Link href={`/teams/${team.id}`} className="group flex items-center gap-3">
          <TeamCrest team={team} className="h-9 w-9 text-sm" />
          <span className="font-display text-xl uppercase tracking-wide group-hover:text-accent">
            {team.name}
          </span>
        </Link>
        <span className="stat-num font-display text-3xl text-accent">{score}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-faint">
              <th className="px-5 py-3 text-left font-semibold">Player</th>
              <th className="px-2 py-3 text-center font-semibold">Pos</th>
              {COLS.map((c) => (
                <th key={c.key} className="px-2.5 py-3 text-center font-semibold">
                  {c.label}
                </th>
              ))}
              <th className="px-2.5 py-3 text-center font-semibold">FG</th>
              <th className="px-2.5 py-3 text-center font-semibold">3PT</th>
              <th className="px-3 py-3 text-center font-semibold">FT</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((r) => (
              <tr key={r.playerId} className="border-t border-line/60 hover:bg-surface-2/40">
                <td className="px-5 py-2.5 text-left">
                  <Link href={`/players/${r.playerId}`} className="group flex items-center gap-2">
                    {r.jersey && <span className="stat-num text-xs text-faint">#{r.jersey}</span>}
                    <span className="font-medium text-fg group-hover:text-accent">{r.name}</span>
                  </Link>
                </td>
                <td className="px-2 py-2.5 text-center text-muted">{r.position || "—"}</td>
                {COLS.map((c) => (
                  <td
                    key={c.key}
                    className={`stat-num px-2.5 py-2.5 text-center ${
                      c.strong ? "font-bold text-fg" : "text-muted"
                    }`}
                  >
                    {r[c.key] as number}
                  </td>
                ))}
                <td className="stat-num px-2.5 py-2.5 text-center text-muted">
                  {r.fgm}-{r.fga}
                </td>
                <td className="stat-num px-2.5 py-2.5 text-center text-muted">
                  {r.tpm}-{r.tpa}
                </td>
                <td className="stat-num px-3 py-2.5 text-center text-muted">
                  {r.ftm}-{r.fta}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-line bg-surface-2/30 text-xs uppercase tracking-wider">
              <td className="px-5 py-2.5 text-left font-semibold text-faint">Team</td>
              <td className="px-2 py-2.5" />
              {COLS.map((c) => (
                <td key={c.key} className="stat-num px-2.5 py-2.5 text-center font-bold text-fg">
                  {sum(ordered, c.key)}
                </td>
              ))}
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export function BoxScore({ home, away }: { home: BoxScoreTeam; away: BoxScoreTeam }) {
  return (
    <div className="space-y-6">
      <TeamBox side={away} />
      <TeamBox side={home} />
    </div>
  );
}
