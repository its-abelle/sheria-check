import { readFile } from "node:fs/promises";
import { bundleSchema } from "./contentSchema.js";
try {
  const bundle = bundleSchema.parse(
    JSON.parse(
      await readFile(process.argv[2] || "data/legal-content.json", "utf8"),
    ),
  );
  for (const [name, records] of Object.entries(bundle)) {
    if (name === "links") continue;
    const ids = records.map((record: object): string =>
      "id" in record ? String(record.id) : "",
    );
    if (new Set(ids).size !== ids.length)
      throw new Error(`Duplicate IDs in ${name}`);
  }
  const instruments = new Set(
    bundle.instruments.map((record): string => record.id),
  );
  const provisions = new Set(
    bundle.provisions.map((record): string => record.id),
  );
  for (const provision of bundle.provisions)
    if (!instruments.has(provision.instrument_id))
      throw new Error(`Missing instrument for ${provision.id}`);
  for (const offense of bundle.offenses)
    if (
      !provisions.has(offense.defining_provision_id) ||
      !provisions.has(offense.penalty_provision_id)
    )
      throw new Error(`Missing provision for ${offense.id}`);
  const offenses = new Set(bundle.offenses.map((record): string => record.id));
  const judgments = new Set(
    bundle.judgments.map((record): string => record.id),
  );
  for (const link of bundle.links)
    if (!offenses.has(link.offense_id) || !judgments.has(link.judgment_id))
      throw new Error("Missing offense or judgment for a case link");
  console.log(
    `Valid draft bundle: ${bundle.instruments.length} laws, ${bundle.provisions.length} provisions, ${bundle.offenses.length} offenses. Structural validation does not verify legal accuracy.`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : "Invalid content");
  process.exitCode = 1;
}
