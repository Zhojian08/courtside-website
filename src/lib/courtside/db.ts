import "server-only";
import { createClient, type Client } from "@libsql/client";

/**
 * Single shared connection to the **main system's Turso database** — the exact
 * same libSQL database that Courtside Live (courtside-live) writes to. Set
 * TURSO_DATABASE_URL + TURSO_AUTH_TOKEN (see .env.example) to the same DB the
 * Render service uses, and the website reads its live games/teams/players
 * directly. Reads hit the cloud primary, so scores update in near real-time.
 *
 * Returns null when no database URL is configured — callers then fall back to
 * the public HTTP feed (see wexme.ts), so the site keeps working either way.
 */
let _client: Client | null | undefined;

export function wexmeDb(): Client | null {
  if (_client !== undefined) return _client;
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    _client = null;
    return _client;
  }
  _client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return _client;
}
