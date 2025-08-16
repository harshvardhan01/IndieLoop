
import {
	type User,
	type InsertUser,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IUserStorage {
	getUser(id: string): Promise<User | undefined>;
	getUserByEmail(email: string): Promise<User | undefined>;
	createUser(user: InsertUser): Promise<User>;
}

export class UserStorage implements IUserStorage {
	private users: Map<string, User> = new Map();

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
}

export const storage = new UserStorage();
