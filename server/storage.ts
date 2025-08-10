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
	type Address, // Added for address type
	type InsertAddress, // Added for insert address type
} from "@shared/schema";
import { randomUUID } from "crypto";
import { eq, desc } from "drizzle-orm"; // Added for drizzle functions
import { db } from "./db"; // Assuming db is exported from './db'

export interface IStorage {
	// User operations
	getUser(id: string): Promise<User | undefined>;
	getUserByEmail(email: string): Promise<User | undefined>;
	createUser(user: InsertUser): Promise<User>;

	// Product operations
	getProducts(filters?: {
		country?: string;
		material?: string;
	}): Promise<Product[]>;
	getFeaturedProducts(): Promise<Product[]>; // Added for featured products
	getProduct(id: string): Promise<Product | undefined>;
	createProduct(product: InsertProduct): Promise<Product>;
	updateProduct(
		id: string,
		productData: InsertProduct
	): Promise<Product | null>;
	deleteProduct(id: string): Promise<boolean>;
	toggleProductFeatured(id: string, featured: boolean): Promise<Product | null>; // Added for admin control

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

	// Address operations
	getUserAddresses(userId: string): Promise<Address[]>;
	createAddress(addressData: InsertAddress): Promise<Address>;
	updateAddress(id: string, addressData: InsertAddress): Promise<Address | undefined>;
	deleteAddress(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
	private users: Map<string, User> = new Map();
	private products: Map<string, Product> = new Map();
	private reviews: Map<string, Review> = new Map();
	private orders: Map<string, Order> = new Map();
	private cartItems: Map<string, CartItem> = new Map();
	private supportMessages: Map<string, SupportMessage> = new Map();
	// No need for addresses map as we are using drizzle-orm for storage

	constructor() {
		this.seedData(); // Initialize with sample data
	}

	private seedData() {
		// Add sample products
		const sampleProducts = [
			{
				name: "Handwoven Silk Scarf",
				description: "Beautiful handwoven silk scarf with traditional patterns",
				originalPrice: "2500",
				discountedPrice: "2000",
				material: "Textile",
				countryOfOrigin: "India",
				images: ["https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400"],
				dimensions: "180cm x 70cm",
				weight: "150g",
				inStock: true,
				featured: true,
			},
			{
				name: "Wooden Hand Carved Bowl",
				description: "Artisan crafted wooden bowl perfect for serving",
				originalPrice: "1500",
				discountedPrice: "1200",
				material: "Wood",
				countryOfOrigin: "India",
				images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"],
				dimensions: "25cm diameter",
				weight: "400g",
				inStock: true,
				featured: false,
			},
			{
				name: "Ceramic Dinner Plate Set",
				description: "Hand-painted ceramic plates with floral motifs",
				originalPrice: "3000",
				discountedPrice: "2400",
				material: "Ceramic",
				countryOfOrigin: "India",
				images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"],
				dimensions: "26cm diameter",
				weight: "800g",
				inStock: true,
				featured: true,
			},
			{
				name: "Leather Handmade Wallet",
				description: "Premium leather wallet with hand-stitched details",
				originalPrice: "1800",
				discountedPrice: "1440",
				material: "Leather",
				countryOfOrigin: "India",
				images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?w=400"],
				inStock: true,
				featured: false,
			},
			{
				name: "Bamboo Storage Basket",
				description: "Eco-friendly bamboo basket for storage",
				originalPrice: "1200",
				material: "Bamboo",
				countryOfOrigin: "India",
				images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400"],
				dimensions: "30cm x 20cm",
				weight: "300g",
				inStock: true,
				featured: false,
			}
		];

		// Create products
		sampleProducts.forEach(async (productData) => {
			await this.createProduct(productData);
		});

		// Add a sample admin user
		this.createUser({
			email: "admin@indieloop.com",
			password: "admin123",
			firstName: "Admin",
			lastName: "User",
			isAdmin: true,
		});

		// Add a sample regular user
		this.createUser({
			email: "user@example.com",
			password: "user123",
			firstName: "John",
			lastName: "Doe",
			isAdmin: false,
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
		// Add addresses property for in-memory storage
		(user as any).addresses = [];
		this.users.set(id, user);
		return user;
	}

	// Product operations
	async getProducts(filters: {
		country?: string;
		material?: string;
	} = {}): Promise<Product[]> {
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

		return products;
	}

	async getFeaturedProducts(): Promise<Product[]> {
		return Array.from(this.products.values()).filter(
			(product) => product.featured
		);
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
			featured: insertProduct.featured ?? false, // Ensure featured is set
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
			featured: insertProduct.featured ?? existingProduct.featured, // Preserve featured status if not provided
		};
		this.products.set(id, updatedProduct);
		return updatedProduct;
	}

	async deleteProduct(id: string): Promise<boolean> {
		return this.products.delete(id);
	}

	async toggleProductFeatured(id: string, featured: boolean): Promise<Product | null> {
		const existingProduct = this.products.get(id);
		if (!existingProduct) {
			return null;
		}

		const updatedProduct = {
			...existingProduct,
			featured,
		};
		this.products.set(id, updatedProduct);
		return updatedProduct;
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
		// Assuming addresses are populated within the Order object or can be fetched separately
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

	// Address operations
	async getUserAddresses(userId: string): Promise<Address[]> {
		const user = this.users.get(userId);
		return (user as any)?.addresses || [];
	}

	async createAddress(insertAddress: InsertAddress): Promise<Address> {
		const id = randomUUID();
		const address: Address = {
			...insertAddress,
			id,
			isDefault: insertAddress.isDefault || false,
			createdAt: new Date(),
		};
		// In a real scenario, you'd interact with a database here.
		// For this mock implementation, we'll simulate adding to a user's addresses.
		const user = this.users.get(address.userId);
		if (user) {
			if (address.isDefault) {
				// Unset other default addresses if this one is set as default
				user.addresses = user.addresses.map(addr => ({ ...addr, isDefault: false }));
			}
			user.addresses.push(address);
		} else {
			// Create user if they don't exist (for seeding purposes if needed)
			const newUser: User = {
				id: address.userId,
				name: "Sample User",
				email: `${address.userId}@example.com`,
				createdAt: new Date(),
				addresses: [address]
			};
			this.users.set(newUser.id, newUser);
		}
		return address;
	}

	async updateAddress(id: string, insertAddress: InsertAddress): Promise<Address | undefined> {
		const userId = insertAddress.userId;
		const user = this.users.get(userId);

		if (user) {
			let addressToUpdate = user.addresses.find(addr => addr.id === id);
			if (!addressToUpdate) return undefined;

			// Handle default status update
			if (insertAddress.isDefault && !addressToUpdate.isDefault) {
				user.addresses = user.addresses.map(addr => ({ ...addr, isDefault: false }));
			}

			// Update the address
			const updatedAddress = { ...addressToUpdate, ...insertAddress };
			const index = user.addresses.indexOf(addressToUpdate);
			user.addresses[index] = updatedAddress;

			this.users.set(userId, user); // Update user in the map
			return updatedAddress;
		}
		return undefined;
	}

	async deleteAddress(id: string): Promise<boolean> {
		let deleted = false;
		for (const user of this.users.values()) {
			const initialLength = user.addresses.length;
			user.addresses = user.addresses.filter(addr => addr.id !== id);
			if (user.addresses.length < initialLength) {
				this.users.set(user.id, user); // Update user in the map
				deleted = true;
				break; // Assuming an address ID is unique across all users
			}
		}
		return deleted;
	}
}

// Exporting the storage instance
export const storage = new MemStorage();