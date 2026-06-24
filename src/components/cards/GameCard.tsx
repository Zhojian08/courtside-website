import Link from "next/link";
import { clsx } from "clsx";
import { ArrowUpRight } from "lucide-react";
import type { Game, Team } from "@/lib/courtside/types";
import { TeamCrest } from "@/components/ui/TeamCrest";
import { LeagueTag } from "@/components/ui/SectionHeading";
import { formatDate } from "@/lib/format";

export function GameCard({
  game,
  home,
  away,
}: {
  game: Game;
  home: Team;
  away: Team;
}) {
  // Static NBA/PBA/FIBA games carry no status → treat as final.
  const status = game.status ?? "final";
  const isScheduled = status === "scheduled";
  const isLive = status === "live";
  const homeWon = status === "final" && game.homeScore > game.awayScore;
  const awayWon = status === "final" && game.awayScore > game.homeScore;
  const label = isLive ? "LIVE" : isScheduled ? "SCHEDULED" : "FINAL";

  return (
    <Link
      href={`/games/${game.id}`}
      className="card card-hover noise group relative block overflow-hidden p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <LeagueTag league={game.league} />
        <span className={clsx("text-xs", isLive ? "font-bold text-bad" : "text-faint")}>
          {formatDate(game.date)} · {label}
          {isLive && game.period ? ` · ${game.period}` : ""}
        </span>
      </div>

      <Row team={away} score={game.awayScore} won={awayWon} show={!isScheduled} live={isLive} />
      <div className="my-2 h-px bg-line" />
      <Row team={home} score={game.homeScore} won={homeWon} show={!isScheduled} live={isLive} />

      <p className="mt-4 line-clamp-1 text-sm text-muted">{game.headline}</p>

      <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-faint opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}

function Row({
  team,
  score,
  won,
  show,
  live,
}: {
  team: Team;
  score: number;
  won: boolean;
  show: boolean;
  live: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <TeamCrest team={team} className="h-9 w-9 text-sm" />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-semibold ${won ? "text-fg" : "text-muted"}`}>
          {team.name}
        </p>
        {team.city && <p className="text-xs text-faint">{team.city}</p>}
      </div>
      {show && (
        <span
          className={clsx(
            "stat-num font-display text-3xl",
            live ? "text-bad" : won ? "text-accent" : "text-muted"
          )}
        >
          {score}
        </span>
      )}
    </div>
  );
}
