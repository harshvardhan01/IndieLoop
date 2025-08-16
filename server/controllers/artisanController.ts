
import type { Request, Response } from "express";
import { z } from "zod";
import { insertArtisanSchema } from "@shared/schema";
import { artisanService } from "../services/artisanService";
import { productService } from "../services/productService";

export class ArtisanController {
	static async getArtisans(req: Request, res: Response) {
		try {
			const artisans = await artisanService.getArtisans();
			res.json(artisans);
		} catch (error) {
			console.error("Error fetching artisans:", error);
			res.status(500).json({ message: "Internal server error" });
		}
	}

	static async getArtisan(req: Request, res: Response) {
		try {
			const artisan = await artisanService.getArtisanById(req.params.id);
			if (!artisan) {
				return res.status(404).json({ message: "Artisan not found" });
			}
			res.json(artisan);
		} catch (error) {
			console.error("Error fetching artisan:", error);
			res.status(500).json({ message: "Internal server error" });
		}
	}

	static async getArtisanProducts(req: Request, res: Response) {
		try {
			const products = await productService.getProductsByArtisanId(req.params.id);
			// Enhance products with artisan details
			const enhancedProducts = await Promise.all(
				products.map(async (product) => {
					if (product.artisanId) {
						const artisan = await artisanService.getArtisanById(product.artisanId);
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
	}

	static async createArtisan(req: any, res: Response) {
		try {
			if (!req.user.isAdmin) {
				return res.status(403).json({ message: "Admin access required" });
			}

			const artisanData = insertArtisanSchema.parse(req.body);
			const artisan = await artisanService.createArtisan(artisanData);
			res.status(201).json(artisan);
		} catch (error) {
			console.error("Error creating artisan:", error);
			if (error instanceof z.ZodError) {
				return res.status(400).json({ message: error.errors[0].message });
			}
			res.status(500).json({ message: "Internal server error" });
		}
	}

	static async updateArtisan(req: any, res: Response) {
		try {
			if (!req.user.isAdmin) {
				return res.status(403).json({ message: "Admin access required" });
			}

			const artisanData = insertArtisanSchema.parse(req.body);
			const artisan = await artisanService.updateArtisan(req.params.id, artisanData);
			if (!artisan) {
				return res.status(404).json({ message: "Artisan not found" });
			}
			res.json(artisan);
		} catch (error) {
			console.error("Error updating artisan:", error);
			if (error instanceof z.ZodError) {
				return res.status(400).json({ message: error.errors[0].message });
			}
			res.status(500).json({ message: "Internal server error" });
		}
	}

	static async deleteArtisan(req: any, res: Response) {
		try {
			if (!req.user.isAdmin) {
				return res.status(403).json({ message: "Admin access required" });
			}

			const success = await artisanService.deleteArtisan(req.params.id);
			if (!success) {
				return res.status(404).json({ message: "Artisan not found" });
			}
			res.status(204).send();
		} catch (error) {
			console.error("Error deleting artisan:", error);
			res.status(500).json({ message: "Internal server error" });
		}
	}
}
