
import { Router } from "express";
import { CartController } from "../controllers/cartController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", CartController.getCart);
router.post("/", CartController.addToCart);
router.put("/:id", CartController.updateCartItem);
router.delete("/:id", CartController.removeFromCart);
router.delete("/", CartController.clearCart);

export default router;
