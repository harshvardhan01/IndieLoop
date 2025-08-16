
import { Router } from "express";
import { ArtisanController } from "../controllers/artisanController";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Public routes
router.get("/", ArtisanController.getArtisans);
router.get("/:id", ArtisanController.getArtisan);
router.get("/:id/products", ArtisanController.getArtisanProducts);

// Admin routes
router.post("/", requireAuth, ArtisanController.createArtisan);
router.put("/:id", requireAuth, ArtisanController.updateArtisan);
router.delete("/:id", requireAuth, ArtisanController.deleteArtisan);

export default router;
