import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalTitle,
	ModalTrigger,
} from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
	Plus,
	Edit,
	Trash2,
	X,
	Package,
	Grid,
	List,
	Filter,
	Search,
} from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export default function AdminProducts() {
	const { user } = useAuth();
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [searchQuery, setSearchQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [materialFilter, setMaterialFilter] = useState("all");
	const [stockFilter, setStockFilter] = useState("all");

	const [productForm, setProductForm] = useState({
		asin: "",
		name: "",
		description: "",
		originalPrice: "",
		discountedPrice: "",
		category: "",
		material: "",
		countryOfOrigin: "",
		images: [""],
		dimensions: {
			length: "",
			width: "",
			height: "",
			unit: "inch" as "inch" | "cm",
		},
		weight: {
			value: "",
			unit: "g" as "g" | "kg",
		},
		inStock: true,
	});

	// Fetch products
	const { data: products = [] } = useQuery<Product[]>({
		queryKey: ["admin", "products"],
		queryFn: async () => {
			const response = await fetch("/api/products", {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("sessionId")}`,
				},
			});
			if (!response.ok) throw new Error("Failed to fetch products");
			return response.json();
		},
	});

	// Fetch config data
	const { data: categories = [] } = useQuery<string[]>({
		queryKey: ["config", "categories"],
		queryFn: async () => {
			const response = await fetch("/api/config/categories");
			if (!response.ok) throw new Error("Failed to fetch categories");
			return response.json();
		},
	});

	const { data: materials = [] } = useQuery<string[]>({
		queryKey: ["config", "materials"],
		queryFn: async () => {
			const response = await fetch("/api/config/materials");
			if (!response.ok) throw new Error("Failed to fetch materials");
			return response.json();
		},
	});

	const { data: countries = [] } = useQuery<string[]>({
		queryKey: ["config", "countries"],
		queryFn: async () => {
			const response = await fetch("/api/config/countries");
			if (!response.ok) throw new Error("Failed to fetch countries");
			return response.json();
		},
	});

	// Create product mutation
	const createProductMutation = useMutation({
		mutationFn: async (productData: any) => {
			const response = await fetch("/api/admin/products", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("sessionId")}`,
				},
				body: JSON.stringify(productData),
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to create product");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
			toast({
				title: "Success",
				description: "Product created successfully",
			});
			setIsProductDialogOpen(false);
			resetForm();
		},
		onError: (error: any) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	// Update product mutation
	const updateProductMutation = useMutation({
		mutationFn: async ({
			id,
			productData,
		}: {
			id: string;
			productData: any;
		}) => {
			const response = await fetch(`/api/admin/products/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("sessionId")}`,
				},
				body: JSON.stringify(productData),
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to update product");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
			toast({
				title: "Success",
				description: "Product updated successfully",
			});
			setIsProductDialogOpen(false);
			setEditingProduct(null);
			resetForm();
		},
		onError: (error: any) => {
			toast({
				title: "Error",
				description: error.message,
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
					Authorization: `Bearer ${localStorage.getItem("sessionId")}`,
				},
			});
			if (!response.ok) throw new Error("Failed to delete product");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
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

	// Toggle featured status mutation
	const toggleFeaturedMutation = useMutation({
		mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
			const response = await fetch(`/api/admin/products/${id}/featured`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("sessionId")}`,
				},
				body: JSON.stringify({ featured }),
			});
			if (!response.ok) throw new Error("Failed to update featured status");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
			toast({
				title: "Success",
				description: "Featured status updated successfully",
			});
		},
		onError: () => {
			toast({
				title: "Error",
				description: "Failed to update featured status",
				variant: "destructive",
			});
		},
	});

	const resetForm = () => {
		setProductForm({
			asin: "",
			name: "",
			description: "",
			originalPrice: "",
			discountedPrice: "",
			category: "",
			material: "",
			countryOfOrigin: "",
			images: [""],
			dimensions: {
				length: "",
				width: "",
				height: "",
				unit: "inch",
			},
			weight: {
				value: "",
				unit: "g",
			},
			inStock: true,
		});
		setEditingProduct(null);
	};

	const openEditProduct = (product: Product) => {
		setEditingProduct(product);
		setProductForm({
			asin: product.asin || "",
			name: product.name,
			description: product.description,
			originalPrice: product.originalPrice,
			discountedPrice: product.discountedPrice || "",
			category: product.category || "",
			material: product.material || "",
			countryOfOrigin: product.countryOfOrigin || "",
			images: product.images && product.images.length > 0 ? product.images : [""],
			dimensions: {
				length: product.dimensions?.length?.toString() || "",
				width: product.dimensions?.width?.toString() || "",
				height: product.dimensions?.height?.toString() || "",
				unit: product.dimensions?.unit || "inch",
			},
			weight: {
				value: product.weight?.value?.toString() || "",
				unit: product.weight?.unit || "g",
			},
			inStock: product.inStock ?? true,
		});
		setIsProductDialogOpen(true);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const productData = {
			...productForm,
			originalPrice: productForm.originalPrice,
			discountedPrice: productForm.discountedPrice || null,
			images: productForm.images.filter((img) => img.trim() !== ""),
			dimensions: productForm.dimensions.length && productForm.dimensions.width ? {
				length: parseFloat(productForm.dimensions.length) || 0,
				width: parseFloat(productForm.dimensions.width) || 0,
				height: parseFloat(productForm.dimensions.height) || 0,
				unit: productForm.dimensions.unit,
			} : null,
			weight: productForm.weight.value ? {
				value: parseFloat(productForm.weight.value) || 0,
				unit: productForm.weight.unit,
			} : null,
		};

		if (editingProduct) {
			updateProductMutation.mutate({
				id: editingProduct.id,
				productData,
			});
		} else {
			createProductMutation.mutate(productData);
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

	// Filter products
	const filteredProducts = useMemo(() => {
		return products.filter((product) => {
			const matchesSearch =
				searchQuery === "" ||
				product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				product.asin.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesCategory =
				categoryFilter === "all" || product.category === categoryFilter;
			const matchesMaterial =
				materialFilter === "all" || product.material === materialFilter;
			const matchesStock =
				stockFilter === "all" ||
				(stockFilter === "in-stock" && product.inStock) ||
				(stockFilter === "out-of-stock" && !product.inStock);
			return matchesSearch && matchesCategory && matchesMaterial && matchesStock;
		});
	}, [products, searchQuery, categoryFilter, materialFilter, stockFilter]);

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
			<div className="flex items-center justify-between mb-8">
				<div className="flex items-center gap-2">
					<Package className="h-6 w-6" />
					<h1 className="text-3xl font-bold">Products Management</h1>
				</div>
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
						<Button
							size="sm"
							variant={viewMode === "grid" ? "default" : "ghost"}
							onClick={() => setViewMode("grid")}
						>
							<Grid className="h-4 w-4" />
						</Button>
						<Button
							size="sm"
							variant={viewMode === "list" ? "default" : "ghost"}
							onClick={() => setViewMode("list")}
						>
							<List className="h-4 w-4" />
						</Button>
					</div>
					<Modal open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
						<ModalTrigger asChild>
							<Button onClick={resetForm}>
								<Plus className="h-4 w-4 mr-2" />
								Add Product
							</Button>
						</ModalTrigger>
						<ModalContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
							<ModalHeader>
								<ModalTitle>
									{editingProduct ? "Edit Product" : "Add New Product"}
								</ModalTitle>
							</ModalHeader>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="asin">ASIN</Label>
										<Input
											id="asin"
											value={productForm.asin}
											onChange={(e) =>
												setProductForm((prev) => ({
													...prev,
													asin: e.target.value,
												}))
											}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="name">Name</Label>
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

								<div className="space-y-2">
									<Label htmlFor="description">Description</Label>
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

								<div className="space-y-2">
									<Label htmlFor="category">Category</Label>
									<Select
										value={productForm.category}
										onValueChange={(value) =>
											setProductForm((prev) => ({
												...prev,
												category: value,
											}))
										}>
										<SelectTrigger>
											<SelectValue placeholder="Select category" />
										</SelectTrigger>
										<SelectContent>
											{categories.map((category) => (
												<SelectItem key={category} value={category}>
													{category}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="originalPrice">Original Price</Label>
										<Input
											id="originalPrice"
											value={productForm.originalPrice}
											onChange={(e) =>
												setProductForm((prev) => ({
													...prev,
													originalPrice: e.target.value,
												}))
											}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="discountedPrice">Discounted Price</Label>
										<Input
											id="discountedPrice"
											value={productForm.discountedPrice}
											onChange={(e) =>
												setProductForm((prev) => ({
													...prev,
													discountedPrice: e.target.value,
												}))
											}
										/>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="material">Material</Label>
										<Select
											value={productForm.material}
											onValueChange={(value) =>
												setProductForm((prev) => ({
													...prev,
													material: value,
												}))
											}>
											<SelectTrigger>
												<SelectValue placeholder="Select material" />
											</SelectTrigger>
											<SelectContent>
												{materials.map((material) => (
													<SelectItem key={material} value={material}>
														{material}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label htmlFor="countryOfOrigin">Country of Origin</Label>
										<Select
											value={productForm.countryOfOrigin}
											onValueChange={(value) =>
												setProductForm((prev) => ({
													...prev,
													countryOfOrigin: value,
												}))
											}>
											<SelectTrigger>
												<SelectValue placeholder="Select country" />
											</SelectTrigger>
											<SelectContent>
												{countries.map((country) => (
													<SelectItem key={country} value={country}>
														{country}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="space-y-4">
									<div className="space-y-2">
										<Label>Dimensions</Label>
										<div className="grid grid-cols-4 gap-2">
											<div>
												<Label htmlFor="length" className="text-xs">Length</Label>
												<Input
													id="length"
													type="number"
													placeholder="L"
													value={productForm.dimensions.length}
													onChange={(e) =>
														setProductForm((prev) => ({
															...prev,
															dimensions: {
																...prev.dimensions,
																length: e.target.value,
															},
														}))
													}
												/>
											</div>
											<div>
												<Label htmlFor="width" className="text-xs">Width</Label>
												<Input
													id="width"
													type="number"
													placeholder="W"
													value={productForm.dimensions.width}
													onChange={(e) =>
														setProductForm((prev) => ({
															...prev,
															dimensions: {
																...prev.dimensions,
																width: e.target.value,
															},
														}))
													}
												/>
											</div>
											<div>
												<Label htmlFor="height" className="text-xs">Height</Label>
												<Input
													id="height"
													type="number"
													placeholder="H"
													value={productForm.dimensions.height}
													onChange={(e) =>
														setProductForm((prev) => ({
															...prev,
															dimensions: {
																...prev.dimensions,
																height: e.target.value,
															},
														}))
													}
												/>
											</div>
											<div>
												<Label htmlFor="dimensionUnit" className="text-xs">Unit</Label>
												<Select
													value={productForm.dimensions.unit}
													onValueChange={(value: "inch" | "cm") =>
														setProductForm((prev) => ({
															...prev,
															dimensions: {
																...prev.dimensions,
																unit: value,
															},
														}))
													}>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="inch">inch</SelectItem>
														<SelectItem value="cm">cm</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
									</div>

									<div className="space-y-2">
										<Label>Weight</Label>
										<div className="grid grid-cols-2 gap-2">
											<div>
												<Input
													type="number"
													placeholder="Weight"
													value={productForm.weight.value}
													onChange={(e) =>
														setProductForm((prev) => ({
															...prev,
															weight: {
																...prev.weight,
																value: e.target.value,
															},
														}))
													}
												/>
											</div>
											<div>
												<Select
													value={productForm.weight.unit}
													onValueChange={(value: "g" | "kg") =>
														setProductForm((prev) => ({
															...prev,
															weight: {
																...prev.weight,
																unit: value,
															},
														}))
													}>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="g">g</SelectItem>
														<SelectItem value="kg">kg</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
									</div>
								</div>

								<div className="space-y-2">
									<Label>Images</Label>
									{productForm.images.map((image, index) => (
										<div key={index} className="flex space-x-2">
											<Input
												value={image}
												onChange={(e) =>
													updateImageField(index, e.target.value)
												}
												placeholder="Image URL"
											/>
											{productForm.images.length > 1 && (
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => removeImageField(index)}
												>
													<X className="h-4 w-4" />
												</Button>
											)}
										</div>
									))}
									<Button
										type="button"
										variant="outline"
										onClick={addImageField}
									>
										<Plus className="h-4 w-4 mr-2" />
										Add Image
									</Button>
								</div>

								<div className="flex items-center space-x-2">
									<Checkbox
										id="inStock"
										checked={productForm.inStock}
										onCheckedChange={(checked) =>
											setProductForm((prev) => ({
												...prev,
												inStock: checked as boolean,
											}))
										}
									/>
									<Label htmlFor="inStock">In Stock</Label>
								</div>

								<div className="flex space-x-2">
									<Button type="submit" className="flex-1">
										{editingProduct ? "Update Product" : "Create Product"}
									</Button>
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsProductDialogOpen(false)}
									>
										Cancel
									</Button>
								</div>
							</form>
						</ModalContent>
					</Modal>
				</div>
			</div>

			{/* Filters */}
			<div className="flex flex-col lg:flex-row gap-4 mb-6">
				<div className="flex items-center gap-2 flex-1">
					<Search className="h-4 w-4 text-gray-500" />
					<Input
						placeholder="Search products by name or ASIN..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="flex-1"
					/>
				</div>
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<Filter className="h-4 w-4 text-gray-500" />
						<Select value={categoryFilter} onValueChange={setCategoryFilter}>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Categories</SelectItem>
								{categories.map((category) => (
									<SelectItem key={category} value={category}>
										{category}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select value={materialFilter} onValueChange={setMaterialFilter}>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Material" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Materials</SelectItem>
								{materials.map((material) => (
									<SelectItem key={material} value={material}>
										{material}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<Select value={stockFilter} onValueChange={setStockFilter}>
						<SelectTrigger className="w-[140px]">
							<SelectValue placeholder="Stock" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Items</SelectItem>
							<SelectItem value="in-stock">In Stock</SelectItem>
							<SelectItem value="out-of-stock">Out of Stock</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div
				className={
					viewMode === "grid"
						? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
						: "grid gap-4"
				}
			>
				{filteredProducts.length === 0 ? (
					<Card>
						<CardContent className="p-6">
							<p className="text-center text-gray-500">No products found</p>
						</CardContent>
					</Card>
				) : (
					filteredProducts.map((product) => (
						<Card
							key={product.id}
							className={viewMode === "list" ? "w-full" : ""}
						>
							{viewMode === "grid" ? (
								<>
									<CardHeader>
										<div className="aspect-square w-full mb-4 bg-gray-100 rounded-lg overflow-hidden">
											{product.images[0] && (
												<img
													src={product.images[0]}
													alt={product.name}
													className="w-full h-full object-cover"
												/>
											)}
										</div>
										<div>
											<CardTitle className="flex items-center gap-2 text-sm">
												{product.name}
												{product.featured && (
													<span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs">
														★
													</span>
												)}
											</CardTitle>
											<p className="text-sm text-gray-600 mt-1">
												₹{product.originalPrice}
											</p>
											<p
												className={`text-xs ${product.inStock ? "text-green-600" : "text-red-600"}`}
											>
												{product.inStock ? "In Stock" : "Out of Stock"}
											</p>
										</div>
									</CardHeader>
									<CardContent className="pt-0">
										<div className="flex space-x-1 mb-2">
											<Button
												size="sm"
												variant="outline"
												onClick={() => openEditProduct(product)}
											>
												<Edit className="h-3 w-3" />
											</Button>
											<Button
												size="sm"
												variant="destructive"
												onClick={() => deleteProductMutation.mutate(product.id)}
											>
												<Trash2 className="h-3 w-3" />
											</Button>
										</div>
										<Button
											size="sm"
											onClick={() =>
												toggleFeaturedMutation.mutate({
													id: product.id,
													featured: !product.featured,
												})
											}
											className={`w-full ${product.featured ? "bg-yellow-600 hover:bg-yellow-700" : ""}`}
										>
											{product.featured ? "★ Featured" : "Feature"}
										</Button>
									</CardContent>
								</>
							) : (
								<>
									<CardHeader>
										<div className="flex justify-between items-start">
											<div>
												<CardTitle className="flex items-center gap-2">
													{product.name}
													{product.featured && (
														<span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs">
															Featured
														</span>
													)}
												</CardTitle>
												<CardDescription>{product.description}</CardDescription>
											</div>
											<div className="text-right">
												<p className="text-lg font-semibold">
													₹{product.originalPrice}
												</p>
												{product.discountedPrice && (
													<p className="text-sm text-green-600">
														Sale: ₹{product.discountedPrice}
													</p>
												)}
											</div>
										</div>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
											<div>
												<p className="text-sm text-gray-500">ASIN</p>
												<p className="font-medium">{product.asin}</p>
											</div>
											<div>
												<p className="text-sm text-gray-500">Material</p>
												<p className="font-medium">{product.material}</p>
											</div>
											<div>
												<p className="text-sm text-gray-500">Origin</p>
												<p className="font-medium">{product.countryOfOrigin}</p>
											</div>
											<div>
												<p className="text-sm text-gray-500">Stock</p>
												<p
													className={`font-medium ${
														product.inStock ? "text-green-600" : "text-red-600"
													}`}
												>
													{product.inStock ? "In Stock" : "Out of Stock"}
												</p>
											</div>
										</div>
										<div className="flex space-x-2">
											<Button
												onClick={() =>
													toggleFeaturedMutation.mutate({
														id: product.id,
														featured: !product.featured,
													})
												}
												className={
													product.featured
														? "bg-yellow-600 hover:bg-yellow-700"
														: ""
												}
											>
												{product.featured ? "Remove Featured" : "Feature This"}
											</Button>
											<div className="flex space-x-2">
												<Button
													variant="outline"
													onClick={() => openEditProduct(product)}
												>
													<Edit className="h-4 w-4" />
												</Button>
												<Button
													variant="destructive"
													onClick={() =>
														deleteProductMutation.mutate(product.id)
													}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>
									</CardContent>
								</>
							)}
						</Card>
					))
				)}
			</div>
		</div>
	);
}