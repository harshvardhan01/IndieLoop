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

	// Cart operations
	getUserCart(userId: string): Promise<CartItem[]>;
	addToCart(cartItem: InsertCartItem): Promise<CartItem>;
	updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
	removeFromCart(id: string): Promise<boolean>;
	clearCart(userId: string): Promise<boolean>;

	// Support operations
	createSupportMessage(
		message: InsertSupportMessage
	): Promise<SupportMessage>;
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
				description:
					"Hand-stitched with traditional Mayan patterns, made from premium leather.",
				originalPrice: "8000.00",
				discountedPrice: "6800.00",
				material: "Leather",
				countryOfOrigin: "Guatemala",
				images: [
					"https://images.unsplash.com/photo-1553062407098eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
				],
				dimensions: '12" x 10" x 4"',
				weight: "600g",
				inStock: true,
			},
			{
				name: "Bamboo Storage Basket",
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
			const searchTerm = filters.search.toLowerCase();
			products = products.filter(
				(p) =>
					p.name.toLowerCase().includes(searchTerm) ||
					p.description.toLowerCase().includes(searchTerm) ||
					p.material.toLowerCase().includes(searchTerm)
			);
		}

		return products;
	}

	async getProduct(id: string): Promise<Product | undefined> {
		return this.products.get(id);
	}

	async searchProducts(
		query: string,
		limit: number = 100
	): Promise<Product[]> {
		const searchTerm = query.toLowerCase();
		const matchingProducts = Array.from(this.products.values()).filter(
			(p) =>
				p.name.toLowerCase().includes(searchTerm) ||
				p.description.toLowerCase().includes(searchTerm) ||
				p.material.toLowerCase().includes(searchTerm)
		);
		return matchingProducts.slice(0, limit);
	}

	async createProduct(insertProduct: InsertProduct): Promise<Product> {
		const id = randomUUID();
		const product: Product = {
			...insertProduct,
			id,
			discountedPrice: insertProduct.discountedPrice || null,
			dimensions: insertProduct.dimensions || null,
			weight: insertProduct.weight || null,
			inStock: insertProduct.inStock ?? true,
			createdAt: new Date(),
		};
		this.products.set(id, product);
		return product;
	}

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
			status: insertMessage.status || "open",
			phone: insertMessage.phone || null,
			createdAt: new Date(),
		};
		this.supportMessages.set(id, message);
		return message;
	}
}

export const storage = new MemStorage();
