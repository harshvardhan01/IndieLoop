import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, MapPin, Plus, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useCurrency } from "@/hooks/useCurrency";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import AddressForm from "@/components/forms/AddressForm";

interface Address {
	id: string;
	firstName: string;
	lastName: string;
	streetAddress: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
	phone?: string;
	isDefault: boolean;
}

export default function Checkout() {
	const { user, isAuthenticated } = useAuth();
	const { cartItems, totalAmount } = useCart();
	const { formatPrice } = useCurrency();
	const { toast } = useToast();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const [selectedAddressId, setSelectedAddressId] = useState<string>("");
	const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);

	const [paymentMethod, setPaymentMethod] = useState<string>("cod");

	// Fetch user addresses
	const { data: addresses = [] } = useQuery<Address[]>({
		queryKey: ["addresses"],
		enabled: isAuthenticated,
		queryFn: async () => {
			const response = await fetch("/api/addresses", {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("sessionId")}`,
				},
			});
			if (!response.ok) return [];
			return response.json();
		},
	});

	const createOrderMutation = useMutation({
		mutationFn: async () => {
			if (!selectedAddressId) {
				throw new Error("No shipping address selected");
			}

			const addressToUse = addresses.find(
				(addr) => addr.id === selectedAddressId,
			);

			if (!addressToUse) {
				throw new Error("Selected address not found");
			}

			const orderItems = cartItems.map((item) => ({
				productId: item.productId,
				quantity: item.quantity,
				price: parseFloat(
					item.product?.discountedPrice || item.product?.originalPrice || "0",
				),
			}));

			const response = await fetch("/api/orders", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("sessionId")}`,
				},
				body: JSON.stringify({
					items: orderItems,
					totalAmount: totalAmount.toString(),
					currency: "INR",
					shippingAddress: {
						firstName: addressToUse.firstName,
						lastName: addressToUse.lastName,
						streetAddress: addressToUse.streetAddress,
						city: addressToUse.city,
						state: addressToUse.state,
						zipCode: addressToUse.zipCode,
						country: addressToUse.country,
						phone: addressToUse.phone,
					},
					paymentMethod,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to create order");
			}

			return response.json();
		},
		onSuccess: (order) => {
			toast({
				title: "Order Placed Successfully!",
				description: `Your order #${order.id
					.slice(-8)
					.toUpperCase()} has been placed.`,
			});
			// Clear cart from React Query cache
			queryClient.setQueryData(["/api/cart"], []);
			// Redirect to orders page
			navigate("/orders");
		},
		onError: () => {
			toast({
				title: "Error",
				description: "Failed to place order. Please try again.",
				variant: "destructive",
			});
		},
	});

	const handlePlaceOrder = () => {
		if (!selectedAddressId) {
			toast({
				title: "Error",
				description: "Please select a shipping address",
				variant: "destructive",
			});
			return;
		}
		createOrderMutation.mutate();
	};

	if (!isAuthenticated) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<Card className="p-8">
					<CardContent className="text-center">
						<p className="mb-4">Please log in to checkout</p>
						<Link to="/login">
							<Button>Login</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (cartItems.length === 0) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<Card className="p-8">
					<CardContent className="text-center">
						<p className="mb-4">Your cart is empty</p>
						<Link to="/">
							<Button>Continue Shopping</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-display font-bold text-gray-900">
							Checkout
						</h1>
					</div>
					<Link to="/cart">
						<Button variant="outline" size="sm">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Cart
						</Button>
					</Link>
				</div>

				<div className="grid lg:grid-cols-3 gap-8">
					{/* Checkout Form */}
					<div className="lg:col-span-2 space-y-6">
						{/* Shipping Address */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<MapPin className="h-5 w-5" />
									Shipping Address
								</CardTitle>
							</CardHeader>
							<CardContent>
								{/* Address Cards */}
								<div className="space-y-4">
									<Label>Select or Add Address</Label>
									<div className="grid gap-4 md:grid-cols-2">
										{/* Existing Address Cards */}
										{addresses.map((address) => (
											<Card
												key={address.id}
												className={`cursor-pointer border-2 transition-colors ${
													selectedAddressId === address.id
														? "border-craft-brown bg-craft-brown/5"
														: "border-gray-200 hover:border-gray-300"
												}`}
												onClick={() => setSelectedAddressId(address.id)}
											>
												<CardContent className="p-4">
													<div className="flex items-center justify-between mb-2">
														<h4 className="font-semibold">
															{address.firstName} {address.lastName}
														</h4>
														{address.isDefault && (
															<span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
																Default
															</span>
														)}
													</div>
													<div className="text-sm text-gray-600 space-y-1">
														<p>{address.streetAddress}</p>
														<p>
															{address.city}, {address.state} {address.zipCode}
														</p>
														<p>{address.country}</p>
														{address.phone && <p>Phone: {address.phone}</p>}
													</div>
												</CardContent>
											</Card>
										))}

										{/* Add New Address Card */}
										<Card
											className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-craft-brown hover:bg-craft-brown/5 transition-colors"
											onClick={() => setIsAddressDialogOpen(true)}
										>
											<CardContent className="p-4 flex flex-col items-center justify-center min-h-[140px]">
												<Plus className="h-8 w-8 text-gray-400 mb-2" />
												<p className="text-sm font-medium text-gray-600">
													Add New Address
												</p>
											</CardContent>
										</Card>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Payment Method */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CreditCard className="h-5 w-5" />
									Payment Method
								</CardTitle>
							</CardHeader>
							<CardContent>
								<RadioGroup
									value={paymentMethod}
									onValueChange={setPaymentMethod}
									className="space-y-3"
								>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="cod" id="cod" />
										<Label
											htmlFor="cod"
											className="text-sm font-medium cursor-pointer"
										>
											Cash on Delivery
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="online" id="online" />
										<Label
											htmlFor="online"
											className="text-sm font-medium cursor-pointer"
										>
											Online Payment (UPI/Card)
										</Label>
									</div>
								</RadioGroup>
							</CardContent>
						</Card>
					</div>

					{/* Order Summary */}
					<div>
						<Card>
							<CardHeader>
								<CardTitle>Order Summary</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Order Items */}
								<div className="space-y-2">
									{cartItems.map((item: any) => (
										<div
											key={item.id}
											className="flex justify-between items-center"
										>
											<div className="flex-1">
												<p className="text-sm font-medium">
													{item.product.name}
												</p>
												<p className="text-xs text-gray-600">
													Qty: {item.quantity}
												</p>
											</div>
											<p className="text-sm font-medium">
												{formatPrice(
													parseFloat(
														item.product.discountedPrice ||
															item.product.originalPrice,
													) * item.quantity,
												)}
											</p>
										</div>
									))}
								</div>

								<hr />

								<div className="flex justify-between items-center">
									<span>
										Subtotal (
										{cartItems.reduce(
											(sum: number, item: any) => sum + item.quantity,
											0,
										)}{" "}
										items)
									</span>
									<span className="font-semibold">
										{formatPrice(totalAmount)}
									</span>
								</div>

								<div className="flex justify-between items-center">
									<span>Shipping</span>
									<span className="text-craft-green font-semibold">Free</span>
								</div>

								<hr />

								<div className="flex justify-between items-center text-lg font-bold">
									<span>Total</span>
									<span className="text-craft-brown">
										{formatPrice(totalAmount)}
									</span>
								</div>

								<Button
									onClick={handlePlaceOrder}
									disabled={createOrderMutation.isPending}
									className="w-full bg-craft-brown hover:bg-craft-brown/90"
								>
									{createOrderMutation.isPending
										? "Placing Order..."
										: "Place Order"}
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>

			<AddressForm
				isOpen={isAddressDialogOpen}
				onOpenChange={setIsAddressDialogOpen}
				editingAddress={null}
				onSuccess={() => {
					// Refetch addresses after adding new one
					queryClient.invalidateQueries({ queryKey: ["addresses"] });
				}}
			/>
		</div>
	);
}
