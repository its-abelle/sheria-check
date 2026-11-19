import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import offenseRoutes from "./routes/offenses.js";
import libraryRoutes from "./routes/library.js";
import statusRoutes from "./routes/status.js";
import adminRoutes from "./routes/admin.js";
import adminPage from "./admin/index.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestId } from "./middleware/requestId.js";
import { asyncHandler } from "./middleware/asyncHandler.js";
import { query } from "./db/index.js";
import { config } from "./config.js";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", config.TRUST_PROXY);
app.use(helmet());
app.use(requestId);
app.use(compression());
app.use(
  cors({
    origin:
      config.CORS_ORIGIN === "*"
        ? "*"
        : config.CORS_ORIGIN.split(",").map((origin: string): string =>
            origin.trim(),
          ),
    credentials: false,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(generalLimiter);
// No request logger: URLs/search terms, IPs, user agents and bodies are not retained.
app.use((_req, res, next): void => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
app.get(
  "/api/v1/health",
  asyncHandler(async (_req, res): Promise<void> => {
    try {
      await query("SELECT 1");
      res.json({ status: "healthy", database: "connected" });
    } catch {
      res.status(503).json({ status: "unhealthy", database: "disconnected" });
    }
  }),
);
app.use("/api/v1/offenses", offenseRoutes);
app.use("/api/v1", libraryRoutes);
app.use("/api/v1/status", statusRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/admin", adminPage);
app.use((_req, res): void => {
  res.status(404).json({ error: "Not found" });
});
app.use(errorHandler);
export default app;
