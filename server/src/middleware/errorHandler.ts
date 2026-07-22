import { Request, Response, NextFunction } from "express";

/** Centralized Express error handler; logs the error and returns a 500 JSON response. */
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { detail: err.message }),
  });
}
