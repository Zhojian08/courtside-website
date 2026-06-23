import type { Player } from "./types";

const FINALS = "https://en.wikipedia.org/wiki/2026_NBA_Finals";
const NBA_SZN = "https://en.wikipedia.org/wiki/2025%E2%80%9326_NBA_season";
const PBA = "https://en.wikipedia.org/wiki/2026_PBA_Commissioner%27s_Cup";
const FIBA = "https://en.wikipedia.org/wiki/2026_FIBA_U18_AmeriCup";

function p(
  id: string, teamId: string, league: Player["league"], name: string,
  position: string, stats: Player["stats"], statContext: string, source: string,
  number?: number
): Player {
  return { id, teamId, league, name, position, stats, statContext, source, number, photoUrl: null };
}

export const PLAYERS: Player[] = [
  // ---------- NBA — Knicks (2026 Finals averages) ----------
  p("nba-nyk-brunson", "nba-nyk", "NBA", "Jalen Brunson", "PG",
    { ppg: 32.6, apg: 4.6, rpg: 4.2, fgPct: 42.1 }, "2026 NBA Finals · Finals MVP", FINALS, 11),
  p("nba-nyk-anunoby", "nba-nyk", "NBA", "OG Anunoby", "SF",
    { ppg: 21.2, fgPct: 52.5 }, "2026 NBA Finals", FINALS, 8),
  p("nba-nyk-towns", "nba-nyk", "NBA", "Karl-Anthony Towns", "C",
    { ppg: 13.0, rpg: 10.6 }, "2026 NBA Finals", FINALS, 32),

  // ---------- NBA — Spurs (2026 Finals averages) ----------
  p("nba-sas-wembanyama", "nba-sas", "NBA", "Victor Wembanyama", "C",
    { ppg: 26.0, rpg: 11.2, bpg: 3.6 }, "2026 NBA Finals", FINALS, 1),
  p("nba-sas-harper", "nba-sas", "NBA", "Dylan Harper", "G",
    { ppg: 18.0 }, "2026 NBA Finals", FINALS, 2),
  p("nba-sas-fox", "nba-sas", "NBA", "De'Aaron Fox", "PG",
    { ppg: 12.8, apg: 6.0 }, "2026 NBA Finals", FINALS, 4),

  // ---------- NBA — 2025-26 statistical leaders ----------
  p("nba-lal-doncic", "nba-lal", "NBA", "Luka Dončić", "G",
    { ppg: 33.5 }, "2025–26 season · scoring leader", NBA_SZN, 77),
  p("nba-den-jokic", "nba-den", "NBA", "Nikola Jokić", "C",
    { rpg: 12.9, apg: 10.7 }, "2025–26 season · rebound & assist leader", NBA_SZN, 15),

  // ---------- PBA — Season 50 Commissioner's Cup ----------
  p("pba-gin-thompson", "pba-gin", "PBA", "Scottie Thompson", "G",
    {}, "2026 Commissioner's Cup · Finals MVP", PBA, 6),
  p("pba-gin-brownlee", "pba-gin", "PBA", "Justin Brownlee", "F",
    {}, "2026 Commissioner's Cup · Ginebra import", PBA),
  p("pba-gin-abarrientos", "pba-gin", "PBA", "RJ Abarrientos", "G",
    { ppg: 21.5 }, "2026 Commissioner's Cup · top local scorer", PBA),
  p("pba-smb-fajardo", "pba-smb", "PBA", "June Mar Fajardo", "C",
    { rpg: 14.8 }, "2026 Commissioner's Cup · rebound leader", PBA),
  p("pba-nlx-bolick", "pba-nlx", "PBA", "Robert Bolick", "G",
    { apg: 8.8 }, "2026 Commissioner's Cup · assist leader", PBA),
  p("pba-tnt-bolbol", "pba-tnt", "PBA", "Bol Bol", "C",
    { ppg: 38.2 }, "2026 Commissioner's Cup · import scoring leader", PBA),
  p("pba-pho-williams", "pba-pho", "PBA", "Johnathan Williams", "F",
    { rpg: 16.7, apg: 6.0 }, "2026 Commissioner's Cup · Phoenix import", PBA),

  // ---------- FIBA — U18 AmeriCup 2026 ----------
  p("fiba-can-tyndale", "fiba-can", "FIBA", "Javion Tyndale", "G",
    { apg: 6.0 }, "2026 U18 AmeriCup · MVP & assist leader", FIBA),
  p("fiba-can-robinson", "fiba-can", "FIBA", "Lyris Robinson", "F",
    {}, "2026 U18 AmeriCup · All-Tournament Team", FIBA),
  p("fiba-dom-martinez", "fiba-dom", "FIBA", "Marlon Martinez", "F",
    { ppg: 19.0 }, "2026 U18 AmeriCup · top scorer", FIBA),
  p("fiba-usa-coleman", "fiba-usa", "FIBA", "Quentin Coleman", "C",
    { rpg: 11.4 }, "2026 U18 AmeriCup · top rebounder", FIBA),
  p("fiba-bra-souza", "fiba-bra", "FIBA", "Pedro Souza", "F",
    {}, "2026 U18 AmeriCup · All-Tournament Team", FIBA),
  p("fiba-pur-quinones", "fiba-pur", "FIBA", "Felipe Quiñones", "G",
    {}, "2026 U18 AmeriCup · All-Tournament Team", FIBA),
];

export const PLAYERS_BY_ID: Record<string, Player> = Object.fromEntries(PLAYERS.map((x) => [x.id, x]));
