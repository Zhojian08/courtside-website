import Link from "next/link";
import { clsx } from "clsx";
import { getSeasonLeaders } from "@/lib/courtside";
import type { League, StatCategory } from "@/lib/courtside/types";
import { LeaderBars } from "@/components/charts/LeaderBars";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = { title: "Leaders" };
export const dynamic = "force-dynamic";

const CATS: { key: StatCategory; title: string; unit: string; color: string }[] = [
  { key: "PTS", title: "Points", unit: " PPG", color: "#ff6a1a" },
  { key: "REB", title: "Rebounds", unit: " RPG", color: "#3d7bff" },
  { key: "AST", title: "Assists", unit: " APG", color: "#2fd27a" },
  { key: "BLK", title: "Blocks", unit: " BPG", color: "#a472ff" },
  { key: "STL", title: "Steals", unit: " SPG", color: "#ff5d8f" },
];

const FILTERS = [
  { key: "all", label: "All Leagues" },
  { key: "NBA", label: "NBA" },
  { key: "PBA", label: "PBA" },
];

export default async function LeadersPage({
  searchParams,
}: {
  searchParams: Promise<{ league?: string }>;
}) {
  const { league } = await searchParams;
  const active = league === "NBA" || league === "PBA" ? league : "all";
  const opts = { league: active === "all" ? undefined : (active as League), limit: 8 };

  const boards = await Promise.all(
    CATS.map(async (c) => ({
      ...c,
      data: (await getSeasonLeaders(c.key, opts)).map((l) => ({
        name: l.player.name,
        value: l.value,
        highlight: l.rank === 1,
      })),
    }))
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="eyebrow mb-2">Who&apos;s Cooking</p>
        <h1 className="font-display text-5xl uppercase sm:text-6xl">League Leaders</h1>
        <p className="mt-3 max-w-xl text-muted">
          Season per-game averages across every tracked league.
        </p>
      </header>

      <div className="mb-10 flex gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/leaders" : `/leaders?league=${f.key}`}
            className={clsx(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              active === f.key ? "bg-accent text-black" : "border border-line text-muted hover:text-fg"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {boards.map((b, i) => (
          <Reveal key={b.key} delay={(i % 2) * 0.08}>
            <div className="card p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: b.color }} />
                <h2 className="font-display text-2xl uppercase tracking-wide">{b.title}</h2>
              </div>
              <LeaderBars data={b.data} unit={b.unit} />
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
