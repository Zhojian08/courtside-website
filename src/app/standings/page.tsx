import { getStandings } from "@/lib/courtside";
import { StandingsTable } from "@/components/tables/StandingsTable";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = { title: "Standings" };

export default function StandingsPage() {
  const east = getStandings("NBA", "East");
  const west = getStandings("NBA", "West");
  const pba = getStandings("PBA");

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-10">
        <p className="eyebrow mb-2">The Race</p>
        <h1 className="font-display text-5xl uppercase sm:text-6xl">Standings</h1>
        <p className="mt-3 max-w-xl text-muted">
          Win-loss records, games back and current streaks across every league.
        </p>
      </header>

      <div className="space-y-12">
        <section>
          <h2 className="font-display mb-4 text-2xl uppercase text-muted">NBA</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Reveal>
              <StandingsTable rows={east} title="Eastern Conference" />
            </Reveal>
            <Reveal delay={0.1}>
              <StandingsTable rows={west} title="Western Conference" />
            </Reveal>
          </div>
        </section>

        <section>
          <h2 className="font-display mb-4 text-2xl uppercase text-muted">PBA</h2>
          <Reveal>
            <StandingsTable rows={pba} title="Philippine Basketball Association" />
          </Reveal>
        </section>
      </div>
    </div>
  );
}
