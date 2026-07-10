import app from "./app.js";
import { initDb } from "./db/index.js";

const PORT = parseInt(process.env.PORT || "4000", 10);

async function start() {
  try {
    await initDb();
    console.log("Database initialized");

    app.listen(PORT, () => {
      console.log(`Sheria Check API running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
