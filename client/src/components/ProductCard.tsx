import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, ShoppingCart, User } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { useCart } from "@/hooks/useCart";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { Product, Artisan } from "@shared/schema";

interface ProductCardProps {
	product: Product;
	viewMode: "grid" | "list";
}

export default function ProductCard({ product, viewMode }: ProductCardProps) {
	const { formatPrice } = useCurrency();
	const { addToCart, isAdding } = useCart();

	const { data: artisan } = useQuery<Artisan | null>({
		queryKey: ["/api/artisans", product.artisanId],
		queryFn: async () => {
			if (!product.artisanId) return null;
			const response = await fetch(`/api/artisans/${product.artisanId}`);
			if (!response.ok) return null;
			return response.json();
		},
		enabled: !!product.artisanId,
	});

	// Fetch reviews for this product
	const { data: reviews = [] } = useQuery({
		queryKey: ["/api/products", product.id, "reviews"],
		queryFn: async () => {
			const response = await fetch(`/api/products/${product.id}/reviews`);
			if (!response.ok) return [];
			return response.json();
		},
	});

	// Calculate average rating and review count
	const averageRating =
		reviews.length > 0
			? reviews.reduce(
					(sum: number, review: any) => sum + review.rating,
					0
			  ) / reviews.length
			: 0;
	const reviewCount = reviews.length;

	const hasDiscount =
		product.discountedPrice &&
		parseFloat(product.discountedPrice) < parseFloat(product.originalPrice);
	const discountPercentage = hasDiscount
		? Math.round(
				((parseFloat(product.originalPrice) -
					parseFloat(product.discountedPrice!)) /
					parseFloat(product.originalPrice)) *
					100
		  )
		: 0;

	const handleAddToCart = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		addToCart({ productId: product.id, quantity: 1 });
	};

	if (viewMode === "list") {
		return (
			<Link to={`/product/${product.id}`}>
				<Card className="hover:shadow-xl transition-all duration-300 cursor-pointer">
					<div className="flex">
						<div className="relative w-48 h-48 flex-shrink-0">
							<img
								src={product.images[0]}
								alt={product.name}
								className="w-full h-full object-cover rounded-l-lg"
							/>
							{hasDiscount && (
								<Badge className="absolute top-2 right-2 bg-craft-crimson text-white">
									{discountPercentage}% OFF
								</Badge>
							)}
							{product.featured && (
								<Badge className="absolute top-2 left-2 bg-yellow-600 text-white">
									Featured
								</Badge>
							)}
						</div>
						<CardContent className="flex-1 p-6">
							<div className="flex justify-between items-start">
								<div className="flex-1">
									<h3 className="text-xl font-semibold text-gray-900 mb-2">
										{product.name}
									</h3>
									<p className="text-gray-600 mb-4 line-clamp-2">
										{product.description}
									</p>

									<div className="flex items-center space-x-4 mb-4">
										<div className="flex items-center text-sm text-gray-500">
											<MapPin className="w-4 h-4 mr-1" />
											{product.countryOfOrigin}
										</div>
										<div className="text-sm text-gray-500">
											{product.material}
										</div>
										{artisan && (
											<Link to={`/artisan/${artisan.id}`}>
												<div className="flex items-center text-sm text-craft-brown hover:underline">
													<User className="w-4 h-4 mr-1" />
													{artisan.name}
												</div>
											</Link>
										)}
										<div className="flex items-center text-sm">
											<Star className="w-4 h-4 text-yellow-400 mr-1" />
											<span>
												{averageRating.toFixed(1)} (
												{reviewCount})
											</span>
										</div>
									</div>

									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-2">
											<span className="text-2xl font-bold text-craft-brown">
												{formatPrice(
													product.discountedPrice ||
														product.originalPrice
												)}
											</span>
											{hasDiscount && (
												<span className="text-lg text-gray-400 line-through">
													{formatPrice(
														product.originalPrice
													)}
												</span>
											)}
										</div>

										<Button
											onClick={handleAddToCart}
											disabled={isAdding}
											className="bg-craft-brown hover:bg-craft-brown/90">
											<ShoppingCart className="w-4 h-4 mr-2" />
											Add to Cart
										</Button>
									</div>
								</div>
							</div>
						</CardContent>
					</div>
				</Card>
			</Link>
		);
	}

	return (
		<Link to={`/product/${product.id}`}>
			<Card className="hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer">
				<div className="relative">
					<img
						src={product.images[0]}
						alt={product.name}
						className="w-full h-48 object-cover"
					/>
					{hasDiscount && (
						<Badge className="absolute top-2 right-2 bg-craft-crimson text-white">
							{discountPercentage}% OFF
						</Badge>
					)}
					{!product.inStock && (
						<Badge className="absolute top-2 left-2 bg-gray-500 text-white">
							Out of Stock
						</Badge>
					)}
					{product.featured && (
						<Badge className="absolute top-2 left-2 bg-yellow-600 text-white">
							Featured
						</Badge>
					)}
				</div>
				<CardContent className="p-4">
					<h3 className="font-semibold text-gray-900 mb-1 truncate">
						{product.name}
					</h3>
					<p className="text-sm text-gray-600 mb-2 line-clamp-2">
						{product.description}
					</p>

					<div className="flex items-center mb-2 space-x-2">
						<span className="text-lg font-bold text-craft-brown">
							{formatPrice(
								product.discountedPrice || product.originalPrice
							)}
						</span>
						{hasDiscount && (
							<span className="text-sm text-gray-400 line-through">
								{formatPrice(product.originalPrice)}
							</span>
						)}
					</div>

					<div className="flex items-center justify-between text-xs text-gray-500 mb-2">
						<div className="flex items-center">
							<MapPin className="w-3 h-3 mr-1" />
							{product.countryOfOrigin}
						</div>
						<span>{product.material}</span>
						<div className="flex items-center">
							<Star className="w-3 h-3 text-yellow-400 mr-1" />
							<span>
								{averageRating.toFixed(1)} ({reviewCount})
							</span>
						</div>
					</div>

					{artisan && (
						<Link to={`/artisan/${artisan.id}`}>
							<div className="flex items-center text-xs text-craft-brown hover:underline mb-2">
								<User className="w-3 h-3 mr-1" />
								By {artisan.name}
							</div>
						</Link>
					)}

					<Button
						onClick={handleAddToCart}
						disabled={isAdding || !product.inStock}
						className="w-full mt-3 bg-craft-brown hover:bg-craft-brown/90"
						size="sm">
						<ShoppingCart className="w-4 h-4 mr-2" />
						{product.inStock ? "Add to Cart" : "Out of Stock"}
					</Button>
				</CardContent>
			</Card>
		</Link>
	);
}
