import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  createOffense,
  bulkUpload,
  deleteOffense,
  importBundle,
  listContent,
  publishContent,
} from "../controllers/adminController.js";
const router = Router();
router.use(requireAdmin);
router.post("/content/import", asyncHandler(importBundle));
router.get("/content/:kind", asyncHandler(listContent));
router.post("/content/:kind/:id/:action", asyncHandler(publishContent));
router.post("/offenses", asyncHandler(createOffense));
router.post("/offenses/bulk", asyncHandler(bulkUpload));
router.delete("/offenses/:id", asyncHandler(deleteOffense));
export default router;
