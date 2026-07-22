import { Request, Response, NextFunction } from "express";
import { query } from "../db/index.js";

export async function getInsights(_req: Request, res: Response, next: NextFunction) {
  try {
    const { rows } = await query(
      `
      SELECT
        COALESCE(location, 'Unknown') AS area,
        to_char(created_at, 'YYYY-MM') AS period,
        COUNT(*)::int AS report_count,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount_demanded) AS median_amount_demanded,
        o.name AS top_offense_name,
        o.id AS top_offense_id
      FROM reports r
      LEFT JOIN offenses o ON o.id = r.offense_id
      GROUP BY COALESCE(location, 'Unknown'), to_char(created_at, 'YYYY-MM'), o.id, o.name
      HAVING COUNT(*) >= 5
      ORDER BY period DESC, report_count DESC
      LIMIT 50
      `
    );

    const insights = rows.map((r) => ({
      area: r.area,
      period: r.period,
      report_count: r.report_count,
      median_amount_demanded: r.median_amount_demanded
        ? Math.round(Number(r.median_amount_demanded))
        : null,
      median_amount_legal: null,
      top_offense_id: r.top_offense_id || null,
      top_offense_name: r.top_offense_name || null,
    }));

    res.json({ data: insights });
  } catch (err) {
    next(err);
  }
}
