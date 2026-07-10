import express from "express";
import cors from "cors";
import offenseRoutes from "./routes/offenses.js";
import reportRoutes from "./routes/reports.js";
import statusRoutes from "./routes/status.js";
import adminRoutes from "./routes/admin.js";
import adminPage from "./admin/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/offenses", offenseRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/admin", adminRoutes);
app.use("/admin", adminPage);

app.use(errorHandler);

export default app;
