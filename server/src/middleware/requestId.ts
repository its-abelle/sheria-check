import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";

/** Middleware that assigns a unique request ID, echoing an existing x-request-id header if present. */
export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = (req.headers["x-request-id"] as string) || randomUUID();
  res.setHeader("x-request-id", id);
  req.requestId = id;
  next();
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}
