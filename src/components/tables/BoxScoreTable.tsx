import Link from "next/link";
import type { BoxEntry, Player } from "@/lib/courtside/types";

export interface BoxRow {
  player: Pick<Player, "id" | "name" | "number" | "position">;
  line: BoxEntry;
}

const COLS: { key: keyof BoxEntry | "fg" | "tp" | "ft"; label: string }[] = [
  { key: "min", label: "MIN" },
  { key: "pts", label: "PTS" },
  { key: "reb", label: "REB" },
  { key: "ast", label: "AST" },
  { key: "stl", label: "STL" },
  { key: "blk", label: "BLK" },
  { key: "tov", label: "TO" },
  { key: "fg", label: "FG" },
  { key: "tp", label: "3PT" },
  { key: "ft", label: "FT" },
];

function cell(line: BoxEntry, key: (typeof COLS)[number]["key"]): string {
  if (key === "fg") return `${line.fgm}-${line.fga}`;
  if (key === "tp") return `${line.tpm}-${line.tpa}`;
  if (key === "ft") return `${line.ftm}-${line.fta}`;
  return String(line[key as keyof BoxEntry]);
}

export function BoxScoreTable({ rows }: { rows: BoxRow[] }) {
  const starters = rows.filter((r) => r.line.starter);
  const bench = rows.filter((r) => !r.line.starter);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-faint">
            <th className="sticky left-0 bg-surface px-4 py-2.5 text-left font-semibold">Player</th>
            {COLS.map((c) => (
              <th key={c.label} className="px-2.5 py-2.5 text-center font-semibold">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <Section label="Starters" rows={starters} />
          <Section label="Bench" rows={bench} />
        </tbody>
      </table>
    </div>
  );
}

function Section({ label, rows }: { label: string; rows: BoxRow[] }) {
  return (
    <>
      <tr>
        <td
          colSpan={COLS.length + 1}
          className="bg-ink/40 px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-faint"
        >
          {label}
        </td>
      </tr>
      {rows.map(({ player, line }) => (
        <tr key={player.id} className="border-t border-line/60 hover:bg-surface-2/40">
          <td className="sticky left-0 bg-surface px-4 py-2.5 text-left">
            <Link href={`/players/${player.id}`} className="group flex items-center gap-2">
              <span className="font-medium text-fg group-hover:text-accent">{player.name}</span>
              <span className="text-xs text-faint">{player.position}</span>
            </Link>
          </td>
          {COLS.map((c) => {
            const isPts = c.key === "pts";
            return (
              <td
                key={c.label}
                className={`stat-num px-2.5 py-2.5 text-center ${
                  isPts ? "font-bold text-fg" : "text-muted"
                }`}
              >
                {cell(line, c.key)}
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}
