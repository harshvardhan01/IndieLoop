import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
	loginSchema,
	registerSchema,
	insertCartItemSchema,
	insertOrderSchema,
	insertSupportMessageSchema,
	insertProductSchema,
} from "@shared/schema";
import { sendEmail } from "./config/email";

// Simple session management
const sessions = new Map<
	string,
	{
		userId: string;
		email: string;
		firstName: string;
		lastName: string;
		isAdmin: boolean;
	}
>();

function generateSessionId(): string {
	return Math.random().toString(36).substring(7) + Date.now().toString(36);
}

function requireAuth(req: any, res: any, next: any) {
	const sessionId = req.headers.authorization?.replace("Bearer ", "");
	const session = sessionId ? sessions.get(sessionId) : null;

	if (!session) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	req.user = session;
	next();
}

function requireAdmin(req: any, res: any, next: any) {
	const sessionId = req.headers.authorization?.replace("Bearer ", "");
	const session = sessionId ? sessions.get(sessionId) : null;

	if (!session) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	if (!session.isAdmin) {
		return res.status(403).json({ message: "Admin access required" });
	}

	req.user = session;
	next();
}

export async function registerRoutes(app: Express): Promise<Server> {
	// Auth routes
	app.post("/api/auth/register", async (req, res) => {
		try {
			const userData = registerSchema.parse(req.body);

			// Check if user already exists
			const existingEmail = await storage.getUserByEmail(userData.email);
			if (existingEmail) {
				return res
					.status(400)
					.json({ message: "Email already exists" });
			}

			const user = await storage.createUser(userData);
			const sessionId = generateSessionId();
			sessions.set(sessionId, {
				userId: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				isAdmin: user.isAdmin || false,
			});

			res.json({
				user: {
					id: user.id,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					isAdmin: user.isAdmin || false,
				},
				sessionId,
			});
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res
					.status(400)
					.json({ message: error.errors[0].message });
			}
			res.status(500).json({ message: "Registration failed" });
		}
	});

	app.post("/api/auth/login", async (req, res) => {
		try {
			const { email, password } = loginSchema.parse(req.body);

			const user = await storage.getUserByEmail(email);
			if (!user || user.password !== password) {
				return res.status(400).json({ message: "Invalid credentials" });
			}

			const sessionId = generateSessionId();
			sessions.set(sessionId, {
				userId: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				isAdmin: user.isAdmin || false,
			});

			res.json({
				user: {
					id: user.id,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					isAdmin: user.isAdmin || false,
				},
				sessionId,
			});
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res
					.status(400)
					.json({ message: error.errors[0].message });
			}
			res.status(500).json({ message: "Login failed" });
		}
	});

	app.post("/api/auth/logout", requireAuth, async (req: any, res) => {
		const sessionId = req.headers.authorization?.replace("Bearer ", "");
		if (sessionId) {
			sessions.delete(sessionId);
		}
		res.json({ message: "Logged out successfully" });
	});

	app.get("/api/auth/me", requireAuth, async (req: any, res) => {
		try {
			const user = await storage.getUser(req.user.userId);
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}
			res.json({
				id: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				isAdmin: user.isAdmin || false,
			});
		} catch (error) {
			res.status(500).json({ message: "Failed to get user info" });
		}
	});

	// Product routes
	app.get("/api/products", async (req, res) => {
		try {
			const { country, material, search } = req.query;
			const products = await storage.getProducts({
				country: country as string,
				material: material as string,
				search: search as string,
			});
			res.json(products);
		} catch (error) {
			res.status(500).json({ message: "Failed to fetch products" });
		}
	});

	app.get("/api/products/search", async (req, res) => {
		try {
			const { q, limit = "6" } = req.query;
			if (!q || typeof q !== "string" || q.trim().length < 2) {
				return res.json([]);
			}

			const suggestions = await storage.searchProducts(
				q.trim(),
				parseInt(limit as string)
			);
			res.json(suggestions);
		} catch (error) {
			res.status(500).json({
				message: "Failed to fetch search suggestions",
			});
		}
	});

	app.get("/api/products/:id", async (req, res) => {
		try {
			console.log("Fetching product with ID:", req.params.id);
			const product = await storage.getProduct(req.params.id);
			console.log("Found product:", product);
			if (!product) {
				return res.status(404).json({ message: "Product not found" });
			}
			res.json(product);
		} catch (error) {
			console.error("Error fetching product:", error);
			res.status(500).json({ message: "Failed to fetch product" });
		}
	});

	app.get("/api/products/:id/reviews", async (req, res) => {
		try {
			const reviews = await storage.getProductReviews(req.params.id);
			res.json(reviews);
		} catch (error) {
			res.status(500).json({ message: "Failed to fetch reviews" });
		}
	});

	// Cart routes
	app.get("/api/cart", requireAuth, async (req: any, res) => {
		try {
			const cartItems = await storage.getUserCart(req.user.userId);
			const cartWithProducts = await Promise.all(
				cartItems.map(async (item) => {
					const product = await storage.getProduct(item.productId);
					return { ...item, product };
				})
			);
			res.json(cartWithProducts);
		} catch (error) {
			res.status(500).json({ message: "Failed to fetch cart" });
		}
	});

	app.post("/api/cart", requireAuth, async (req: any, res) => {
		try {
			const cartItemData = insertCartItemSchema.parse({
				...req.body,
				userId: req.user.userId,
			});
			const cartItem = await storage.addToCart(cartItemData);
			res.json(cartItem);
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res
					.status(400)
					.json({ message: error.errors[0].message });
			}
			res.status(500).json({ message: "Failed to add to cart" });
		}
	});

	app.put("/api/cart/:id", requireAuth, async (req: any, res) => {
		try {
			const { quantity } = req.body;
			const cartItem = await storage.updateCartItem(
				req.params.id,
				quantity
			);
			if (!cartItem) {
				return res.status(404).json({ message: "Cart item not found" });
			}
			res.json(cartItem);
		} catch (error) {
			res.status(500).json({ message: "Failed to update cart item" });
		}
	});

	app.delete("/api/cart/:id", requireAuth, async (req: any, res) => {
		try {
			const success = await storage.removeFromCart(req.params.id);
			if (!success) {
				return res.status(404).json({ message: "Cart item not found" });
			}
			res.json({ message: "Item removed from cart" });
		} catch (error) {
			res.status(500).json({ message: "Failed to remove cart item" });
		}
	});

	app.delete("/api/cart", requireAuth, async (req: any, res) => {
		try {
			await storage.clearCart(req.user.userId);
			res.json({ message: "Cart cleared" });
		} catch (error) {
			res.status(500).json({ message: "Failed to clear cart" });
		}
	});

	// Order routes
	app.get("/api/orders", requireAuth, async (req: any, res) => {
		try {
			const orders = await storage.getUserOrders(req.user.userId);
			res.json(orders);
		} catch (error) {
			res.status(500).json({ message: "Failed to fetch orders" });
		}
	});

	app.post("/api/orders", requireAuth, async (req: any, res) => {
		try {
			const orderData = insertOrderSchema.parse({
				...req.body,
				userId: req.user.userId,
			});
			const order = await storage.createOrder(orderData);

			// Clear cart after successful order
			await storage.clearCart(req.user.userId);

			res.json(order);
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res
					.status(400)
					.json({ message: error.errors[0].message });
			}
			res.status(500).json({ message: "Failed to create order" });
		}
	});

	// Support routes
	app.post("/api/support", async (req, res) => {
		try {
			const messageData = insertSupportMessageSchema.parse(req.body);
			const message = await storage.createSupportMessage(messageData);

			// Send email notification
			const emailSent = await sendEmail({
				to: "jasapa7424@cotasen.com",
				subject: `New Support Message from ${messageData.name}`,
				text: `
Name: ${messageData.name}
Email: ${messageData.email}
Phone: ${messageData.phone || "Not provided"}

Message:
${messageData.message}
        `,
			});

			res.json({
				message: "Support message sent successfully",
				emailSent,
			});
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res
					.status(400)
					.json({ message: error.errors[0].message });
			}
			res.status(500).json({ message: "Failed to send support message" });
		}
	});

	// Config routes
	app.get("/api/config/countries", async (req, res) => {
		try {
			const { COUNTRIES } = await import("./config/constants");
			res.json(COUNTRIES);
		} catch (error) {
			res.status(500).json({ message: "Failed to fetch countries" });
		}
	});

	app.get("/api/config/materials", async (req, res) => {
		try {
			const { MATERIALS } = await import("./config/constants");
			res.json(MATERIALS);
		} catch (error) {
			res.status(500).json({ message: "Failed to fetch materials" });
		}
	});

	// Admin routes - Product management
	app.post("/api/admin/products", requireAdmin, async (req: any, res) => {
		try {
			const productData = insertProductSchema.parse(req.body);
			const product = await storage.createProduct(productData);
			res.json(product);
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res
					.status(400)
					.json({ message: error.errors[0].message });
			}
			res.status(500).json({ message: "Failed to create product" });
		}
	});

	app.put("/api/admin/products/:id", requireAdmin, async (req: any, res) => {
		try {
			const productData = insertProductSchema.parse(req.body);
			const product = await storage.updateProduct(
				req.params.id,
				productData
			);
			if (!product) {
				return res.status(404).json({ message: "Product not found" });
			}
			res.json(product);
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res
					.status(400)
					.json({ message: error.errors[0].message });
			}
			res.status(500).json({ message: "Failed to update product" });
		}
	});

	app.delete(
		"/api/admin/products/:id",
		requireAdmin,
		async (req: any, res) => {
			try {
				const success = await storage.deleteProduct(req.params.id);
				if (!success) {
					return res
						.status(404)
						.json({ message: "Product not found" });
				}
				res.json({ message: "Product deleted successfully" });
			} catch (error) {
				res.status(500).json({ message: "Failed to delete product" });
			}
		}
	);

	app.get("/api/admin/orders", requireAdmin, async (req: any, res) => {
		try {
			const orders = await storage.getAllOrders();
			res.json(orders);
		} catch (error) {
			res.status(500).json({ message: "Failed to fetch orders" });
		}
	});

	app.put(
		"/api/admin/orders/:id/status",
		requireAdmin,
		async (req: any, res) => {
			try {
				const { status, trackingNumber } = req.body;
				const order = await storage.updateOrderStatus(
					req.params.id,
					status,
					trackingNumber
				);
				if (!order) {
					return res.status(404).json({ message: "Order not found" });
				}
				res.json(order);
			} catch (error) {
				res.status(500).json({
					message: "Failed to update order status",
				});
			}
		}
	);

	app.get("/api/admin/support", requireAdmin, async (req: any, res) => {
		try {
			const messages = await storage.getAllSupportMessages();
			res.json(messages);
		} catch (error) {
			res.status(500).json({
				message: "Failed to fetch support messages",
			});
		}
	});

	app.put(
		"/api/admin/support/:id/status",
		requireAdmin,
		async (req: any, res) => {
			try {
				const { status } = req.body;
				const message = await storage.updateSupportMessageStatus(
					req.params.id,
					status
				);
				if (!message) {
					return res
						.status(404)
						.json({ message: "Support message not found" });
				}
				res.json(message);
			} catch (error) {
				res.status(500).json({
					message: "Failed to update support message status",
				});
			}
		}
	);

	// Currency conversion rates (mock data)
	app.get("/api/currency-rates", async (req, res) => {
		try {
			// Mock exchange rates - in production, fetch from a real API
			const rates = {
				INR: 1,
				USD: 0.012,
				EUR: 0.011,
				AED: 0.044,
			};
			res.json(rates);
		} catch (error) {
			res.status(500).json({ message: "Failed to fetch currency rates" });
		}
	});

	const httpServer = createServer(app);
	return httpServer;
}
