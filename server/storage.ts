import {
	type User,
	type InsertUser,
	type Product,
	type InsertProduct,
	type Review,
	type InsertReview,
	type Order,
	type InsertOrder,
	type CartItem,
	type InsertCartItem,
	type SupportMessage,
	type InsertSupportMessage,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
	// User operations
	getUser(id: string): Promise<User | undefined>;
	getUserByEmail(email: string): Promise<User | undefined>;
	createUser(user: InsertUser): Promise<User>;

	// Product operations
	getProducts(filters?: {
		country?: string;
		material?: string;
		search?: string;
	}): Promise<Product[]>;
	getProduct(id: string): Promise<Product | undefined>;
	searchProducts(query: string, limit?: number): Promise<Product[]>;
	createProduct(product: InsertProduct): Promise<Product>;
	updateProduct(
		id: string,
		productData: InsertProduct
	): Promise<Product | null>;
	deleteProduct(id: string): Promise<boolean>;

	// Review operations
	getProductReviews(productId: string): Promise<Review[]>;
	createReview(review: InsertReview): Promise<Review>;

	// Order operations
	getUserOrders(userId: string): Promise<Order[]>;
	createOrder(order: InsertOrder): Promise<Order>;
	updateOrderStatus(
		orderId: string,
		status: string,
		trackingNumber?: string
	): Promise<Order | undefined>;
	getAllOrders(): Promise<Order[]>;

	// Cart operations
	getUserCart(userId: string): Promise<CartItem[]>;
	addToCart(cartItem: InsertCartItem): Promise<CartItem>;
	updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
	removeFromCart(id: string): Promise<boolean>;
	clearCart(userId: string): Promise<boolean>;

	// Product management operations
	createProduct(product: InsertProduct): Promise<Product>;
	updateProduct(
		id: string,
		product: InsertProduct
	): Promise<Product | undefined>;
	deleteProduct(id: string): Promise<boolean>;

	// Order management operations
	getAllOrders(): Promise<Order[]>;

	// Support operations
	createSupportMessage(
		message: InsertSupportMessage
	): Promise<SupportMessage>;
	getAllSupportMessages(): Promise<SupportMessage[]>;
	updateSupportMessageStatus(
		id: string,
		status: string
	): Promise<SupportMessage | undefined>;
}

export class MemStorage implements IStorage {
	private users: Map<string, User> = new Map();
	private products: Map<string, Product> = new Map();
	private reviews: Map<string, Review> = new Map();
	private orders: Map<string, Order> = new Map();
	private cartItems: Map<string, CartItem> = new Map();
	private supportMessages: Map<string, SupportMessage> = new Map();

	constructor() {
		this.seedData();
	}

	private seedData() {
		// Seed some sample products
		const sampleProducts: InsertProduct[] = [
			{
				name: "Artisan Wooden Bowl",
				asin: "B001234567",
				description:
					"Hand-carved from sustainable teak wood by skilled artisans in Kerala, India. Each bowl is unique with its own grain pattern and natural beauty.",
				originalPrice: "3000.00",
				discountedPrice: "2400.00",
				material: "Wood",
				countryOfOrigin: "India",
				images: [
					"https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
					"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
				],
				dimensions: '12" x 8" x 3"',
				weight: "500g",
				inStock: true,
			},
			{
				name: "Peruvian Alpaca Scarf",
				asin: "B001234566",
				description:
					"Soft alpaca wool with traditional patterns, handwoven by Peruvian artisans using ancestral techniques.",
				originalPrice: "4200.00",
				discountedPrice: null,
				material: "Textile",
				countryOfOrigin: "Peru",
				images: [
					"https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
				],
				dimensions: '60" x 12"',
				weight: "200g",
				inStock: true,
			},
			{
				name: "Moroccan Ceramic Vase",
				asin: "B001234565",
				description:
					"Traditional blue pottery with intricate details, handcrafted in Fez using centuries-old techniques.",
				originalPrice: "3600.00",
				discountedPrice: null,
				material: "Ceramic",
				countryOfOrigin: "Morocco",
				images: [
					"https://images.unsplash.com/photo-1578321272176-b7bbc0679853?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
				],
				dimensions: '8" x 12"',
				weight: "800g",
				inStock: true,
			},
			{
				name: "Silver Wire Bracelet",
				asin: "B001234564",
				description:
					"Hand-forged sterling silver with natural stones, crafted by Thai silversmiths.",
				originalPrice: "5800.00",
				discountedPrice: null,
				material: "Metal",
				countryOfOrigin: "Thailand",
				images: [
					"https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
				],
				dimensions: '7" circumference',
				weight: "50g",
				inStock: true,
			},
			{
				name: "Guatemalan Leather Bag",
				asin: "B001234563",
				description:
					"Hand-stitched with traditional Mayan patterns, made from premium leather.",
				originalPrice: "8000.00",
				discountedPrice: "6800.00",
				material: "Leather",
				countryOfOrigin: "Guatemala",
				images: [
					"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
				],
				dimensions: '12" x 10" x 4"',
				weight: "600g",
				inStock: true,
			},
			{
				name: "Bamboo Storage Basket",
				asin: "B001234562",
				description:
					"Eco-friendly woven bamboo with natural finish, perfect for storage.",
				originalPrice: "1800.00",
				discountedPrice: null,
				material: "Bamboo",
				countryOfOrigin: "India",
				images: [
					"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
				],
				dimensions: '10" x 8"',
				weight: "300g",
				inStock: true,
			},
		];

		sampleProducts.forEach((product) => {
			this.createProduct(product);
		});
	}

	// Helper to generate ASIN
	private generateASIN(): string {
		return `ASIN${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
	}

	// User operations
	async getUser(id: string): Promise<User | undefined> {
		return this.users.get(id);
	}

	async getUserByEmail(email: string): Promise<User | undefined> {
		return Array.from(this.users.values()).find(
			(user) => user.email === email
		);
	}

	async createUser(insertUser: InsertUser): Promise<User> {
		const id = randomUUID();
		const user: User = {
			...insertUser,
			id,
			createdAt: new Date(),
		};
		this.users.set(id, user);
		return user;
	}

	// Product operations
	async getProducts(filters?: {
		country?: string;
		material?: string;
		search?: string;
	}): Promise<Product[]> {
		let products = Array.from(this.products.values());

		if (filters?.country) {
			products = products.filter(
				(p) =>
					p.countryOfOrigin.toLowerCase() ===
					filters.country!.toLowerCase()
			);
		}

		if (filters?.material) {
			products = products.filter(
				(p) =>
					p.material.toLowerCase() === filters.material!.toLowerCase()
			);
		}

		if (filters?.search) {
			const searchTerms = filters.search
				.toLowerCase()
				.trim()
				.split(/\s+/);
			products = products.filter((p) => {
				const searchableText =
					`${p.name} ${p.description} ${p.material} ${p.countryOfOrigin}`.toLowerCase();
				return searchTerms.every((term) =>
					searchableText.includes(term)
				);
			});
		}

		return products;
	}

	async getProduct(id: string): Promise<Product | undefined> {
		return this.products.get(id);
	}

	async createProduct(insertProduct: InsertProduct): Promise<Product> {
		const id = randomUUID();
		const asin = insertProduct.asin || this.generateASIN();
		const product: Product = {
			...insertProduct,
			id,
			asin,
			discountedPrice: insertProduct.discountedPrice || null,
			dimensions: insertProduct.dimensions || null,
			weight: insertProduct.weight || null,
			inStock: insertProduct.inStock ?? true,
			createdAt: new Date(),
		};
		this.products.set(id, product);
		return product;
	}

	async updateProduct(
		id: string,
		insertProduct: InsertProduct
	): Promise<Product | undefined> {
		const existingProduct = this.products.get(id);
		if (!existingProduct) {
			return undefined;
		}

		const updatedProduct: Product = {
			...existingProduct,
			...insertProduct,
			id,
			discountedPrice: insertProduct.discountedPrice || null,
			dimensions: insertProduct.dimensions || null,
			weight: insertProduct.weight || null,
			inStock: insertProduct.inStock ?? true,
		};
		this.products.set(id, updatedProduct);
		return updatedProduct;
	}

	async deleteProduct(id: string): Promise<boolean> {
		return this.products.delete(id);
	}

	async searchProducts(
		query: string,
		limit: number = 100
	): Promise<Product[]> {
		const searchTerms = query.toLowerCase().trim().split(/\s+/);
		const matchingProducts = Array.from(this.products.values()).filter(
			(p) => {
				const searchableText =
					`${p.name} ${p.description} ${p.material} ${p.countryOfOrigin}`.toLowerCase();
				return searchTerms.every((term) =>
					searchableText.includes(term)
				);
			}
		);
		return matchingProducts.slice(0, limit);
	}

	// The second createProduct method was a duplicate and is now consolidated
	// The updateProduct method also had a duplicate, which is now consolidated.

	// Review operations
	async getProductReviews(productId: string): Promise<Review[]> {
		return Array.from(this.reviews.values()).filter(
			(review) => review.productId === productId
		);
	}

	async createReview(insertReview: InsertReview): Promise<Review> {
		const id = randomUUID();
		const review: Review = {
			...insertReview,
			id,
			comment: insertReview.comment || null,
			createdAt: new Date(),
		};
		this.reviews.set(id, review);
		return review;
	}

	// Order operations
	async getUserOrders(userId: string): Promise<Order[]> {
		return Array.from(this.orders.values()).filter(
			(order) => order.userId === userId
		);
	}

	async createOrder(insertOrder: InsertOrder): Promise<Order> {
		const id = randomUUID();
		const order: Order = {
			...insertOrder,
			id,
			currency: insertOrder.currency || "INR",
			status: insertOrder.status || "pending",
			trackingNumber: `TRK${Date.now()}`,
			createdAt: new Date(),
		};
		this.orders.set(id, order);
		return order;
	}

	async updateOrderStatus(
		orderId: string,
		status: string,
		trackingNumber?: string
	): Promise<Order | undefined> {
		const order = this.orders.get(orderId);
		if (order) {
			const updatedOrder = {
				...order,
				status,
				trackingNumber: trackingNumber || order.trackingNumber,
			};
			this.orders.set(orderId, updatedOrder);
			return updatedOrder;
		}
		return undefined;
	}

	async getAllOrders(): Promise<Order[]> {
		return Array.from(this.orders.values()).sort(
			(a, b) => b.createdAt.getTime() - a.createdAt.getTime()
		);
	}

	// Cart operations
	async getUserCart(userId: string): Promise<CartItem[]> {
		return Array.from(this.cartItems.values()).filter(
			(item) => item.userId === userId
		);
	}

	async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
		// Check if item already exists in cart
		const existingItem = Array.from(this.cartItems.values()).find(
			(item) =>
				item.userId === insertCartItem.userId &&
				item.productId === insertCartItem.productId
		);

		if (existingItem) {
			// Update quantity
			const updatedItem = {
				...existingItem,
				quantity:
					existingItem.quantity + (insertCartItem.quantity || 1),
			};
			this.cartItems.set(existingItem.id, updatedItem);
			return updatedItem;
		}

		const id = randomUUID();
		const cartItem: CartItem = {
			...insertCartItem,
			id,
			quantity: insertCartItem.quantity || 1,
			createdAt: new Date(),
		};
		this.cartItems.set(id, cartItem);
		return cartItem;
	}

	async updateCartItem(
		id: string,
		quantity: number
	): Promise<CartItem | undefined> {
		const item = this.cartItems.get(id);
		if (item) {
			const updatedItem = { ...item, quantity };
			this.cartItems.set(id, updatedItem);
			return updatedItem;
		}
		return undefined;
	}

	async removeFromCart(id: string): Promise<boolean> {
		return this.cartItems.delete(id);
	}

	async clearCart(userId: string): Promise<boolean> {
		const userItems = Array.from(this.cartItems.entries()).filter(
			([_, item]) => item.userId === userId
		);
		userItems.forEach(([id]) => this.cartItems.delete(id));
		return true;
	}

	// Support operations
	async createSupportMessage(
		insertMessage: InsertSupportMessage
	): Promise<SupportMessage> {
		const id = randomUUID();
		const message: SupportMessage = {
			...insertMessage,
			id,
			phone: insertMessage.phone || null,
			status: insertMessage.status || "open",
			createdAt: new Date(),
		};
		this.supportMessages.set(id, message);
		return message;
	}

	async getAllSupportMessages(): Promise<SupportMessage[]> {
		return Array.from(this.supportMessages.values()).sort(
			(a, b) => b.createdAt.getTime() - a.createdAt.getTime()
		);
	}

	async updateSupportMessageStatus(
		id: string,
		status: string
	): Promise<SupportMessage | undefined> {
		const message = this.supportMessages.get(id);
		if (message) {
			const updatedMessage = { ...message, status };
			this.supportMessages.set(id, updatedMessage);
			return updatedMessage;
		}
		return undefined;
	}
}

export const storage = new MemStorage();
