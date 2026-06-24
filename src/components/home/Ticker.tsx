import type { Game, Team } from "@/lib/courtside/types";
import { formatDate } from "@/lib/format";

export function Ticker({
  items,
}: {
  items: { game: Game; home: Team; away: Team }[];
}) {
  if (items.length === 0) return null;

  const cell = (game: Game, home: Team, away: Team) => {
    const status = game.status ?? "final";
    const homeWon = game.homeScore > game.awayScore;

    if (status === "scheduled") {
      return (
        <span className="flex items-center gap-2 text-sm whitespace-nowrap">
          <span className="inline-flex items-center rounded-full border border-line px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-faint">
            Upcoming
          </span>
          <span className="font-semibold text-fg">{away.abbr}</span>
          <span className="text-faint">vs</span>
          <span className="font-semibold text-fg">{home.abbr}</span>
          <span className="text-faint">
            {game.startsAt ? game.startsAt.slice(11, 16) : formatDate(game.date)}
          </span>
          <span className="h-1 w-1 rounded-full bg-accent" />
        </span>
      );
    }

    const isLive = status === "live";
    return (
      <span className="flex items-center gap-2 text-sm whitespace-nowrap">
        {isLive ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-bad/15 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-bad">
            <span className="h-1.5 w-1.5 rounded-full bg-bad pulse-ring" /> Live
          </span>
        ) : (
          <span className="text-faint">{game.league}</span>
        )}
        <span className={homeWon ? "text-muted" : "font-semibold text-fg"}>
          {away.abbr} {game.awayScore}
        </span>
        <span className="text-faint">·</span>
        <span className={homeWon ? "font-semibold text-fg" : "text-muted"}>
          {home.abbr} {game.homeScore}
        </span>
        {isLive && game.period && <span className="text-xs text-bad">{game.period}</span>}
        <span className="h-1 w-1 rounded-full bg-accent" />
      </span>
    );
  };

  const row = (
    <div className="flex shrink-0 items-center gap-8 pr-8">
      {items.map(({ game, home, away }) => (
        <div key={game.id}>{cell(game, home, away)}</div>
      ))}
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
