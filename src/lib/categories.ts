import type { StatCategory } from "./courtside/types";

export type PerformerKind = "POG" | StatCategory;

export const CATEGORY_META: Record<
  PerformerKind,
  { label: string; short: string; color: string; unit: string }
> = {
  POG: { label: "Player of the Game", short: "MVP", color: "#ffb020", unit: "" },
  PTS: { label: "Top Scorer", short: "PTS", color: "#ff6a1a", unit: "PTS" },
  REB: { label: "Rebounds", short: "REB", color: "#3d7bff", unit: "REB" },
  AST: { label: "Assists", short: "AST", color: "#2fd27a", unit: "AST" },
  BLK: { label: "Blocks", short: "BLK", color: "#a472ff", unit: "BLK" },
  STL: { label: "Steals", short: "STL", color: "#ff5d8f", unit: "STL" },
};

export const PERFORMER_ORDER: PerformerKind[] = ["PTS", "REB", "AST", "BLK", "STL"];
