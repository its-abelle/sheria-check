import { Router } from "express";
import {
  searchOffenses,
  getOffenseById,
  getOffensesByCategory,
  getCategories,
} from "../controllers/offenseController.js";

const router = Router();

router.get("/search", searchOffenses);
router.get("/categories", getCategories);
router.get("/:id", getOffenseById);
router.get("/", getOffensesByCategory);

export default router;
