
import { Router } from "express";
import { ProductController } from "../controllers/productController";
import { ReviewController } from "../controllers/reviewController";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// Public product routes
router.get("/", ProductController.getProducts);
router.get("/featured", ProductController.getFeaturedProducts);
router.get("/:id", ProductController.getProduct);
router.get("/:id/reviews", ReviewController.getProductReviews);

// Protected routes
router.post("/:id/reviews", requireAuth, ReviewController.createReview);

// Admin routes
router.post("/", requireAdmin, ProductController.createProduct);
router.put("/:id", requireAdmin, ProductController.updateProduct);
router.delete("/:id", requireAdmin, ProductController.deleteProduct);
router.put("/:id/featured", requireAdmin, ProductController.toggleFeatured);

export default router;
