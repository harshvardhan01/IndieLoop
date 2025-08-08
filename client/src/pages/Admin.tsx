import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Product, Order, SupportMessage } from "@/types";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ProductFormData {
	asin?: string;
	name: string;
	description: string;
	originalPrice: string;
	discountedPrice: string;
	material: string;
	countryOfOrigin: string;
	images: string[];
	dimensions: string;
	weight: string;
	inStock: boolean;
}

export default function Admin() {
	// Use countries from backend config to avoid duplicates and keep centralized
	const { data: countries = [] } = useQuery<string[]>({
		queryKey: ["config", "countries"],
		queryFn: async () => {
			const response = await fetch("/api/config/countries");
			if (!response.ok) throw new Error("Failed to fetch countries");
			return response.json();
		},
	});
	const { user } = useAuth();
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
	const [productForm, setProductForm] = useState<ProductFormData>({
		name: "",
		description: "",
		originalPrice: "",
		discountedPrice: "",
		material: "",
		countryOfOrigin: "",
		images: [""],
		dimensions: "",
		weight: "",
		inStock: true,
	});

	// Fetch products
	const { data: products = [] } = useQuery<Product[]>({
		queryKey: ["products"],
		queryFn: async () => {
			const response = await fetch("/api/products");
			if (!response.ok) throw new Error("Failed to fetch products");
			return response.json();
		},
	});

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

	// Fetch support messages
	const { data: supportMessages = [] } = useQuery<SupportMessage[]>({
		queryKey: ["admin", "support"],
		queryFn: async () => {
			const response = await fetch("/api/admin/support", {
				headers: {
					Authorization: `Bearer ${localStorage.getItem(
						"sessionId"
					)}`,
				},
			});
			if (!response.ok)
				throw new Error("Failed to fetch support messages");
			return response.json();
		},
	});

	// Create product mutation
	const createProductMutation = useMutation({
		mutationFn: async (data: ProductFormData) => {
			const response = await fetch("/api/admin/products", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem(
						"sessionId"
					)}`,
				},
				body: JSON.stringify({
					...data,
					images: data.images.filter((img) => img.trim()),
				}),
			});
			if (!response.ok) throw new Error("Failed to create product");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
			setIsProductDialogOpen(false);
			resetProductForm();
			toast({
				title: "Success",
				description: "Product created successfully",
			});
		},
		onError: () => {
			toast({
				title: "Error",
				description: "Failed to create product",
				variant: "destructive",
			});
		},
	});

	// Update product mutation
	const updateProductMutation = useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: ProductFormData;
		}) => {
			const response = await fetch(`/api/admin/products/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem(
						"sessionId"
					)}`,
				},
				body: JSON.stringify({
					...data,
					images: data.images.filter((img) => img.trim()),
				}),
			});
			if (!response.ok) throw new Error("Failed to update product");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
			setIsProductDialogOpen(false);
			setEditingProduct(null);
			resetProductForm();
			toast({
				title: "Success",
				description: "Product updated successfully",
			});
		},
		onError: () => {
			toast({
				title: "Error",
				description: "Failed to update product",
				variant: "destructive",
			});
		},
	});

	// Delete product mutation
	const deleteProductMutation = useMutation({
		mutationFn: async (id: string) => {
			const response = await fetch(`/api/admin/products/${id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${localStorage.getItem(
						"sessionId"
					)}`,
				},
			});
			if (!response.ok) throw new Error("Failed to delete product");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
			toast({
				title: "Success",
				description: "Product deleted successfully",
			});
		},
		onError: () => {
			toast({
				title: "Error",
				description: "Failed to delete product",
				variant: "destructive",
			});
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

	// Update support message status mutation
	const updateSupportStatusMutation = useMutation({
		mutationFn: async ({ id, status }: { id: string; status: string }) => {
			const response = await fetch(`/api/admin/support/${id}/status`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem(
						"sessionId"
					)}`,
				},
				body: JSON.stringify({ status }),
			});
			if (!response.ok)
				throw new Error("Failed to update support message status");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "support"] });
			toast({
				title: "Success",
				description: "Support ticket status updated successfully",
			});
		},
		onError: () => {
			toast({
				title: "Error",
				description: "Failed to update support ticket status",
				variant: "destructive",
			});
		},
	});

	const resetProductForm = () => {
		setProductForm({
			asin: "",
			name: "",
			description: "",
			originalPrice: "",
			discountedPrice: "",
			material: "",
			countryOfOrigin: "",
			images: [""],
			dimensions: "",
			weight: "",
			inStock: true,
		});
	};

	const openEditProduct = (product: Product) => {
		setEditingProduct(product);
		setProductForm({
			asin: product.asin,
			name: product.name,
			description: product.description,
			originalPrice: product.originalPrice,
			discountedPrice: product.discountedPrice || "",
			material: product.material,
			countryOfOrigin: product.countryOfOrigin,
			images: product.images.length ? product.images : [""],
			dimensions: product.dimensions || "",
			weight: product.weight || "",
			inStock: product.inStock,
		});
		setIsProductDialogOpen(true);
	};

	const handleSubmitProduct = (e: React.FormEvent) => {
		e.preventDefault();
		if (editingProduct) {
			updateProductMutation.mutate({
				id: editingProduct.id,
				data: productForm,
			});
		} else {
			createProductMutation.mutate(productForm);
		}
	};

	const addImageField = () => {
		setProductForm((prev) => ({ ...prev, images: [...prev.images, ""] }));
	};

	const updateImageField = (index: number, value: string) => {
		setProductForm((prev) => ({
			...prev,
			images: prev.images.map((img, i) => (i === index ? value : img)),
		}));
	};

	const removeImageField = (index: number) => {
		setProductForm((prev) => ({
			...prev,
			images: prev.images.filter((_, i) => i !== index),
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
			<h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

			<Tabs defaultValue="products" className="space-y-6">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="products">Products</TabsTrigger>
					<TabsTrigger value="orders">Orders</TabsTrigger>
					<TabsTrigger value="support">Support</TabsTrigger>
				</TabsList>

				<TabsContent value="products" className="space-y-6">
					<div className="flex justify-between items-center">
						<h2 className="text-2xl font-semibold">
							Product Management
						</h2>
						<Dialog
							open={isProductDialogOpen}
							onOpenChange={setIsProductDialogOpen}>
							<DialogTrigger asChild>
								<Button onClick={resetProductForm}>
									<Plus className="h-4 w-4 mr-2" />
									Add Product
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
								<DialogHeader>
									<DialogTitle>
										{editingProduct
											? "Edit Product"
											: "Add New Product"}
									</DialogTitle>
									<DialogDescription>
										{editingProduct
											? "Update the product details below."
											: "Fill in the product details below."}
									</DialogDescription>
								</DialogHeader>
								<form
									onSubmit={handleSubmitProduct}
									className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<Label htmlFor="asin">
												ASIN Code
											</Label>
											<Input
												id="asin"
												value={productForm.asin || ""}
												onChange={(e) =>
													setProductForm({
														...productForm,
														asin: e.target.value,
													})
												}
												placeholder="Auto-generated if empty"
												maxLength={10}
											/>
											<p className="text-xs text-gray-500 mt-1">
												Leave empty to auto-generate
											</p>
										</div>
										<div>
											<Label htmlFor="name">
												Product Name
											</Label>
											<Input
												id="name"
												value={productForm.name}
												onChange={(e) =>
													setProductForm((prev) => ({
														...prev,
														name: e.target.value,
													}))
												}
												required
											/>
										</div>
									</div>
									<div>
										<Label htmlFor="description">
											Description
										</Label>
										<Textarea
											id="description"
											value={productForm.description}
											onChange={(e) =>
												setProductForm((prev) => ({
													...prev,
													description: e.target.value,
												}))
											}
											required
										/>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<Label htmlFor="originalPrice">
												Original Price (₹)
											</Label>
											<Input
												id="originalPrice"
												type="number"
												step="0.01"
												value={
													productForm.originalPrice
												}
												onChange={(e) =>
													setProductForm((prev) => ({
														...prev,
														originalPrice:
															e.target.value,
													}))
												}
												required
											/>
										</div>
										<div>
											<Label htmlFor="discountedPrice">
												Discounted Price (₹)
											</Label>
											<Input
												id="discountedPrice"
												type="number"
												step="0.01"
												value={
													productForm.discountedPrice
												}
												onChange={(e) =>
													setProductForm((prev) => ({
														...prev,
														discountedPrice:
															e.target.value,
													}))
												}
											/>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<Label htmlFor="countryOfOrigin">
												Country of Origin
											</Label>
											<Select
												value={
													productForm.countryOfOrigin
												}
												onValueChange={(value) =>
													setProductForm((prev) => ({
														...prev,
														countryOfOrigin: value,
													}))
												}>
												<SelectTrigger>
													<SelectValue placeholder="Select a country" />
												</SelectTrigger>
												<SelectContent>
													{countries.map(
														(country) => (
															<SelectItem
																key={country}
																value={country}>
																{country}
															</SelectItem>
														)
													)}
												</SelectContent>
											</Select>
										</div>
										<div>
											<Label htmlFor="inStock">
												In Stock
											</Label>
											<Select
												value={productForm.inStock.toString()}
												onValueChange={(value) =>
													setProductForm((prev) => ({
														...prev,
														inStock:
															value === "true",
													}))
												}>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="true">
														Yes
													</SelectItem>
													<SelectItem value="false">
														No
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<Label htmlFor="dimensions">
												Dimensions
											</Label>
											<Input
												id="dimensions"
												value={productForm.dimensions}
												onChange={(e) =>
													setProductForm((prev) => ({
														...prev,
														dimensions:
															e.target.value,
													}))
												}
											/>
										</div>
										<div>
											<Label htmlFor="weight">
												Weight
											</Label>
											<Input
												id="weight"
												value={productForm.weight}
												onChange={(e) =>
													setProductForm((prev) => ({
														...prev,
														weight: e.target.value,
													}))
												}
											/>
										</div>
									</div>
									<div>
										<Label>Product Images (URLs)</Label>
										{productForm.images.map(
											(image, index) => (
												<div
													key={index}
													className="flex gap-2 mt-2">
													<Input
														value={image}
														onChange={(e) =>
															updateImageField(
																index,
																e.target.value
															)
														}
														placeholder="Image URL"
													/>
													{productForm.images.length >
														1 && (
														<Button
															type="button"
															variant="outline"
															size="icon"
															onClick={() =>
																removeImageField(
																	index
																)
															}>
															<Trash2 className="h-4 w-4" />
														</Button>
													)}
												</div>
											)
										)}
										<Button
											type="button"
											variant="outline"
											onClick={addImageField}
											className="mt-2">
											Add Another Image
										</Button>
									</div>
									<div className="flex justify-end space-x-2">
										<Button
											type="button"
											variant="outline"
											onClick={() =>
												setIsProductDialogOpen(false)
											}>
											Cancel
										</Button>
										<Button type="submit">
											{editingProduct
												? "Update Product"
												: "Create Product"}
										</Button>
									</div>
								</form>
							</DialogContent>
						</Dialog>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{products.map((product) => (
							<Card key={product.id}>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div>
											<CardTitle className="text-lg">
												{product.name}
											</CardTitle>
											<p className="text-sm text-gray-600 font-mono">
												ASIN: {product.asin}
											</p>
											<p className="text-sm text-gray-600">
												{product.material} •{" "}
												{product.countryOfOrigin}
											</p>
										</div>
										<Badge
											variant={
												product.inStock
													? "default"
													: "secondary"
											}>
											{product.inStock
												? "In Stock"
												: "Out of Stock"}
										</Badge>
									</div>
								</CardHeader>
								<CardContent>
									<div className="flex justify-between items-center mb-4">
										<div>
											<span className="text-lg font-bold">
												₹{product.originalPrice}
											</span>
											{product.discountedPrice && (
												<span className="text-sm text-gray-500 line-through ml-2">
													₹{product.discountedPrice}
												</span>
											)}
										</div>
									</div>
									<div className="flex space-x-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												openEditProduct(product)
											}>
											<Edit className="h-4 w-4" />
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												deleteProductMutation.mutate(
													product.id
												)
											}>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</TabsContent>

				<TabsContent value="orders" className="space-y-6">
					<h2 className="text-2xl font-semibold">Order Management</h2>
					<div className="space-y-4">
						{orders.map((order) => (
							<Card key={order.id}>
								<CardHeader>
									<div className="flex justify-between items-start">
										<div>
											<CardTitle>
												Order #{order.id.slice(-8)}
											</CardTitle>
											<CardDescription>
												Total: {order.currency}{" "}
												{order.totalAmount} • Status:{" "}
												{order.status}
											</CardDescription>
										</div>
										<div className="flex space-x-2">
											<Select
												value={order.status}
												onValueChange={(status) =>
													updateOrderStatusMutation.mutate(
														{ id: order.id, status }
													)
												}>
												<SelectTrigger className="w-32">
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
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										<p>
											<strong>Items:</strong>
										</p>
										<ul>
											{order.items.map((item) => (
												<li key={item.productId}>
													{item.quantity} x{" "}
													{item.product.asin} -{" "}
													{item.product.name} (ID:{" "}
													{item.product.id})
												</li>
											))}
										</ul>
										<p>
											<strong>Created:</strong>{" "}
											{new Date(
												order.createdAt
											).toLocaleDateString()}
										</p>
										{order.trackingNumber && (
											<p>
												<strong>Tracking:</strong>{" "}
												{order.trackingNumber}
											</p>
										)}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</TabsContent>

				<TabsContent value="support" className="space-y-6">
					<h2 className="text-2xl font-semibold">Support Messages</h2>
					<div className="space-y-4">
						{supportMessages.map((message) => (
							<Card key={message.id}>
								<CardHeader>
									<div className="flex justify-between items-start">
										<div>
											<CardTitle>
												{message.name}
											</CardTitle>
											<CardDescription>
												{message.email}
											</CardDescription>
										</div>
										<div className="flex items-center space-x-2">
											<Select
												value={message.status}
												onValueChange={(status) =>
													updateSupportStatusMutation.mutate(
														{
															id: message.id,
															status,
														}
													)
												}>
												<SelectTrigger className="w-32">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="open">
														Open
													</SelectItem>
													<SelectItem value="in_progress">
														In Progress
													</SelectItem>
													<SelectItem value="resolved">
														Resolved
													</SelectItem>
													<SelectItem value="closed">
														Closed
													</SelectItem>
												</SelectContent>
											</Select>
											<Badge
												variant={
													message.status === "open"
														? "destructive"
														: message.status ===
														  "resolved"
														? "default"
														: "secondary"
												}>
												{message.status.replace(
													"_",
													" "
												)}
											</Badge>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<p className="mb-2">{message.message}</p>
									<div className="text-sm text-gray-500">
										<p>
											Created:{" "}
											{new Date(
												message.createdAt
											).toLocaleDateString()}
										</p>
										{message.phone && (
											<p>Phone: {message.phone}</p>
										)}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
