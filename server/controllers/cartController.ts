
import type { Request, Response } from "express";
import { z } from "zod";
import { insertCartItemSchema } from "@shared/schema";
import { cartService } from "../services/cartService";
import { productService } from "../services/productService";
import { artisanService } from "../services/artisanService";

export class CartController {
	static async getCart(req: any, res: Response) {
		try {
			const cartItems = await cartService.getUserCart(req.user.userId);
			const cartWithProducts = await Promise.all(
				cartItems.map(async (item) => {
					const product = await productService.getProduct(item.productId);
					if (product && product.artisanId) {
						const artisan = await artisanService.getArtisanById(product.artisanId);
						product.artisan = artisan;
					}
					return { ...item, product };
				})
			);
			res.json(cartWithProducts);
		} catch (error) {
			res.status(500).json({ message: "Failed to fetch cart" });
		}
	}

	static async addToCart(req: any, res: Response) {
		try {
			const cartItemData = insertCartItemSchema.parse({
				...req.body,
				userId: req.user.userId,
			});
			const cartItem = await cartService.addToCart(cartItemData);
			res.json(cartItem);
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({ message: error.errors[0].message });
			}
			res.status(500).json({ message: "Failed to add to cart" });
		}
	}

	static async updateCartItem(req: any, res: Response) {
		try {
			const { quantity } = req.body;
			const cartItem = await cartService.updateCartItem(req.params.id, quantity);
			if (!cartItem) {
				return res.status(404).json({ message: "Cart item not found" });
			}
			res.json(cartItem);
		} catch (error) {
			res.status(500).json({ message: "Failed to update cart item" });
		}
	}

	static async removeFromCart(req: any, res: Response) {
		try {
			const success = await cartService.removeFromCart(req.params.id);
			if (!success) {
				return res.status(404).json({ message: "Cart item not found" });
			}
			res.json({ message: "Item removed from cart" });
		} catch (error) {
			res.status(500).json({ message: "Failed to remove cart item" });
		}
	}

	static async clearCart(req: any, res: Response) {
		try {
			await cartService.clearCart(req.user.userId);
			res.json({ message: "Cart cleared" });
		} catch (error) {
			res.status(500).json({ message: "Failed to clear cart" });
		}
	}
}
