
import type { Request, Response, NextFunction } from "express";
import { SessionManager } from "../utils/sessionManager";

export function requireAuth(req: any, res: Response, next: NextFunction) {
	const sessionId = req.headers.authorization?.replace("Bearer ", "");
	const session = sessionId ? SessionManager.getSession(sessionId) : null;

	if (!session) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	req.user = session;
	next();
}

export function requireAdmin(req: any, res: Response, next: NextFunction) {
	const sessionId = req.headers.authorization?.replace("Bearer ", "");
	const session = sessionId ? SessionManager.getSession(sessionId) : null;

	if (!session) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	if (!session.isAdmin) {
		return res.status(403).json({ message: "Admin access required" });
	}

	req.user = session;
	next();
}
