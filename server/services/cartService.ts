
import {
	type CartItem,
	type InsertCartItem,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface ICartStorage {
	getUserCart(userId: string): Promise<CartItem[]>;
	addToCart(cartItem: InsertCartItem): Promise<CartItem>;
	updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
	removeFromCart(id: string): Promise<boolean>;
	clearCart(userId: string): Promise<boolean>;
}

export class CartStorage implements ICartStorage {
	private cartItems: Map<string, CartItem> = new Map();

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
				quantity: existingItem.quantity + (insertCartItem.quantity || 1),
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

	async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
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
}

export const cartService = new CartStorage();
