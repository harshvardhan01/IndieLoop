import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Order } from "@shared/schema";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";

export default function AdminOrders() {
	const { user } = useAuth();
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [trackingNumbers, setTrackingNumbers] = useState<
		Record<string, string>
	>({});

	// Fetch orders
	const { data: orders = [] } = useQuery<Order[]>({
		queryKey: ["admin", "orders"],
		queryFn: async () => {
			const response = await fetch("/api/admin/orders", {
				headers: {
					Authorization: `Bearer ${localStorage.getItem(
						"sessionId"
					)}`,
				},
			});
			if (!response.ok) throw new Error("Failed to fetch orders");
			return response.json();
		},
	});

	// Update order status mutation
	const updateOrderStatusMutation = useMutation({
		mutationFn: async ({
			id,
			status,
			trackingNumber,
		}: {
			id: string;
			status: string;
			trackingNumber?: string;
		}) => {
			const response = await fetch(`/api/admin/orders/${id}/status`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem(
						"sessionId"
					)}`,
				},
				body: JSON.stringify({ status, trackingNumber }),
			});
			if (!response.ok) throw new Error("Failed to update order status");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
			toast({
				title: "Success",
				description: "Order status updated successfully",
			});
		},
		onError: () => {
			toast({
				title: "Error",
				description: "Failed to update order status",
				variant: "destructive",
			});
		},
	});

	const handleStatusUpdate = (orderId: string, status: string) => {
		const trackingNumber = trackingNumbers[orderId] || undefined;
		updateOrderStatusMutation.mutate({
			id: orderId,
			status,
			trackingNumber,
		});
	};

	const handleTrackingNumberChange = (
		orderId: string,
		trackingNumber: string
	) => {
		setTrackingNumbers((prev) => ({
			...prev,
			[orderId]: trackingNumber,
		}));
	};

	// Only render admin content if user is an admin
	if (!user || !user.isAdmin) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				You do not have permission to view this page.
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6">
			<div className="flex items-center gap-2 mb-8">
				<ShoppingCart className="h-6 w-6" />
				<h1 className="text-3xl font-bold">Orders Management</h1>
			</div>

			<div className="grid gap-6">
				{orders.length === 0 ? (
					<Card>
						<CardContent className="p-6">
							<p className="text-center text-gray-500">
								No orders found
							</p>
						</CardContent>
					</Card>
				) : (
					orders.map((order) => (
						<Card key={order.id}>
							<CardHeader>
								<div className="flex justify-between items-start">
									<div>
										<CardTitle>
											Order #{order.id.substring(0, 8)}
										</CardTitle>
										<CardDescription>
											{new Date(
												order.createdAt
											).toLocaleDateString()}
										</CardDescription>
									</div>
									<div className="text-right">
										<p className="text-lg font-semibold">
											₹{order.total}
										</p>
										<p
											className={`text-sm px-2 py-1 rounded ${
												order.status === "delivered"
													? "bg-green-100 text-green-800"
													: order.status === "shipped"
													? "bg-blue-100 text-blue-800"
													: order.status ===
													  "processing"
													? "bg-yellow-100 text-yellow-800"
													: "bg-gray-100 text-gray-800"
											}`}>
											{order.status.toUpperCase()}
										</p>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
									<div>
										<h4 className="font-semibold mb-2">
											Customer Details
										</h4>
										<p className="text-sm">
											{order.shippingAddress.firstName}{" "}
											{order.shippingAddress.lastName}
										</p>
										<p className="text-sm text-gray-600">
											{
												order.shippingAddress
													.streetAddress
											}
										</p>
										<p className="text-sm text-gray-600">
											{order.shippingAddress.city},{" "}
											{order.shippingAddress.state}{" "}
											{order.shippingAddress.zipCode}
										</p>
										<p className="text-sm text-gray-600">
											{order.shippingAddress.country}
										</p>
										{order.shippingAddress.phone && (
											<p className="text-sm text-gray-600">
												Phone:{" "}
												{order.shippingAddress.phone}
											</p>
										)}
									</div>
									<div>
										<h4 className="font-semibold mb-2">
											Items
										</h4>
										{order.items.map((item, index) => (
											<div
												key={index}
												className="text-sm mb-1">
												{item.productName} ×{" "}
												{item.quantity}
											</div>
										))}
									</div>
								</div>

								<div className="flex flex-wrap gap-4 items-end">
									<div className="flex-1 min-w-[200px]">
										<label className="text-sm font-medium mb-1 block">
											Update Status
										</label>
										<Select
											value={order.status}
											onValueChange={(status) =>
												handleStatusUpdate(
													order.id,
													status
												)
											}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="pending">
													Pending
												</SelectItem>
												<SelectItem value="processing">
													Processing
												</SelectItem>
												<SelectItem value="shipped">
													Shipped
												</SelectItem>
												<SelectItem value="delivered">
													Delivered
												</SelectItem>
												<SelectItem value="cancelled">
													Cancelled
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="flex-1 min-w-[200px]">
										<label className="text-sm font-medium mb-1 block">
											Tracking Number
										</label>
										<div className="flex gap-2">
											<Input
												placeholder={
													order.trackingNumber ||
													"Enter tracking number"
												}
												value={
													trackingNumbers[order.id] ||
													order.trackingNumber ||
													""
												}
												onChange={(e) =>
													handleTrackingNumberChange(
														order.id,
														e.target.value
													)
												}
											/>
											<Button
												size="sm"
												onClick={() =>
													handleStatusUpdate(
														order.id,
														order.status
													)
												}
												disabled={
													!trackingNumbers[order.id]
												}>
												Update
											</Button>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>
		</div>
	);
}
