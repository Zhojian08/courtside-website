import Link from "next/link";
import { clsx } from "clsx";
import { listGames, getTeam, getWexmeFeed } from "@/lib/courtside";
import type { GameWithTeams, League } from "@/lib/courtside/types";
import { GameCard } from "@/components/cards/GameCard";
import { LiveBoard } from "@/components/home/LiveBoard";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { formatDateLong } from "@/lib/format";

export const metadata = { title: "Games" };
export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "NBA", label: "NBA" },
  { key: "PBA", label: "PBA" },
  { key: "FIBA", label: "FIBA" },
  { key: "WEXME", label: "WEXME" },
];

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ league?: string }>;
}) {
  const { league } = await searchParams;
  const active =
    ["NBA", "PBA", "FIBA", "WEXME"].includes(league ?? "") ? (league as string) : "all";

  const needsWexme = active === "WEXME" || active === "all";
  const wexme = needsWexme ? await getWexmeFeed() : { live: [], scheduled: [], final: [] };

  let finals: GameWithTeams[];
  if (active === "WEXME") {
    finals = wexme.final;
  } else {
    const staticGames = listGames(active === "all" ? undefined : { league: active as League });
    finals = staticGames.map((g) => ({
      game: g,
      home: getTeam(g.homeTeamId)!,
      away: getTeam(g.awayTeamId)!,
    }));
    if (active === "all") {
      finals = [...wexme.final, ...finals].sort((a, b) => b.game.date.localeCompare(a.game.date));
    }
  }

  const byDate = new Map<string, GameWithTeams[]>();
  for (const item of finals) {
    const arr = byDate.get(item.game.date) ?? [];
    arr.push(item);
    byDate.set(item.game.date, arr);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-10">
        <p className="eyebrow mb-2">Real Results</p>
        <h1 className="font-display text-5xl uppercase sm:text-6xl">Games</h1>
        <p className="mt-3 max-w-xl text-muted">
          Live and final games from your WEXME system, plus real results from the
          NBA, PBA and FIBA — each with the story behind it.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/games" : `/games?league=${f.key}`}
            className={clsx(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              active === f.key ? "bg-accent text-black" : "border border-line text-muted hover:text-fg"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {(active === "WEXME" || active === "all") &&
        (wexme.live.length > 0 || wexme.scheduled.length > 0) && (
          <div className="mb-12">
            <LiveBoard initialLive={wexme.live} initialScheduled={wexme.scheduled} />
          </div>
        )}

      {finals.length === 0 ? (
        <p className="text-muted">
          {active === "WEXME"
            ? "No completed WEXME games yet — finals will appear here as your system publishes them."
            : "No games found."}
        </p>
      ) : (
        <div className="space-y-10">
          {[...byDate.entries()].map(([date, dayGames]) => (
            <section key={date}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-faint">
                {formatDateLong(date)}
              </h2>
              <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {dayGames.map(({ game, home, away }) => (
                  <RevealItem key={game.id}>
                    <GameCard game={game} home={home} away={away} />
                  </RevealItem>
                ))}
              </RevealGroup>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
