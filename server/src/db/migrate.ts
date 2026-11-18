import { initDb, closeDb } from "./index.js";
try {
  await initDb();
  console.log("Migrations applied");
} catch {
  console.error("Migration failed");
  process.exitCode = 1;
} finally {
  await closeDb();
}
