import type { Game, GamePerformer } from "./types";
import { TEAMS_BY_ID } from "./teams";

const FINALS = "https://en.wikipedia.org/wiki/2026_NBA_Finals";
const PBA = "https://en.wikipedia.org/wiki/2026_PBA_Commissioner%27s_Cup";
const FIBA = "https://en.wikipedia.org/wiki/2026_FIBA_U18_AmeriCup";

function verb(margin: number): string {
  if (margin <= 3) return "edge";
  if (margin <= 8) return "hold off";
  if (margin <= 18) return "pull away from";
  return "rout";
}

function g(
  id: string, league: Game["league"], date: string,
  homeId: string, awayId: string, homeScore: number, awayScore: number,
  venue: string, series: string, source: string,
  performers: GamePerformer[], recap: string
): Game {
  const home = TEAMS_BY_ID[homeId];
  const away = TEAMS_BY_ID[awayId];
  const homeWon = homeScore > awayScore;
  const winner = homeWon ? home : away;
  const loser = homeWon ? away : home;
  const ws = Math.max(homeScore, awayScore);
  const ls = Math.min(homeScore, awayScore);
  const headline = `${winner.name} ${verb(ws - ls)} ${loser.name}, ${ws}–${ls}`;
  return { id, league, date, homeTeamId: homeId, awayTeamId: awayId, homeScore, awayScore, venue, series, headline, recap, source, performers };
}

const pts = (name: string, teamAbbr: string, value: number, playerId?: string, detail?: string): GamePerformer =>
  ({ name, teamAbbr, category: "PTS", value, playerId, detail: detail ?? `${value} PTS` });

export const GAMES: Game[] = [
  /* ====================== NBA — 2026 Finals (Knicks 4–1) ====================== */
  g("nba-finals-g5", "NBA", "2026-06-13", "nba-sas", "nba-nyk", 90, 94,
    "Frost Bank Center, San Antonio", "NBA Finals · Game 5", FINALS,
    [pts("Jalen Brunson", "NYK", 45, "nba-nyk-brunson")],
    "Jalen Brunson erupted for a Knicks Finals-record 45 points as New York closed out San Antonio to clinch the series 4–1 — the franchise's first title since 1973."),
  g("nba-finals-g4", "NBA", "2026-06-10", "nba-nyk", "nba-sas", 107, 106,
    "Madison Square Garden, New York", "NBA Finals · Game 4", FINALS,
    [pts("Jalen Brunson", "NYK", 36, "nba-nyk-brunson")],
    "Brunson's 36 lifted the Knicks to a one-point Game 4 thriller at the Garden, pushing New York to a 3–1 series lead."),
  g("nba-finals-g3", "NBA", "2026-06-08", "nba-nyk", "nba-sas", 111, 115,
    "Madison Square Garden, New York", "NBA Finals · Game 3", FINALS,
    [pts("Victor Wembanyama", "SAS", 32, "nba-sas-wembanyama"), pts("Jalen Brunson", "NYK", 32, "nba-nyk-brunson")],
    "Victor Wembanyama answered Brunson blow-for-blow with 32 as San Antonio grabbed its lone win of the series in New York."),
  g("nba-finals-g2", "NBA", "2026-06-05", "nba-sas", "nba-nyk", 104, 105,
    "Frost Bank Center, San Antonio", "NBA Finals · Game 2", FINALS,
    [pts("Victor Wembanyama", "SAS", 29, "nba-sas-wembanyama")],
    "Wembanyama poured in 29, but the Knicks rallied late to steal Game 2 by a point and take a 2–0 lead."),
  g("nba-finals-g1", "NBA", "2026-06-03", "nba-sas", "nba-nyk", 95, 105,
    "Frost Bank Center, San Antonio", "NBA Finals · Game 1", FINALS,
    [pts("Jalen Brunson", "NYK", 30, "nba-nyk-brunson")],
    "Brunson's 30 set the tone as New York opened the Finals with a double-digit road win in San Antonio."),

  /* ============ PBA — Season 50 Commissioner's Cup Finals (Ginebra 4–3) ============ */
  g("pba-cc-g7", "PBA", "2026-06-17", "pba-gin", "pba-tnt", 88, 76,
    "SM Mall of Asia Arena, Pasay", "Commissioner's Cup Finals · Game 7", PBA,
    [pts("Justin Brownlee", "GIN", 30, "pba-gin-brownlee", "30 pts"),
     { name: "Scottie Thompson", teamAbbr: "GIN", category: "AST", value: 19, playerId: "pba-gin-thompson", detail: "19 pts" }],
    "Barangay Ginebra dethroned defending champion TNT in a decisive Game 7, 88–76, to capture the Season 50 Commissioner's Cup crown."),
  g("pba-cc-g6", "PBA", "2026-06-14", "pba-gin", "pba-tnt", 90, 98,
    "Smart Araneta Coliseum, Quezon City", "Commissioner's Cup Finals · Game 6", PBA, [],
    "TNT forced a winner-take-all Game 7, holding off Ginebra 98–90 to even the series at 3–3."),
  g("pba-cc-g5", "PBA", "2026-06-12", "pba-gin", "pba-tnt", 100, 95,
    "Smart Araneta Coliseum, Quezon City", "Commissioner's Cup Finals · Game 5", PBA, [],
    "Ginebra survived overtime 100–95 to move within one win of the title."),
  g("pba-cc-g4", "PBA", "2026-06-10", "pba-gin", "pba-tnt", 98, 106,
    "Smart Araneta Coliseum, Quezon City", "Commissioner's Cup Finals · Game 4", PBA, [],
    "TNT levelled the series with a 106–98 Game 4 win."),
  g("pba-cc-g3", "PBA", "2026-06-07", "pba-gin", "pba-tnt", 116, 102,
    "SM Mall of Asia Arena, Pasay", "Commissioner's Cup Finals · Game 3", PBA, [],
    "Ginebra took control of the series with a 116–102 statement in front of 18,607 fans."),
  g("pba-cc-g2", "PBA", "2026-06-05", "pba-gin", "pba-tnt", 94, 101,
    "Smart Araneta Coliseum, Quezon City", "Commissioner's Cup Finals · Game 2", PBA, [],
    "TNT answered with a 101–94 win to square the series at one game apiece."),
  g("pba-cc-g1", "PBA", "2026-06-03", "pba-gin", "pba-tnt", 102, 100,
    "Smart Araneta Coliseum, Quezon City", "Commissioner's Cup Finals · Game 1", PBA, [],
    "Ginebra opened the Finals with a tight 102–100 win before 11,447 at the Big Dome."),

  /* ============ FIBA — U18 AmeriCup 2026 (Canada gold) ============ */
  g("fiba-u18-final", "FIBA", "2026-06-07", "fiba-can", "fiba-usa", 67, 65,
    "Domo de la Feria, León", "U18 AmeriCup · Final", FIBA,
    [pts("Javion Tyndale", "CAN", 19, "fiba-can-tyndale", "19 pts · 8 ast")],
    "Canada edged the United States 67–65 to win its first-ever U18 AmeriCup title, behind MVP Javion Tyndale."),
  g("fiba-u18-bronze", "FIBA", "2026-06-07", "fiba-pur", "fiba-bra", 77, 83,
    "León, Mexico", "U18 AmeriCup · Bronze Medal", FIBA,
    [pts("Pedro Souza", "BRA", 21, "fiba-bra-souza", "21 pts")],
    "Brazil claimed bronze with an 83–77 win over Puerto Rico, paced by 21 points each from Joao Neves and Pedro Souza."),
  g("fiba-u18-sf2", "FIBA", "2026-06-06", "fiba-pur", "fiba-can", 49, 115,
    "León, Mexico", "U18 AmeriCup · Semifinal", FIBA,
    [pts("Lyris Robinson", "CAN", 18, "fiba-can-robinson")],
    "Canada overwhelmed Puerto Rico 115–49 to reach the final."),
  g("fiba-u18-sf1", "FIBA", "2026-06-06", "fiba-bra", "fiba-usa", 56, 102,
    "León, Mexico", "U18 AmeriCup · Semifinal", FIBA,
    [pts("Colben Landrew", "USA", 18)],
    "The United States rolled past Brazil 102–56 to book its place in the gold-medal game."),
  g("fiba-u18-qf2", "FIBA", "2026-06-05", "fiba-bra", "fiba-dom", 101, 96,
    "León, Mexico", "U18 AmeriCup · Quarterfinal", FIBA,
    [pts("Pietro Melo", "BRA", 21)],
    "Brazil outlasted the Dominican Republic 101–96 in a quarterfinal shootout."),
  g("fiba-u18-qf1", "FIBA", "2026-06-05", "fiba-pur", "fiba-arg", 73, 70,
    "León, Mexico", "U18 AmeriCup · Quarterfinal", FIBA,
    [pts("Jomar Bernard", "PUR", 18)],
    "Puerto Rico edged Argentina 73–70 to advance to the semifinals."),
];
