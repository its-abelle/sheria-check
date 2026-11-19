-- Intentionally destructive: incident reporting was retired by product decision.
DROP TABLE IF EXISTS reports;

CREATE TABLE legal_instruments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  source_url TEXT NOT NULL,
  version TEXT NOT NULL,
  retrieved_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  rights_basis TEXT NOT NULL DEFAULT '',
  publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE legal_provisions (
  id TEXT PRIMARY KEY,
  instrument_id TEXT NOT NULL REFERENCES legal_instruments(id),
  number TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0 CHECK (position >= 0),
  heading TEXT NOT NULL,
  text TEXT NOT NULL,
  topics TEXT[] NOT NULL DEFAULT '{}',
  source_url TEXT NOT NULL,
  verified_at TIMESTAMPTZ,
  publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'published')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (instrument_id, number)
);
CREATE INDEX legal_provisions_instrument ON legal_provisions(instrument_id);
CREATE INDEX legal_provisions_topics ON legal_provisions USING GIN(topics);
CREATE INDEX legal_provisions_search ON legal_provisions USING GIN(to_tsvector('english', heading || ' ' || text));

ALTER TABLE offenses ALTER COLUMN severity DROP NOT NULL;
ALTER TABLE offenses ALTER COLUMN min_fine DROP NOT NULL;
ALTER TABLE offenses ALTER COLUMN max_fine DROP NOT NULL;
ALTER TABLE offenses ALTER COLUMN course_of_action DROP NOT NULL;
ALTER TABLE offenses ADD COLUMN publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'published'));
ALTER TABLE offenses ADD COLUMN defining_provision_id TEXT REFERENCES legal_provisions(id);
ALTER TABLE offenses ADD COLUMN penalty_provision_id TEXT REFERENCES legal_provisions(id);
ALTER TABLE offenses ADD COLUMN verified_at TIMESTAMPTZ;
-- Historic scraper output is retained privately for review, never auto-published.
CREATE TABLE judgment_references (
  id TEXT PRIMARY KEY,
  citation TEXT NOT NULL,
  court TEXT NOT NULL,
  decision_date DATE NOT NULL,
  source_url TEXT NOT NULL,
  verified_at TIMESTAMPTZ,
  publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'published')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE offense_judgments (
  offense_id TEXT NOT NULL REFERENCES offenses(id) ON DELETE CASCADE,
  judgment_id TEXT NOT NULL REFERENCES judgment_references(id) ON DELETE CASCADE,
  PRIMARY KEY(offense_id, judgment_id)
);
INSERT INTO status(id, data_version, total_offenses, statutes_covered) VALUES (1, 'sources-1', 0, '{}')
ON CONFLICT(id) DO UPDATE SET data_version = 'sources-1', total_offenses = 0, statutes_covered = '{}', last_updated = NOW();

CREATE VIEW public_offenses AS
SELECT o.id, o.name, o.aliases, o.category, d.text AS description,
  i.title AS act, d.number AS section, i.title || ', ' || d.number AS citation,
  i.version AS law_version, o.defining_provision_id, o.penalty_provision_id,
  d.text AS defining_text, p.text AS penalty_text, d.source_url,
  p.source_url AS penalty_source_url, pi.title AS penalty_act, p.number AS penalty_section,
  pi.version AS penalty_source_version, o.verified_at, o.updated_at,
  i.version AS source_version
FROM offenses o
JOIN legal_provisions d ON d.id = o.defining_provision_id
JOIN legal_provisions p ON p.id = o.penalty_provision_id
JOIN legal_instruments i ON i.id = d.instrument_id
JOIN legal_instruments pi ON pi.id = p.instrument_id
WHERE o.publication_status = 'published' AND o.verified_at IS NOT NULL
  AND d.publication_status = 'published' AND p.publication_status = 'published'
  AND i.publication_status = 'published' AND pi.publication_status = 'published';

CREATE TABLE content_history (
  id BIGSERIAL PRIMARY KEY,
  kind TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
