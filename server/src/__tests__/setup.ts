import pg from "pg";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function setupTestDb() {
  const adminPool = new pg.Pool({
    connectionString: "postgres://sheria:sheria_prod@localhost:5432/postgres",
  });

  try {
    await adminPool.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = 'sheria_check_test'
        AND pid <> pg_backend_pid()
    `);
    await adminPool.query("DROP DATABASE IF EXISTS sheria_check_test");
    await adminPool.query("CREATE DATABASE sheria_check_test");
  } finally {
    await adminPool.end();
  }

  const testUrl = process.env.DATABASE_URL || "postgres://sheria:sheria_prod@localhost:5432/sheria_check_test";
  const testPool = new pg.Pool({ connectionString: testUrl });

  await testPool.query(`
    CREATE TABLE IF NOT EXISTS offenses (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      aliases       TEXT[] NOT NULL DEFAULT '{}',
      description   TEXT NOT NULL,
      category      TEXT NOT NULL,
      severity      TEXT NOT NULL CHECK (severity IN ('minor', 'serious', 'felony')),
      citation      TEXT NOT NULL,
      act           TEXT NOT NULL,
      section       TEXT NOT NULL,
      min_fine      INTEGER NOT NULL,
      max_fine      INTEGER NOT NULL,
      max_imprisonment TEXT,
      course_of_action TEXT NOT NULL,
      law_version   TEXT NOT NULL DEFAULT '2024',
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_offenses_category ON offenses(category);
    CREATE INDEX IF NOT EXISTS idx_offenses_severity ON offenses(severity);

    CREATE TABLE IF NOT EXISTS reports (
      id            SERIAL PRIMARY KEY,
      offense_id    TEXT REFERENCES offenses(id),
      officer_name  TEXT,
      officer_badge TEXT,
      location      TEXT,
      amount_demanded INTEGER,
      description   TEXT NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS status (
      id              INTEGER PRIMARY KEY DEFAULT 1,
      data_version    TEXT NOT NULL DEFAULT '2024.1',
      statutes_covered TEXT[] NOT NULL DEFAULT '{"Traffic Act Cap 403"}',
      total_offenses  INTEGER NOT NULL DEFAULT 0,
      last_updated    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    INSERT INTO status (id, data_version, total_offenses)
    VALUES (1, '2024.1', 0)
    ON CONFLICT (id) DO NOTHING;
  `);

  const jsonPath = resolve(__dirname, "..", "..", "..", "scripts", "seed_data_unified.json");
  const offenses = JSON.parse(readFileSync(jsonPath, "utf-8"));

  for (const o of offenses) {
    await testPool.query(
      `INSERT INTO offenses (id, name, aliases, description, category, severity, citation, act, section, min_fine, max_fine, max_imprisonment, course_of_action, law_version)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO NOTHING`,
      [o.id, o.name, o.aliases, o.description, o.category, o.severity, o.citation, o.act, o.section, o.min_fine, o.max_fine, o.max_imprisonment, o.course_of_action, o.law_version]
    );
  }

  await testPool.query("UPDATE status SET total_offenses = $1", [offenses.length]);
  await testPool.end();

  console.log(`[setup] Test database ready with ${offenses.length} offenses`);
}

await setupTestDb();
