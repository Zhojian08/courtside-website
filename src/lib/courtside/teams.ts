import type { Team } from "./types";

/* Sources:
 * NBA 2025-26 final standings — https://en.wikipedia.org/wiki/2025%E2%80%9326_NBA_season
 * PBA 2026 Commissioner's Cup elim round — https://en.wikipedia.org/wiki/2026_PBA_Commissioner%27s_Cup
 * FIBA U18 AmeriCup 2026 groups — https://en.wikipedia.org/wiki/2026_FIBA_U18_AmeriCup
 */

const NBA = "https://en.wikipedia.org/wiki/2025%E2%80%9326_NBA_season";
const PBA = "https://en.wikipedia.org/wiki/2026_PBA_Commissioner%27s_Cup";
const FIBA = "https://en.wikipedia.org/wiki/2026_FIBA_U18_AmeriCup";

function t(
  id: string, league: Team["league"], city: string, name: string, abbr: string,
  conf: string, primary: string, secondary: string, w: number, l: number, source: string
): Team {
  return { id, league, city, name, abbr, conference: conf, primary, secondary, wins: w, losses: l, source };
}

export const TEAMS: Team[] = [
  // ---------- NBA — Eastern Conference (2025-26 final) ----------
  t("nba-det", "NBA", "Detroit", "Pistons", "DET", "Eastern", "#C8102E", "#1D42BA", 60, 22, NBA),
  t("nba-bos", "NBA", "Boston", "Celtics", "BOS", "Eastern", "#007A33", "#BA9653", 56, 26, NBA),
  t("nba-nyk", "NBA", "New York", "Knicks", "NYK", "Eastern", "#006BB6", "#F58426", 53, 29, NBA),
  t("nba-cle", "NBA", "Cleveland", "Cavaliers", "CLE", "Eastern", "#860038", "#FDBB30", 52, 30, NBA),
  t("nba-tor", "NBA", "Toronto", "Raptors", "TOR", "Eastern", "#CE1141", "#9D9D9D", 46, 36, NBA),
  t("nba-atl", "NBA", "Atlanta", "Hawks", "ATL", "Eastern", "#E03A3E", "#C1D32F", 46, 36, NBA),
  t("nba-phi", "NBA", "Philadelphia", "76ers", "PHI", "Eastern", "#006BB6", "#ED174C", 45, 37, NBA),
  t("nba-orl", "NBA", "Orlando", "Magic", "ORL", "Eastern", "#0077C0", "#C4CED4", 45, 37, NBA),
  t("nba-cha", "NBA", "Charlotte", "Hornets", "CHA", "Eastern", "#1D1160", "#00788C", 44, 38, NBA),
  t("nba-mia", "NBA", "Miami", "Heat", "MIA", "Eastern", "#98002E", "#F9A01B", 43, 39, NBA),
  t("nba-mil", "NBA", "Milwaukee", "Bucks", "MIL", "Eastern", "#00471B", "#EEE1C6", 32, 50, NBA),
  t("nba-chi", "NBA", "Chicago", "Bulls", "CHI", "Eastern", "#CE1141", "#111111", 31, 51, NBA),
  t("nba-bkn", "NBA", "Brooklyn", "Nets", "BKN", "Eastern", "#1A1A1A", "#C9CCCE", 20, 62, NBA),
  t("nba-ind", "NBA", "Indiana", "Pacers", "IND", "Eastern", "#002D62", "#FDBB30", 19, 63, NBA),
  t("nba-was", "NBA", "Washington", "Wizards", "WAS", "Eastern", "#002B5C", "#E31837", 17, 65, NBA),

  // ---------- NBA — Western Conference (2025-26 final) ----------
  t("nba-okc", "NBA", "Oklahoma City", "Thunder", "OKC", "Western", "#007AC1", "#EF3B24", 64, 18, NBA),
  t("nba-sas", "NBA", "San Antonio", "Spurs", "SAS", "Western", "#A6AEB5", "#1A1A1A", 62, 20, NBA),
  t("nba-den", "NBA", "Denver", "Nuggets", "DEN", "Western", "#0E2240", "#FEC524", 54, 28, NBA),
  t("nba-lal", "NBA", "Los Angeles", "Lakers", "LAL", "Western", "#552583", "#FDB927", 53, 29, NBA),
  t("nba-hou", "NBA", "Houston", "Rockets", "HOU", "Western", "#CE1141", "#C4CED4", 52, 30, NBA),
  t("nba-min", "NBA", "Minnesota", "Timberwolves", "MIN", "Western", "#0C2340", "#236192", 49, 33, NBA),
  t("nba-phx", "NBA", "Phoenix", "Suns", "PHX", "Western", "#1D1160", "#E56020", 45, 37, NBA),
  t("nba-por", "NBA", "Portland", "Trail Blazers", "POR", "Western", "#E03A3E", "#111111", 42, 40, NBA),
  t("nba-lac", "NBA", "LA", "Clippers", "LAC", "Western", "#C8102E", "#1D428A", 42, 40, NBA),
  t("nba-gsw", "NBA", "Golden State", "Warriors", "GSW", "Western", "#1D428A", "#FFC72C", 37, 45, NBA),
  t("nba-nop", "NBA", "New Orleans", "Pelicans", "NOP", "Western", "#0C2340", "#C8102E", 26, 56, NBA),
  t("nba-dal", "NBA", "Dallas", "Mavericks", "DAL", "Western", "#00538C", "#B8C4CA", 26, 56, NBA),
  t("nba-mem", "NBA", "Memphis", "Grizzlies", "MEM", "Western", "#5D76A9", "#12173F", 25, 57, NBA),
  t("nba-sac", "NBA", "Sacramento", "Kings", "SAC", "Western", "#5A2D81", "#63727A", 22, 60, NBA),
  t("nba-uta", "NBA", "Utah", "Jazz", "UTA", "Western", "#002B5C", "#3E7A3E", 22, 60, NBA),

  // ---------- PBA — Season 50 Commissioner's Cup (elimination round) ----------
  t("pba-nlx", "PBA", "NLEX", "Road Warriors", "NLX", "PBA", "#E8541F", "#101010", 10, 2, PBA),
  t("pba-gin", "PBA", "Barangay", "Ginebra", "GIN", "PBA", "#9B1C2E", "#D8A13A", 9, 3, PBA),
  t("pba-ros", "PBA", "Rain or Shine", "Elasto Painters", "ROS", "PBA", "#1F8A4C", "#F2A900", 9, 3, PBA),
  t("pba-mer", "PBA", "Meralco", "Bolts", "MER", "PBA", "#F47C20", "#1C1C1C", 8, 4, PBA),
  t("pba-mag", "PBA", "Magnolia", "Hotshots", "MAG", "PBA", "#0A4B9C", "#E63329", 7, 5, PBA),
  t("pba-smb", "PBA", "San Miguel", "Beermen", "SMB", "PBA", "#B3122A", "#C9A227", 7, 5, PBA),
  t("pba-pho", "PBA", "Phoenix", "Fuel Masters", "PHO", "PBA", "#E4002B", "#FDB813", 6, 6, PBA),
  t("pba-tnt", "PBA", "TNT", "Tropang 5G", "TNT", "PBA", "#E2231A", "#0A0A0A", 6, 6, PBA),

  // ---------- FIBA — U18 AmeriCup 2026 (group standings) ----------
  t("fiba-usa", "FIBA", "", "United States", "USA", "Group A", "#0A3161", "#B31942", 3, 0, FIBA),
  t("fiba-arg", "FIBA", "", "Argentina", "ARG", "Group A", "#6CACE4", "#F6B40E", 2, 1, FIBA),
  t("fiba-bra", "FIBA", "", "Brazil", "BRA", "Group A", "#009C3B", "#FFDF00", 1, 2, FIBA),
  t("fiba-mex", "FIBA", "", "Mexico", "MEX", "Group A", "#006847", "#CE1126", 0, 3, FIBA),
  t("fiba-can", "FIBA", "", "Canada", "CAN", "Group B", "#D52B1E", "#C9CCCE", 3, 0, FIBA),
  t("fiba-dom", "FIBA", "", "Dominican Rep.", "DOM", "Group B", "#002D62", "#CE1126", 2, 1, FIBA),
  t("fiba-pur", "FIBA", "", "Puerto Rico", "PUR", "Group B", "#0050A4", "#ED1C24", 1, 2, FIBA),
  t("fiba-ven", "FIBA", "", "Venezuela", "VEN", "Group B", "#FCD116", "#CF142B", 0, 3, FIBA),
];

export const TEAMS_BY_ID: Record<string, Team> = Object.fromEntries(TEAMS.map((x) => [x.id, x]));
