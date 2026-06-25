import Link from "next/link";
import { clsx } from "clsx";
import { getStandings, getWexmeStandingGroups } from "@/lib/courtside";
import { StandingsTable } from "@/components/tables/StandingsTable";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = { title: "Standings" };
export const dynamic = "force-dynamic";

export default async function StandingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; g?: string }>;
}) {
  const { tab, g } = await searchParams;
  const wexmeGroups = await getWexmeStandingGroups();
  const hasWexme = wexmeGroups.length > 0;

  // Top-level: WEXME (your competitions live under here), then the reference leagues.
  const tabs = [
    ...(hasWexme ? [{ key: "WEXME", label: "WEXME" }] : []),
    { key: "NBA", label: "NBA" },
    { key: "PBA", label: "PBA" },
    { key: "FIBA", label: "FIBA" },
  ];
  const activeKey = tab && tabs.some((t) => t.key === tab) ? tab : tabs[0]?.key ?? "NBA";

  // Under WEXME, each competition (HARBOR, CITY, MOWEN, …) is a sub-pill.
  const activeGroup =
    activeKey === "WEXME"
      ? (g && wexmeGroups.some((x) => x.portfolio === g) ? g : wexmeGroups[0]?.portfolio) ?? null
      : null;
  const wx = activeGroup ? wexmeGroups.find((x) => x.portfolio === activeGroup) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="eyebrow mb-2">The Race</p>
        <h1 className="font-display text-5xl uppercase sm:text-6xl">Standings</h1>
        <p className="mt-3 max-w-xl text-muted">
          Records by league — your WEXME competitions, plus the latest NBA season, the
          PBA Commissioner&apos;s Cup, and the FIBA U18 AmeriCup. Pick a league.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/standings?tab=${encodeURIComponent(t.key)}`}
            className={clsx(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              t.key === activeKey
                ? "bg-accent text-black"
                : "border border-line text-muted hover:text-fg"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {activeKey === "WEXME" && hasWexme && (
        <div className="mb-8 -mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs uppercase tracking-wider text-faint">WEXME:</span>
          {wexmeGroups.map((x) => (
            <Link
              key={x.portfolio}
              href={`/standings?tab=WEXME&g=${encodeURIComponent(x.portfolio)}`}
              className={clsx(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                x.portfolio === activeGroup
                  ? "bg-accent text-black"
                  : "border border-line text-muted hover:text-fg"
              )}
            >
              {x.portfolio}
            </Link>
          ))}
        </div>
      )}

      {wx ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {wx.tables.map((t, i) => (
            <Reveal key={t.league} delay={(i % 2) * 0.08}>
              <StandingsTable rows={t.rows} title={t.title} />
            </Reveal>
          ))}
        </div>
      ) : activeKey === "NBA" ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal>
            <StandingsTable rows={getStandings("NBA", "Eastern")} title="Eastern Conference" />
          </Reveal>
          <Reveal delay={0.1}>
            <StandingsTable rows={getStandings("NBA", "Western")} title="Western Conference" />
          </Reveal>
        </div>
      ) : activeKey === "PBA" ? (
        <Reveal>
          <StandingsTable rows={getStandings("PBA")} title="Elimination Round" />
        </Reveal>
      ) : activeKey === "FIBA" ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal>
            <StandingsTable rows={getStandings("FIBA", "Group A")} title="Group A" />
          </Reveal>
          <Reveal delay={0.1}>
            <StandingsTable rows={getStandings("FIBA", "Group B")} title="Group B" />
          </Reveal>
        </div>
      ) : null}
    </div>
  );
}
