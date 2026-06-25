"use client";

import { useState } from "react";
import { clsx } from "clsx";
import type { GameWithTeams } from "@/lib/courtside/types";
import { GameCard } from "@/components/cards/GameCard";

type Cat = { name: string; slug: string; codes: string[] };

/**
 * A club's games with its category sub-pills, filtered ENTIRELY in the browser —
 * switching categories is instant (no server round-trip), which fixes the lag
 * from navigating between ?cat= URLs. The club's full game set is provided once
 * by the server; clicking a category just filters it in memory.
 */
export function ClubGames({
  clubName,
  categories,
  games,
  initialCat,
}: {
  clubName: string;
  categories: Cat[];
  games: GameWithTeams[];
  initialCat?: string;
}) {
  const valid = initialCat && categories.some((c) => c.slug === initialCat) ? initialCat : null;
  const [activeCat, setActiveCat] = useState<string | null>(valid);

  const cat = categories.find((c) => c.slug === activeCat) ?? null;
  const codeSet = cat ? new Set(cat.codes) : null;
  const shown = codeSet ? games.filter((g) => codeSet.has(g.game.id)) : games;
  const badge = cat ? cat.name : clubName;

  const pill = (active: boolean) =>
    clsx(
      "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
      active ? "bg-accent text-black" : "border border-line text-muted hover:text-fg"
    );

  return (
    <div>
      {categories.length > 0 && (
        <div className="mb-8 -mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs uppercase tracking-wider text-faint">{clubName}:</span>
          <button type="button" onClick={() => setActiveCat(null)} className={pill(!activeCat)}>
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setActiveCat(c.slug)}
              className={pill(activeCat === c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="text-muted">No games in this {cat ? "category" : "tab"} yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map(({ game, home, away }) => (
            <GameCard key={game.id} game={game} home={home} away={away} badge={badge} />
          ))}
        </div>
      )}
    </div>
  );
}
