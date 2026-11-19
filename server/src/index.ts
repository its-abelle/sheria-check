import app from "./app.js";
import { initDb, closeDb } from "./db/index.js";
import { config } from "./config.js";
import { logger } from "./utils/logger.js";
try {
  await initDb();
  const server = app.listen(config.PORT, (): void => {
    logger.info({ port: config.PORT }, "Sheria Check API ready");
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  const shutdown = (): void => {
    server.close((): void => {
      void closeDb().then((): void => {
        process.exit(0);
      });
    });
    setTimeout((): never => process.exit(1), 10000).unref();
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
} catch {
  logger.fatal("Database initialization failed");
  await closeDb();
  process.exitCode = 1;
}
