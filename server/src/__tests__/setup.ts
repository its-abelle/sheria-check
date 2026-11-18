import pg from "pg";
import { afterAll } from "vitest";
import { randomUUID } from "node:crypto";
const url = new URL(
  process.env.DATABASE_URL ||
    "postgres://sheria:sheria_test@localhost:5432/sheria_check_test",
);
if (!url.pathname.endsWith("_test"))
  throw new Error("Tests require a database ending in _test");
// A fresh isolated schema per suite: never drop a developer's database or sessions.
const baseUrl = url.toString();
const schema = `test_${randomUUID().replace(/-/g, "")}`;
const admin = new pg.Pool({ connectionString: url.toString() });
await admin.query(`CREATE SCHEMA ${schema}`);
await admin.end();
url.searchParams.set("options", `-c search_path=${schema},public`);
process.env.DATABASE_URL = url.toString();
process.env.ADMIN_PASSWORD = "test_admin";
const { initDb, closeDb } = await import("../db/index.js");
await initDb();

afterAll(async (): Promise<void> => {
  await closeDb();
  const cleanup = new pg.Pool({ connectionString: baseUrl });
  try {
    await cleanup.query(`DROP SCHEMA ${schema} CASCADE`);
  } finally {
    await cleanup.end();
  }
});
