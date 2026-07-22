import { Request, Response, NextFunction } from "express";
import { query } from "../db/index.js";

export async function getInsights(_req: Request, res: Response, next: NextFunction) {
  try {
    const { rows } = await query(
      `
      WITH area_period_stats AS (
        SELECT
          COALESCE(location, 'Unknown') AS area,
          to_char(created_at, 'YYYY-MM') AS period,
          COUNT(*)::int AS report_count,
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount_demanded) AS median_amount_demanded
        FROM reports
        GROUP BY COALESCE(location, 'Unknown'), to_char(created_at, 'YYYY-MM')
        HAVING COUNT(*) >= 5
      ),
      top_offenses AS (
        SELECT DISTINCT ON (COALESCE(r2.location, 'Unknown'), to_char(r2.created_at, 'YYYY-MM'))
          COALESCE(r2.location, 'Unknown') AS area,
          to_char(r2.created_at, 'YYYY-MM') AS period,
          o.id AS top_offense_id,
          o.name AS top_offense_name
        FROM reports r2
        LEFT JOIN offenses o ON o.id = r2.offense_id
        GROUP BY COALESCE(r2.location, 'Unknown'), to_char(r2.created_at, 'YYYY-MM'), o.id, o.name
        ORDER BY COALESCE(r2.location, 'Unknown'), to_char(r2.created_at, 'YYYY-MM'), COUNT(*) DESC
      )
      SELECT
        s.area,
        s.period,
        s.report_count,
        s.median_amount_demanded,
        t.top_offense_id,
        t.top_offense_name
      FROM area_period_stats s
      LEFT JOIN top_offenses t ON t.area = s.area AND t.period = s.period
      ORDER BY s.period DESC, s.report_count DESC
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
