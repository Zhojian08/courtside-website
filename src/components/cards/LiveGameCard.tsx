import Link from "next/link";
import { clsx } from "clsx";
import type { GameWithTeams } from "@/lib/courtside/types";
import { TeamCrest } from "@/components/ui/TeamCrest";
import { formatDate } from "@/lib/format";

function tipTime(startsAt?: string): string {
  if (!startsAt) return "";
  const t = startsAt.slice(11, 16); // HH:MM (UTC, consistent server/client)
  return `${formatDate(startsAt.slice(0, 10))} · ${t}`;
}

export function LiveGameCard({ item }: { item: GameWithTeams }) {
  const { game, home, away } = item;
  const live = game.status === "live";
  const scheduled = game.status === "scheduled";
  const homeWon = game.homeScore > game.awayScore;

  return (
    <Link
      href={`/games/${game.id}`}
      className={clsx(
        "card card-hover block overflow-hidden p-5",
        live && "border-good/40"
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        {live ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-bad/15 px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-bad">
            <span className="h-1.5 w-1.5 rounded-full bg-bad pulse-ring" /> Live
          </span>
        ) : scheduled ? (
          <span className="chip text-faint">Scheduled</span>
        ) : (
          <span className="text-xs font-semibold text-faint">FINAL</span>
        )}
        <span className="text-xs text-faint">
          {scheduled ? tipTime(game.startsAt) : game.period || game.venue}
        </span>
      </div>

      <Row team={away} score={game.awayScore} show={!scheduled} lead={!homeWon} live={live} />
      <div className="my-2 h-px bg-line" />
      <Row team={home} score={game.homeScore} show={!scheduled} lead={homeWon} live={live} />

      {scheduled && (
        <p className="mt-3 text-center text-xs text-muted">{away.name} vs {home.name}</p>
      )}
    </Link>
  );
}

function Row({
  team,
  score,
  show,
  lead,
  live,
}: {
  team: GameWithTeams["home"];
  score: number;
  show: boolean;
  lead: boolean;
  live: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <TeamCrest team={team} className="h-9 w-9 text-sm" />
      <div className="min-w-0 flex-1">
        <p className={clsx("truncate text-sm font-semibold", show && lead ? "text-fg" : "text-muted")}>
          {team.name}
        </p>
        {team.city && <p className="text-xs text-faint">{team.city}</p>}
      </div>
      {show && (
        <span
          className={clsx(
            "stat-num font-display text-3xl",
            live ? "text-bad" : lead ? "text-accent" : "text-muted"
          )}
        >
          {score}
        </span>
      )}
    </div>
  );
}
