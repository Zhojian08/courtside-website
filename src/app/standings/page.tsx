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
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const wexmeGroups = await getWexmeStandingGroups();

  // One tab per WEXME portfolio (MOWEN, CITY, …), then the reference leagues.
  const tabs = [
    ...wexmeGroups.map((g) => ({ key: g.portfolio, label: g.portfolio })),
    { key: "NBA", label: "NBA" },
    { key: "PBA", label: "PBA" },
    { key: "FIBA", label: "FIBA" },
  ];
  const activeKey = tab && tabs.some((t) => t.key === tab) ? tab : tabs[0]?.key ?? "NBA";
  const wx = wexmeGroups.find((g) => g.portfolio === activeKey);

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
