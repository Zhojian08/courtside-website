import Link from "next/link";
import { clsx } from "clsx";
import { listGames, getTeam } from "@/lib/courtside";
import type { League } from "@/lib/courtside/types";
import { GameCard } from "@/components/cards/GameCard";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { formatDateLong } from "@/lib/format";

export const metadata = { title: "Games" };

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "NBA", label: "NBA" },
  { key: "PBA", label: "PBA" },
  { key: "FIBA", label: "FIBA" },
];

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ league?: string }>;
}) {
  const { league } = await searchParams;
  const active =
    league === "NBA" || league === "PBA" || league === "FIBA" ? league : "all";

  const games = listGames(active === "all" ? undefined : { league: active as League });

  // group by date
  const byDate = new Map<string, typeof games>();
  for (const g of games) {
    const arr = byDate.get(g.date) ?? [];
    arr.push(g);
    byDate.set(g.date, arr);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-10">
        <p className="eyebrow mb-2">Real Results</p>
        <h1 className="font-display text-5xl uppercase sm:text-6xl">Games</h1>
        <p className="mt-3 max-w-xl text-muted">
          Real recent finals from the NBA, PBA and FIBA, each with the story
          behind it and a link to the source.
        </p>
      </header>

      <div className="mb-8 flex gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/games" : `/games?league=${f.key}`}
            className={clsx(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              active === f.key
                ? "bg-accent text-black"
                : "border border-line text-muted hover:text-fg"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="space-y-10">
        {[...byDate.entries()].map(([date, dayGames]) => (
          <section key={date}>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-faint">
              {formatDateLong(date)}
            </h2>
            <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dayGames.map((g) => (
                <RevealItem key={g.id}>
                  <GameCard game={g} home={getTeam(g.homeTeamId)!} away={getTeam(g.awayTeamId)!} />
                </RevealItem>
              ))}
            </RevealGroup>
          </section>
        ))}
      </div>
    </div>
  );
}
