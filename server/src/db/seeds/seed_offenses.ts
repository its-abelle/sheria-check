import { readFile } from "node:fs/promises";
import { initDb, closeDb } from "../index.js";
import { importContent } from "../../utils/contentStore.js";
try {
  const path =
    process.argv[2] ||
    new URL("../../../data/legal-content.json", import.meta.url);
  const bundle: unknown = JSON.parse(await readFile(path, "utf8"));
  await initDb();
  const result = await importContent(bundle);
  console.log(
    `Imported ${result.instruments.length} laws, ${result.provisions.length} provisions, ${result.offenses.length} offenses as private drafts. Review and publish through /admin.`,
  );
} catch {
  console.error(
    "Content import failed. Check the bundle and database configuration.",
  );
  process.exitCode = 1;
} finally {
  await closeDb();
}
