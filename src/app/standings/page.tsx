import { getStandings, getWexmeStandings } from "@/lib/courtside";
import { StandingsTable } from "@/components/tables/StandingsTable";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = { title: "Standings" };
export const dynamic = "force-dynamic";

export default async function StandingsPage() {
  const wexme = await getWexmeStandings();
  const east = getStandings("NBA", "Eastern");
  const west = getStandings("NBA", "Western");
  const pba = getStandings("PBA");
  const groupA = getStandings("FIBA", "Group A");
  const groupB = getStandings("FIBA", "Group B");

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-10">
        <p className="eyebrow mb-2">The Race</p>
        <h1 className="font-display text-5xl uppercase sm:text-6xl">Standings</h1>
        <p className="mt-3 max-w-xl text-muted">
          Live records from your WEXME system, plus the latest NBA season, the PBA
          Commissioner&apos;s Cup, and the FIBA U18 AmeriCup.
        </p>
      </header>

      <div className="space-y-12">
        {wexme.length > 0 && (
          <section>
            <h2 className="font-display mb-4 text-2xl uppercase text-muted">
              WEXME · Your League
            </h2>
            <Reveal>
              <StandingsTable rows={wexme} title="Standings" />
            </Reveal>
          </section>
        )}

        <section>
          <h2 className="font-display mb-4 text-2xl uppercase text-muted">NBA · 2025–26</h2>
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
          <h2 className="font-display mb-4 text-2xl uppercase text-muted">PBA · Commissioner&apos;s Cup</h2>
          <Reveal>
            <StandingsTable rows={pba} title="Elimination Round" />
          </Reveal>
        </section>

        <section>
          <h2 className="font-display mb-4 text-2xl uppercase text-muted">FIBA · U18 AmeriCup 2026</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Reveal>
              <StandingsTable rows={groupA} title="Group A" />
            </Reveal>
            <Reveal delay={0.1}>
              <StandingsTable rows={groupB} title="Group B" />
            </Reveal>
          </div>
        </section>
      </div>
    </div>
  );
}
