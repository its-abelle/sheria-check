import app from "../app.js";
import { initDb } from "../db/index.js";

const PORT = parseInt(process.env.PORT || "4001", 10);

let server: ReturnType<typeof app.listen> | null = null;

export async function startTestServer(): Promise<number> {
  await initDb();
  return new Promise((resolve) => {
    server = app.listen(PORT, () => resolve(PORT));
  });
}

export async function stopTestServer(): Promise<void> {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => resolve());
    } else {
      resolve();
    }
  });
}
