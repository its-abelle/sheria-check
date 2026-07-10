import { initDb, query } from "./index.js";

async function migrate() {
  console.log("Running migrations...");
  await initDb();

  const { rows } = await query("SELECT data_version, total_offenses FROM status WHERE id = 1");
  console.log("Migration complete. Status:", rows[0]);
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
