import { Router } from "express";
import { OrderController } from "../controllers/orderController";
import { requireAdmin } from "../middleware/auth";

const router = Router();

// Admin order routes
router.get("/orders", requireAdmin, OrderController.getAllOrders);
router.get("/orders/:id", requireAdmin, OrderController.adminGetOrderById);
router.put(
	"/orders/:id/status",
	requireAdmin,
	OrderController.adminUpdateOrderStatus
);
router.get("/users/:id", requireAdmin, OrderController.getUserById);

export default router;
