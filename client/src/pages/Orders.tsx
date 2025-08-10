import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, CheckCircle, Clock, ArrowLeft, Eye, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCurrency } from "@/hooks/useCurrency";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Order } from "@shared/schema";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export default function Orders() {
	const { isAuthenticated, isLoading: authLoading, user } = useAuth();
	const { formatPrice } = useCurrency();
	const { toast } = useToast();
	const [, setLocation] = useLocation();
	const queryClient = useQueryClient();
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

	// Redirect to login if not authenticated
	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			toast({
				title: "Unauthorized",
				description: "You need to be logged in to view your orders.",
				variant: "destructive",
			});
			setTimeout(() => {
				setLocation("/login");
			}, 500);
			return;
		}
	}, [isAuthenticated, authLoading, toast, setLocation]);

	const sessionId = localStorage.getItem("sessionId");

	const {
		data: orders = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["/api/orders"],
		enabled: !!sessionId && isAuthenticated,
		queryFn: async () => {
			if (!sessionId) return [];

			const response = await fetch("/api/orders", {
				headers: {
					Authorization: `Bearer ${sessionId}`,
				},
			});

			if (!response.ok) {
				if (response.status === 401) {
					localStorage.removeItem("sessionId");
					throw new Error("401: Unauthorized");
				}
				throw new Error("Failed to fetch orders");
			}

			const ordersData = await response.json();

			// Fetch product details for each order item
			const ordersWithProducts = await Promise.all(
				ordersData.map(async (order: any) => {
					const itemsWithProducts = await Promise.all(
						order.items.map(async (item: any) => {
							try {
								const productResponse = await fetch(
									`/api/products/${item.productId}`
								);
								if (productResponse.ok) {
									const product =
										await productResponse.json();
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
		retry: (failureCount, error) => {
			if (isUnauthorizedError(error)) {
				return false;
			}
			return failureCount < 3;
		},
	});

	const cancelOrderMutation = useMutation({
		mutationFn: async (orderId: string) => {
			const response = await fetch(`/api/orders/${orderId}/cancel`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionId}`,
				},
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to cancel order");
			}
			return response.json();
		},
		onSuccess: () => {
			toast({
				title: "Order Cancelled",
				description: "Your order has been successfully cancelled.",
			});
			queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
		},
		onError: (error) => {
			toast({
				title: "Error Cancelling Order",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	// Handle unauthorized error
	useEffect(() => {
		if (error && isUnauthorizedError(error)) {
			toast({
				title: "Unauthorized",
				description: "You are logged out. Logging in again...",
				variant: "destructive",
			});
			setTimeout(() => {
				setLocation("/login");
			}, 500);
		}
	}, [error, toast, setLocation]);

	const getStatusIcon = (status: string) => {
		switch (status.toLowerCase()) {
			case "pending":
				return <Clock className="h-4 w-4" />;
			case "processing":
				return <Package className="h-4 w-4" />;
			case "shipped":
				return <Truck className="h-4 w-4" />;
			case "delivered":
				return <CheckCircle className="h-4 w-4" />;
			default:
				return <Clock className="h-4 w-4" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "processing":
				return "bg-blue-100 text-blue-800";
			case "shipped":
				return "bg-purple-100 text-purple-800";
			case "delivered":
				return "bg-green-100 text-green-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const openOrderDetails = (order: Order) => {
		setSelectedOrder(order);
	};

	const closeOrderDetails = () => {
		setSelectedOrder(null);
	};

	const handleCancelOrder = (orderId: string) => {
		cancelOrderMutation.mutate(orderId);
	};

	if (authLoading || isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-craft-brown"></div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null; // Will redirect in useEffect
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-display font-bold text-gray-900">
							Your Orders
						</h1>
						<p className="text-gray-600 mt-1">
							Track and manage your purchases
						</p>
					</div>
					<Link href="/">
						<Button variant="outline" className="flex items-center">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Continue Shopping
						</Button>
					</Link>
				</div>

				{orders.length === 0 ? (
					<div className="text-center py-16">
						<Package className="h-24 w-24 text-gray-300 mx-auto mb-6" />
						<h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
							No orders yet
						</h2>
						<p className="text-gray-600 mb-8 max-w-md mx-auto">
							You haven't placed any orders yet. Start exploring
							our beautiful handcrafted products!
						</p>
						<Link href="/">
							<Button className="bg-craft-brown hover:bg-craft-brown/90">
								Start Shopping
							</Button>
						</Link>
					</div>
				) : (
					<div className="space-y-6">
						{orders.map((order: Order) => (
							<Card key={order.id} className="shadow-md">
								<CardHeader>
									<div className="flex items-center justify-between">
										<div>
											<CardTitle className="text-lg">
												Order #
												{order.id
													.slice(-8)
													.toUpperCase()}
											</CardTitle>
											<p className="text-sm text-gray-600 mt-1">
												Placed on{" "}
												{new Date(
													order.createdAt!
												).toLocaleDateString("en-US", {
													year: "numeric",
													month: "long",
													day: "numeric",
												})}
											</p>
										</div>
										<div className="text-right">
											<div className="text-2xl font-bold text-craft-brown">
												{formatPrice(
													order.totalAmount,
													order.currency
												)}
											</div>
											<Badge
												className={`${getStatusColor(
													order.status
												)} flex items-center gap-1 mt-2`}>
												{getStatusIcon(order.status)}
												{order.status
													.charAt(0)
													.toUpperCase() +
													order.status.slice(1)}
											</Badge>
											<div className="flex gap-2 mt-3">
												<Button
													size="sm"
													variant="outline"
													onClick={() =>
														openOrderDetails(order)
													}>
													<Eye className="h-3 w-3 mr-1" />
													Details
												</Button>
												{(order.status ===
													"pending" ||
													order.status ===
														"processing") && (
													<Button
														size="sm"
														variant="destructive"
														onClick={() =>
															handleCancelOrder(
																order.id
															)
														}
														disabled={
															cancelOrderMutation.isPending
														}>
														<X className="h-3 w-3 mr-1" />
														Cancel
													</Button>
												)}
											</div>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{/* Order Items */}
										<div>
											<h4 className="font-semibold text-gray-900 mb-2">
												Items ({order.items.length})
											</h4>
											<div className="space-y-2">
												{order.items.map(
													(item, index) => (
														<div
															key={index}
															className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
															<div className="flex-1">
																{item.product ? (
																	<div>
																		<div className="font-medium text-gray-900">
																			{
																				item
																					.product
																					.name
																			}
																		</div>
																		<div className="text-sm text-gray-600">
																			ASIN:{" "}
																			<span className="font-mono">
																				{
																					item
																						.product
																						.asin
																				}
																			</span>
																		</div>
																		<div className="text-sm text-gray-600">
																			ID:{" "}
																			<span className="font-mono">
																				{item.productId.slice(
																					-8
																				)}
																			</span>
																		</div>
																		<div className="text-sm">
																			Quantity:{" "}
																			<span className="font-medium">
																				{
																					item.quantity
																				}
																			</span>
																		</div>
																	</div>
																) : (
																	<div>
																		<span className="text-sm text-gray-600">
																			Product
																			ID:{" "}
																			{item.productId.slice(
																				-8
																			)}
																		</span>
																		<div className="text-sm">
																			Quantity:{" "}
																			<span className="font-medium">
																				{
																					item.quantity
																				}
																			</span>
																		</div>
																	</div>
																)}
															</div>
															<div className="text-right ml-4">
																<div className="font-medium">
																	{formatPrice(
																		item.price,
																		order.currency
																	)}
																</div>
																<div className="text-sm text-gray-600">
																	each
																</div>
															</div>
														</div>
													)
												)}
											</div>
										</div>

										{/* Tracking Information */}
										{order.trackingNumber && (
											<div className="bg-gray-50 rounded-lg p-4">
												<h4 className="font-semibold text-gray-900 mb-2 flex items-center">
													<Truck className="h-4 w-4 mr-2" />
													Tracking Information
												</h4>
												<div className="text-sm">
													<span className="text-gray-600">
														Tracking Number:{" "}
													</span>
													<span className="font-mono font-medium">
														{order.trackingNumber}
													</span>
												</div>
												<p className="text-xs text-gray-500 mt-1">
													Use this tracking number to
													monitor your shipment
													progress
												</p>
											</div>
										)}

										{/* Order Status Timeline */}
										<div className="bg-gray-50 rounded-lg p-4">
											<h4 className="font-semibold text-gray-900 mb-3">
												Order Status
											</h4>
											<div className="flex items-center justify-between">
												<div
													className={`flex flex-col items-center ${
														[
															"pending",
															"processing",
															"shipped",
															"delivered",
														].includes(
															order.status.toLowerCase()
														)
															? "text-craft-brown"
															: "text-gray-400"
													}`}>
													<div
														className={`w-3 h-3 rounded-full ${
															[
																"pending",
																"processing",
																"shipped",
																"delivered",
															].includes(
																order.status.toLowerCase()
															)
																? "bg-craft-brown"
																: "bg-gray-300"
														}`}
													/>
													<span className="text-xs mt-1">
														Confirmed
													</span>
												</div>

												<div
													className={`flex-1 h-0.5 mx-2 ${
														[
															"processing",
															"shipped",
															"delivered",
														].includes(
															order.status.toLowerCase()
														)
															? "bg-craft-brown"
															: "bg-gray-300"
													}`}
												/>

												<div
													className={`flex flex-col items-center ${
														[
															"processing",
															"shipped",
															"delivered",
														].includes(
															order.status.toLowerCase()
														)
															? "text-craft-brown"
															: "text-gray-400"
													}`}>
													<div
														className={`w-3 h-3 rounded-full ${
															[
																"processing",
																"shipped",
																"delivered",
															].includes(
																order.status.toLowerCase()
															)
																? "bg-craft-brown"
																: "bg-gray-300"
														}`}
													/>
													<span className="text-xs mt-1">
														Processing
													</span>
												</div>

												<div
													className={`flex-1 h-0.5 mx-2 ${
														[
															"shipped",
															"delivered",
														].includes(
															order.status.toLowerCase()
														)
															? "bg-craft-brown"
															: "bg-gray-300"
													}`}
												/>

												<div
													className={`flex flex-col items-center ${
														[
															"shipped",
															"delivered",
														].includes(
															order.status.toLowerCase()
														)
															? "text-craft-brown"
															: "text-gray-400"
													}`}>
													<div
														className={`w-3 h-3 rounded-full ${
															[
																"shipped",
																"delivered",
															].includes(
																order.status.toLowerCase()
															)
																? "bg-craft-brown"
																: "bg-gray-300"
														}`}
													/>
													<span className="text-xs mt-1">
														Shipped
													</span>
												</div>

												<div
													className={`flex-1 h-0.5 mx-2 ${
														order.status.toLowerCase() ===
														"delivered"
															? "bg-craft-brown"
															: "bg-gray-300"
													}`}
												/>

												<div
													className={`flex flex-col items-center ${
														order.status.toLowerCase() ===
														"delivered"
															? "text-craft-brown"
															: "text-gray-400"
													}`}>
													<div
														className={`w-3 h-3 rounded-full ${
															order.status.toLowerCase() ===
															"delivered"
																? "bg-craft-brown"
																: "bg-gray-300"
														}`}
													/>
													<span className="text-xs mt-1">
														Delivered
													</span>
												</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>

			<Dialog open={!!selectedOrder} onOpenChange={closeOrderDetails}>
				<DialogContent className="max-w-4xl">
					<DialogHeader>
						<DialogTitle>
							Order Details #
							{selectedOrder?.id.slice(-8).toUpperCase()}
						</DialogTitle>
					</DialogHeader>
					{selectedOrder && (
						<div className="space-y-6">
							{/* Customer Details */}
							<div className="bg-gray-50 rounded-lg p-4">
								<h4 className="font-semibold text-gray-900 mb-3">
									Customer Details
								</h4>
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
									<div className="md:col-span-3">
										<p className="text-gray-600">Address</p>
										<p className="font-medium">
											{selectedOrder.shippingAddress?.street || selectedOrder.shippingAddress?.streetAddress || 'No address'},{" "}
											{selectedOrder.shippingAddress?.city || ''},{" "}
											{selectedOrder.shippingAddress?.state || ''}{" "}
											{selectedOrder.shippingAddress?.zipCode || ''},{" "}
											{selectedOrder.shippingAddress?.country || ''}
										</p>
									</div>
								</div>
							</div>

							{/* Order Summary */}
							<div className="bg-gray-50 rounded-lg p-4">
								<h4 className="font-semibold text-gray-900 mb-3 flex items-center justify-between">
									<span>Order Summary</span>
									<span className="text-xl font-bold text-craft-brown">
										{formatPrice(
											selectedOrder.totalAmount,
											selectedOrder.currency
										)}
									</span>
								</h4>
								<div className="space-y-2">
									{selectedOrder.items.map(
										(item, index) => (
											<div
												key={index}
												className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
												<div className="flex items-center flex-1">
													{item.product && (
														<img
															src={
																item.product
																	.imageUrl
															}
															alt={
																item.product
																	.name
															}
															className="w-16 h-16 object-cover rounded mr-4"
														/>
													)}
													<div className="flex-1">
														<div className="font-medium text-gray-900">
															{
																item.product
																	?.name ??
																	`Product ID: ${item.productId.slice(
																		-8
																	)}`
															}
														</div>
														<div className="text-sm text-gray-600">
															Qty: {item.quantity}
														</div>
													</div>
												</div>
												<div className="text-right ml-4">
													<div className="font-medium">
														{formatPrice(
															item.price,
															selectedOrder.currency
														)}
													</div>
													<div className="text-sm text-gray-600">
														each
													</div>
												</div>
											</div>
										)
									)}
								</div>
							</div>

							{/* Payment and Status */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="bg-gray-50 rounded-lg p-4">
									<h4 className="font-semibold text-gray-900 mb-3">
										Payment Method
									</h4>
									<p className="font-medium capitalize">
										{selectedOrder.paymentMethod}
									</p>
								</div>
								<div className="bg-gray-50 rounded-lg p-4">
									<h4 className="font-semibold text-gray-900 mb-3 flex items-center">
										<Clock className="h-4 w-4 mr-2" />
										Order Status
									</h4>
									<Badge
										className={`${getStatusColor(
											selectedOrder.status
										)} text-lg flex items-center gap-1`}>
										{getStatusIcon(selectedOrder.status)}
										{selectedOrder.status
											.charAt(0)
											.toUpperCase() +
											selectedOrder.status.slice(1)}
									</Badge>
								</div>
							</div>
							{selectedOrder.trackingNumber && (
								<div className="bg-gray-50 rounded-lg p-4">
									<h4 className="font-semibold text-gray-900 mb-2 flex items-center">
										<Truck className="h-4 w-4 mr-2" />
										Tracking Information
									</h4>
									<div className="text-sm">
										<span className="text-gray-600">
											Tracking Number:{" "}
										</span>
										<span className="font-mono font-medium">
											{selectedOrder.trackingNumber}
										</span>
									</div>
									<p className="text-xs text-gray-500 mt-1">
										Use this tracking number to monitor
										your shipment progress
									</p>
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}