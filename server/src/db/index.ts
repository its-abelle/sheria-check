import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || "postgres://sheria:sheria_dev@localhost:5432/sheria_check",
});

pool.on("error", (err) => {
  console.error("Unexpected pool error:", err);
});

export function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}

export function getClient() {
  return pool.connect();
}

export async function initDb() {
  await query(`
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
    CREATE INDEX IF NOT EXISTS idx_offenses_trgm ON offenses USING GIN (to_tsvector('english', name || ' ' || description || ' ' || array_to_string(aliases, ' ')));

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
}
