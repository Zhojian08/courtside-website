"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import type { GameWithTeams } from "@/lib/courtside/types";
import { LiveGameCard } from "@/components/cards/LiveGameCard";

/**
 * Live board for WEXME — renders server-provided data immediately, then polls
 * /api/wexme/live every 15s so live scores update without a refresh.
 */
export function LiveBoard({
  initialLive,
  initialScheduled,
}: {
  initialLive: GameWithTeams[];
  initialScheduled: GameWithTeams[];
}) {
  const [live, setLive] = useState(initialLive);
  const [scheduled, setScheduled] = useState(initialScheduled);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch("/api/wexme/live", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!alive) return;
        setLive(data.live ?? []);
        setScheduled(data.scheduled ?? []);
        setPulse(true);
        setTimeout(() => alive && setPulse(false), 600);
      } catch {
        /* keep last good data */
      }
    };
    const id = setInterval(tick, 15000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (live.length === 0 && scheduled.length === 0) return null;

  return (
    <div className="space-y-8">
      {live.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-bad pulse-ring" />
            <h3 className="font-display text-xl uppercase tracking-wide">Live Now</h3>
            <RefreshCw className={`h-3.5 w-3.5 text-faint transition-opacity ${pulse ? "opacity-100" : "opacity-30"}`} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((g) => (
              <LiveGameCard key={g.game.id} item={g} />
            ))}
          </div>
        </div>
      )}

      {scheduled.length > 0 && (
        <div>
          <h3 className="font-display mb-4 text-xl uppercase tracking-wide text-muted">Upcoming</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {scheduled.map((g) => (
              <LiveGameCard key={g.game.id} item={g} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
