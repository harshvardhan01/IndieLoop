
import type { Request, Response } from "express";
import { z } from "zod";
import { insertProductSchema } from "@shared/schema";
import { productService } from "../services/productService";
import { artisanService } from "../services/artisanService";

export class ProductController {
	static async getProducts(req: Request, res: Response) {
		try {
			const { country, material, category, search } = req.query;
			const products = await productService.getProducts({
				country: country as string,
				material: material as string,
				category: category as string,
				search: search as string,
			});
			res.json(products);
		} catch (error) {
			res.status(500).json({ message: "Failed to fetch products" });
		}
	}

	static async getFeaturedProducts(req: Request, res: Response) {
		try {
			const featuredProducts = await productService.getFeaturedProducts();
			res.json(featuredProducts);
		} catch (error) {
			res.status(500).json({ message: "Failed to fetch featured products" });
		}
	}

	static async getProduct(req: Request, res: Response) {
		try {
			console.log("Fetching product with ID:", req.params.id);
			const product = await productService.getProduct(req.params.id);
			console.log("Found product:", product);
			if (!product) {
				return res.status(404).json({ message: "Product not found" });
			}
			// Fetch artisan details for the product
			if (product.artisanId) {
				const artisan = await artisanService.getArtisanById(product.artisanId);
				product.artisan = artisan;
			}
			res.json(product);
		} catch (error) {
			console.error("Error fetching product:", error);
			res.status(500).json({ message: "Failed to fetch product" });
		}
	}

	static async createProduct(req: any, res: Response) {
		try {
			const productData = insertProductSchema.parse(req.body);
			const product = await productService.createProduct(productData);
			res.json(product);
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({ message: error.errors[0].message });
			}
			res.status(500).json({ message: "Failed to create product" });
		}
	}

	static async updateProduct(req: any, res: Response) {
		try {
			const productData = insertProductSchema.parse(req.body);
			const product = await productService.updateProduct(req.params.id, productData);
			if (!product) {
				return res.status(404).json({ message: "Product not found" });
			}
			res.json(product);
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({ message: error.errors[0].message });
			}
			res.status(500).json({ message: "Failed to update product" });
		}
	}

	static async deleteProduct(req: any, res: Response) {
		try {
			const success = await productService.deleteProduct(req.params.id);
			if (!success) {
				return res.status(404).json({ message: "Product not found" });
			}
			res.json({ message: "Product deleted successfully" });
		} catch (error) {
			res.status(500).json({ message: "Failed to delete product" });
		}
	}

	static async toggleFeatured(req: any, res: Response) {
		try {
			const { featured } = req.body;
			const product = await productService.toggleProductFeatured(req.params.id, featured);
			if (!product) {
				return res.status(404).json({ message: "Product not found" });
			}
			res.json(product);
		} catch (error) {
			res.status(500).json({ message: "Failed to update featured status" });
		}
	}
}
