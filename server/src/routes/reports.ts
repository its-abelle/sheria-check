import { Router } from "express";
import { createReport } from "../controllers/reportController.js";
import { reportLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/", reportLimiter, createReport);

export default router;
