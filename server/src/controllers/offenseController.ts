import { Request, Response } from "express";
import { query } from "../db/index.js";

/** Full-text and ILIKE search across offenses with offset-based pagination (cursor = SQL OFFSET). */
export async function searchOffenses(req: Request, res: Response) {
  const q = (req.query.q as string || "").trim();
  const cursor = Math.max(0, parseInt(req.query.cursor as string || "0", 10));
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string || "20", 10)));

  if (!q) {
    return res.json({
      data: [],
      pagination: { cursor: 0, limit, has_more: false, total: 0 },
    });
  }

  const { rows } = await query(
    `SELECT * FROM offenses
     WHERE to_tsvector('english', name || ' ' || description || ' ' || array_to_string(aliases, ' '))
           @@ plainto_tsquery('english', $1)
     OR name ILIKE '%' || $1 || '%'
     OR description ILIKE '%' || $1 || '%'
     OR $1 = ANY(aliases)
     ORDER BY
       CASE WHEN name ILIKE $1 THEN 0
            WHEN name ILIKE $1 || '%' THEN 1
            ELSE 2
       END,
       min_fine ASC
     OFFSET $2
     LIMIT $3`,
    [q, cursor, limit + 1]
  );

  const hasMore = rows.length > limit;
  if (hasMore) rows.pop();

  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM offenses
     WHERE to_tsvector('english', name || ' ' || description || ' ' || array_to_string(aliases, ' '))
           @@ plainto_tsquery('english', $1)
     OR name ILIKE '%' || $1 || '%'
     OR description ILIKE '%' || $1 || '%'
     OR $1 = ANY(aliases)`,
    [q]
  );

  res.json({
    data: rows,
    pagination: {
      cursor: cursor + rows.length,
      limit,
      has_more: hasMore,
      total: countRows[0]?.total || 0,
    },
  });
}

/** Fetch a single offense by its ID, returning 404 if not found. */
export async function getOffenseById(req: Request, res: Response) {
  const { id } = req.params;
  const { rows } = await query("SELECT * FROM offenses WHERE id = $1", [id]);

  if (rows.length === 0) {
    return res.status(404).json({ error: "Offense not found" });
  }
  res.json({ data: rows[0] });
}

/** Fetch offenses filtered by category, or all offenses if no category is provided. */
export async function getOffensesByCategory(req: Request, res: Response) {
  const category = req.query.category as string;
  if (!category) {
    const { rows } = await query("SELECT * FROM offenses ORDER BY category, name");
    return res.json({ data: rows });
  }

  const { rows } = await query(
    "SELECT * FROM offenses WHERE category = $1 ORDER BY name",
    [category]
  );
  res.json({ data: rows });
}

/** Return the list of offense categories with their offense counts and display metadata. */
export async function getCategories(_req: Request, res: Response) {
  const { rows } = await query(
    `SELECT category AS id,
            COUNT(*)::int AS count
     FROM offenses
     GROUP BY category
     ORDER BY category`
  );

  const categoryNames: Record<string, { name: string; description: string; icon: string }> = {
    "speeding-reckless": {
      name: "Speeding & Reckless Driving",
      description: "Speeding, dangerous driving, racing, and careless driving offenses",
      icon: "gauge",
    },
    "license-documents": {
      name: "License & Documents",
      description: "No license, expired license, no insurance, and document-related offenses",
      icon: "file-text",
    },
    "vehicle-condition": {
      name: "Vehicle Condition",
      description: "Bald tires, broken lights, no reflectors, expired inspection",
      icon: "wrench",
    },
    "traffic-rules": {
      name: "Traffic Rules",
      description: "Overtaking on yellow line, ignoring traffic lights, wrong lane",
      icon: "traffic-cone",
    },
    "parking-loading": {
      name: "Parking & Loading",
      description: "Illegal parking, overloading goods or passengers",
      icon: "truck",
    },
    "alcohol-drugs": {
      name: "Alcohol & Drugs",
      description: "Driving under the influence of alcohol or drugs",
      icon: "beer",
    },
  };

  const categories = rows.map((r: any) => ({
    id: r.id,
    ...categoryNames[r.id as string] || {
      name: r.id,
      description: "Other offenses",
      icon: "file-text",
    },
    count: r.count,
  }));

  res.json({ data: categories });
}
