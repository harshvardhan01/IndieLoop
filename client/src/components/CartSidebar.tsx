import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useCurrency } from "@/hooks/useCurrency";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface CartSidebarProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
	const { cartItems, totalAmount, updateCart, removeFromCart, clearCart } =
		useCart();
	const { formatPrice } = useCurrency();
	const { isAuthenticated } = useAuth();
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const checkoutMutation = useMutation({
		mutationFn: async () => {
			const orderItems = cartItems.map((item: any) => ({
				productId: item.productId,
				quantity: item.quantity,
				price: parseFloat(
					item.product.discountedPrice || item.product.originalPrice
				),
			}));

			return apiRequest("POST", "/api/orders", {
				items: orderItems,
				totalAmount: totalAmount.toString(),
				currency: "INR", // Default currency for now
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
			queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
			toast({
				title: "Order placed successfully!",
				description: "Thank you for your purchase.",
			});
			onClose();
			navigate("/orders");
		},
		onError: () => {
			toast({
				title: "Error",
				description: "Failed to place order",
				variant: "destructive",
			});
		},
	});

	const handleCheckout = () => {
		if (!isAuthenticated) {
			onClose();
			navigate("/login");
			return;
		}
		checkoutMutation.mutate();
	};

	return (
		<>
			{/* Overlay */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-40"
					onClick={onClose}
				/>
			)}

			{/* Sidebar */}
			<div
				className={`fixed top-0 right-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 z-50 ${
					isOpen ? "translate-x-0" : "translate-x-full"
				}`}>
				<div className="flex justify-between items-center p-6 border-b">
					<h2 className="text-xl font-semibold text-gray-900">
						Shopping Cart
					</h2>
					<Button onClick={onClose} variant="ghost" size="icon">
						<X className="h-5 w-5" />
					</Button>
				</div>

				<div className="flex-1 overflow-y-auto p-6">
					{cartItems.length === 0 ? (
						<div className="text-center py-12">
							<ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								Your cart is empty
							</h3>
							<p className="text-gray-600">
								Add some beautiful handcrafted items to get
								started!
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{cartItems.map((item: any) => (
								<div
									key={item.id}
									className="flex items-center space-x-4 border-b pb-4">
									<img
										src={item.product.images[0]}
										alt={item.product.name}
										className="w-16 h-16 object-cover rounded"
									/>
									<div className="flex-1">
										<h4 className="font-medium text-gray-900 text-sm">
											{item.product.name}
										</h4>
										<p className="text-xs text-gray-600">
											{item.product.material}
										</p>
										<div className="flex items-center justify-between mt-2">
											<span className="text-craft-brown font-semibold text-sm">
												{formatPrice(
													item.product
														.discountedPrice ||
														item.product
															.originalPrice
												)}
											</span>
											<div className="flex items-center space-x-2">
												<Button
													onClick={() =>
														updateCart({
															id: item.id,
															quantity: Math.max(
																1,
																item.quantity -
																	1
															),
														})
													}
													variant="outline"
													size="icon"
													className="h-8 w-8">
													<Minus className="h-3 w-3" />
												</Button>
												<span className="text-sm w-8 text-center">
													{item.quantity}
												</span>
												<Button
													onClick={() =>
														updateCart({
															id: item.id,
															quantity:
																item.quantity +
																1,
														})
													}
													variant="outline"
													size="icon"
													className="h-8 w-8">
													<Plus className="h-3 w-3" />
												</Button>
												<Button
													onClick={() =>
														removeFromCart(item.id)
													}
													variant="outline"
													size="icon"
													className="h-8 w-8 text-red-500 hover:text-red-700">
													<X className="h-3 w-3" />
												</Button>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{cartItems.length > 0 && (
					<div className="border-t p-6">
						<div className="flex justify-between items-center mb-4">
							<span className="text-lg font-semibold">
								Total:
							</span>
							<span className="text-2xl font-bold text-craft-brown">
								{formatPrice(totalAmount)}
							</span>
						</div>
						<Button
							onClick={() => {
								onClose();
								navigate("/cart");
							}}
							className="w-full bg-craft-brown hover:bg-craft-brown/90 mb-2">
							View Cart
						</Button>
						<Button
							onClick={onClose}
							variant="outline"
							className="w-full">
							Continue Shopping
						</Button>
					</div>
				)}
			</div>
		</>
	);
}
