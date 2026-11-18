import type pg from "pg";
import { ZodError } from "zod";
import { bundleSchema, type ContentBundle } from "./contentSchema.js";
import { getClient } from "../db/index.js";

/** All imports become drafts; imported JSON can never publish itself. */
export async function importContent(input: unknown): Promise<ContentBundle> {
  const bundle = bundleSchema.parse(input);
  const client = await getClient();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(573911)");
    for (const record of bundle.instruments) {
      const previous = await client.query(
        "SELECT version FROM legal_instruments WHERE id = $1",
        [record.id],
      );
      if (previous.rows.length && previous.rows[0].version !== record.version)
        throw new ZodError([
          {
            code: "custom",
            path: ["instruments", record.id],
            message: "A different source version requires a new instrument ID",
          },
        ]);
      await upsert(client, "legal_instruments", record);
    }
    for (const record of bundle.provisions) {
      const previous = await client.query(
        "SELECT instrument_id FROM legal_provisions WHERE id = $1",
        [record.id],
      );
      if (
        previous.rows.length &&
        previous.rows[0].instrument_id !== record.instrument_id
      )
        throw new ZodError([
          {
            code: "custom",
            path: ["provisions", record.id],
            message:
              "A provision cannot be reassigned to a different source version",
          },
        ]);
      await upsert(client, "legal_provisions", record);
    }
    for (const record of bundle.offenses) {
      // Legacy fields exist only to preserve historical migrations and private scraper drafts.
      await upsert(client, "offenses", {
        ...record,
        description: "",
        citation: "",
        act: "",
        section: "",
      });
    }
    for (const record of bundle.judgments)
      await upsert(client, "judgment_references", record);
    for (const link of bundle.links) {
      await client.query(
        "INSERT INTO offense_judgments(offense_id, judgment_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [link.offense_id, link.judgment_id],
      );
    }
    await client.query(
      "UPDATE status SET data_version = gen_random_uuid()::text, last_updated = NOW() WHERE id = 1",
    );
    await client.query("COMMIT");
    return bundle;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
async function upsert(
  client: pg.PoolClient,
  table: string,
  record: object,
): Promise<void> {
  // Table and column identifiers come exclusively from internal constants/Zod-stripped records.
  const entries = Object.entries(record);
  const columns = entries.map(([key]: [string, unknown]): string => key);
  const values = entries.map(([, value]: [string, unknown]): unknown => value);
  const assignments = columns
    .filter((key: string): boolean => key !== "id")
    .map((key: string): string => `${key} = EXCLUDED.${key}`);
  await client.query(
    `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${columns.map((_key: string, index: number): string => `$${index + 1}`).join(", ")}) ON CONFLICT(id) DO UPDATE SET ${assignments.join(", ")}, publication_status = 'draft', updated_at = NOW()`,
    values,
  );
  await client.query(
    "INSERT INTO content_history(kind, record_id, action, snapshot) VALUES ($1, $2, 'import', $3::jsonb)",
    [table, values[0], JSON.stringify(record)],
  );
}
