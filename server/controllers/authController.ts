
import type { Request, Response } from "express";
import { z } from "zod";
import { loginSchema, registerSchema } from "@shared/schema";
import { storage } from "../services/userService";
import { SessionManager } from "../utils/sessionManager";

export class AuthController {
	static async register(req: Request, res: Response) {
		try {
			const userData = registerSchema.parse(req.body);

			// Check if user already exists
			const existingEmail = await storage.getUserByEmail(userData.email);
			if (existingEmail) {
				return res.status(400).json({ message: "Email already exists" });
			}

			const user = await storage.createUser(userData);
			const sessionId = SessionManager.generateSessionId();
			SessionManager.createSession(sessionId, {
				userId: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				isAdmin: user.isAdmin || false,
			});

			res.json({
				user: {
					id: user.id,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					isAdmin: user.isAdmin || false,
				},
				sessionId,
			});
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({ message: error.errors[0].message });
			}
			res.status(500).json({ message: "Registration failed" });
		}
	}

	static async login(req: Request, res: Response) {
		try {
			const { email, password } = loginSchema.parse(req.body);

			const user = await storage.getUserByEmail(email);
			if (!user || user.password !== password) {
				return res.status(400).json({ message: "Invalid credentials" });
			}

			const sessionId = SessionManager.generateSessionId();
			SessionManager.createSession(sessionId, {
				userId: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				isAdmin: user.isAdmin || false,
			});

			res.json({
				user: {
					id: user.id,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					isAdmin: user.isAdmin || false,
				},
				sessionId,
			});
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({ message: error.errors[0].message });
			}
			res.status(500).json({ message: "Login failed" });
		}
	}

	static async logout(req: any, res: Response) {
		const sessionId = req.headers.authorization?.replace("Bearer ", "");
		if (sessionId) {
			SessionManager.deleteSession(sessionId);
		}
		res.json({ message: "Logged out successfully" });
	}

	static async me(req: any, res: Response) {
		try {
			const user = await storage.getUser(req.user.userId);
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}
			res.json({
				id: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				isAdmin: user.isAdmin || false,
			});
		} catch (error) {
			res.status(500).json({ message: "Failed to get user info" });
		}
	}
}
