
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Admin() {
	const { user } = useAuth();
	const [, setLocation] = useLocation();

	// Only render admin content if user is an admin
	if (!user || !user.isAdmin) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				You do not have permission to view this page.
			</div>
		);
	}

	// Redirect to products page
	useEffect(() => {
		setLocation("/admin/products");
	}, [setLocation]);

	return null;
}
