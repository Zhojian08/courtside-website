import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  href,
  hrefLabel = "View all",
  index,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  hrefLabel?: string;
  index?: string;
}) {
  return (
    <Reveal>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-end gap-4 sm:gap-6">
          {index && (
            <span className="font-display select-none text-5xl leading-[0.7] text-white/10 sm:text-8xl">
              {index}
            </span>
          )}
          <div>
            {eyebrow && <p className="eyebrow mb-2.5">{eyebrow}</p>}
            <h2 className="font-display text-5xl uppercase sm:text-6xl">{title}</h2>
          </div>
        </div>
        {href && (
          <Link
            href={href}
            className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted transition-colors hover:text-accent"
          >
            {hrefLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>
    </Reveal>
  );
}

const LEAGUE_TAG: Record<string, { border: string; color: string }> = {
  NBA: { border: "rgba(47,125,255,0.45)", color: "#9ec4ff" },
  PBA: { border: "rgba(34,195,230,0.45)", color: "#7fe0f0" },
  FIBA: { border: "rgba(255,193,77,0.5)", color: "#ffce7a" },
  WEXME: { border: "rgba(34,197,94,0.5)", color: "#86efac" },
};

export function LeagueTag({ league, label }: { league: string; label?: string }) {
  // Unknown labels here are admin-curated tab names (e.g. "MOWEN") or derived
  // portfolio labels — WEXME-family games, so style them like WEXME, not NBA.
  const c = LEAGUE_TAG[league] ?? LEAGUE_TAG.WEXME;
  return (
    <span className="chip" style={{ borderColor: c.border, color: c.color }}>
      {label || league}
    </span>
  );
}
