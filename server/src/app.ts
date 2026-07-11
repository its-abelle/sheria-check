import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import pinoHttp from "pino-http";
import offenseRoutes from "./routes/offenses.js";
import reportRoutes from "./routes/reports.js";
import statusRoutes from "./routes/status.js";
import adminRoutes from "./routes/admin.js";
import adminPage from "./admin/index.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { logger } from "./utils/logger.js";

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || "*";
const isProduction = process.env.NODE_ENV === "production";

app.use(helmet());
app.use(compression());
app.use(pinoHttp({ logger }));
app.use(cors({ origin: corsOrigin.split(","), credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(generalLimiter);

const API_PREFIX = "/api/v1";

app.get(`${API_PREFIX}/health`, async (_req, res) => {
  const { query } = await import("./db/index.js");
  try {
    await query("SELECT 1");
    res.json({
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch {
    res.status(503).json({
      status: "unhealthy",
      database: "disconnected",
    });
  }
});

app.use(`${API_PREFIX}/offenses`, offenseRoutes);
app.use(`${API_PREFIX}/reports`, reportRoutes);
app.use(`${API_PREFIX}/status`, statusRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);
app.use("/admin", adminPage);

app.use(errorHandler);

export default app;
