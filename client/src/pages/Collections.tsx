
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { Grid, List, Filter, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/ProductCard";
import { Product } from "@shared/schema";

export default function Collections() {
	const location = useLocation();
	const searchParams = new URLSearchParams(location.search);
	const initialSearch = searchParams.get("search") || "";

	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [searchQuery, setSearchQuery] = useState(initialSearch);
	const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [countryFilter, setCountryFilter] = useState("all");
	const [materialFilter, setMaterialFilter] = useState("all");

	// Debounce search query for API calls
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchQuery);
		}, 300);

		return () => clearTimeout(timer);
	}, [searchQuery]);

	const { data: products = [], isLoading } = useQuery({
		queryKey: [
			"/api/products",
			{
				search: debouncedSearch,
				category: categoryFilter,
				country: countryFilter,
				material: materialFilter,
			},
		],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (debouncedSearch) params.append("search", debouncedSearch);
			if (categoryFilter && categoryFilter !== "all") params.append("category", categoryFilter);
			if (countryFilter && countryFilter !== "all") params.append("country", countryFilter);
			if (materialFilter && materialFilter !== "all") params.append("material", materialFilter);

			const response = await fetch(`/api/products?${params}`);
			if (!response.ok) throw new Error("Failed to fetch products");
			return response.json();
		},
	});

	// Fetch categories for filter
	const { data: categories = [] } = useQuery<string[]>({
		queryKey: ["config", "categories"],
		queryFn: async () => {
			const response = await fetch("/api/config/categories");
			if (!response.ok) throw new Error("Failed to fetch categories");
			return response.json();
		},
	});

	// Fetch materials for filter
	const { data: materials = [] } = useQuery<string[]>({
		queryKey: ["config", "materials"],
		queryFn: async () => {
			const response = await fetch("/api/config/materials");
			if (!response.ok) throw new Error("Failed to fetch materials");
			return response.json();
		},
	});

	// Fetch countries for filter
	const { data: countries = [] } = useQuery<string[]>({
		queryKey: ["config", "countries"],
		queryFn: async () => {
			const response = await fetch("/api/config/countries");
			if (!response.ok) throw new Error("Failed to fetch countries");
			return response.json();
		},
	});

	const clearAllFilters = () => {
		setSearchQuery("");
		setCategoryFilter("all");
		setCountryFilter("all");
		setMaterialFilter("all");
	};

	const activeFiltersCount = [
		searchQuery.length > 0,
		categoryFilter !== "all",
		countryFilter !== "all",
		materialFilter !== "all",
	].filter(Boolean).length;

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-craft-brown"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div className="flex items-center justify-between mb-6">
						<h1 className="text-3xl font-display font-bold text-gray-900">
							{searchQuery
								? `Search results for "${searchQuery}"`
								: "All Products"}
						</h1>

						<div className="flex items-center space-x-4">
							<div className="flex items-center border border-gray-300 rounded-md">
								<Button
									onClick={() => setViewMode("grid")}
									variant={
										viewMode === "grid"
											? "default"
											: "ghost"
									}
									size="sm"
									className="rounded-r-none">
									<Grid className="h-4 w-4" />
								</Button>
								<Button
									onClick={() => setViewMode("list")}
									variant={
										viewMode === "list"
											? "default"
											: "ghost"
									}
									size="sm"
									className="rounded-l-none">
									<List className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>

					{/* Live Search Bar */}
					<div className="relative mb-6">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
						<Input
							placeholder="Search products by name, category, material..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 max-w-md"
						/>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
				{/* Left Sidebar - Filters */}
				<aside className="w-64 flex-shrink-0">
					<Card className="sticky top-4">
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle className="flex items-center">
									<Filter className="h-5 w-5 mr-2" />
									Filters
									{activeFiltersCount > 0 && (
										<Badge
											variant="secondary"
											className="ml-2">
											{activeFiltersCount}
										</Badge>
									)}
								</CardTitle>
								{activeFiltersCount > 0 && (
									<Button
										variant="outline"
										size="sm"
										onClick={clearAllFilters}>
										<X className="h-4 w-4 mr-1" />
										Clear All
									</Button>
								)}
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Category Filter */}
							<div>
								<label className="text-sm font-medium text-gray-700 mb-2 block">
									Category
								</label>
								<Select
									value={categoryFilter}
									onValueChange={setCategoryFilter}>
									<SelectTrigger>
										<SelectValue placeholder="All Categories" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">
											All Categories
										</SelectItem>
										{categories.map((category) => (
											<SelectItem
												key={category}
												value={category}>
												{category}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Country Filter */}
							<div>
								<label className="text-sm font-medium text-gray-700 mb-2 block">
									Country
								</label>
								<Select
									value={countryFilter}
									onValueChange={setCountryFilter}>
									<SelectTrigger>
										<SelectValue placeholder="All Countries" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">
											All Countries
										</SelectItem>
										{countries.map((country) => (
											<SelectItem
												key={country}
												value={country}>
												{country}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Material Filter */}
							<div>
								<label className="text-sm font-medium text-gray-700 mb-2 block">
									Material
								</label>
								<Select
									value={materialFilter}
									onValueChange={setMaterialFilter}>
									<SelectTrigger>
										<SelectValue placeholder="All Materials" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">
											All Materials
										</SelectItem>
										{materials.map((material) => (
											<SelectItem
												key={material}
												value={material}>
												{material}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>
				</aside>

				{/* Main Content Area */}
				<main className="flex-1">
					<div className="mb-4 flex items-center justify-between">
						<p className="text-gray-600">
							{products.length}{" "}
							{products.length === 1 ? "product" : "products"} found
						</p>
						
						{isLoading && (
							<div className="flex items-center text-sm text-gray-500">
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-craft-brown mr-2"></div>
								Searching...
							</div>
						)}
					</div>

					{products.length === 0 && !isLoading ? (
						<div className="text-center py-12">
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								No products found
							</h3>
							<p className="text-gray-600 mb-4">
								Try adjusting your search terms or filters.
							</p>
							<Button onClick={clearAllFilters} variant="outline">
								Clear All Filters
							</Button>
						</div>
					) : (
						<div
							className={
								viewMode === "grid"
									? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
									: "grid grid-cols-1 gap-4"
							}>
							{products.map((product: Product) => (
								<ProductCard
									key={product.id}
									product={product}
									viewMode={viewMode}
								/>
							))}
						</div>
					)}
				</main>
			</div>
		</div>
	);
}
