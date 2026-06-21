import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  href,
  hrefLabel = "View all",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <Reveal>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          <h2 className="font-display text-4xl uppercase sm:text-5xl">{title}</h2>
        </div>
        {href && (
          <Link
            href={href}
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-accent"
          >
            {hrefLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>
    </Reveal>
  );
}

export function LeagueTag({ league }: { league: string }) {
  return (
    <span
      className="chip"
      style={{
        borderColor:
          league === "PBA" ? "rgba(61,123,255,0.4)" : "rgba(255,106,26,0.4)",
        color: league === "PBA" ? "#84a9ff" : "#ffb98c",
      }}
    >
      {league}
    </span>
  );
}
