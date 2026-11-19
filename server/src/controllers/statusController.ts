import type { Request, Response } from "express";
import type { StatusRow } from "../models/offense.js";
import { query } from "../db/index.js";
export async function getStatus(_req: Request, res: Response): Promise<void> {
  const { rows } = await query<Omit<StatusRow, "id">>(`SELECT s.data_version, s.last_updated,
    (SELECT COUNT(*)::int FROM public_offenses) AS total_offenses,
    ARRAY(SELECT DISTINCT title FROM legal_instruments WHERE publication_status = 'published') AS statutes_covered
    FROM status s WHERE id = 1`);
  res.json({
    data: rows[0] || {
      data_version: "unknown",
      last_updated: null,
      total_offenses: 0,
      statutes_covered: [],
    },
  });
}
