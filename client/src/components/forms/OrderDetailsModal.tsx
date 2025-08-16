
import { Order } from "@shared/schema";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalTitle,
} from "@/components/ui/modal";
import { Link } from "react-router-dom";

interface OrderDetailsModalProps {
	order: Order | null;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function OrderDetailsModal({
	order,
	isOpen,
	onOpenChange,
}: OrderDetailsModalProps) {
	if (!order) return null;

	return (
		<Modal open={isOpen} onOpenChange={onOpenChange}>
			<ModalContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<ModalHeader>
					<ModalTitle>
						Order Details - #{order.id.slice(-8).toUpperCase()}
					</ModalTitle>
				</ModalHeader>
				<div className="space-y-6">
					{/* Customer Details */}
					<div className="bg-gray-50 rounded-lg p-4">
						<h4 className="font-semibold text-gray-900 mb-3">
							Customer Information
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
							<div>
								<p className="text-gray-600">Name</p>
								<p className="font-medium">
									{order.customer?.firstName ||
										order.shippingAddress?.firstName ||
										"N/A"}{" "}
									{order.customer?.lastName ||
										order.shippingAddress?.lastName ||
										""}
								</p>
							</div>
							<div>
								<p className="text-gray-600">Email</p>
								<p className="font-medium">
									{order.customer?.email ||
										order.shippingAddress?.email ||
										"Not provided"}
								</p>
							</div>
							<div>
								<p className="text-gray-600">Phone</p>
								<p className="font-medium">
									{order.customer?.phone ||
										order.shippingAddress?.phone ||
										"Not provided"}
								</p>
							</div>
						</div>
					</div>

					{/* Order Summary */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<h4 className="font-semibold mb-3">
								Order Information
							</h4>
							<div className="space-y-2 text-sm">
								<p>
									<span className="font-medium">
										Order ID:
									</span>{" "}
									{order.id}
								</p>
								<p>
									<span className="font-medium">Date:</span>{" "}
									{new Date(order.createdAt).toLocaleDateString()}
								</p>
								<p>
									<span className="font-medium">Status:</span>{" "}
									<span
										className={`px-2 py-1 rounded text-sm ${
											order.status === "delivered"
												? "bg-green-100 text-green-800"
												: order.status === "shipped"
												? "bg-blue-100 text-blue-800"
												: order.status === "processing"
												? "bg-yellow-100 text-yellow-800"
												: "bg-gray-100 text-gray-800"
										}`}>
										{order.status.toUpperCase()}
									</span>
								</p>
								{order.trackingNumber && (
									<p>
										<span className="font-medium">
											Tracking:
										</span>{" "}
										{order.trackingNumber}
									</p>
								)}
							</div>
						</div>

						{/* Payment Details */}
						<div>
							<h4 className="font-semibold mb-3">
								Payment Information
							</h4>
							<div className="space-y-2 text-sm">
								<p>
									<span className="font-medium">
										Payment Method:
									</span>{" "}
									{order.paymentMethod || "Not specified"}
								</p>
								<p>
									<span className="font-medium">
										Total Amount:
									</span>{" "}
									₹{order.totalAmount || order.total || 0}
								</p>
								<p>
									<span className="font-medium">
										Currency:
									</span>{" "}
									{order.currency || "INR"}
								</p>
							</div>
						</div>
					</div>

					{/* Shipping Address */}
					<div>
						<h4 className="font-semibold mb-3">Shipping Address</h4>
						<div className="bg-gray-50 p-4 rounded-lg text-sm">
							<p className="font-medium">
								{order.shippingAddress?.firstName || "N/A"}{" "}
								{order.shippingAddress?.lastName || ""}
							</p>
							<p>
								{order.shippingAddress?.streetAddress ||
									"No address provided"}
							</p>
							<p>
								{order.shippingAddress?.city || ""}
								{order.shippingAddress?.city &&
								order.shippingAddress?.state
									? ", "
									: ""}
								{order.shippingAddress?.state || ""}{" "}
								{order.shippingAddress?.zipCode || ""}
							</p>
							<p>{order.shippingAddress?.country || ""}</p>
							{order.shippingAddress?.phone && (
								<p className="mt-1">
									Phone: {order.shippingAddress.phone}
								</p>
							)}
						</div>
					</div>

					{/* Order Items */}
					<div>
						<h4 className="font-semibold mb-3">Order Items</h4>
						<div className="space-y-3">
							{order.items.map((item, index) => (
								<div
									key={index}
									className="flex items-center p-3 border rounded-lg">
									<div className="flex items-center flex-1">
										{item.product &&
											item.product.images &&
											item.product.images.length > 0 && (
												<img
													src={item.product.images[0]}
													alt={
														item.product.name ||
														"Product image"
													}
													className="w-16 h-16 object-cover rounded mr-4"
												/>
											)}
										<div className="flex-1">
											<div className="font-medium text-lg">
												{item.product?.name ||
												item.productName ? (
													<Link
														to={`/product/${item.productId}`}
														className="text-craft-brown hover:text-craft-brown/80 hover:underline">
														{item.product?.name ||
															item.productName}
													</Link>
												) : (
													<span className="text-gray-500">
														Product name not
														available
													</span>
												)}
											</div>
											{item.product?.asin ? (
												<p className="text-sm text-gray-600 font-mono">
													ASIN: {item.product.asin}
												</p>
											) : (
												<p className="text-sm text-gray-500 italic">
													ASIN: Not available
												</p>
											)}
											<p className="text-sm text-gray-600">
												Product ID: {item.productId}
											</p>
											<p className="text-sm text-gray-600">
												Quantity: {item.quantity}
											</p>
										</div>
									</div>
									<div className="text-right ml-4">
										<p className="font-medium">
											₹{item.price}
										</p>
										<p className="text-sm text-gray-600">
											each
										</p>
										<p className="text-sm font-medium">
											Total: ₹
											{(
												parseFloat(item.price) *
												item.quantity
											).toFixed(2)}
										</p>
									</div>
								</div>
							))}
							<div className="border-t pt-3 mt-3">
								<div className="flex justify-between items-center font-semibold text-lg">
									<span>Order Total:</span>
									<span>
										₹{order.totalAmount || order.total || 0}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</ModalContent>
		</Modal>
	);
}
