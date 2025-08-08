import { useQuery } from "@tanstack/react-query";

// Updated User type to include isAdmin
interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	isAdmin?: boolean;
}

export function useAuth() {
	const sessionId = localStorage.getItem("sessionId");

	const {
		data: user,
		isLoading,
		error,
	} = useQuery<User | null>({
		queryKey: ["/api/auth/me"],
		enabled: !!sessionId,
		retry: false,
		queryFn: async () => {
			if (!sessionId) return null;

			const response = await fetch("/api/auth/me", {
				headers: {
					Authorization: `Bearer ${sessionId}`,
				},
			});

			if (!response.ok) {
				if (response.status === 401) {
					localStorage.removeItem("sessionId");
					return null;
				}
				throw new Error("Failed to fetch user");
			}

			return response.json();
		},
	});

	return {
		user,
		isLoading,
		isAuthenticated: !!user && !!sessionId,
		error,
	};
}
