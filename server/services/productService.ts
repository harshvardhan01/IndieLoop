
import {
	type Product,
	type InsertProduct,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IProductStorage {
	getProducts(filters?: {
		country?: string;
		material?: string;
		category?: string;
		search?: string;
	}): Promise<Product[]>;
	getFeaturedProducts(): Promise<Product[]>;
	getProduct(id: string): Promise<Product | undefined>;
	createProduct(product: InsertProduct): Promise<Product>;
	updateProduct(id: string, productData: InsertProduct): Promise<Product | null>;
	deleteProduct(id: string): Promise<boolean>;
	toggleProductFeatured(id: string, featured: boolean): Promise<Product | null>;
	getProductsByArtisanId(artisanId: string): Promise<Product[]>;
}

export class ProductStorage implements IProductStorage {
	private products: Map<string, Product> = new Map();

	constructor() {
		this.initializeSampleData();
	}

	private initializeSampleData() {
		const sampleProducts: Product[] = [
			{
				id: "sample-1",
				name: "Handwoven Scarf",
				description: "Beautiful handwoven scarf made from organic cotton",
				originalPrice: "2500",
				discountedPrice: "2000",
				images: [
					"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgU82ITH6pk1Sogoc8jiU7kgYkKc1v_3wKhg&s",
				],
				category: "Textiles",
				material: "Cotton",
				countryOfOrigin: "India",
				dimensions: { length: 180, width: 30, height: 0.5, unit: "cm" },
				weight: { value: 150, unit: "g" },
				inStock: true,
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
				countryOfOrigin: "Peru",
				dimensions: { length: 15, width: 15, height: 8, unit: "cm" },
				weight: { value: 300, unit: "g" },
				inStock: true,
				featured: true,
				asin: "CBS002",
				artisanId: "artisan-2",
			},
			{
				id: "sample-3",
				name: "Wooden Jewelry Box",
				description: "Intricately carved wooden jewelry box with multiple compartments",
				originalPrice: "3200",
				discountedPrice: "2800",
				images: [
					"https://www.woodsala.com/cdn/shop/files/MG_9060.jpg?v=1696077823&width=4000",
				],
				category: "Accessories",
				material: "Wood",
				countryOfOrigin: "Morocco",
				dimensions: { length: 20, width: 15, height: 10, unit: "cm" },
				weight: { value: 500, unit: "g" },
				inStock: true,
				featured: false,
				asin: "WJB003",
				artisanId: "artisan-1",
			},
			{
				id: "sample-4",
				name: "Leather Handbag",
				description: "Handcrafted leather handbag with traditional embossing",
				originalPrice: "4500",
				discountedPrice: "4000",
				images: [
					"https://craftandglory.in/cdn/shop/files/SON000021.jpg?v=1711024390&width=1946",
				],
				category: "Accessories",
				material: "Leather",
				countryOfOrigin: "Guatemala",
				dimensions: { length: 35, width: 12, height: 25, unit: "cm" },
				weight: { value: 800, unit: "g" },
				inStock: true,
				featured: false,
				asin: "LHB004",
				artisanId: "artisan-2",
			},
			{
				id: "sample-5",
				name: "Bamboo Cutting Board",
				description: "Eco-friendly bamboo cutting board with natural finish",
				originalPrice: "1200",
				discountedPrice: "1000",
				images: [
					"https://www.freshware.com/cdn/shop/products/30a751a22a6a4bf67004452ae0209178d46bd5e2f4c80978ac2536d10d55b594.jpg?v=1594437463",
				],
				category: "Home & Kitchen",
				material: "Bamboo",
				countryOfOrigin: "Thailand",
				dimensions: { length: 30, width: 20, height: 2, unit: "cm" },
				weight: { value: 400, unit: "g" },
				inStock: true,
				featured: false,
				asin: "BCB005",
				artisanId: "artisan-1",
			},
			{
				id: "sample-6",
				name: "Textile Wall Hanging",
				description: "Colorful handwoven textile wall hanging with geometric patterns",
				originalPrice: "3500",
				discountedPrice: "3000",
				images: [
					"https://u-mercari-images.mercdn.net/photos/m70162559898_2.jpg",
				],
				category: "Textiles",
				material: "Fabric",
				countryOfOrigin: "India",
				dimensions: { length: 60, width: 40, height: 1, unit: "cm" },
				weight: { value: 200, unit: "g" },
				inStock: true,
				featured: true,
				asin: "TWH006",
				artisanId: "artisan-2",
			},
		];

		sampleProducts.forEach((p) => this.products.set(p.id, p));
	}

	private generateASIN(): string {
		return `ASIN${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
	}

	async getProducts(filters: {
		country?: string;
		material?: string;
		category?: string;
		search?: string;
	} = {}): Promise<Product[]> {
		let products = Array.from(this.products.values());

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
				(p) => p.countryOfOrigin.toLowerCase() === filters.country!.toLowerCase()
			);
		}

		if (filters?.material) {
			products = products.filter(
				(p) => p.material.toLowerCase() === filters.material!.toLowerCase()
			);
		}

		if (filters?.category) {
			products = products.filter(
				(p) => p.category.toLowerCase() === filters.category!.toLowerCase()
			);
		}

		return products;
	}

	async getFeaturedProducts(): Promise<Product[]> {
		const products = await this.getProducts({});
		return products.filter((p) => p.featured);
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
			featured: insertProduct.featured ?? false,
			createdAt: new Date(),
		};
		this.products.set(id, product);
		return product;
	}

	async updateProduct(id: string, insertProduct: InsertProduct): Promise<Product | undefined> {
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
			featured: insertProduct.featured ?? existingProduct.featured,
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

	async getProductsByArtisanId(artisanId: string): Promise<Product[]> {
		return Array.from(this.products.values()).filter(
			(product) => product.artisanId === artisanId
		);
	}
}

export const productService = new ProductStorage();
