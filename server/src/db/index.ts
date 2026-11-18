import pg from "pg";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { config } from "../config.js";

const pool = new pg.Pool({
  connectionString: config.DATABASE_URL,
  max: config.PG_POOL_SIZE,
  connectionTimeoutMillis: 5000,
  statement_timeout: 15000,
});
pool.on("error", (): void => {
  console.error("Unexpected database connection error");
});
export function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params);
}
export function getClient(): Promise<pg.PoolClient> {
  return pool.connect();
}
export function closeDb(): Promise<void> {
  return pool.end();
}
/** Apply each committed migration once, atomically, including on existing installations. */
export async function initDb(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock(573910)");
    await client.query(
      "CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())",
    );
    const directory = fileURLToPath(new URL("./migrations/", import.meta.url));
    const files = (await readdir(directory))
      .filter((name: string): boolean => name.endsWith(".sql"))
      .sort();
    for (const name of files) {
      const applied = await client.query(
        "SELECT 1 FROM _migrations WHERE name = $1",
        [name],
      );
      if (applied.rowCount) continue;
      await client.query("BEGIN");
      try {
        await client.query(await readFile(`${directory}/${name}`, "utf8"));
        await client.query("INSERT INTO _migrations(name) VALUES ($1)", [name]);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
    await client.query(
      "INSERT INTO status(id) VALUES (1) ON CONFLICT DO NOTHING",
    );
  } finally {
    try {
      await client.query("SELECT pg_advisory_unlock(573910)");
    } finally {
      client.release();
    }
  }
}
