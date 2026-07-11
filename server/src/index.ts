import app from "./app.js";
import { initDb } from "./db/index.js";
import { logger } from "./utils/logger.js";

const PORT = parseInt(process.env.PORT || "4000", 10);
const server = app.listen(PORT, async () => {
  try {
    await initDb();
    logger.info({ port: PORT }, "Sheria Check API started");
  } catch (err) {
    logger.fatal({ err }, "Failed to initialize database");
    process.exit(1);
  }
});

function gracefulShutdown(signal: string) {
  logger.info({ signal }, "Received shutdown signal");
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
