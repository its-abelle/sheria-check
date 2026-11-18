import type { Request, Response } from "express";
import { z } from "zod";
import { getClient, query } from "../db/index.js";
import { importContent } from "../utils/contentStore.js";
import {
  contentKind,
  contentTables,
  offenseSchema,
} from "../utils/contentSchema.js";

export async function importBundle(req: Request, res: Response): Promise<void> {
  const bundle = await importContent(req.body);
  res
    .status(201)
    .json({
      data: {
        instruments: bundle.instruments.length,
        provisions: bundle.provisions.length,
        offenses: bundle.offenses.length,
        judgments: bundle.judgments.length,
        publication_status: "draft",
      },
    });
}
export async function createOffense(
  req: Request,
  res: Response,
): Promise<void> {
  const offense = offenseSchema.parse(req.body);
  await importContent({ offenses: [offense] });
  res
    .status(201)
    .json({ data: { id: offense.id, publication_status: "draft" } });
}
export async function bulkUpload(req: Request, res: Response): Promise<void> {
  const offenses = z.array(offenseSchema).max(500).parse(req.body);
  await importContent({ offenses });
  res
    .status(201)
    .json({ data: { count: offenses.length, publication_status: "draft" } });
}
export async function listContent(req: Request, res: Response): Promise<void> {
  const kind = contentKind.parse(req.params.kind);
  const offset = z.coerce
    .number()
    .int()
    .min(0)
    .default(0)
    .parse(req.query.cursor);
  const { rows } = await query(
    `SELECT * FROM ${contentTables[kind]} ORDER BY id OFFSET $1 LIMIT 51`,
    [offset],
  );
  res.json({
    data: rows.slice(0, 50),
    pagination: {
      cursor: offset + Math.min(rows.length, 50),
      has_more: rows.length > 50,
    },
  });
}
export async function publishContent(
  req: Request,
  res: Response,
): Promise<void> {
  const kind = contentKind.parse(req.params.kind);
  const action = z.enum(["publish", "unpublish"]).parse(req.params.action);
  const table = contentTables[kind];
  const client = await getClient();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(573911)");
    const { rows } = await client.query(
      `SELECT * FROM ${table} WHERE id = $1 FOR UPDATE`,
      [req.params.id],
    );
    if (!rows.length) {
      await client.query("ROLLBACK");
      res.status(404).json({ error: "Record not found" });
      return;
    }
    const row = rows[0];
    if (action === "publish") {
      let valid = Boolean(row.verified_at);
      if (kind === "instruments")
        valid = valid && row.rights_basis.trim().length > 0;
      if (kind === "provisions") {
        const parent = await client.query(
          "SELECT 1 FROM legal_instruments WHERE id = $1 AND publication_status = 'published'",
          [row.instrument_id],
        );
        valid = valid && parent.rows.length === 1;
      }
      if (kind === "offenses") {
        const provisions = await client.query(
          `SELECT p.id FROM legal_provisions p JOIN legal_instruments i ON i.id = p.instrument_id WHERE p.id = ANY($1::text[]) AND p.publication_status = 'published' AND i.publication_status = 'published'`,
          [[row.defining_provision_id, row.penalty_provision_id]],
        );
        valid =
          valid &&
          Boolean(row.defining_provision_id && row.penalty_provision_id) &&
          provisions.rows.length ===
            new Set([row.defining_provision_id, row.penalty_provision_id]).size;
      }
      if (!valid) {
        await client.query("ROLLBACK");
        res
          .status(409)
          .json({
            error:
              "Verify sources and permissions, then publish parent laws and referenced provisions first",
          });
        return;
      }
    }
    const status = action === "publish" ? "published" : "draft";
    await client.query(
      `UPDATE ${table} SET publication_status = $1, updated_at = NOW() WHERE id = $2`,
      [status, req.params.id],
    );
    await client.query(
      "INSERT INTO content_history(kind, record_id, action, snapshot) VALUES ($1, $2, $3, $4::jsonb)",
      [table, req.params.id, action, JSON.stringify(row)],
    );
    await client.query(
      "UPDATE status SET data_version = gen_random_uuid()::text, last_updated = NOW() WHERE id = 1",
    );
    await client.query("COMMIT");
    res.json({ data: { id: req.params.id, publication_status: status } });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
export async function deleteOffense(
  req: Request,
  res: Response,
): Promise<void> {
  // Retain the source audit trail; removal from publication is reversible.
  req.params.kind = "offenses";
  req.params.action = "unpublish";
  await publishContent(req, res);
}
