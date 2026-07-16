import { Request, Response } from "express";
import { query } from "../db/index.js";

export async function getStatus(_req: Request, res: Response) {
  const { rows } = await query("SELECT * FROM status WHERE id = 1");
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
