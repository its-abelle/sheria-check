import { Router } from "express";
import {
  searchOffenses,
  getCategories,
  getOffenseById,
  getOffensesByCategory,
} from "../controllers/offenseController.js";
import { searchLimiter } from "../middleware/rateLimiter.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
const router = Router();
router.get("/search", searchLimiter, asyncHandler(searchOffenses));
router.get("/categories", asyncHandler(getCategories));
router.get("/:id", asyncHandler(getOffenseById));
router.get("/", asyncHandler(getOffensesByCategory));
export default router;
