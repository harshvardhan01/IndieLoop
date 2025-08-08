import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Grid, List, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard from "@/components/ProductCard";
import { Product } from "@shared/schema";

export default function Collections() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [countryFilter, setCountryFilter] = useState("all");
  const [materialFilter, setMaterialFilter] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products", { country: countryFilter, material: materialFilter, sort: sortBy }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (countryFilter && countryFilter !== "all") params.append("country", countryFilter);
      if (materialFilter && materialFilter !== "all") params.append("material", materialFilter);
      params.append("sort", sortBy);
      
      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  const countries = ["India", "Peru", "Morocco", "Thailand", "Guatemala"];
  const materials = ["Wood", "Textile", "Ceramic", "Metal", "Leather", "Bamboo"];

  const featuredCollections = [
    {
      title: "Wooden Treasures",
      description: "Handcrafted wooden items from master artisans",
      material: "wood",
      image: "🪵"
    },
    {
      title: "Textile Arts",
      description: "Beautiful fabrics and textiles with traditional patterns",
      material: "textile",
      image: "🧵"
    },
    {
      title: "Ceramic Crafts",
      description: "Pottery and ceramic pieces fired with ancient techniques",
      material: "ceramic",
      image: "🏺"
    },
    {
      title: "Metal Works",
      description: "Intricate metalwork from skilled artisans",
      material: "metal",
      image: "⚒️"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-craft-brown"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-display font-bold text-craft-brown mb-4">
            Explore Collections
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Discover curated collections of handcrafted products from talented artisans around the world.
          </p>
        </div>
      </div>

      {/* Featured Collections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-display font-bold text-craft-brown mb-6">Featured Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredCollections.map((collection) => (
            <div
              key={collection.material}
              onClick={() => setMaterialFilter(collection.material)}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="text-4xl mb-4 text-center">{collection.image}</div>
              <h3 className="text-lg font-semibold text-craft-brown mb-2">{collection.title}</h3>
              <p className="text-gray-600 text-sm">{collection.description}</p>
            </div>
          ))}
        </div>

        {/* Filter and View Controls */}
        <div className="bg-white border-b border-gray-200 rounded-lg mb-8">
          <div className="px-6 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country.toLowerCase()}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={materialFilter} onValueChange={setMaterialFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Materials" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Materials</SelectItem>
                    {materials.map((material) => (
                      <SelectItem key={material} value={material.toLowerCase()}>
                        {material}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 text-sm">View:</span>
                <Button
                  onClick={() => setViewMode("grid")}
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  className={viewMode === "grid" ? "bg-craft-brown hover:bg-craft-brown/90" : ""}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setViewMode("list")}
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  className={viewMode === "list" ? "bg-craft-brown hover:bg-craft-brown/90" : ""}
                >
                  <List className="h-4 w-4" />
                </Button>
                <span className="text-gray-600 text-sm ml-4">
                  {products.length} products found
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
          : "space-y-6"
        }>
          {products.map((product: Product) => (
            <ProductCard key={product.id} product={product} viewMode={viewMode} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found matching your filters.</p>
            <Button 
              onClick={() => {
                setCountryFilter("all");
                setMaterialFilter("all");
              }}
              variant="outline"
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}