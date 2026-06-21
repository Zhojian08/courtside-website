import {
  getGamePerformers,
  getPlayerOfGame,
  getTeam,
  listGames,
} from "@/lib/courtside";
import { CATEGORY_META, type PerformerKind } from "@/lib/categories";
import { formatDate } from "@/lib/format";
import { UploadDesk, type GameSlots } from "@/components/statistician/UploadDesk";

export const metadata = { title: "Statistician Upload" };
export const dynamic = "force-dynamic";

export default async function StatisticianPage() {
  const games = listGames({ limit: 12 });

  const data: GameSlots[] = await Promise.all(
    games.map(async (g) => {
      const home = getTeam(g.homeTeamId)!;
      const away = getTeam(g.awayTeamId)!;
      const pog = await getPlayerOfGame(g);
      const performers = await getGamePerformers(g);

      const slots = [
        {
          category: "POG" as PerformerKind,
          label: CATEGORY_META.POG.label,
          color: CATEGORY_META.POG.color,
          playerId: pog.player.id,
          playerName: pog.player.name,
          teamAbbr: pog.team.abbr,
          statLabel: `${pog.line.pts} PTS · ${pog.line.reb} REB · ${pog.line.ast} AST`,
          currentPhoto: pog.photoUrl,
        },
        ...performers.map((p) => ({
          category: p.category as PerformerKind,
          label: CATEGORY_META[p.category].label,
          color: CATEGORY_META[p.category].color,
          playerId: p.player.id,
          playerName: p.player.name,
          teamAbbr: p.team.abbr,
          statLabel: `${p.value} ${CATEGORY_META[p.category].unit}`,
          currentPhoto: p.photoUrl,
        })),
      ];

      return {
        id: g.id,
        label: `${away.abbr} ${g.awayScore} – ${g.homeScore} ${home.abbr}`,
        date: formatDate(g.date, { year: "numeric" }),
        league: g.league,
        slots,
      } satisfies GameSlots;
    })
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="eyebrow mb-2">For Statisticians</p>
        <h1 className="font-display text-5xl uppercase sm:text-6xl">Upload Desk</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Pick a game, then add a photo for each featured performer — player of the
          game, top scorer, and the leaders in rebounds, assists, blocks and steals.
          Photos publish to the public site the moment you upload.
        </p>
      </header>

      <UploadDesk games={data} />
    </div>
  );
}
