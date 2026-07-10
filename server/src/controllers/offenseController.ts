import { Request, Response } from "express";
import { query } from "../db/index.js";

export async function searchOffenses(req: Request, res: Response) {
  const q = (req.query.q as string || "").trim();
  if (!q) {
    return res.json([]);
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
     LIMIT 30`,
    [q]
  );
  res.json(rows);
}

export async function getOffenseById(req: Request, res: Response) {
  const { id } = req.params;
  const { rows } = await query("SELECT * FROM offenses WHERE id = $1", [id]);

  if (rows.length === 0) {
    return res.status(404).json({ error: "Offense not found" });
  }
  res.json(rows[0]);
}

export async function getOffensesByCategory(req: Request, res: Response) {
  const category = req.query.category as string;
  if (!category) {
    const { rows } = await query("SELECT * FROM offenses ORDER BY category, name");
    return res.json(rows);
  }

  const { rows } = await query(
    "SELECT * FROM offenses WHERE category = $1 ORDER BY name",
    [category]
  );
  res.json(rows);
}

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

  const categories = rows.map((r) => ({
    id: r.id,
    ...categoryNames[r.id as string] || {
      name: r.id,
      description: "Other offenses",
      icon: "file-text",
    },
    count: r.count,
  }));

  res.json(categories);
}
