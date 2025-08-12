
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, ShoppingCart, MessageSquare, User } from "lucide-react";

export default function Admin() {
	const { user } = useAuth();
	const navigate = useNavigate();

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
		navigate("/admin/products");
	}, [navigate]);

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
			<Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/admin/products")}>
				<CardHeader>
					<CardTitle className="flex items-center">
						<Package className="mr-2" />
						Products
					</CardTitle>
					<CardDescription>Manage your products</CardDescription>
				</CardHeader>
			</Card>

			<Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/admin/orders")}>
				<CardHeader>
					<CardTitle className="flex items-center">
						<ShoppingCart className="mr-2" />
						Orders
					</CardTitle>
					<CardDescription>Manage customer orders</CardDescription>
				</CardHeader>
			</Card>

			<Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/admin/support")}>
				<CardHeader>
					<CardTitle className="flex items-center">
						<MessageSquare className="mr-2" />
						Support Messages
					</CardTitle>
					<CardDescription>Manage customer support inquiries</CardDescription>
				</CardHeader>
			</Card>
			<Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/admin/artisans")}>
				<CardHeader>
					<CardTitle className="flex items-center">
						<User className="mr-2" />
						Artisan Management
					</CardTitle>
					<CardDescription>Manage artisan profiles and information</CardDescription>
				</CardHeader>
			</Card>
		</div>
	);
}
