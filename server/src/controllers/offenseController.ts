import type { Request, Response } from "express";
import { z } from "zod";
import type { OffenseRow } from "../models/offense.js";
import { query } from "../db/index.js";
export const paginationSchema = z.object({
  q: z.string().trim().max(200).default(""),
  cursor: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
/** Cursor remains a documented numeric offset, with deterministic ordering. */
export async function searchOffenses(
  req: Request,
  res: Response,
): Promise<void> {
  const { q, cursor, limit } = paginationSchema.parse(req.query);
  const filter = `($1 = '' OR to_tsvector('english', name || ' ' || description || ' ' || array_to_string(aliases, ' ')) @@ plainto_tsquery('english', $1) OR name ILIKE '%' || $1 || '%' OR act ILIKE '%' || $1 || '%' OR section ILIKE '%' || $1 || '%' OR $1 = ANY(aliases))`;
  const { rows } = await query<OffenseRow>(
    `SELECT * FROM public_offenses WHERE ${filter} ORDER BY name, id OFFSET $2 LIMIT $3`,
    [q, cursor, limit + 1],
  );
  const count = await query<{ total: number }>(
    `SELECT COUNT(*)::int AS total FROM public_offenses WHERE ${filter}`,
    [q],
  );
  const hasMore = rows.length > limit;
  res.json({
    data: rows.slice(0, limit),
    pagination: {
      cursor: cursor + Math.min(rows.length, limit),
      limit,
      has_more: hasMore,
      total: count.rows[0].total,
    },
  });
}
export async function getOffenseById(
  req: Request,
  res: Response,
): Promise<void> {
  const { rows } = await query<OffenseRow>("SELECT * FROM public_offenses WHERE id = $1", [
    req.params.id,
  ]);
  if (!rows.length) {
    res.status(404).json({ error: "Offense not found" });
    return;
  }
  res.json({ data: rows[0] });
}
export async function getOffensesByCategory(
  req: Request,
  res: Response,
): Promise<void> {
  const category = z.string().max(80).optional().parse(req.query.category);
  const { rows } = await query<OffenseRow>(
    "SELECT * FROM public_offenses WHERE ($1::text IS NULL OR category = $1) ORDER BY name, id",
    [category ?? null],
  );
  res.json({ data: rows });
}
export async function getCategories(
  _req: Request,
  res: Response,
): Promise<void> {
  const { rows } = await query(
    "SELECT category AS id, initcap(replace(category, '-', ' ')) AS name, 'Read verified offense and penalty provisions' AS description, 'scale' AS icon, COUNT(*)::int AS count FROM public_offenses GROUP BY category ORDER BY category",
  );
  res.json({ data: rows });
}
