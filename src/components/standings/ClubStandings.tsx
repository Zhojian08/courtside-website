"use client";

import { useState } from "react";
import { clsx } from "clsx";
import type { StandingRow } from "@/lib/courtside/types";
import { StandingsTable } from "@/components/tables/StandingsTable";

type Group = { key: string; label: string; rows: StandingRow[] };

/**
 * A club's standings with category sub-pills (All + each category, e.g. MOWEN →
 * FUNDAMENTALS/GRASSROOTS/HOMEGROWN). All groups are computed on the server from
 * the club's live games; switching between them here is instant (no navigation).
 */
export function ClubStandings({
  clubName,
  groups,
  initialKey,
}: {
  clubName: string;
  groups: Group[];
  initialKey?: string;
}) {
  const valid = initialKey && groups.some((x) => x.key === initialKey) ? initialKey : groups[0]?.key ?? "";
  const [active, setActive] = useState(valid);
  const g = groups.find((x) => x.key === active) ?? groups[0];

  const pill = (on: boolean) =>
    clsx(
      "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
      on ? "bg-accent text-black" : "border border-line text-muted hover:text-fg"
    );

  if (!g) return <p className="text-muted">No standings yet.</p>;
  const title = g.label === "All" ? clubName : g.label;

  return (
    <div>
      {groups.length > 1 && (
        <div className="mb-8 -mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs uppercase tracking-wider text-faint">{clubName}:</span>
          {groups.map((x) => (
            <button key={x.key} type="button" onClick={() => setActive(x.key)} className={pill(active === x.key)}>
              {x.label}
            </button>
          ))}
        </div>
      )}

      {g.rows.length === 0 ? (
        <p className="text-muted">No completed games in {title} yet — standings appear as games finish.</p>
      ) : (
        <StandingsTable rows={g.rows} title={title} />
      )}
    </div>
  );
}
