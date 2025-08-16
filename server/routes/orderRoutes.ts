import { Router } from "express";
import { OrderController } from "../controllers/orderController";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// User routes
router.get("/", requireAuth, OrderController.getOrders);
// User routes
router.get("/", requireAuth, OrderController.getOrders);
router.post("/", requireAuth, OrderController.createOrder);
router.put("/:id/cancel", requireAuth, OrderController.cancelOrder);

export default router;
