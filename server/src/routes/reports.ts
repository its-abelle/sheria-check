import { Router } from "express";
import { createReport } from "../controllers/reportController.js";
import { getInsights } from "../controllers/insightController.js";
import { reportLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.get("/insights", getInsights);
router.post("/", reportLimiter, createReport);

export default router;
