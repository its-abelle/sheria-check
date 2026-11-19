import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../utils/logger.js";
export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ZodError) {
    res
      .status(400)
      .json({ error: "Invalid request", details: error.flatten() });
    return;
  }
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? Number(error.status)
      : 500;
  if (status === 400 || status === 413) {
    res
      .status(status)
      .json({ error: status === 413 ? "Request too large" : "Invalid JSON" });
    return;
  }
  // Never log database errors: PostgreSQL details may contain private imported content.
  logger.error({ requestId: req.requestId }, "Request failed");
  res.status(500).json({ error: "Something went wrong. Please try again." });
}
