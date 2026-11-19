import { Router } from "express";
import { getStatus } from "../controllers/statusController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
const router = Router();
router.get("/", asyncHandler(getStatus));
export default router;
