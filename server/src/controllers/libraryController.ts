import type { Request, Response } from "express";
import { z } from "zod";
import { query } from "../db/index.js";
const searchSchema = z.object({
  q: z.string().trim().max(200).default(""),
  topic: z
    .enum(["arrest", "detention", "bail", "fair-trial", "legal-aid"])
    .optional(),
});
export async function listInstruments(
  req: Request,
  res: Response,
): Promise<void> {
  const { q } = searchSchema.parse(req.query);
  const { rows } = await query(
    `SELECT i.*, (SELECT COUNT(*)::int FROM legal_provisions p WHERE p.instrument_id = i.id AND p.publication_status = 'published') AS provision_count
    FROM legal_instruments i WHERE i.publication_status = 'published' AND ($1 = '' OR i.title ILIKE '%' || $1 || '%') ORDER BY i.title, i.id`,
    [q],
  );
  res.json({ data: rows });
}
export async function getInstrument(
  req: Request,
  res: Response,
): Promise<void> {
  const { rows } = await query(
    "SELECT * FROM legal_instruments WHERE id = $1 AND publication_status = 'published'",
    [req.params.id],
  );
  if (!rows.length) {
    res.status(404).json({ error: "Law not found" });
    return;
  }
  const provisions = await query(
    "SELECT * FROM legal_provisions WHERE instrument_id = $1 AND publication_status = 'published' ORDER BY position, id",
    [req.params.id],
  );
  res.json({ data: { ...rows[0], provisions: provisions.rows } });
}
export async function searchProvisions(
  req: Request,
  res: Response,
): Promise<void> {
  const { q, topic } = searchSchema.parse(req.query);
  const cursor = z.coerce
    .number()
    .int()
    .min(0)
    .default(0)
    .parse(req.query.cursor);
  const params = [q, topic ?? null, cursor];
  const filter = `p.publication_status = 'published' AND i.publication_status = 'published' AND ($2::text IS NULL OR $2 = ANY(p.topics)) AND ($1 = '' OR to_tsvector('english', p.heading || ' ' || p.text) @@ plainto_tsquery('english', $1) OR p.heading ILIKE '%' || $1 || '%' OR p.number ILIKE '%' || $1 || '%' OR i.title ILIKE '%' || $1 || '%')`;
  const { rows } = await query(
    `SELECT p.*, i.title AS instrument_title, i.version AS source_version FROM legal_provisions p JOIN legal_instruments i ON i.id = p.instrument_id WHERE ${filter} ORDER BY i.title, p.position, p.id OFFSET $3 LIMIT 21`,
    params,
  );
  res.json({
    data: rows.slice(0, 20),
    pagination: {
      cursor: cursor + Math.min(rows.length, 20),
      has_more: rows.length > 20,
      limit: 20,
    },
  });
}
export async function getProvision(req: Request, res: Response): Promise<void> {
  const { rows } = await query(
    `SELECT p.*, i.title AS instrument_title, i.version AS source_version FROM legal_provisions p JOIN legal_instruments i ON i.id = p.instrument_id WHERE p.id = $1 AND p.publication_status = 'published' AND i.publication_status = 'published'`,
    [req.params.id],
  );
  if (!rows.length) {
    res.status(404).json({ error: "Provision not found" });
    return;
  }
  res.json({ data: rows[0] });
}
export async function listJudgments(
  req: Request,
  res: Response,
): Promise<void> {
  const offense = z.string().max(100).parse(req.query.offense_id);
  const { rows } = await query(
    `SELECT j.* FROM judgment_references j JOIN offense_judgments oj ON oj.judgment_id = j.id JOIN public_offenses o ON o.id = oj.offense_id WHERE o.id = $1 AND j.publication_status = 'published' ORDER BY j.decision_date DESC, j.id`,
    [offense],
  );
  res.json({ data: rows });
}
