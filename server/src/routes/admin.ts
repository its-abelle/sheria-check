import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import { createOffense, deleteOffense, bulkUpload } from "../controllers/adminController.js";

const router = Router();

router.post("/offenses", requireAdmin, createOffense);
router.post("/offenses/bulk", requireAdmin, bulkUpload);
router.delete("/offenses/:id", requireAdmin, deleteOffense);

export default router;
