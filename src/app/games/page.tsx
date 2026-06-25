import Link from "next/link";
import { clsx } from "clsx";
import { listGames, getTeam, getWexmeFeed, getCollections } from "@/lib/courtside";
import type { GameWithTeams, League } from "@/lib/courtside/types";
import { GameCard } from "@/components/cards/GameCard";
import { LiveBoard } from "@/components/home/LiveBoard";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { formatDateLong } from "@/lib/format";

export const metadata = { title: "Games" };
export const dynamic = "force-dynamic";

const BASE_FILTERS = [
  { key: "all", label: "All" },
  { key: "NBA", label: "NBA" },
  { key: "PBA", label: "PBA" },
  { key: "FIBA", label: "FIBA" },
  { key: "WEXME", label: "WEXME" },
];

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ league?: string; tab?: string }>;
}) {
  const { league, tab } = await searchParams;

  // Admin-curated tabs (collections) from Courtside Live, appended after the built-ins.
  const collections = await getCollections();
  const activeTab = tab && collections.some((c) => c.slug === tab) ? tab : null;
  const active = activeTab
    ? null
    : ["NBA", "PBA", "FIBA", "WEXME"].includes(league ?? "")
    ? (league as string)
    : "all";

  // WEXME feed is needed for All, the WEXME tab, and any custom tab (tabs hold WEXME games).
  const needsWexme = activeTab !== null || active === "WEXME" || active === "all";
  const wexme = needsWexme ? await getWexmeFeed() : { live: [], scheduled: [], final: [] };

  // A game placed in any custom tab/portfolio lives ONLY in that tab — drop it from
  // the generic WEXME bucket so it doesn't double-post. (All/NBA/PBA/FIBA unaffected.)
  const tabbedCodes = new Set(collections.flatMap((c) => c.codes));
  const hideTabbed = active === "WEXME";
  const boardLive = hideTabbed ? wexme.live.filter((m) => !tabbedCodes.has(m.game.id)) : wexme.live;
  const boardScheduled = hideTabbed
    ? wexme.scheduled.filter((m) => !tabbedCodes.has(m.game.id))
    : wexme.scheduled;

  // A custom tab shows its games in the admin's drag order; built-in tabs group by date.
  let ordered: GameWithTeams[] | null = null;
  let sections: { date: string; games: GameWithTeams[] }[] = [];

  if (activeTab) {
    const col = collections.find((c) => c.slug === activeTab)!;
    const byCode = new Map<string, GameWithTeams>();
    for (const m of [...wexme.live, ...wexme.scheduled, ...wexme.final]) byCode.set(m.game.id, m);
    ordered = col.codes.map((code) => byCode.get(code)).filter((m): m is GameWithTeams => !!m);
  } else {
    let finals: GameWithTeams[];
    if (active === "WEXME") {
      finals = wexme.final.filter((m) => !tabbedCodes.has(m.game.id));
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
    sections = [...byDate.entries()].map(([date, games]) => ({ date, games }));
  }

  const filters = [...BASE_FILTERS, ...collections.map((c) => ({ key: `tab:${c.slug}`, label: c.name }))];
  const activeColName = collections.find((c) => c.slug === activeTab)?.name;
  const isActive = (key: string) =>
    key.startsWith("tab:") ? activeTab === key.slice(4) : !activeTab && active === key;
  const hrefFor = (key: string) =>
    key.startsWith("tab:")
      ? `/games?tab=${key.slice(4)}`
      : key === "all"
      ? "/games"
      : `/games?league=${key}`;

  const showLive =
    !activeTab &&
    (active === "WEXME" || active === "all") &&
    (boardLive.length > 0 || boardScheduled.length > 0);
  const isEmpty = activeTab ? ordered!.length === 0 : sections.length === 0;

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
        {filters.map((f) => (
          <Link
            key={f.key}
            href={hrefFor(f.key)}
            className={clsx(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              isActive(f.key) ? "bg-accent text-black" : "border border-line text-muted hover:text-fg"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {showLive && (
        <div className="mb-12">
          <LiveBoard
            initialLive={boardLive}
            initialScheduled={boardScheduled}
            excludeCodes={hideTabbed ? [...tabbedCodes] : []}
          />
        </div>
      )}

      {isEmpty ? (
        <p className="text-muted">
          {activeTab
            ? "No games in this tab yet."
            : active === "WEXME"
            ? "No completed WEXME games yet — finals will appear here as your system publishes them."
            : "No games found."}
        </p>
      ) : activeTab ? (
        <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ordered!.map(({ game, home, away }) => (
            <RevealItem key={game.id}>
              <GameCard game={game} home={home} away={away} badge={activeColName} />
            </RevealItem>
          ))}
        </RevealGroup>
      ) : (
        <div className="space-y-10">
          {sections.map(({ date, games }) => (
            <section key={date}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-faint">
                {formatDateLong(date)}
              </h2>
              <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {games.map(({ game, home, away }) => (
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
