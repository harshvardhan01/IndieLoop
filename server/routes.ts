import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
	type User,
	type Product,
	type Review,
	type Order,
	type CartItem,
	insertUserSchema,
	insertProductSchema,
	insertReviewSchema,
	insertOrderSchema,
	insertCartItemSchema,
	insertSupportMessageSchema,
	insertAddressSchema,
	loginSchema,
	registerSchema,
	insertArtisanSchema, // Import the new schema
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
			const { country, material, category, search } = req.query;
			const products = await storage.getProducts({
				country: country as string,
				material: material as string,
				category: category as string,
				search: search as string,
			});
			res.json(products);
		} catch (error) {
			res.status(500).json({ message: "Failed to fetch products" });
		}
	});

	app.get("/api/products/featured", async (req, res) => {
		try {
			const featuredProducts = await storage.getFeaturedProducts();
			res.json(featuredProducts);
		} catch (error) {
			res.status(500).json({
				message: "Failed to fetch featured products",
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
			// Fetch artisan details for the product
			if (product.artisanId) {
				const artisan = await storage.getArtisanById(product.artisanId);
				product.artisan = artisan; // Attach artisan details to the product
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

	app.post(
		"/api/products/:id/reviews",
		requireAuth,
		async (req: any, res) => {
			try {
				const { rating, comment } = req.body;

				if (!rating || rating < 1 || rating > 5) {
					return res
						.status(400)
						.json({ message: "Rating must be between 1 and 5" });
				}

				const reviewData = insertReviewSchema.parse({
					productId: req.params.id,
					userId: req.user.userId,
					rating: parseInt(rating),
					comment: comment?.trim() || null,
				});

				// Check if user already reviewed this product
				const existingReviews = await storage.getProductReviews(
					req.params.id
				);
				const userHasReviewed = existingReviews.some(
					(review) => review.userId === req.user.userId
				);

				if (userHasReviewed) {
					return res.status(400).json({
						message: "You have already reviewed this product",
					});
				}

				const review = await storage.createReview(reviewData);
				res.status(201).json(review);
			} catch (error) {
				if (error instanceof z.ZodError) {
					return res
						.status(400)
						.json({ message: error.errors[0].message });
				}
				res.status(500).json({ message: "Failed to create review" });
			}
		}
	);

	// Cart routes
	app.get("/api/cart", requireAuth, async (req: any, res) => {
		try {
			const cartItems = await storage.getUserCart(req.user.userId);
			const cartWithProducts = await Promise.all(
				cartItems.map(async (item) => {
					const product = await storage.getProduct(item.productId);
					if (product && product.artisanId) {
						const artisan = await storage.getArtisanById(
							product.artisanId
						);
						product.artisan = artisan;
					}
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

	// Cancel order route
	app.put("/api/orders/:id/cancel", requireAuth, async (req: any, res) => {
		try {
			const order = await storage.updateOrderStatus(
				req.params.id,
				"cancelled"
			);
			if (!order) {
				return res.status(404).json({ message: "Order not found" });
			}

			// Verify the order belongs to the user (unless admin)
			const userOrder = await storage.getUserOrders(req.user.userId);
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

	// Address routes
	app.get("/api/addresses", requireAuth, async (req: any, res) => {
		try {
			const addresses = await storage.getUserAddresses(req.user.userId);
			res.json(addresses);
		} catch (error) {
			console.error("Error fetching addresses:", error);
			res.status(500).json({ message: "Internal server error" });
		}
	});

	// Artisan routes
	app.get("/api/artisans", async (req, res) => {
		try {
			const artisans = await storage.getArtisans();
			res.json(artisans);
		} catch (error) {
			console.error("Error fetching artisans:", error);
			res.status(500).json({ message: "Internal server error" });
		}
	});

	app.get("/api/artisans/:id", async (req, res) => {
		try {
			const artisan = await storage.getArtisanById(req.params.id);
			if (!artisan) {
				return res.status(404).json({ message: "Artisan not found" });
			}
			res.json(artisan);
		} catch (error) {
			console.error("Error fetching artisan:", error);
			res.status(500).json({ message: "Internal server error" });
		}
	});

	app.get("/api/artisans/:id/products", async (req, res) => {
		try {
			const products = await storage.getProductsByArtisanId(
				req.params.id
			);
			// Enhance products with artisan details
			const enhancedProducts = await Promise.all(
				products.map(async (product) => {
					if (product.artisanId) {
						const artisan = await storage.getArtisanById(
							product.artisanId
						);
						product.artisan = artisan;
					}
					return product;
				})
			);
			res.json(enhancedProducts);
		} catch (error) {
			console.error("Error fetching artisan products:", error);
			res.status(500).json({ message: "Internal server error" });
		}
	});

	app.post("/api/artisans", requireAuth, async (req, res) => {
		try {
			if (!req.user.isAdmin) {
				return res
					.status(403)
					.json({ message: "Admin access required" });
			}

			const artisanData = insertArtisanSchema.parse(req.body);
			const artisan = await storage.createArtisan(artisanData);
			res.status(201).json(artisan);
		} catch (error) {
			console.error("Error creating artisan:", error);
			if (error instanceof z.ZodError) {
				return res
					.status(400)
					.json({ message: error.errors[0].message });
			}
			res.status(500).json({ message: "Internal server error" });
		}
	});

	app.put("/api/artisans/:id", requireAuth, async (req, res) => {
		try {
			if (!req.user.isAdmin) {
				return res
					.status(403)
					.json({ message: "Admin access required" });
			}

			const artisanData = insertArtisanSchema.parse(req.body);
			const artisan = await storage.updateArtisan(
				req.params.id,
				artisanData
			);
			if (!artisan) {
				return res.status(404).json({ message: "Artisan not found" });
			}
			res.json(artisan);
		} catch (error) {
			console.error("Error updating artisan:", error);
			if (error instanceof z.ZodError) {
				return res
					.status(400)
					.json({ message: error.errors[0].message });
			}
			res.status(500).json({ message: "Internal server error" });
		}
	});

	app.delete("/api/artisans/:id", requireAuth, async (req, res) => {
		try {
			if (!req.user.isAdmin) {
				return res
					.status(403)
					.json({ message: "Admin access required" });
			}

			const success = await storage.deleteArtisan(req.params.id);
			if (!success) {
				return res.status(404).json({ message: "Artisan not found" });
			}
			res.status(204).send();
		} catch (error) {
			console.error("Error deleting artisan:", error);
			res.status(500).json({ message: "Internal server error" });
		}
	});

	app.post("/api/addresses", requireAuth, async (req: any, res) => {
		try {
			const addressData = insertAddressSchema.parse({
				...req.body,
				userId: req.user.userId,
			});
			const address = await storage.createAddress(addressData);
			res.json(address);
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res
					.status(400)
					.json({ message: error.errors[0].message });
			}
			res.status(500).json({ message: "Failed to create address" });
		}
	});

	app.put("/api/addresses/:id", requireAuth, async (req: any, res) => {
		try {
			// First check if the address belongs to the user
			const userAddresses = await storage.getUserAddresses(
				req.user.userId
			);
			const addressExists = userAddresses.find(
				(addr) => addr.id === req.params.id
			);

			if (!addressExists) {
				return res.status(404).json({ message: "Address not found" });
			}

			const addressData = insertAddressSchema.parse({
				...req.body,
				userId: req.user.userId,
			});

			const address = await storage.updateAddress(
				req.params.id,
				addressData
			);
			if (!address) {
				return res.status(404).json({ message: "Address not found" });
			}
			res.json(address);
		} catch (error) {
			console.error("Error updating address:", error);
			if (error instanceof z.ZodError) {
				return res
					.status(400)
					.json({ message: error.errors[0].message });
			}
			res.status(500).json({ message: "Failed to update address" });
		}
	});

	app.delete("/api/addresses/:id", requireAuth, async (req: any, res) => {
		try {
			// First check if the address belongs to the user
			const userAddresses = await storage.getUserAddresses(
				req.user.userId
			);
			const addressExists = userAddresses.find(
				(addr) => addr.id === req.params.id
			);

			if (!addressExists) {
				return res.status(404).json({ message: "Address not found" });
			}

			const success = await storage.deleteAddress(req.params.id);
			if (!success) {
				return res.status(404).json({ message: "Address not found" });
			}
			res.json({ message: "Address deleted successfully" });
		} catch (error) {
			console.error("Error deleting address:", error);
			res.status(500).json({ message: "Failed to delete address" });
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

	app.get("/api/config/categories", async (req, res) => {
		try {
			const { CATEGORIES } = await import("./config/constants");
			res.json(CATEGORIES);
		} catch (error) {
			res.status(500).json({ message: "Failed to fetch categories" });
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

	app.put(
		"/api/admin/products/:id/featured",
		requireAdmin,
		async (req: any, res) => {
			try {
				const { featured } = req.body;
				const product = await storage.toggleProductFeatured(
					req.params.id,
					featured
				);
				if (!product) {
					return res
						.status(404)
						.json({ message: "Product not found" });
				}
				res.json(product);
			} catch (error) {
				res.status(500).json({
					message: "Failed to update featured status",
				});
			}
		}
	);

	app.get("/api/admin/orders", requireAdmin, async (req: any, res) => {
		try {
			const orders = await storage.getAllOrders();

			// Enhance orders with user details
			const ordersWithUsers = await Promise.all(
				orders.map(async (order) => {
					try {
						const user = await storage.getUser(order.userId);
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
					} catch {
						return order;
					}
				})
			);

			res.json(ordersWithUsers);
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

	// Admin get user details
	app.get("/api/admin/users/:id", requireAdmin, async (req: any, res) => {
		try {
			const user = await storage.getUser(req.params.id);
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}
			res.json({
				id: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
			});
		} catch (error) {
			res.status(500).json({ message: "Failed to fetch user details" });
		}
	});

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
