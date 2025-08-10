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
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
	const [materialFilter, setMaterialFilter] = useState("all");
	const [stockFilter, setStockFilter] = useState("all");

	const [productForm, setProductForm] = useState({
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

	// Create product mutation
	const createProductMutation = useMutation({
		mutationFn: async (productData: any) => {
			const response = await fetch("/api/admin/products", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("sessionId")}`,
				},
				body: JSON.stringify({
					...productData,
					images: productData.images.filter((img: string) => img.trim()),
				}),
			});
			if (!response.ok) throw new Error("Failed to create product");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
			setIsProductDialogOpen(false);
			resetForm();
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
		mutationFn: async ({ id, data }: { id: string; data: any }) => {
			const response = await fetch(`/api/admin/products/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("sessionId")}`,
				},
				body: JSON.stringify({
					...data,
					images: data.images.filter((img: string) => img.trim()),
				}),
			});
			if (!response.ok) throw new Error("Failed to update product");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
			setIsProductDialogOpen(false);
			resetForm();
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
			material: "",
			countryOfOrigin: "",
			images: [""],
			dimensions: "",
			weight: "",
			inStock: true,
		});
		setEditingProduct(null);
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

	// Filter products
	const filteredProducts = useMemo(() => {
		return products.filter((product) => {
			const matchesSearch =
				searchQuery === "" ||
				product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				product.asin.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesMaterial =
				materialFilter === "all" || product.material === materialFilter;
			const matchesStock =
				stockFilter === "all" ||
				(stockFilter === "in-stock" && product.inStock) ||
				(stockFilter === "out-of-stock" && !product.inStock);
			return matchesSearch && matchesMaterial && matchesStock;
		});
	}, [products, searchQuery, materialFilter, stockFilter]);

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
					<Dialog
						open={isProductDialogOpen}
						onOpenChange={setIsProductDialogOpen}
					>
						<DialogTrigger asChild>
							<Button onClick={() => resetForm()}>
								<Plus className="h-4 w-4 mr-2" />
								Add Product
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>
									{editingProduct ? "Edit Product" : "Add New Product"}
								</DialogTitle>
							</DialogHeader>
							<form onSubmit={handleSubmitProduct} className="space-y-4">
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
										<Input
											id="material"
											value={productForm.material}
											onChange={(e) =>
												setProductForm((prev) => ({
													...prev,
													material: e.target.value,
												}))
											}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="countryOfOrigin">Country of Origin</Label>
										<Input
											id="countryOfOrigin"
											value={productForm.countryOfOrigin}
											onChange={(e) =>
												setProductForm((prev) => ({
													...prev,
													countryOfOrigin: e.target.value,
												}))
											}
											required
										/>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="dimensions">Dimensions</Label>
										<Input
											id="dimensions"
											value={productForm.dimensions}
											onChange={(e) =>
												setProductForm((prev) => ({
													...prev,
													dimensions: e.target.value,
												}))
											}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="weight">Weight</Label>
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
						</DialogContent>
					</Dialog>
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
						<Select value={materialFilter} onValueChange={setMaterialFilter}>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Material" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Materials</SelectItem>
								<SelectItem value="Wood">Wood</SelectItem>
								<SelectItem value="Textile">Textile</SelectItem>
								<SelectItem value="Ceramic">Ceramic</SelectItem>
								<SelectItem value="Metal">Metal</SelectItem>
								<SelectItem value="Leather">Leather</SelectItem>
								<SelectItem value="Bamboo">Bamboo</SelectItem>
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