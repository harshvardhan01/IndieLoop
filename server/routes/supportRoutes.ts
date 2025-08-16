import { Router } from "express";
import { SupportController } from "../controllers/supportController";
import { requireAdmin } from "../middleware/auth";

const router = Router();

// Public route
router.post("/", SupportController.createSupportMessage);

// Admin routes
router.get("/", requireAdmin, SupportController.getAllSupportMessages);
router.put("/:id/status", requireAdmin, SupportController.updateSupportMessageStatus);

export default router;