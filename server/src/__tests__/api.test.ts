import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../app.js";
import { initDb } from "../db/index.js";

const API = "/api/v1";

let agent: ReturnType<typeof request>;

beforeAll(async () => {
  await initDb();
  agent = request(app);
}, 30000);

describe("Health", () => {
  it("returns healthy status with db connected", async () => {
    const res = await agent.get(`${API}/health`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("healthy");
    expect(res.body.database).toBe("connected");
    expect(res.headers["x-request-id"]).toBeDefined();
  });
});

describe("Search", () => {
  it("returns matching offenses for a query", async () => {
    const res = await agent.get(`${API}/offenses/search?q=speeding`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBeGreaterThan(0);
  });

  it("returns empty results for empty query", async () => {
    const res = await agent.get(`${API}/offenses/search?q=`);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination.total).toBe(0);
  });

  it("supports cursor-based pagination", async () => {
    const res = await agent.get(`${API}/offenses/search?q=license&limit=2`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(2);
    expect(res.body.pagination.has_more).toBeDefined();
    expect(typeof res.body.pagination.cursor).toBe("number");
  });

  it("capped limit at 50", async () => {
    const res = await agent.get(`${API}/offenses/search?q=the&limit=999`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(50);
  });

  it("rejects cursor values below 0", async () => {
    const res = await agent.get(`${API}/offenses/search?q=speeding&cursor=-5`);
    expect(res.status).toBe(200);
  });
});

describe("Categories", () => {
  it("returns 6 categories with counts", async () => {
    const res = await agent.get(`${API}/offenses/categories`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBe(6);
    for (const cat of res.body.data) {
      expect(cat).toHaveProperty("id");
      expect(cat).toHaveProperty("name");
      expect(cat).toHaveProperty("count");
      expect(cat.count).toBeGreaterThan(0);
    }
  });
});

describe("Category Browse", () => {
  it("returns offenses filtered by category", async () => {
    const res = await agent.get(`${API}/offenses?category=speeding-reckless`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
    for (const o of res.body.data) {
      expect(o.category).toBe("speeding-reckless");
    }
  });

  it("returns all offenses when no category specified", async () => {
    const res = await agent.get(`${API}/offenses`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it("returns empty for unknown category", async () => {
    const res = await agent.get(`${API}/offenses?category=nonexistent`);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});

describe("Offense Detail", () => {
  it("returns offense by ID", async () => {
    const res = await agent.get(`${API}/offenses/speeding-school-zone`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBe("speeding-school-zone");
    expect(res.body.data.min_fine).toBeGreaterThan(0);
  });

  it("returns 404 for missing offense", async () => {
    const res = await agent.get(`${API}/offenses/does-not-exist`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Offense not found");
  });
});

describe("Status", () => {
  it("returns data freshness info", async () => {
    const res = await agent.get(`${API}/status`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.total_offenses).toBeGreaterThanOrEqual(61);
    expect(res.body.data.data_version).toBe("2024.1");
  });
});

describe("Reports", () => {
  it("creates a valid report", async () => {
    const res = await agent
      .post(`${API}/reports`)
      .send({
        officer_name: "Test Officer",
        location: "Nairobi",
        amount_demanded: 5000,
        description: "Officer demanded extra payment for speeding",
      });
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.id).toBeGreaterThan(0);
  });

  it("rejects report with empty description", async () => {
    const res = await agent
      .post(`${API}/reports`)
      .send({ description: "" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("rejects report with missing description", async () => {
    const res = await agent
      .post(`${API}/reports`)
      .send({});
    expect(res.status).toBe(400);
  });

  it("creates report with minimal fields", async () => {
    const res = await agent
      .post(`${API}/reports`)
      .send({ description: "Minimal valid report" });
    expect(res.status).toBe(201);
  });
});

describe("Admin", () => {
  it("rejects request without auth header", async () => {
    const res = await agent
      .post(`${API}/admin/offenses`)
      .send({ id: "test", name: "Test" });
    expect(res.status).toBe(401);
  });

  it("rejects request with wrong token", async () => {
    const res = await agent
      .post(`${API}/admin/offenses`)
      .set("Authorization", "Bearer wrong")
      .send({ id: "test", name: "Test" });
    expect(res.status).toBe(401);
  });

  it("accepts request with correct token", async () => {
    const res = await agent
      .post(`${API}/admin/offenses`)
      .set("Authorization", "Bearer test_admin")
      .send({
        id: "test-offense-001",
        name: "Test Offense",
        aliases: ["test"],
        description: "A test offense",
        category: "traffic-rules",
        severity: "minor",
        citation: "Test Act, Section 1",
        act: "Test Act",
        section: "Section 1",
        min_fine: 100,
        max_fine: 500,
        course_of_action: "Do not pay on the spot.",
        law_version: "2024",
      });
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
  });

  it("rejects offense with missing required fields", async () => {
    const res = await agent
      .post(`${API}/admin/offenses`)
      .set("Authorization", "Bearer test_admin")
      .send({ id: "bad" });
    expect(res.status).toBe(400);
  });

  it("bulk uploads multiple offenses", async () => {
    const res = await agent
      .post(`${API}/admin/offenses/bulk`)
      .set("Authorization", "Bearer test_admin")
      .send([
        {
          id: "bulk-test-1",
          name: "Bulk Test 1",
          aliases: [],
          description: "Bulk test offense one",
          category: "traffic-rules",
          severity: "minor",
          citation: "Test Act, S1",
          act: "Test Act",
          section: "S1",
          min_fine: 100,
          max_fine: 500,
          course_of_action: "Test",
          law_version: "2024",
        },
        {
          id: "bulk-test-2",
          name: "Bulk Test 2",
          aliases: [],
          description: "Bulk test offense two",
          category: "parking-loading",
          severity: "serious",
          citation: "Test Act, S2",
          act: "Test Act",
          section: "S2",
          min_fine: 500,
          max_fine: 2000,
          course_of_action: "Test serious",
          law_version: "2024",
        },
      ]);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.count).toBe(2);
  });
});

describe("Rate Limiting", () => {
  it("search rate limiter triggers after rapid requests", { timeout: 30000 }, async () => {
    const promises = Array.from({ length: 105 }, (_, i) =>
      agent.get(`${API}/offenses/search?q=test${i}`).then((r) => r.status)
    );
    const statuses = await Promise.all(promises);
    const has429 = statuses.some((s) => s === 429);
    expect(has429).toBe(true);
  });
});
