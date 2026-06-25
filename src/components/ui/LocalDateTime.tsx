"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/format";

/**
 * Tip-off time in the viewer's local timezone, 12-hour (e.g. "Jun 26 · 7:15 PM").
 * The server and first client render show the date only — stable, so there's no
 * hydration mismatch — then after mount we add the local time, which matches the
 * time the operator scheduled in their own timezone (instead of raw UTC 24-hour).
 */
export function LocalDateTime({ iso }: { iso: string }) {
  const [text, setText] = useState(() => formatDate(iso.slice(0, 10)));

  useEffect(() => {
    // Local timezone is only known on the client, so we read it once after mount.
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setText(
        d.toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    }
  }, [iso]);

  return <span>{text}</span>;
}
