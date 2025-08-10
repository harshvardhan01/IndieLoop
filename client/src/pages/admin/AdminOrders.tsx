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
import { ShoppingCart, Filter, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { Link } from "wouter";

export default function AdminOrders() {
	const { user, isLoading: authLoading } = useAuth();
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [trackingNumbers, setTrackingNumbers] = useState<
		Record<string, string>
	>({});
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

	// Fetch orders
	const { data: orders = [], isLoading, error } = useQuery({
		queryKey: ["/api/admin/orders"],
		queryFn: async () => {
			const response = await fetch("/api/admin/orders", {
				headers: {
					Authorization: `Bearer ${localStorage.getItem(
						"sessionId"
					)}`,
				},
			});
			if (!response.ok) throw new Error("Failed to fetch orders");
			const data = await response.json();

			// Fetch user details for each order
			const ordersWithUsers = await Promise.all(
				data.map(async (order: any) => {
					let customer = null;
					if (order.userId) {
						try {
							const userResponse = await fetch(`/api/admin/users/${order.userId}`, {
								headers: {
									Authorization: `Bearer ${localStorage.getItem("sessionId")}`,
								},
							});
							if (userResponse.ok) {
								customer = await userResponse.json();
							}
						} catch (error) {
							console.log("Could not fetch user details:", error);
						}
					}

					return {
						...order,
						shippingAddress: order.shippingAddress || {},
						customer: customer || {
							firstName: "Unknown",
							lastName: "Customer",
							email: "N/A"
						},
						items: order.items || [],
						totalAmount: order.totalAmount || order.total || 0
					};
				})
			);

			// Fetch product details for each order item
			const ordersWithProducts = await Promise.all(
				ordersWithUsers.map(async (order: any) => {
					const itemsWithProducts = await Promise.all(
						order.items.map(async (item: any) => {
							try {
								const productResponse = await fetch(
									`/api/products/${item.productId}`
								);
								if (productResponse.ok) {
									const product = await productResponse.json();
									return { ...item, product };
								}
								return item;
							} catch {
								return item;
							}
						})
					);
					return { ...order, items: itemsWithProducts };
				})
			);

			return ordersWithProducts;
		},
		enabled: !!user?.isAdmin,
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
			queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
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

	// Filter orders based on status and search query
	const filteredOrders = useMemo(() => {
		return orders.filter((order) => {
			const matchesStatus = statusFilter === "all" || order.status === statusFilter;
			const matchesSearch = searchQuery === "" || 
				order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				order.shippingAddress?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				order.shippingAddress?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				order.shippingAddress?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				order.customer?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				order.customer?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				order.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesStatus && matchesSearch;
		});
	}, [orders, statusFilter, searchQuery]);

	const openOrderDetails = (order: Order) => {
		setSelectedOrder(order);
		setIsOrderModalOpen(true);
	};

	// Show loading while auth is loading
	if (authLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-craft-brown"></div>
			</div>
		);
	}

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

			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-4 mb-6">
				<div className="flex items-center gap-2 flex-1">
					<Search className="h-4 w-4 text-gray-500" />
					<Input
						placeholder="Search by order ID, customer name, or email..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="flex-1"
					/>
				</div>
				<div className="flex items-center gap-2">
					<Filter className="h-4 w-4 text-gray-500" />
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Filter by status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Orders</SelectItem>
							<SelectItem value="pending">Pending</SelectItem>
							<SelectItem value="processing">Processing</SelectItem>
							<SelectItem value="shipped">Shipped</SelectItem>
							<SelectItem value="delivered">Delivered</SelectItem>
							<SelectItem value="cancelled">Cancelled</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="grid gap-6">
				{filteredOrders.length === 0 ? (
					<Card>
						<CardContent className="p-6">
							<p className="text-center text-gray-500">
								No orders found
							</p>
						</CardContent>
					</Card>
				) : (
					filteredOrders.map((order) => (
						<Card key={order.id}>
							<CardHeader>
								<div className="flex justify-between items-start">
									<div>
										<CardTitle 
											className="cursor-pointer hover:text-craft-brown"
											onClick={() => openOrderDetails(order)}
										>
											Order #{order.id.slice(-8).toUpperCase()}
										</CardTitle>
										<CardDescription>
											{new Date(
												order.createdAt
											).toLocaleDateString()}
										</CardDescription>
									</div>
									<div className="text-right">
										<p className="text-lg font-semibold">
											₹{order.totalAmount || order.total || 0}
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
											{order.customer?.firstName || order.shippingAddress?.firstName || 'N/A'}{" "}
											{order.customer?.lastName || order.shippingAddress?.lastName || ''}
										</p>
										<p className="text-sm text-gray-600">
											{order.customer?.email || 'No email'}
										</p>
										<p className="text-sm text-gray-600 mt-2">
											<strong>Shipping Address:</strong>
										</p>
										<p className="text-sm text-gray-600">
											{order.shippingAddress?.streetAddress || 'No address'}
										</p>
										<p className="text-sm text-gray-600">
											{order.shippingAddress?.city || ''},{" "}
											{order.shippingAddress?.state || ''}{" "}
											{order.shippingAddress?.zipCode || ''}
										</p>
										<p className="text-sm text-gray-600">
											{order.shippingAddress?.country || ''}
										</p>
										{order.shippingAddress?.phone && (
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
												{item.product?.name || item.productName || 'Product name not available'} ×{" "}
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

									<div className="flex gap-2">
										<Button
											size="sm"
											variant="outline"
											onClick={() => openOrderDetails(order)}
										>
											Order Details
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>

			{/* Order Details Modal */}
			<Modal open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
				<ModalContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<ModalHeader>
						<ModalTitle>
							Order Details - #{selectedOrder?.id.slice(-8).toUpperCase()}
						</ModalTitle>
					</ModalHeader>
					{selectedOrder && (
						<div className="space-y-6">
							{/* Customer Details */}
							<div className="bg-gray-50 rounded-lg p-4">
								<h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
									<div>
										<p className="text-gray-600">Name</p>
										<p className="font-medium">
											{selectedOrder.customer?.firstName || selectedOrder.shippingAddress?.firstName || 'N/A'}{" "}
											{selectedOrder.customer?.lastName || selectedOrder.shippingAddress?.lastName || ''}
										</p>
									</div>
									<div>
										<p className="text-gray-600">Email</p>
										<p className="font-medium">
											{selectedOrder.customer?.email || selectedOrder.shippingAddress?.email || 'Not provided'}
										</p>
									</div>
									<div>
										<p className="text-gray-600">Phone</p>
										<p className="font-medium">
											{selectedOrder.customer?.phone || selectedOrder.shippingAddress?.phone || 'Not provided'}
										</p>
									</div>
								</div>
							</div>

							{/* Order Summary */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<h4 className="font-semibold mb-3">Order Information</h4>
									<div className="space-y-2 text-sm">
										<p><span className="font-medium">Order ID:</span> {selectedOrder.id}</p>
										<p><span className="font-medium">Date:</span> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
										<p><span className="font-medium">Status:</span> <span className={`px-2 py-1 rounded text-sm ${selectedOrder.status === "delivered" ? "bg-green-100 text-green-800" : selectedOrder.status === "shipped" ? "bg-blue-100 text-blue-800" : selectedOrder.status === "processing" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}>{selectedOrder.status.toUpperCase()}</span></p>
										{selectedOrder.trackingNumber && (
											<p><span className="font-medium">Tracking:</span> {selectedOrder.trackingNumber}</p>
										)}
									</div>
								</div>

								{/* Payment Details */}
								<div>
									<h4 className="font-semibold mb-3">Payment Information</h4>
									<div className="space-y-2 text-sm">
										<p><span className="font-medium">Payment Method:</span> {selectedOrder.paymentMethod || 'Not specified'}</p>
										<p><span className="font-medium">Total Amount:</span> ₹{selectedOrder.totalAmount || selectedOrder.total || 0}</p>
										<p><span className="font-medium">Currency:</span> {selectedOrder.currency || 'INR'}</p>
									</div>
								</div>
							</div>

							{/* Shipping Address */}
							<div>
								<h4 className="font-semibold mb-3">Shipping Address</h4>
								<div className="bg-gray-50 p-4 rounded-lg text-sm">
									<p className="font-medium">{selectedOrder.shippingAddress?.firstName || 'N/A'} {selectedOrder.shippingAddress?.lastName || ''}</p>
									<p>{selectedOrder.shippingAddress?.streetAddress || 'No address provided'}</p>
									<p>{selectedOrder.shippingAddress?.city || ''}{selectedOrder.shippingAddress?.city && selectedOrder.shippingAddress?.state ? ', ' : ''}{selectedOrder.shippingAddress?.state || ''} {selectedOrder.shippingAddress?.zipCode || ''}</p>
									<p>{selectedOrder.shippingAddress?.country || ''}</p>
									{selectedOrder.shippingAddress?.phone && (
										<p className="mt-1">Phone: {selectedOrder.shippingAddress.phone}</p>
									)}
								</div>
							</div>

							{/* Order Items */}
							<div>
								<h4 className="font-semibold mb-3">Order Items</h4>
								<div className="space-y-3">
									{selectedOrder.items.map((item, index) => (
										<div key={index} className="flex items-center p-3 border rounded-lg">
											<div className="flex items-center flex-1">
												{item.product && item.product.images && item.product.images.length > 0 && (
													<img
														src={item.product.images[0]}
														alt={item.product.name || 'Product image'}
														className="w-16 h-16 object-cover rounded mr-4"
													/>
												)}
												<div className="flex-1">
													<div className="font-medium text-lg">
														{item.product?.name || item.productName ? (
															<Link 
																href={`/product/${item.productId}`}
																className="text-craft-brown hover:text-craft-brown/80 hover:underline"
															>
																{item.product?.name || item.productName}
															</Link>
														) : (
															<span className="text-gray-500">Product name not available</span>
														)}
													</div>
													{item.product?.asin ? (
														<p className="text-sm text-gray-600 font-mono">ASIN: {item.product.asin}</p>
													) : (
														<p className="text-sm text-gray-500 italic">ASIN: Not available</p>
													)}
													<p className="text-sm text-gray-600">Product ID: {item.productId}</p>
													<p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
												</div>
											</div>
											<div className="text-right ml-4">
												<p className="font-medium">₹{item.price}</p>
												<p className="text-sm text-gray-600">each</p>
												<p className="text-sm font-medium">Total: ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
											</div>
										</div>
									))}
									<div className="border-t pt-3 mt-3">
										<div className="flex justify-between items-center font-semibold text-lg">
											<span>Order Total:</span>
											<span>₹{selectedOrder.totalAmount || selectedOrder.total || 0}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
}