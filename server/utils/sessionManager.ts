
export interface SessionData {
	userId: string;
	email: string;
	firstName: string;
	lastName: string;
	isAdmin: boolean;
}

export class SessionManager {
	private static sessions = new Map<string, SessionData>();

	static generateSessionId(): string {
		return Math.random().toString(36).substring(7) + Date.now().toString(36);
	}

	static createSession(sessionId: string, sessionData: SessionData): void {
		this.sessions.set(sessionId, sessionData);
	}

	static getSession(sessionId: string): SessionData | undefined {
		return this.sessions.get(sessionId);
	}

	static deleteSession(sessionId: string): boolean {
		return this.sessions.delete(sessionId);
	}
}
