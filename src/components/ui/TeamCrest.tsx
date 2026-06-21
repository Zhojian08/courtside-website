import { clsx } from "clsx";
import type { Team } from "@/lib/courtside/types";

export function TeamCrest({
  team,
  className,
  showAbbr = true,
}: {
  team: Team;
  className?: string;
  showAbbr?: boolean;
}) {
  return (
    <div
      className={clsx(
        "grid place-items-center rounded-xl font-display tracking-wide",
        className
      )}
      style={{
        containerType: "inline-size",
        background: `linear-gradient(135deg, ${team.primary}, ${team.secondary})`,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
      }}
      aria-label={`${team.city} ${team.name}`}
    >
      {showAbbr && (
        <span
          className="text-[clamp(0.6rem,34cqw,2rem)] text-white drop-shadow"
          style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}
        >
          {team.abbr}
        </span>
      )}
    </div>
  );
}
