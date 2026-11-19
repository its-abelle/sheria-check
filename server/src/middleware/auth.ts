import { timingSafeEqual, createHash } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const auth = req.headers.authorization || "";
  const digest = (value: string): Buffer =>
    createHash("sha256").update(value).digest();
  if (
    !auth.startsWith("Bearer ") ||
    !timingSafeEqual(digest(auth.slice(7)), digest(config.ADMIN_PASSWORD))
  ) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
