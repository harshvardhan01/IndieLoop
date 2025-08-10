import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin, Plus, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useCurrency } from "@/hooks/useCurrency";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
	const [, setLocation] = useLocation();
	const queryClient = useQueryClient();

	const [selectedAddressId, setSelectedAddressId] = useState<string>("");
	const [isNewAddress, setIsNewAddress] = useState(false);
	const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
	const [shippingAddress, setShippingAddress] = useState({
		firstName: user?.firstName || "",
		lastName: user?.lastName || "",
		streetAddress: "",
		city: "",
		state: "",
		zipCode: "",
		country: "India",
		phone: "",
		isDefault: false,
	});

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

	// Pre-fill shipping address with user data if available
	useState(() => {
		if (user) {
			setShippingAddress((prev) => ({
				...prev,
				firstName: user.firstName || "",
				lastName: user.lastName || "",
			}));
		}
	});

	// Handle address selection
	useState(() => {
		if (selectedAddressId && selectedAddressId !== "new" && addresses.length > 0) {
			const address = addresses.find(addr => addr.id === selectedAddressId);
			if (address) {
				setShippingAddress({
					firstName: address.firstName,
					lastName: address.lastName,
					streetAddress: address.streetAddress,
					city: address.city,
					state: address.state,
					zipCode: address.zipCode,
					country: address.country,
					phone: address.phone || "",
					isDefault: address.isDefault,
				});
				setIsNewAddress(false);
			}
		} else if (selectedAddressId === "new") {
			setIsNewAddress(true);
			setShippingAddress({
				firstName: user?.firstName || "",
				lastName: user?.lastName || "",
				streetAddress: "",
				city: "",
				state: "",
				zipCode: "",
				country: "India",
				phone: "",
				isDefault: false,
			});
		}
	});


	const createOrderMutation = useMutation({
		mutationFn: async () => {
			let addressToUse;

			if (selectedAddressId && selectedAddressId !== "new") {
				addressToUse = addresses.find(addr => addr.id === selectedAddressId);
			} else {
				// Use the manually entered address
				addressToUse = shippingAddress;
			}

			if (!addressToUse || !addressToUse.streetAddress) {
				throw new Error("Please provide a shipping address");
			}

			const orderItems = cartItems.map((item: any) => ({
				productId: item.productId,
				quantity: item.quantity,
				price: parseFloat(item.product.discountedPrice || item.product.originalPrice),
			}));

			return apiRequest("POST", "/api/orders", {
				items: orderItems,
				totalAmount: totalAmount.toString(),
				currency: "INR",
				paymentMethod,
				shippingAddress: addressToUse,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
			queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
			toast({ 
				title: "Order placed successfully!", 
				description: "Thank you for your purchase." 
			});
			setLocation("/orders");
		},
		onError: (error: any) => {
			toast({ 
				title: "Error", 
				description: error.message || "Failed to place order", 
				variant: "destructive" 
			});
		},
	});

	const addAddressMutation = useMutation({
		mutationFn: async (addressData: any) => {
			const response = await fetch("/api/addresses", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("sessionId")}`,
				},
				body: JSON.stringify(addressData),
			});
			if (!response.ok) throw new Error("Failed to add address");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["addresses"] });
			toast({
				title: "Success",
				description: "Address added successfully",
			});
			setIsAddressDialogOpen(false);
		},
		onError: () => {
			toast({
				title: "Error",
				description: "Failed to add address",
				variant: "destructive",
			});
		},
	});

	const handleAddAddress = (e: React.FormEvent) => {
		e.preventDefault();
		addAddressMutation.mutate(shippingAddress);
	};

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
						<Link href="/login">
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
						<Link href="/">
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
				<div className="flex items-center gap-4 mb-8">
					<Link href="/cart">
						<Button variant="outline" size="sm">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Cart
						</Button>
					</Link>
					<h1 className="text-3xl font-display font-bold text-gray-900">
						Checkout
					</h1>
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
							<CardContent className="space-y-4">
								{/* Address Selection */}
								{addresses.length > 0 && (
									<div className="space-y-2">
										<Label>Select Address</Label>
										<div className="flex gap-2">
											<Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
												<SelectTrigger className="flex-1">
													<SelectValue placeholder="Choose saved address or add new" />
												</SelectTrigger>
												<SelectContent>
													{addresses.map((address) => (
														<SelectItem key={address.id} value={address.id || ""}>
															{address.firstName} {address.lastName} - {address.streetAddress}, {address.city}
														</SelectItem>
													))}
													<SelectItem value="new">Add New Address</SelectItem>
												</SelectContent>
											</Select>
											<Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
												<DialogTrigger asChild>
													<Button type="button" variant="outline">
														<Plus className="h-4 w-4" />
													</Button>
												</DialogTrigger>
												<DialogContent className="max-w-2xl">
													<DialogHeader>
														<DialogTitle>Add New Address</DialogTitle>
													</DialogHeader>
													<form onSubmit={handleAddAddress} className="space-y-4">
														<div className="grid grid-cols-2 gap-4">
															<div className="space-y-2">
																<Label htmlFor="firstName">First Name</Label>
																<Input
																	id="firstName"
																	value={shippingAddress.firstName}
																	onChange={(e) =>
																		setShippingAddress((prev) => ({
																			...prev,
																			firstName: e.target.value,
																		}))
																	}
																	required
																/>
															</div>
															<div className="space-y-2">
																<Label htmlFor="lastName">Last Name</Label>
																<Input
																	id="lastName"
																	value={shippingAddress.lastName}
																	onChange={(e) =>
																		setShippingAddress((prev) => ({
																			...prev,
																			lastName: e.target.value,
																		}))
																	}
																	required
																/>
															</div>
														</div>

														<div className="space-y-2">
															<Label htmlFor="streetAddress">Street Address</Label>
															<Input
																id="streetAddress"
																value={shippingAddress.streetAddress}
																onChange={(e) =>
																	setShippingAddress((prev) => ({
																		...prev,
																		streetAddress: e.target.value,
																	}))
																}
																required
															/>
														</div>

														<div className="grid grid-cols-2 gap-4">
															<div className="space-y-2">
																<Label htmlFor="city">City</Label>
																<Input
																	id="city"
																	value={shippingAddress.city}
																	onChange={(e) =>
																		setShippingAddress((prev) => ({
																			...prev,
																			city: e.target.value,
																		}))
																	}
																	required
																/>
															</div>
															<div className="space-y-2">
																<Label htmlFor="state">State</Label>
																<Input
																	id="state"
																	value={shippingAddress.state}
																	onChange={(e) =>
																		setShippingAddress((prev) => ({
																			...prev,
																			state: e.target.value,
																		}))
																	}
																	required
																/>
															</div>
														</div>

														<div className="grid grid-cols-2 gap-4">
															<div className="space-y-2">
																<Label htmlFor="zipCode">ZIP Code</Label>
																<Input
																	id="zipCode"
																	value={shippingAddress.zipCode}
																	onChange={(e) =>
																		setShippingAddress((prev) => ({
																			...prev,
																			zipCode: e.target.value,
																		}))
																	}
																	required
																/>
															</div>
															<div className="space-y-2">
																<Label htmlFor="country">Country</Label>
																<Input
																	id="country"
																	value={shippingAddress.country}
																	onChange={(e) =>
																		setShippingAddress((prev) => ({
																			...prev,
																			country: e.target.value,
																		}))
																	}
																	required
																/>
															</div>
														</div>

														<div className="space-y-2">
															<Label htmlFor="phone">Phone Number</Label>
															<Input
																id="phone"
																value={shippingAddress.phone}
																onChange={(e) =>
																	setShippingAddress((prev) => ({
																		...prev,
																		phone: e.target.value,
																	}))
																}
															/>
														</div>

														<div className="flex space-x-2">
															<Button type="submit" className="flex-1">
																Add Address
															</Button>
															<Button
																type="button"
																variant="outline"
																onClick={() => setIsAddressDialogOpen(false)}
															>
																Cancel
															</Button>
														</div>
													</form>
												</DialogContent>
											</Dialog>
										</div>
									</div>
								)}

								{(isNewAddress || addresses.length === 0 || !selectedAddressId) && (
									<div className="space-y-4">
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="firstName">First Name</Label>
												<Input
													id="firstName"
													value={shippingAddress.firstName}
													onChange={(e) =>
														setShippingAddress((prev) => ({
															...prev,
															firstName: e.target.value,
														}))
													}
													required
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="lastName">Last Name</Label>
												<Input
													id="lastName"
													value={shippingAddress.lastName}
													onChange={(e) =>
														setShippingAddress((prev) => ({
															...prev,
															lastName: e.target.value,
														}))
													}
													required
												/>
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="streetAddress">Street Address</Label>
											<Input
												id="streetAddress"
												value={shippingAddress.streetAddress}
												onChange={(e) =>
													setShippingAddress((prev) => ({
														...prev,
														streetAddress: e.target.value,
													}))
												}
												required
											/>
										</div>

										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="city">City</Label>
												<Input
													id="city"
													value={shippingAddress.city}
													onChange={(e) =>
														setShippingAddress((prev) => ({
															...prev,
															city: e.target.value,
														}))
													}
													required
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="state">State</Label>
												<Input
													id="state"
													value={shippingAddress.state}
													onChange={(e) =>
														setShippingAddress((prev) => ({
															...prev,
															state: e.target.value,
														}))
													}
													required
												/>
											</div>
										</div>

										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="zipCode">ZIP Code</Label>
												<Input
													id="zipCode"
													value={shippingAddress.zipCode}
													onChange={(e) =>
														setShippingAddress((prev) => ({
															...prev,
															zipCode: e.target.value,
														}))
													}
													required
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="country">Country</Label>
												<Input
													id="country"
													value={shippingAddress.country}
													onChange={(e) =>
														setShippingAddress((prev) => ({
															...prev,
															country: e.target.value,
														}))
													}
													required
												/>
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="phone">Phone Number</Label>
											<Input
												id="phone"
												value={shippingAddress.phone}
												onChange={(e) =>
													setShippingAddress((prev) => ({
														...prev,
														phone: e.target.value,
													}))
												}
											/>
										</div>
									</div>
								)}
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
										<Label htmlFor="cod" className="text-sm font-medium cursor-pointer">
											Cash on Delivery
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="online" id="online" />
										<Label htmlFor="online" className="text-sm font-medium cursor-pointer">
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
										<div key={item.id} className="flex justify-between items-center">
											<div className="flex-1">
												<p className="text-sm font-medium">{item.product.name}</p>
												<p className="text-xs text-gray-600">Qty: {item.quantity}</p>
											</div>
											<p className="text-sm font-medium">
												{formatPrice(
													(parseFloat(item.product.discountedPrice || item.product.originalPrice) * item.quantity)
												)}
											</p>
										</div>
									))}
								</div>

								<hr />

								<div className="flex justify-between items-center">
									<span>Subtotal ({cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0)} items)</span>
									<span className="font-semibold">{formatPrice(totalAmount)}</span>
								</div>

								<div className="flex justify-between items-center">
									<span>Shipping</span>
									<span className="text-craft-green font-semibold">Free</span>
								</div>

								<hr />

								<div className="flex justify-between items-center text-lg font-bold">
									<span>Total</span>
									<span className="text-craft-brown">{formatPrice(totalAmount)}</span>
								</div>

								<Button
									onClick={handlePlaceOrder}
									disabled={createOrderMutation.isPending || !selectedAddressId}
									className="w-full bg-craft-brown hover:bg-craft-brown/90"
								>
									{createOrderMutation.isPending ? "Placing Order..." : "Place Order"}
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}