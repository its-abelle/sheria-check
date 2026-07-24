import { Request, Response } from "express";
import { query } from "../db/index.js";
import { StatusRow } from "../models/offense.js";

/** Return the current API status including data version, offense count, and last-updated timestamp. */
export async function getStatus(_req: Request, res: Response) {
  const { rows } = await query<StatusRow>("SELECT * FROM status WHERE id = 1");
  if (rows.length === 0) {
    return res.json({
      data: {
        data_version: "unknown",
        statutes_covered: [],
        last_updated: new Date().toISOString(),
        total_offenses: 0,
      },
    });
  }
  res.json({ data: rows[0] });
}
