import {
	users,
	products,
	reviews,
	orders,
	cartItems,
	supportMessages,
	addresses,
	artisans,
	type User,
	type Product,
	type Review,
	type Order,
	type CartItem,
	type SupportMessage,
	type Address,
	type Artisan,
	type InsertUser,
	type InsertProduct,
	type InsertReview,
	type InsertOrder,
	type InsertCartItem,
	type InsertSupportMessage,
	type InsertAddress,
	type InsertArtisan,
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
		category?: string;
		search?: string;
	}): Promise<Product[]>;
	getFeaturedProducts(): Promise<Product[]>; // Added for featured products
	getProduct(id: string): Promise<Product | undefined>;
	createProduct(product: InsertProduct): Promise<Product>;
	updateProduct(
		id: string,
		productData: InsertProduct
	): Promise<Product | null>;
	deleteProduct(id: string): Promise<boolean>;
	toggleProductFeatured(
		id: string,
		featured: boolean
	): Promise<Product | null>; // Added for admin control

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
	updateAddress(
		id: string,
		addressData: InsertAddress
	): Promise<Address | undefined>;
	deleteAddress(id: string): Promise<boolean>;

	// Artisan operations
	getArtisans(): Promise<Artisan[]>;
	getArtisanById(artisanId: string): Promise<Artisan | null>;
	createArtisan(artisanData: InsertArtisan): Promise<Artisan>;
	updateArtisan(
		artisanId: string,
		artisanData: InsertArtisan
	): Promise<Artisan>;
	deleteArtisan(artisanId: string): Promise<void>;
	getProductsByArtisanId(artisanId: string): Promise<Product[]>;
}

export class MemStorage implements IStorage {
	// Mocking the database with in-memory maps for demonstration purposes.
	// In a real application, you would interact with a database like PostgreSQL using Drizzle ORM.
	private users: Map<string, User> = new Map();
	private products: Map<string, Product> = new Map();
	private reviews: Map<string, Review> = new Map();
	private orders: Map<string, Order> = new Map();
	private cartItems: Map<string, CartItem> = new Map();
	private supportMessages: Map<string, SupportMessage> = new Map();
	private addresses: Map<string, Address> = new Map();
	private artisans = new Map<string, Artisan>();

	constructor() {
		// Initialize with sample data
		this.initializeSampleData();
		this.initializeSampleArtisans();
	}

	private initializeSampleData() {
		// Sample products with featured status
		const sampleProducts: Product[] = [
			{
				id: "sample-1",
				name: "Handwoven Scarf",
				description:
					"Beautiful handwoven scarf made from organic cotton",
				originalPrice: "2500",
				discountedPrice: "2000",
				images: [
					"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgU82ITH6pk1Sogoc8jiU7kgYkKc1v_3wKhg&s",
				],
				category: "Textiles",
				material: "Cotton",
				countryOfOrigin: "India", // Corrected from 'country' to 'countryOfOrigin'
				dimensions: { length: 180, width: 30, height: 0.5, unit: "cm" },
				weight: { value: 150, unit: "g" },
				inStock: true, // Corrected from 'stock' to 'inStock'
				featured: true,
				asin: "HSC001",
				artisanId: "artisan-1",
			},
			{
				id: "sample-2",
				name: "Ceramic Bowl",
				description: "Hand-thrown ceramic bowl with traditional glaze",
				originalPrice: "1800",
				discountedPrice: "1500",
				images: [
					"https://market99.com/cdn/shop/files/bowls-glossy-finish-royal-blue-ceramic-set-of-2-300-ml-bowls-1-29021507485866.jpg?v=1737462148",
				],
				category: "Home & Kitchen",
				material: "Ceramic",
				countryOfOrigin: "Peru", // Corrected from 'country' to 'countryOfOrigin'
				dimensions: { length: 15, width: 15, height: 8, unit: "cm" },
				weight: { value: 300, unit: "g" },
				inStock: true, // Corrected from 'stock' to 'inStock'
				featured: true,
				asin: "CBS002",
				artisanId: "artisan-2",
			},
			{
				id: "sample-3",
				name: "Wooden Jewelry Box",
				description:
					"Intricately carved wooden jewelry box with multiple compartments",
				originalPrice: "3200",
				discountedPrice: "2800",
				images: [
					"https://www.woodsala.com/cdn/shop/files/MG_9060.jpg?v=1696077823&width=4000",
				],
				category: "Accessories",
				material: "Wood",
				countryOfOrigin: "Morocco", // Corrected from 'country' to 'countryOfOrigin'
				dimensions: { length: 20, width: 15, height: 10, unit: "cm" },
				weight: { value: 500, unit: "g" },
				inStock: true, // Corrected from 'stock' to 'inStock'
				featured: false,
				asin: "WJB003",
				artisanId: "artisan-1",
			},
			{
				id: "sample-4",
				name: "Leather Handbag",
				description:
					"Handcrafted leather handbag with traditional embossing",
				originalPrice: "4500",
				discountedPrice: "4000",
				images: [
					"https://craftandglory.in/cdn/shop/files/SON000021.jpg?v=1711024390&width=1946",
				],
				category: "Accessories",
				material: "Leather",
				countryOfOrigin: "Guatemala", // Corrected from 'country' to 'countryOfOrigin'
				dimensions: { length: 35, width: 12, height: 25, unit: "cm" },
				weight: { value: 800, unit: "g" },
				inStock: true, // Corrected from 'stock' to 'inStock'
				featured: false,
				asin: "LHB004",
				artisanId: "artisan-2",
			},
			{
				id: "sample-5",
				name: "Bamboo Cutting Board",
				description:
					"Eco-friendly bamboo cutting board with natural finish",
				originalPrice: "1200",
				discountedPrice: "1000",
				images: [
					"https://www.freshware.com/cdn/shop/products/30a751a22a6a4bf67004452ae0209178d46bd5e2f4c80978ac2536d10d55b594.jpg?v=1594437463",
				],
				category: "Home & Kitchen",
				material: "Bamboo",
				countryOfOrigin: "Thailand", // Corrected from 'country' to 'countryOfOrigin'
				dimensions: { length: 30, width: 20, height: 2, unit: "cm" },
				weight: { value: 400, unit: "g" },
				inStock: true, // Corrected from 'stock' to 'inStock'
				featured: false,
				asin: "BCB005",
				artisanId: "artisan-1",
			},
			{
				id: "sample-6",
				name: "Textile Wall Hanging",
				description:
					"Colorful handwoven textile wall hanging with geometric patterns",
				originalPrice: "3500",
				discountedPrice: "3000",
				images: [
					"https://u-mercari-images.mercdn.net/photos/m70162559898_2.jpg",
				],
				category: "Textiles",
				material: "Fabric",
				countryOfOrigin: "India", // Corrected from 'country' to 'countryOfOrigin'
				dimensions: { length: 60, width: 40, height: 1, unit: "cm" },
				weight: { value: 200, unit: "g" },
				inStock: true, // Corrected from 'stock' to 'inStock'
				featured: true,
				asin: "TWH006",
				artisanId: "artisan-2",
			},
		];

		sampleProducts.forEach((p) => this.products.set(p.id, p));
	}

	private initializeSampleArtisans(): void {
		const sampleArtisans: Artisan[] = [
			{
				id: "artisan-1",
				name: "Ravi Kumar",
				bio: "A master weaver from Rajasthan, India, known for his intricate textile designs.",
				website: "https://example.com/ravikumar",
				countryOfOrigin: "India",
				createdAt: new Date(),
			},
			{
				id: "artisan-2",
				name: "Sofia Alvarez",
				bio: "A ceramic artist from Cusco, Peru, blending traditional techniques with modern aesthetics.",
				website: "https://example.com/sofiaalvarez",
				countryOfOrigin: "Peru",
				createdAt: new Date(),
			},
		];
		sampleArtisans.forEach((a) => this.artisans.set(a.id, a));
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
	async getProducts(
		filters: {
			country?: string;
			material?: string;
			category?: string;
			search?: string;
		} = {}
	): Promise<Product[]> {
		let products = Array.from(this.products.values());

		// Search functionality - search in name, description, category, and material
		if (filters?.search) {
			const searchTerm = filters.search.toLowerCase().trim();
			products = products.filter(
				(p) =>
					p.name.toLowerCase().includes(searchTerm) ||
					p.description.toLowerCase().includes(searchTerm) ||
					p.category.toLowerCase().includes(searchTerm) ||
					p.material.toLowerCase().includes(searchTerm) ||
					p.countryOfOrigin.toLowerCase().includes(searchTerm)
			);
		}

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

		if (filters?.category) {
			products = products.filter(
				(p) =>
					p.category.toLowerCase() === filters.category!.toLowerCase()
			);
		}

		return products;
	}

	async getFeaturedProducts(): Promise<Product[]> {
		const products = await this.getProducts({});
		let featured = products.filter((p) => p.featured);

		// If no featured products, add some sample data
		if (featured.length === 0) {
			const sampleProducts = [
				{
					id: "sample-1",
					name: "Handwoven Scarf",
					description:
						"Beautiful handwoven scarf made from organic cotton",
					originalPrice: "2500",
					discountedPrice: "2000",
					images: [
						"https://images.unsplash.com/photo-1544441893-675973e31985?w=400",
					],
					countryOfOrigin: "India",
					material: "Cotton",
					category: "Textile",
					featured: true,
					inStock: true,
					asin: "HSC001",
					artisanId: "artisan-1",
				},
				{
					id: "sample-2",
					name: "Ceramic Bowl Set",
					description:
						"Handcrafted ceramic bowls perfect for serving",
					originalPrice: "3500",
					images: [
						"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
					],
					countryOfOrigin: "Peru",
					material: "Ceramic",
					category: "Home Decor",
					featured: true,
					inStock: true,
					asin: "CBS002",
					artisanId: "artisan-2",
				},
			];
			return sampleProducts as Product[];
		}

		return featured;
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

	async toggleProductFeatured(
		id: string,
		featured: boolean
	): Promise<Product | null> {
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
			trackingNumber: undefined,
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
		return Array.from(this.addresses.values()).filter(
			(address) => address.userId === userId
		);
	}

	async createAddress(insertAddress: InsertAddress): Promise<Address> {
		const id = randomUUID();
		const address: Address = {
			...insertAddress,
			id,
			isDefault: insertAddress.isDefault || false,
			createdAt: new Date(),
		};

		// If this address is set as default, unset all other default addresses for this user
		if (address.isDefault) {
			const userAddresses = Array.from(this.addresses.values()).filter(
				(addr) => addr.userId === address.userId
			);
			userAddresses.forEach((addr) => {
				if (addr.isDefault) {
					const updatedAddr = { ...addr, isDefault: false };
					this.addresses.set(addr.id, updatedAddr);
				}
			});
		}

		this.addresses.set(id, address);
		return address;
	}

	async updateAddress(
		id: string,
		insertAddress: InsertAddress
	): Promise<Address | undefined> {
		const existingAddress = this.addresses.get(id);
		if (!existingAddress) {
			return undefined;
		}

		// If this address is being set as default, unset all other default addresses for this user
		if (insertAddress.isDefault && !existingAddress.isDefault) {
			const userAddresses = Array.from(this.addresses.values()).filter(
				(addr) => addr.userId === existingAddress.userId
			);
			userAddresses.forEach((addr) => {
				if (addr.isDefault) {
					const updatedAddr = { ...addr, isDefault: false };
					this.addresses.set(addr.id, updatedAddr);
				}
			});
		}

		const updatedAddress: Address = {
			...existingAddress,
			...insertAddress,
			id,
		};
		this.addresses.set(id, updatedAddress);
		return updatedAddress;
	}

	async deleteAddress(id: string): Promise<boolean> {
		return this.addresses.delete(id);
	}

	// Artisan methods
	async getArtisans(): Promise<Artisan[]> {
		return Array.from(this.artisans.values());
	}

	async getArtisanById(artisanId: string): Promise<Artisan | null> {
		return this.artisans.get(artisanId) || null;
	}

	async createArtisan(artisanData: InsertArtisan): Promise<Artisan> {
		const id = randomUUID();
		const artisan: Artisan = {
			...artisanData,
			id,
			createdAt: new Date(),
		};
		this.artisans.set(id, artisan);
		console.log("Created artisan:", artisan);
		return artisan;
	}

	async updateArtisan(
		artisanId: string,
		artisanData: InsertArtisan
	): Promise<Artisan | null> {
		const existingArtisan = this.artisans.get(artisanId);
		if (!existingArtisan) {
			return null;
		}
		const updatedArtisan: Artisan = {
			...existingArtisan,
			...artisanData,
		};
		this.artisans.set(artisanId, updatedArtisan);
		console.log("Updated artisan:", updatedArtisan);
		return updatedArtisan;
	}

	async deleteArtisan(artisanId: string): Promise<boolean> {
		return this.artisans.delete(artisanId);
	}

	async getProductsByArtisanId(artisanId: string): Promise<Product[]> {
		return Array.from(this.products.values()).filter(
			(product) => product.artisanId === artisanId
		);
	}
}

// Exporting the storage instance
export const storage = new MemStorage();
