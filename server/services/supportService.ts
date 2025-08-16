import {
	type SupportMessage,
	type InsertSupportMessage,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface ISupportStorage {
	createSupportMessage(message: InsertSupportMessage): Promise<SupportMessage>;
	getAllSupportMessages(): Promise<SupportMessage[]>;
	updateSupportMessageStatus(id: string, status: string): Promise<SupportMessage | null>;
}

export class SupportStorage implements ISupportStorage {
	private supportMessages: Map<string, SupportMessage> = new Map();

	async createSupportMessage(insertMessage: InsertSupportMessage): Promise<SupportMessage> {
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

	async updateSupportMessageStatus(id: string, status: string): Promise<SupportMessage | null> {
		const existingMessage = this.supportMessages.get(id);
		if (!existingMessage) {
			return null;
		}

		const updatedMessage = {
			...existingMessage,
			status,
		};
		this.supportMessages.set(id, updatedMessage);
		return updatedMessage;
	}

	async getAllSupportMessages(): Promise<SupportMessage[]> {
		return Array.from(this.supportMessages.values()).sort((a, b) =>
			new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
		);
	}
}

export const supportService = new SupportStorage();