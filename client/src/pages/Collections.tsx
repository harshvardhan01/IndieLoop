import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Grid, List, Filter, X } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import ProductCard from "@/components/ProductCard";
import { Product } from "@shared/schema";

export default function Collections() {
	const [location] = useLocation();
	const searchParams = new URLSearchParams(location.split("?")[1] || "");
	const searchQuery = searchParams.get("search") || "";

	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [countryFilter, setCountryFilter] = useState("all");
	const [materialFilter, setMaterialFilter] = useState("all");
	const [sortBy, setSortBy] = useState("featured");
	const [priceRange, setPriceRange] = useState({ min: "", max: "" });
	const [inStockOnly, setInStockOnly] = useState(false);

	const { data: products = [], isLoading } = useQuery({
		queryKey: [
			"/api/products",
			{
				search: searchQuery,
				country: countryFilter,
				material: materialFilter,
				minPrice: priceRange.min,
				maxPrice: priceRange.max,
				inStock: inStockOnly,
			},
		],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (searchQuery) params.append("search", searchQuery);
			if (countryFilter && countryFilter !== "all")
				params.append("country", countryFilter);
			if (materialFilter && materialFilter !== "all")
				params.append("material", materialFilter);
			if (priceRange.min) params.append("minPrice", priceRange.min);
			if (priceRange.max) params.append("maxPrice", priceRange.max);
			if (inStockOnly) params.append("inStock", "true");

			const response = await fetch(`/api/products?${params}`);
			if (!response.ok) throw new Error("Failed to fetch products");
			return response.json();
		},
	});

	const clearAllFilters = () => {
		setCountryFilter("all");
		setMaterialFilter("all");
		setPriceRange({ min: "", max: "" });
		setInStockOnly(false);
	};

	const activeFiltersCount = [
		countryFilter !== "all",
		materialFilter !== "all",
		priceRange.min || priceRange.max,
		inStockOnly,
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

					{/* Enhanced Filters */}
					<Card>
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
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
								<Select
									value={countryFilter}
									onValueChange={setCountryFilter}>
									<SelectTrigger>
										<SelectValue placeholder="Country" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">
											All Countries
										</SelectItem>
										{[
											"India",
											"Peru",
											"Morocco",
											"Thailand",
											"Guatemala",
										].map((country) => (
											<SelectItem
												key={country}
												value={country}>
												{country}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								<Select
									value={materialFilter}
									onValueChange={setMaterialFilter}>
									<SelectTrigger>
										<SelectValue placeholder="Material" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">
											All Materials
										</SelectItem>
										{[
											"Wood",
											"Textile",
											"Ceramic",
											"Metal",
											"Leather",
											"Bamboo",
										].map((material) => (
											<SelectItem
												key={material}
												value={material}>
												{material}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								<Input
									placeholder="Min Price (₹)"
									type="number"
									value={priceRange.min}
									onChange={(e) =>
										setPriceRange((prev) => ({
											...prev,
											min: e.target.value,
										}))
									}
								/>

								<Input
									placeholder="Max Price (₹)"
									type="number"
									value={priceRange.max}
									onChange={(e) =>
										setPriceRange((prev) => ({
											...prev,
											max: e.target.value,
										}))
									}
								/>

								<div className="flex items-center space-x-2">
									<Checkbox
										id="inStock"
										checked={inStockOnly}
										onCheckedChange={(checked) =>
											setInStockOnly(!!checked)
										}
									/>
									<label
										htmlFor="inStock"
										className="text-sm font-medium">
										In Stock Only
									</label>
								</div>

								<Select
									value={sortBy}
									onValueChange={setSortBy}>
									<SelectTrigger>
										<SelectValue placeholder="Sort by" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="featured">
											Featured
										</SelectItem>
										<SelectItem value="price-low">
											Price: Low to High
										</SelectItem>
										<SelectItem value="price-high">
											Price: High to Low
										</SelectItem>
										<SelectItem value="newest">
											Newest First
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Products Grid */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-4 flex items-center justify-between">
					<p className="text-gray-600">
						{products.length}{" "}
						{products.length === 1 ? "product" : "products"} found
					</p>
				</div>

				{products.length === 0 ? (
					<div className="text-center py-12">
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							No products found
						</h3>
						<p className="text-gray-600 mb-4">
							Try adjusting your filters or search terms.
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
			</div>
		</div>
	);
}
