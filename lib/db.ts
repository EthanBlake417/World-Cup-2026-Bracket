import { neon } from "@neondatabase/serverless";
import type { Picks, R32Teams, Results, Settings } from "./bracket";

// Lazily-created Neon SQL client. Reads the connection string Vercel/Neon
// injects (DATABASE_URL for the Neon integration, POSTGRES_URL for older
// Vercel Postgres). Created on first use so importing this module never throws.
let _sql: ReturnType<typeof neon> | null = null;
function db() {
  if (_sql) return _sql;
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    throw new Error(
      "No database connection string. Set DATABASE_URL (or POSTGRES_URL).",
    );
  }
  _sql = neon(url);
  return _sql;
}

// ---- schema ----------------------------------------------------------------

// Default empty R32 seeding: 16 matches, both slots blank until the admin fills
// them in. Friends can still build a bracket once these are set.
function emptyR32Teams(): R32Teams {
  const out: R32Teams = {};
  for (let i = 1; i <= 16; i++) out[`M${i}`] = { a: null, b: null };
  return out;
}

export async function ensureSchema(): Promise<void> {
  const sql = db();
  await sql`
    CREATE TABLE IF NOT EXISTS brackets (
      id          SERIAL PRIMARY KEY,
      name        TEXT NOT NULL,
      picks       JSONB NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS config (
      key   TEXT PRIMARY KEY,
      value JSONB NOT NULL
    );
  `;
  // Seed default config rows only if missing.
  await setConfigIfAbsent("r32_teams", emptyR32Teams());
  await setConfigIfAbsent("results", {} as Results);
  await setConfigIfAbsent("settings", { locked: false } as Settings);
}

// ---- config ----------------------------------------------------------------

async function getConfig<T>(key: string, fallback: T): Promise<T> {
  const rows = (await db()`SELECT value FROM config WHERE key = ${key} LIMIT 1;`) as {
    value: T;
  }[];
  if (rows.length === 0) return fallback;
  return rows[0].value;
}

async function setConfig(key: string, value: unknown): Promise<void> {
  const json = JSON.stringify(value);
  await db()`
    INSERT INTO config (key, value) VALUES (${key}, ${json}::jsonb)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
  `;
}

async function setConfigIfAbsent(key: string, value: unknown): Promise<void> {
  const json = JSON.stringify(value);
  await db()`
    INSERT INTO config (key, value) VALUES (${key}, ${json}::jsonb)
    ON CONFLICT (key) DO NOTHING;
  `;
}

export function getR32Teams(): Promise<R32Teams> {
  return getConfig<R32Teams>("r32_teams", emptyR32Teams());
}
export function setR32Teams(teams: R32Teams): Promise<void> {
  return setConfig("r32_teams", teams);
}

export function getResults(): Promise<Results> {
  return getConfig<Results>("results", {});
}
export function setResults(results: Results): Promise<void> {
  return setConfig("results", results);
}

export function getSettings(): Promise<Settings> {
  return getConfig<Settings>("settings", { locked: false });
}
export function setSettings(settings: Settings): Promise<void> {
  return setConfig("settings", settings);
}

// ---- brackets --------------------------------------------------------------

export type BracketRow = {
  id: number;
  name: string;
  picks: Picks;
  created_at: string;
};

export async function createBracket(name: string, picks: Picks): Promise<number> {
  const json = JSON.stringify(picks);
  const rows = (await db()`
    INSERT INTO brackets (name, picks)
    VALUES (${name}, ${json}::jsonb)
    RETURNING id;
  `) as { id: number }[];
  return rows[0].id;
}

export async function listBrackets(): Promise<BracketRow[]> {
  const rows = (await db()`
    SELECT id, name, picks, created_at
    FROM brackets
    ORDER BY created_at ASC;
  `) as BracketRow[];
  return rows;
}

export async function getBracket(id: number): Promise<BracketRow | null> {
  const rows = (await db()`
    SELECT id, name, picks, created_at
    FROM brackets
    WHERE id = ${id}
    LIMIT 1;
  `) as BracketRow[];
  return rows[0] ?? null;
}
