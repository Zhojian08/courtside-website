import Link from "next/link";
import type { GamePerformer } from "@/lib/courtside/types";
import { Avatar } from "@/components/ui/Avatar";
import { CATEGORY_META } from "@/lib/categories";

export function PerformerCard({ performer }: { performer: GamePerformer }) {
  const meta = CATEGORY_META[performer.category];

  const card = (
    <div className="card card-hover group relative block overflow-hidden">
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <Avatar
          name={performer.name}
          rounded="rounded-none"
          align="top"
          initialsClassName="text-[clamp(1.1rem,26cqw,2.75rem)]"
          className="h-full w-full transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
        <div
          className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[0.7rem] font-bold tracking-wide text-black"
          style={{ background: meta.color }}
        >
          {meta.short}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end gap-2">
            <span className="font-display text-4xl leading-none sm:text-5xl" style={{ color: meta.color }}>
              {performer.value}
            </span>
            <span className="mb-1 text-xs font-semibold text-muted">{meta.short}</span>
          </div>
          <p className="mt-1 truncate font-semibold text-fg">{performer.name}</p>
          <p className="text-xs text-muted">
            {performer.teamAbbr}
            {performer.detail ? ` · ${performer.detail}` : ""}
          </p>
        </div>
      </div>
    </div>
  );

  return performer.playerId ? (
    <Link href={`/players/${performer.playerId}`}>{card}</Link>
  ) : (
    card
  );
}
