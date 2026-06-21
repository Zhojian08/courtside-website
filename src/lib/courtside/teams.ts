import type { Team } from "./types";

/**
 * Real franchise identities (NBA + PBA) used as realistic sample teams.
 * Records are illustrative. Player rosters & box scores are generated
 * deterministically in `generate.ts`.
 */
export const TEAMS: Team[] = [
  // ---- NBA East ----
  team("nba", "BOS", "Boston", "Celtics", "East", "#1d8348", "#bb9753", 48, 12),
  team("nba", "NYK", "New York", "Knicks", "East", "#f58426", "#0072ce", 41, 19),
  team("nba", "MIL", "Milwaukee", "Bucks", "East", "#00471b", "#eee1c6", 38, 22),
  team("nba", "MIA", "Miami", "Heat", "East", "#98002e", "#f9a01b", 33, 27),
  team("nba", "PHI", "Philadelphia", "76ers", "East", "#006bb6", "#ed174c", 31, 29),
  team("nba", "CLE", "Cleveland", "Cavaliers", "East", "#860038", "#fdbb30", 44, 16),

  // ---- NBA West ----
  team("nba", "OKC", "Oklahoma City", "Thunder", "West", "#007ac1", "#ef3b24", 50, 10),
  team("nba", "DEN", "Denver", "Nuggets", "West", "#0e2240", "#fec524", 43, 17),
  team("nba", "LAL", "Los Angeles", "Lakers", "West", "#552583", "#fdb927", 39, 21),
  team("nba", "GSW", "Golden State", "Warriors", "West", "#1d428a", "#ffc72c", 36, 24),
  team("nba", "DAL", "Dallas", "Mavericks", "West", "#00538c", "#b8c4ca", 34, 26),
  team("nba", "PHX", "Phoenix", "Suns", "West", "#e56020", "#1d1160", 32, 28),

  // ---- PBA (single conference) ----
  team("pba", "GIN", "Barangay", "Ginebra", "PBA", "#9b1c2e", "#d8a13a", 9, 2),
  team("pba", "SMB", "San Miguel", "Beermen", "PBA", "#b3122a", "#1a1a1a", 8, 3),
  team("pba", "TNT", "TNT", "Tropang Giga", "PBA", "#e2231a", "#0a0a0a", 8, 3),
  team("pba", "MAG", "Magnolia", "Hotshots", "PBA", "#0a4b9c", "#e63329", 7, 4),
  team("pba", "MER", "Meralco", "Bolts", "PBA", "#f47c20", "#1c1c1c", 6, 5),
  team("pba", "ROS", "Rain or Shine", "Elasti Painters", "PBA", "#1f8a4c", "#f2a900", 5, 6),
  team("pba", "NLX", "NLEX", "Road Warriors", "PBA", "#e8541f", "#101010", 4, 7),
  team("pba", "CON", "Converge", "FiberXers", "PBA", "#ff7a00", "#5b2d8e", 3, 8),
];

function team(
  league: "nba" | "pba",
  abbr: string,
  city: string,
  name: string,
  conference: string,
  primary: string,
  secondary: string,
  wins: number,
  losses: number
): Team {
  return {
    id: `${league}-${abbr.toLowerCase()}`,
    league: league.toUpperCase() as Team["league"],
    abbr,
    city,
    name,
    conference,
    primary,
    secondary,
    wins,
    losses,
  };
}

export const TEAMS_BY_ID: Record<string, Team> = Object.fromEntries(
  TEAMS.map((t) => [t.id, t])
);
