import { Request, Response } from "express";
import { z } from "zod";
import { query } from "../db/index.js";

const reportSchema = z.object({
  offense_id: z.string().optional(),
  officer_name: z.string().max(200).optional(),
  officer_badge: z.string().max(100).optional(),
  location: z.string().max(300).optional(),
  amount_demanded: z.number().int().positive().optional(),
  description: z.string().min(1).max(2000),
});

export async function createReport(req: Request, res: Response) {
  const parsed = reportSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid report data", details: parsed.error.flatten() });
  }

  const data = parsed.data;
  const { rows } = await query(
    `INSERT INTO reports (offense_id, officer_name, officer_badge, location, amount_demanded, description)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      data.offense_id || null,
      data.officer_name || null,
      data.officer_badge || null,
      data.location || null,
      data.amount_demanded || null,
      data.description,
    ]
  );

  res.status(201).json({ ok: true, id: rows[0].id });
}
