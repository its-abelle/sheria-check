import { query } from "../index.js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface SeedOffense {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  category: string;
  severity: string;
  citation: string;
  act: string;
  section: string;
  min_fine: number;
  max_fine: number;
  max_imprisonment: string | null;
  course_of_action: string;
  law_version: string;
}

function loadSeedData(): SeedOffense[] {
  const jsonPath = resolve(__dirname, "..", "..", "..", "..", "scripts", "seed_data_unified.json");
  const raw = readFileSync(jsonPath, "utf-8");
  return JSON.parse(raw) as SeedOffense[];
}

async function seed() {
  console.log("Loading seed data...");
  const offenses = loadSeedData();
  console.log(`Loaded ${offenses.length} offenses from seed_data_unified.json`);

  for (const o of offenses) {
    const severity = ["minor", "serious", "felony"].includes(o.severity) ? o.severity : "minor";

    await query(
      `INSERT INTO offenses (id, name, aliases, description, category, severity, citation, act, section, min_fine, max_fine, max_imprisonment, course_of_action, law_version)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, aliases = EXCLUDED.aliases, description = EXCLUDED.description,
         category = EXCLUDED.category, severity = EXCLUDED.severity, citation = EXCLUDED.citation,
         act = EXCLUDED.act, section = EXCLUDED.section, min_fine = EXCLUDED.min_fine,
         max_fine = EXCLUDED.max_fine, max_imprisonment = EXCLUDED.max_imprisonment,
         course_of_action = EXCLUDED.course_of_action, law_version = EXCLUDED.law_version,
         updated_at = NOW()`,
      [o.id, o.name, o.aliases, o.description, o.category, severity, o.citation, o.act, o.section, o.min_fine, o.max_fine, o.max_imprisonment, o.course_of_action, o.law_version]
    );
  }

  await query("UPDATE status SET total_offenses = $1, last_updated = NOW() WHERE id = 1", [offenses.length]);
  console.log(`Seeded ${offenses.length} offenses`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
