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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
	Plus,
	Edit,
	Trash2,
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
import ProductForm from "@/components/forms/ProductForm";

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

	// Fetch products
	const { data: products = [] } = useQuery<Product[]>({
		queryKey: ["admin", "products"],
		queryFn: async () => {
			const response = await fetch("/api/products", {
				headers: {
					Authorization: `Bearer ${localStorage.getItem(
						"sessionId"
					)}`,
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

	const { data: artisans = [] } = useQuery({
		queryKey: ["admin", "artisans"],
		queryFn: async () => {
			const response = await fetch("/api/artisans", {
				headers: {
					Authorization: `Bearer ${localStorage.getItem(
						"sessionId"
					)}`,
				},
			});
			if (!response.ok) throw new Error("Failed to fetch artisans");
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
		mutationFn: async ({
			id,
			featured,
		}: {
			id: string;
			featured: boolean;
		}) => {
			const response = await fetch(`/api/admin/products/${id}/featured`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem(
						"sessionId"
					)}`,
				},
				body: JSON.stringify({ featured }),
			});
			if (!response.ok)
				throw new Error("Failed to update featured status");
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

	const openEditProduct = (product: Product) => {
		setEditingProduct(product);
		setIsProductDialogOpen(true);
	};

	const handleFormSuccess = () => {
		setEditingProduct(null);
	};

	// Filter products
	const filteredProducts = useMemo(() => {
		return products.filter((product) => {
			const matchesSearch =
				searchQuery === "" ||
				product.name
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				product.asin.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesCategory =
				categoryFilter === "all" || product.category === categoryFilter;
			const matchesMaterial =
				materialFilter === "all" || product.material === materialFilter;
			const matchesStock =
				stockFilter === "all" ||
				(stockFilter === "in-stock" && product.inStock) ||
				(stockFilter === "out-of-stock" && !product.inStock);
			return (
				matchesSearch &&
				matchesCategory &&
				matchesMaterial &&
				matchesStock
			);
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
							onClick={() => setViewMode("grid")}>
							<Grid className="h-4 w-4" />
						</Button>
						<Button
							size="sm"
							variant={viewMode === "list" ? "default" : "ghost"}
							onClick={() => setViewMode("list")}>
							<List className="h-4 w-4" />
						</Button>
					</div>
					<Button
						onClick={() => {
							setEditingProduct(null);
							setIsProductDialogOpen(true);
						}}>
						<Plus className="h-4 w-4 mr-2" />
						Add Product
					</Button>
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
						<Select
							value={categoryFilter}
							onValueChange={setCategoryFilter}>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									All Categories
								</SelectItem>
								{categories.map((category) => (
									<SelectItem key={category} value={category}>
										{category}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select
							value={materialFilter}
							onValueChange={setMaterialFilter}>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Material" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									All Materials
								</SelectItem>
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
							<SelectItem value="out-of-stock">
								Out of Stock
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div
				className={
					viewMode === "grid"
						? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
						: "grid gap-4"
				}>
				{filteredProducts.length === 0 ? (
					<Card>
						<CardContent className="p-6">
							<p className="text-center text-gray-500">
								No products found
							</p>
						</CardContent>
					</Card>
				) : (
					filteredProducts.map((product) => (
						<Card
							key={product.id}
							className={viewMode === "list" ? "w-full" : ""}>
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
											<div className="grid grid-cols-2 md:grid-cols-2 gap-2 mb-2">
												<div>
													<p className="text-sm text-gray-500">
														ASIN
													</p>
													<p className="font-medium">
														{product.asin}
													</p>
												</div>
												<div className="">
													{product.discountedPrice && (
														<p className="text-sm text-green-600">
															Sale: ₹
															{
																product.discountedPrice
															}
														</p>
													)}
													<p className="text-lg font-semibold">
														₹{product.originalPrice}
													</p>
												</div>
												<div>
													<p
														className={`text-sm ${
															product.inStock
																? "text-green-600"
																: "text-red-600"
														}`}>
														{product.inStock
															? "In Stock"
															: "Out of Stock"}
													</p>
												</div>
											</div>
										</div>
									</CardHeader>
									<CardContent className="pt-0">
										<div className="flex space-x-1 mb-2">
											<Button
												size="sm"
												variant="outline"
												onClick={() =>
													openEditProduct(product)
												}>
												<Edit className="h-3 w-3" />
											</Button>
											<Button
												size="sm"
												variant="destructive"
												onClick={() =>
													deleteProductMutation.mutate(
														product.id
													)
												}>
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
											className={`w-full ${
												product.featured
													? "bg-yellow-600 hover:bg-yellow-700"
													: ""
											}`}>
											{product.featured
												? "★ Featured"
												: "Feature"}
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
												<CardDescription>
													{product.description}
												</CardDescription>
											</div>
											<div className="text-right">
												<p className="text-lg font-semibold">
													₹{product.originalPrice}
												</p>
												{product.discountedPrice && (
													<p className="text-sm text-green-600">
														Sale: ₹
														{
															product.discountedPrice
														}
													</p>
												)}
											</div>
										</div>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
											<div>
												<p className="text-sm text-gray-500">
													ASIN
												</p>
												<p className="font-medium">
													{product.asin}
												</p>
											</div>
											<div>
												<p className="text-sm text-gray-500">
													Material
												</p>
												<p className="font-medium">
													{product.material}
												</p>
											</div>
											<div>
												<p className="text-sm text-gray-500">
													Origin
												</p>
												<p className="font-medium">
													{product.countryOfOrigin}
												</p>
											</div>
											<div>
												<p className="text-sm text-gray-500">
													Stock
												</p>
												<p
													className={`font-medium ${
														product.inStock
															? "text-green-600"
															: "text-red-600"
													}`}>
													{product.inStock
														? "In Stock"
														: "Out of Stock"}
												</p>
											</div>
										</div>
										<div className="flex space-x-2">
											<Button
												onClick={() =>
													toggleFeaturedMutation.mutate(
														{
															id: product.id,
															featured:
																!product.featured,
														}
													)
												}
												className={
													product.featured
														? "bg-yellow-600 hover:bg-yellow-700"
														: ""
												}>
												{product.featured
													? "Remove Featured"
													: "Feature This"}
											</Button>
											<div className="flex space-x-2">
												<Button
													variant="outline"
													onClick={() =>
														openEditProduct(product)
													}>
													<Edit className="h-4 w-4" />
												</Button>
												<Button
													variant="destructive"
													onClick={() =>
														deleteProductMutation.mutate(
															product.id
														)
													}>
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

			<ProductForm
				isOpen={isProductDialogOpen}
				onOpenChange={setIsProductDialogOpen}
				editingProduct={editingProduct}
				onSuccess={handleFormSuccess}
			/>
		</div>
	);
}
