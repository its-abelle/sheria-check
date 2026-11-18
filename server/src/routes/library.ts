import { Router } from "express";
import {
  listInstruments,
  getInstrument,
  searchProvisions,
  getProvision,
  listJudgments,
} from "../controllers/libraryController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
const router = Router();
router.get("/legislation", asyncHandler(listInstruments));
router.get("/legislation/:id", asyncHandler(getInstrument));
router.get("/provisions", asyncHandler(searchProvisions));
router.get("/provisions/:id", asyncHandler(getProvision));
router.get("/judgments", asyncHandler(listJudgments));
export default router;
