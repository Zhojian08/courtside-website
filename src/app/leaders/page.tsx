import Link from "next/link";
import { clsx } from "clsx";
import { getSeasonLeaders } from "@/lib/courtside";
import type { League } from "@/lib/courtside/types";
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
  { key: "NBA", label: "NBA" },
  { key: "PBA", label: "PBA" },
  { key: "FIBA", label: "FIBA" },
];

export default async function LeadersPage({
  searchParams,
}: {
  searchParams: Promise<{ league?: string }>;
}) {
  const { league } = await searchParams;
  const active =
    league === "NBA" || league === "PBA" || league === "FIBA" ? league : "all";
  const opts = active === "all" ? {} : { league: active as League };

  const boards = CATS.map((c) => ({ ...c, rows: getSeasonLeaders(c.key, opts) }));

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
