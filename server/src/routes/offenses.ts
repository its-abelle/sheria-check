import { Router } from "express";
import {
  searchOffenses,
  getOffenseById,
  getOffensesByCategory,
  getCategories,
} from "../controllers/offenseController.js";
import { searchLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.get("/search", searchLimiter, searchOffenses);
router.get("/categories", getCategories);
router.get("/:id", getOffenseById);
router.get("/", getOffensesByCategory);

export default router;
