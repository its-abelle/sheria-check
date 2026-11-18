import { assertDemoDatabase } from "../db/seeds/demoGuard.js";
import { readFile } from "node:fs/promises";
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
import { query, initDb, getClient } from "../db/index.js";
import { bundleSchema, officialUrl } from "../utils/contentSchema.js";
const API = "/api/v1";
const agent = request(app);
const token = "Bearer test_admin";
const verified_at = "2024-01-01T00:00:00.000Z";
const url = "https://new.kenyalaw.org/akn/ke/act/test-only/eng@2024-01-01";
// Synthetic fixtures never represent real Kenyan law and never enter production seeds.
const instrument = {
  id: "test-law-2024",
  title: "TEST ONLY source",
  source_url: url,
  version: "2024-01-01",
  retrieved_at: verified_at,
  verified_at,
  rights_basis: "Synthetic test fixture",
};
const penaltyInstrument = {
  ...instrument,
  id: "test-penalty-law",
  title: "TEST ONLY penalty source",
  version: "2023-01-01",
  source_url: url.replace(/2024/g, "2023"),
};
const definition = {
  id: "test-definition",
  instrument_id: instrument.id,
  number: "1",
  position: 1,
  heading: "TEST ONLY definition",
  text: "TEST ONLY offense wording, not Kenyan law.",
  topics: ["arrest"],
  source_url: url,
  verified_at,
};
const penalty = {
  ...definition,
  id: "test-penalty",
  instrument_id: penaltyInstrument.id,
  source_url: penaltyInstrument.source_url,
  number: "2",
  position: 2,
  heading: "TEST ONLY penalty",
  text: "TEST ONLY conditional penalty wording with alternatives, not a personal bill.",
};
const offense = {
  id: "test-offense",
  name: "TEST ONLY offense",
  aliases: ["test alias"],
  category: "general-offenses",
  defining_provision_id: definition.id,
  penalty_provision_id: penalty.id,
  verified_at,
};
async function publish(
  kind: string,
  id: string,
  action = "publish",
): Promise<request.Response> {
  return agent
    .post(`${API}/admin/content/${kind}/${id}/${action}`)
    .set("Authorization", token)
    .send({});
}
describe("Retired reporting and migrations", (): void => {
  it("removes reports and insights endpoints", async (): Promise<void> => {
    expect(
      (await agent.post(`${API}/reports`).send({ description: "private" }))
        .status,
    ).toBe(404);
    expect((await agent.get(`${API}/reports/insights`)).status).toBe(404);
  });
  it("deletes existing reports and applies migrations once", async (): Promise<void> => {
    expect(
      (
        await query(
          "SELECT to_regclass(current_schema() || '.reports') AS name",
        )
      ).rows[0].name,
    ).toBeNull();
    const client = await getClient();
    try {
      // Exercise both real SQL files with a legacy record in a transaction-local schema.
      await client.query("BEGIN");
      await client.query("CREATE SCHEMA migration_fixture");
      await client.query("SET LOCAL search_path = migration_fixture");
      await client.query(
        await readFile(
          new URL("../db/migrations/001_create_offenses.sql", import.meta.url),
          "utf8",
        ),
      );
      await client.query(
        "INSERT INTO reports(description) VALUES ('test record')",
      );
      await client.query(
        await readFile(
          new URL("../db/migrations/002_legal_library.sql", import.meta.url),
          "utf8",
        ),
      );
      expect(
        (
          await client.query(
            "SELECT to_regclass(current_schema() || '.reports') AS name",
          )
        ).rows[0].name,
      ).toBeNull();
      await client.query("ROLLBACK");
    } finally {
      client.release();
    }
    await initDb();
    expect(
      (await query("SELECT COUNT(*)::int AS count FROM _migrations")).rows[0]
        .count,
    ).toBe(2);
  });
});
describe("Publication and sources", (): void => {
  it("rejects anonymous admin import and untrusted source URLs", async (): Promise<void> => {
    expect(
      (await agent.post(`${API}/admin/content/import`).send({})).status,
    ).toBe(401);
    for (const value of [
      "http://new.kenyalaw.org/a",
      "https://new.kenyalaw.org.evil.test/a",
      "https://user@new.kenyalaw.org/a",
      "https://127.0.0.1/a",
    ])
      expect(officialUrl.safeParse(value).success).toBe(false);
    expect(
      bundleSchema.safeParse({
        instruments: [{ ...instrument, publication_status: "published" }],
      }).success,
    ).toBe(false);
  });
  it("imports into private drafts and enforces parent publication", async (): Promise<void> => {
    const response = await agent
      .post(`${API}/admin/content/import`)
      .set("Authorization", token)
      .send({
        instruments: [instrument, penaltyInstrument],
        provisions: [definition, penalty],
        offenses: [offense],
      });
    expect(response.status).toBe(201);
    expect((await agent.get(`${API}/offenses/test-offense`)).status).toBe(404);
    expect((await agent.get(`${API}/legislation`)).body.data).toEqual([]);
    expect((await publish("offenses", offense.id)).status).toBe(409);
    expect((await publish("provisions", definition.id)).status).toBe(409);
    expect((await publish("instruments", instrument.id)).status).toBe(200);
    expect((await publish("instruments", penaltyInstrument.id)).status).toBe(
      200,
    );
    expect((await publish("provisions", definition.id)).status).toBe(200);
    expect((await publish("provisions", penalty.id)).status).toBe(200);
    expect((await publish("offenses", offense.id)).status).toBe(200);
  });
  it("preserves source-version identities", async (): Promise<void> => {
    const result = await agent
      .post(`${API}/admin/content/import`)
      .set("Authorization", token)
      .send({ instruments: [{ ...instrument, version: "2025-01-01" }] });
    expect(result.status).toBe(400);
    expect(
      (
        await query("SELECT version FROM legal_instruments WHERE id = $1", [
          instrument.id,
        ])
      ).rows[0].version,
    ).toBe(instrument.version);
  });
  it("returns exact penalty wording without legacy inferred fine ranges", async (): Promise<void> => {
    const result = await agent.get(`${API}/offenses/${offense.id}`);
    expect(result.status).toBe(200);
    expect(result.body.data.penalty_text).toBe(penalty.text);
    expect(result.body.data.defining_text).toBe(definition.text);
    expect(result.body.data.source_version).toBe(instrument.version);
    expect(result.body.data.penalty_source_version).toBe(
      penaltyInstrument.version,
    );
    expect(result.body.data.penalty_act).toBe(penaltyInstrument.title);
    expect(result.body.data).not.toHaveProperty("min_fine");
    expect(result.body.data).not.toHaveProperty("severity");
    expect(result.body.data).not.toHaveProperty("course_of_action");
  });
  it("searches laws, provisions, rights and offenses with the same envelope", async (): Promise<void> => {
    const offenses = await agent.get(`${API}/offenses/search?q=test&limit=1`);
    expect(offenses.body.data).toHaveLength(1);
    expect(offenses.body.pagination.total).toBe(1);
    expect(
      (await agent.get(`${API}/offenses/search?q=&limit=1`)).body.data,
    ).toHaveLength(1);
    expect(
      (await agent.get(`${API}/provisions?topic=arrest`)).body.data,
    ).toHaveLength(2);
    expect(
      (await agent.get(`${API}/legislation/${instrument.id}`)).body.data
        .provisions,
    ).toHaveLength(1);
    expect(
      (await agent.get(`${API}/provisions/${definition.id}`)).body.data.text,
    ).toBe(definition.text);
    expect(
      (await agent.get(`${API}/offenses/categories`)).body.data[0].count,
    ).toBe(1);
    expect((await agent.get(`${API}/status`)).body.data.total_offenses).toBe(1);
  });
  it("validates invalid offsets, arrays, limits, topics and query lengths", async (): Promise<void> => {
    for (const path of [
      "/offenses/search?cursor=abc",
      "/offenses/search?cursor=-1",
      "/offenses/search?limit=999",
      "/offenses/search?q[]=a",
      "/provisions?topic=unknown",
      `/offenses/search?q=${"x".repeat(201)}`,
    ])
      expect((await agent.get(API + path)).status).toBe(400);
  });
  it("does not publish unverified imports or permissions-free instruments", async (): Promise<void> => {
    expect(
      (
        await agent
          .post(`${API}/admin/content/import`)
          .set("Authorization", token)
          .send({
            instruments: [
              {
                ...instrument,
                id: "unverified",
                verified_at: null,
                rights_basis: "",
              },
            ],
          })
      ).status,
    ).toBe(201);
    expect((await publish("instruments", "unverified")).status).toBe(409);
  });
  it("hides children when their parent is withdrawn, and records a revision", async (): Promise<void> => {
    const before = (await agent.get(`${API}/status`)).body.data.data_version;
    expect(
      (await publish("instruments", instrument.id, "unpublish")).status,
    ).toBe(200);
    expect((await agent.get(`${API}/offenses/${offense.id}`)).status).toBe(404);
    expect((await agent.get(`${API}/provisions/${definition.id}`)).status).toBe(
      404,
    );
    expect((await agent.get(`${API}/status`)).body.data.total_offenses).toBe(0);
    expect((await agent.get(`${API}/status`)).body.data.data_version).not.toBe(
      before,
    );
    expect(
      (await query("SELECT COUNT(*)::int AS count FROM content_history"))
        .rows[0].count,
    ).toBeGreaterThan(4);
  });
  it("rolls back the entire import on invalid references", async (): Promise<void> => {
    const result = await agent
      .post(`${API}/admin/content/import`)
      .set("Authorization", token)
      .send({
        instruments: [{ ...instrument, id: "rollback-law" }],
        provisions: [{ ...definition, id: "orphan", instrument_id: "missing" }],
      });
    expect(result.status).toBe(500);
    expect(
      (await query("SELECT 1 FROM legal_instruments WHERE id = 'rollback-law'"))
        .rowCount,
    ).toBe(0);
    expect(result.body).not.toHaveProperty("detail");
  });
  it("exposes only curated published judgment references for published offenses", async (): Promise<void> => {
    await publish("instruments", instrument.id);
    const judgment = {
      id: "test-case",
      citation: "TEST ONLY case",
      court: "TEST court",
      decision_date: "2024-01-01",
      source_url: url,
      verified_at,
    };
    await agent
      .post(`${API}/admin/content/import`)
      .set("Authorization", token)
      .send({
        judgments: [judgment],
        links: [{ offense_id: offense.id, judgment_id: judgment.id }],
      });
    expect(
      (await agent.get(`${API}/judgments?offense_id=${offense.id}`)).body.data,
    ).toHaveLength(0);
    await publish("judgments", judgment.id);
    const result = await agent.get(`${API}/judgments?offense_id=${offense.id}`);
    expect(result.body.data).toHaveLength(1);
    expect(result.body.data[0]).not.toHaveProperty("summary");
  });
});
describe("HTTP privacy and health", (): void => {
  it("returns no-store, no cookies, request IDs and DB readiness", async (): Promise<void> => {
    const result = await agent.get(`${API}/health`);
    expect(result.status).toBe(200);
    expect(result.headers["cache-control"]).toBe("no-store");
    expect(result.headers["set-cookie"]).toBeUndefined();
    expect(result.headers["x-request-id"]).toBeDefined();
    expect(result.headers["access-control-allow-credentials"]).toBeUndefined();
  });
});

describe("Visual demo isolation", (): void => {
  it("allows a local dedicated demo database", (): void => {
    expect((): void =>
      assertDemoDatabase(
        "postgres://user:password@localhost:5432/sheria_check_demo",
        "development",
      ),
    ).not.toThrow();
  });
  it("rejects ordinary, remote and production targets", (): void => {
    for (const url of [
      "postgres://localhost/sheria_check",
      "postgres://localhost/sheria_check_test",
      "postgres://remote.example/sheria_check_demo",
    ]) {
      expect((): void => assertDemoDatabase(url, "development")).toThrow(
        "local database",
      );
    }
    expect((): void =>
      assertDemoDatabase(
        "postgres://localhost/sheria_check_demo",
        "production",
      ),
    ).toThrow();
  });
});
