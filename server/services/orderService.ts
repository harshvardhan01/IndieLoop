import {
	type Order,
	type InsertOrder,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IOrderStorage {
	getUserOrders(userId: string): Promise<Order[]>;
	createOrder(order: InsertOrder): Promise<Order>;
	updateOrderStatus(orderId: string, status: string, trackingNumber?: string): Promise<Order | null>;
	getAllOrders(): Promise<Order[]>;
	getOrderById(orderId: string): Promise<Order | null>;
}

export class OrderStorage implements IOrderStorage {
	private orders: Map<string, Order> = new Map();

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
			trackingNumber: undefined,
			createdAt: new Date(),
		};
		this.orders.set(id, order);
		return order;
	}

	async updateOrderStatus(id: string, status: string, trackingNumber?: string): Promise<Order | null> {
		const existingOrder = this.orders.get(id);
		if (!existingOrder) {
			return null;
		}

		const updatedOrder = {
			...existingOrder,
			status,
			...(trackingNumber && { trackingNumber }),
		};
		this.orders.set(id, updatedOrder);
		return updatedOrder;
	}

	async getAllOrders(): Promise<Order[]> {
		return Array.from(this.orders.values()).sort((a, b) => 
			new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
		);
	}

	async getOrderById(id: string): Promise<Order | null> {
		return this.orders.get(id) || null;
	}
}

export const orderService = new OrderStorage();