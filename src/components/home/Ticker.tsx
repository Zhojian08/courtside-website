import type { Game, Team } from "@/lib/courtside/types";

export function Ticker({
  items,
}: {
  items: { game: Game; home: Team; away: Team }[];
}) {
  const row = (
    <div className="flex shrink-0 items-center gap-8 pr-8">
      {items.map(({ game, home, away }) => {
        const homeWon = game.homeScore > game.awayScore;
        return (
          <span key={game.id} className="flex items-center gap-2 text-sm whitespace-nowrap">
            <span className="text-faint">{game.league}</span>
            <span className={homeWon ? "text-muted" : "font-semibold text-fg"}>
              {away.abbr} {game.awayScore}
            </span>
            <span className="text-faint">·</span>
            <span className={homeWon ? "font-semibold text-fg" : "text-muted"}>
              {home.abbr} {game.homeScore}
            </span>
            <span className="h-1 w-1 rounded-full bg-accent" />
          </span>
        );
      })}
    </div>
  );

  return (
    <div className="relative flex overflow-hidden border-y border-line bg-ink-2/60 py-3">
      <div className="flex animate-marquee">
        {row}
        {row}
      </div>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink to-transparent" />
    </div>
  );
}
