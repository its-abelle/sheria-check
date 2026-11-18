import { config } from "../../config.js";
import { initDb, getClient, closeDb } from "../index.js";
import { bundleSchema, type ContentBundle } from "../../utils/contentSchema.js";
import { importContent } from "../../utils/contentStore.js";
import { assertDemoDatabase } from "./demoGuard.js";

// Fictional fixtures for visual testing. These are not legislation or judgments.
const now = new Date().toISOString();
const source = "https://new.kenyalaw.org/";
const definition = {
  instrument_id: "demo-law",
  source_url: source,
  verified_at: now,
};
const bundle = bundleSchema.parse({
  instruments: [
    {
      id: "demo-law",
      title: "DEMO — fictional law reader, not Kenyan law",
      version: "Demo version A",
      source_url: source,
      retrieved_at: now,
      verified_at: now,
      rights_basis: "Synthetic development fixture. Not a legal source.",
    },
    {
      id: "demo-penalty-law",
      title: "DEMO — fictional penalty source, not Kenyan law",
      version: "Demo version B",
      source_url: source,
      retrieved_at: now,
      verified_at: now,
      rights_basis: "Synthetic development fixture. Not a legal source.",
    },
  ],
  provisions: [
    {
      ...definition,
      id: "demo-definition",
      number: "Demo section 1",
      position: 1,
      heading: "DEMO — offense and arrest-topic layout",
      text: "DEMO ONLY. This fictional paragraph lets you inspect the offense definition and long-text reader. It does not describe Kenyan law, a crime, or your rights. Open the official reference directory for real sources.",
      topics: ["arrest", "bail"],
    },
    {
      ...definition,
      id: "demo-rights",
      number: "Demo section 2",
      position: 2,
      heading: "DEMO — detention and fair-trial topic layout",
      text: "DEMO ONLY. This is synthetic text for testing topic filters, reading and source links. It is not a statement of legal rights or legal advice.",
      topics: ["detention", "fair-trial", "legal-aid"],
    },
    {
      ...definition,
      id: "demo-penalty",
      instrument_id: "demo-penalty-law",
      number: "Demo section 3",
      position: 1,
      heading: "DEMO — conditional penalty display",
      text: "DEMO ONLY. This fictional penalty paragraph contains no fine amount and no real sentence. Use it to check that the penalty source, section and version are displayed separately from the offense source. It is not an amount owed or a prediction of any outcome.",
    },
  ],
  offenses: [
    {
      id: "demo-offense",
      name: "DEMO — example general offense (fictional)",
      aliases: ["demo", "example"],
      category: "demo-general",
      defining_provision_id: "demo-definition",
      penalty_provision_id: "demo-penalty",
      verified_at: now,
    },
    {
      id: "demo-traffic-offense",
      name: "DEMO — example traffic offense (fictional)",
      aliases: ["demo traffic", "example traffic"],
      category: "demo-traffic",
      defining_provision_id: "demo-rights",
      penalty_provision_id: "demo-penalty",
      verified_at: now,
    },
  ],
  judgments: [
    {
      id: "demo-judgment",
      citation: "DEMO — fictional judgment card, not a real case",
      court: "DEMO — no actual court",
      decision_date: now.slice(0, 10),
      source_url: source,
      verified_at: now,
    },
  ],
  links: [{ offense_id: "demo-offense", judgment_id: "demo-judgment" }],
});

try {
  assertDemoDatabase(config.DATABASE_URL, config.NODE_ENV);
  await initDb();
  await importContent(bundle);
  const client = await getClient();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(573911)");
    // Publication is only for the known synthetic IDs in the guarded demo DB.
    await client.query(
      "UPDATE legal_instruments SET publication_status = 'published' WHERE id = ANY($1::text[])",
      [
        bundle.instruments.map(
          (record: ContentBundle["instruments"][number]): string => record.id,
        ),
      ],
    );
    await client.query(
      "UPDATE legal_provisions SET publication_status = 'published' WHERE id = ANY($1::text[])",
      [
        bundle.provisions.map(
          (record: ContentBundle["provisions"][number]): string => record.id,
        ),
      ],
    );
    await client.query(
      "UPDATE offenses SET publication_status = 'published' WHERE id = ANY($1::text[])",
      [
        bundle.offenses.map(
          (record: ContentBundle["offenses"][number]): string => record.id,
        ),
      ],
    );
    await client.query(
      "UPDATE judgment_references SET publication_status = 'published' WHERE id = ANY($1::text[])",
      [
        bundle.judgments.map(
          (record: ContentBundle["judgments"][number]): string => record.id,
        ),
      ],
    );
    await client.query(
      "INSERT INTO content_history(kind, record_id, action, snapshot) VALUES ('demo', 'demo-dataset', 'seed-demo', '{\"synthetic\":true}'::jsonb)",
    );
    await client.query(
      "UPDATE status SET data_version = gen_random_uuid()::text, last_updated = NOW() WHERE id = 1",
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
  console.log(
    "Loaded fictional DEMO records. Not Kenyan law. Start the API with this same _demo DATABASE_URL, then search for 'demo'.",
  );
} catch {
  console.error(
    "Demo setup failed. Use a reachable local database ending in _demo and NODE_ENV=development. No ordinary application database is allowed.",
  );
  process.exitCode = 1;
} finally {
  await closeDb();
}
