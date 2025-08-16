import type { Request, Response } from "express";
import { z } from "zod";
import { insertOrderSchema } from "@shared/schema";
import { orderService } from "../services/orderService";
import { cartService } from "../services/cartService";
import { storage as userStorage } from "../services/userService";

export class OrderController {
	static async getOrders(req: any, res: Response) {
		try {
			const orders = await orderService.getUserOrders(req.user.userId);
			res.json(orders);
		} catch (error) {
			res.status(500).json({ message: "Failed to fetch orders" });
		}
	}

	static async createOrder(req: any, res: Response) {
		try {
			const orderData = insertOrderSchema.parse({
				...req.body,
				userId: req.user.userId,
			});
			const order = await orderService.createOrder(orderData);

			// Clear cart after successful order
			await cartService.clearCart(req.user.userId);

			res.json(order);
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res
					.status(400)
					.json({ message: error.errors[0].message });
			}
			res.status(500).json({ message: "Failed to create order" });
		}
	}

	static async cancelOrder(req: any, res: Response) {
		try {
			const order = await orderService.updateOrderStatus(
				req.params.id,
				"cancelled"
			);
			if (!order) {
				return res.status(404).json({ message: "Order not found" });
			}

			// Verify the order belongs to the user (unless admin)
			const userOrder = await orderService.getUserOrders(req.user.userId);
			const orderExists = userOrder.find((o) => o.id === req.params.id);

			if (!orderExists && !req.user.isAdmin) {
				return res
					.status(403)
					.json({ message: "Not authorized to cancel this order" });
			}

			res.json(order);
		} catch (error) {
			res.status(500).json({ message: "Failed to cancel order" });
		}
	}

	static async getAllOrders(req: any, res: Response) {
		try {
			const orders = await orderService.getAllOrders();

			// Enhance orders with user details
			const ordersWithUsers = await Promise.all(
				orders.map(async (order) => {
					try {
						const user = await userStorage.getUser(order.userId);
						return {
							...order,
							customer: user
								? {
										firstName: user.firstName,
										lastName: user.lastName,
										email: user.email,
										phone: user.phone,
								  }
								: {
										firstName: "Unknown",
										lastName: "Customer",
										email: "N/A",
										phone: "N/A",
								  },
						};
					} catch (error) {
						console.error(
							`Error fetching user ${order.userId}:`,
							error
						);
						return {
							...order,
							customer: {
								firstName: "Unknown",
								lastName: "Customer",
								email: "N/A",
								phone: "N/A",
							},
						};
					}
				})
			);

			res.json(ordersWithUsers);
		} catch (error) {
			console.error("Get all orders error:", error);
			res.status(500).json({ message: "Failed to fetch orders" });
		}
	}

	static async updateOrderStatus(req: any, res: Response) {
		try {
			const { status, trackingNumber } = req.body;
			const order = await orderService.updateOrderStatus(
				req.params.id,
				status,
				trackingNumber
			);
			if (!order) {
				return res.status(404).json({ message: "Order not found" });
			}
			res.json(order);
		} catch (error) {
			res.status(500).json({ message: "Failed to update order status" });
		}
	}

	// Admin methods
	static async adminGetAllOrders(req: Request, res: Response) {
		try {
			const orders = await orderService.getAllOrders();
			const ordersWithUsers = await Promise.all(
				orders.map(async (order) => {
					try {
						const user = await userStorage.getUser(order.userId);
						return {
							...order,
							customer: user
								? {
										firstName: user.firstName,
										lastName: user.lastName,
										email: user.email,
								  }
								: null,
						};
					} catch (e) {
						console.error(
							`Error fetching user for order ${order.id}:`,
							e
						);
						return order;
					}
				})
			);
			res.json(ordersWithUsers);
		} catch (error) {
			res.status(500).json({ message: "Failed to fetch all orders" });
		}
	}

	static async adminGetOrderById(req: Request, res: Response) {
		try {
			const orderId = req.params.id;
			const order = await orderService.getOrderById(orderId);
			if (!order) {
				return res.status(404).json({ message: "Order not found" });
			}

			const user = await userStorage.getUser(order.userId);
			const orderWithUser = {
				...order,
				customer: user
					? {
							firstName: user.firstName,
							lastName: user.lastName,
							email: user.email,
					  }
					: null,
			};

			res.json(orderWithUser);
		} catch (error) {
			res.status(500).json({ message: "Failed to fetch order by ID" });
		}
	}

	static async adminUpdateOrderStatus(req: Request, res: Response) {
		try {
			const { status, trackingNumber } = req.body;
			const orderId = req.params.id;
			const updatedOrder = await orderService.updateOrderStatus(
				orderId,
				status,
				trackingNumber
			);
			if (!updatedOrder) {
				return res.status(404).json({ message: "Order not found" });
			}

			// Return order with customer information
			const user = await userStorage.getUser(updatedOrder.userId);
			const orderWithUser = {
				...updatedOrder,
				customer: user
					? {
							firstName: user.firstName,
							lastName: user.lastName,
							email: user.email,
					  }
					: null,
			};

			res.json(orderWithUser);
		} catch (error) {
			console.error("Admin update order status error:", error);
			res.status(500).json({ message: "Failed to update order status" });
		}
	}

	static async getUserById(req: Request, res: Response) {
		try {
			const userId = req.params.id;
			const user = await userStorage.getUser(userId);
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}
			res.json(user);
		} catch (error) {
			res.status(500).json({ message: "Failed to fetch user" });
		}
	}
}
