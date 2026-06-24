import Link from "next/link";
import { clsx } from "clsx";
import { getSeasonLeaders, getWexmeLeaders } from "@/lib/courtside";
import type { League, SeasonLeader, StatCategory } from "@/lib/courtside/types";
import { LeaderColumn } from "@/components/home/LeaderColumn";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = { title: "Leaders" };
export const dynamic = "force-dynamic";

const CATS = [
  { key: "PTS" as const, title: "Points", unit: "PPG", color: "#2f7dff" },
  { key: "REB" as const, title: "Rebounds", unit: "RPG", color: "#22c3e6" },
  { key: "AST" as const, title: "Assists", unit: "APG", color: "#2fd27a" },
];

const FILTERS = [
  { key: "all", label: "All Leagues" },
  { key: "WEXME", label: "WEXME" },
  { key: "NBA", label: "NBA" },
  { key: "PBA", label: "PBA" },
  { key: "FIBA", label: "FIBA" },
];

function reRank(rows: SeasonLeader[]): SeasonLeader[] {
  return [...rows].sort((a, b) => b.value - a.value).map((r, i) => ({ ...r, rank: i + 1 }));
}

async function leadersFor(cat: StatCategory, active: string): Promise<SeasonLeader[]> {
  if (active === "WEXME") return getWexmeLeaders(cat);
  if (active === "all") {
    const [sample, wexme] = await Promise.all([
      Promise.resolve(getSeasonLeaders(cat)),
      getWexmeLeaders(cat),
    ]);
    return reRank([...wexme, ...sample]);
  }
  return getSeasonLeaders(cat, { league: active as League });
}

export default async function LeadersPage({
  searchParams,
}: {
  searchParams: Promise<{ league?: string }>;
}) {
  const { league } = await searchParams;
  const active =
    league === "NBA" || league === "PBA" || league === "FIBA" || league === "WEXME"
      ? league
      : "all";

  const boards = await Promise.all(
    CATS.map(async (c) => ({ ...c, rows: await leadersFor(c.key, active) }))
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="eyebrow mb-2">Who&apos;s Cooking</p>
        <h1 className="font-display text-5xl uppercase sm:text-6xl">Stat Leaders</h1>
        <p className="mt-3 max-w-xl text-muted">
          Real statistical leaders from the latest NBA season, PBA Commissioner&apos;s
          Cup and FIBA U18 AmeriCup. Tap a name for the source.
        </p>
      </header>

      <div className="mb-10 flex flex-wrap gap-2">
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {boards.map((b, i) =>
          b.rows.length > 0 ? (
            <Reveal key={b.key} delay={(i % 3) * 0.06}>
              <LeaderColumn title={b.title} color={b.color} unit={b.unit} leaders={b.rows} />
            </Reveal>
          ) : null
        )}
      </div>
    </div>
  );
}
