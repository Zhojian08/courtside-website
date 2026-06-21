import "server-only";
import { promises as fs } from "fs";
import path from "path";

/**
 * Statistician-uploaded photo assignments, persisted to disk.
 *
 * - `players`    : playerId -> photo URL (a player's headshot, reused everywhere)
 * - `performers` : `${gameId}:${category}` -> photo URL (game-specific override,
 *                  where category is POG | PTS | REB | AST | BLK | STL)
 *
 * In production you'd back this with the Courtside Live API or object storage;
 * for the demo a JSON file under `.data/` is the single source of truth.
 */
export interface OverrideStore {
  players: Record<string, string>;
  performers: Record<string, string>;
  updatedAt: string | null;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "overrides.json");

const EMPTY: OverrideStore = { players: {}, performers: {}, updatedAt: null };

export async function readOverrides(): Promise<OverrideStore> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<OverrideStore>;
    return {
      players: parsed.players ?? {},
      performers: parsed.performers ?? {},
      updatedAt: parsed.updatedAt ?? null,
    };
  } catch {
    return { ...EMPTY };
  }
}

export async function writeOverrides(store: OverrideStore): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function setPerformerPhoto(
  gameId: string,
  category: string,
  playerId: string,
  url: string
): Promise<OverrideStore> {
  const store = await readOverrides();
  store.performers[`${gameId}:${category}`] = url;
  // also set as the player's default headshot so it shows on profiles/leaders
  store.players[playerId] = url;
  store.updatedAt = new Date().toISOString();
  await writeOverrides(store);
  return store;
}

export function performerPhoto(
  store: OverrideStore,
  gameId: string,
  category: string,
  playerId: string
): string | null {
  return (
    store.performers[`${gameId}:${category}`] ??
    store.players[playerId] ??
    null
  );
}
