import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Calendar, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import type { Product } from "@shared/schema";

export default function ArtisanDetail() {
	const { id: artisanId } = useParams();
	const { user, isLoading: authLoading } = useAuth();

	// Check if user is admin
	if (authLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-craft-brown"></div>
			</div>
		);
	}

	if (!user || !user.isAdmin) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Access Denied
					</h2>
					<p className="text-gray-600">
						You need admin privileges to view artisan details.
					</p>
				</div>
			</div>
		);
	}

	const { data: artisan, isLoading } = useQuery({
		queryKey: ["/api/artisans", artisanId],
		queryFn: async () => {
			const response = await fetch(`/api/artisans/${artisanId}`);
			if (!response.ok) throw new Error("Failed to fetch artisan");
			return response.json();
		},
	});

	const { data: products = [] } = useQuery({
		queryKey: ["/api/artisans", artisanId, "products"],
		queryFn: async () => {
			const response = await fetch(`/api/artisans/${artisanId}/products`);
			if (!response.ok)
				throw new Error("Failed to fetch artisan products");
			return response.json();
		},
	});

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-craft-brown"></div>
			</div>
		);
	}

	if (!artisan) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Artisan not found
					</h2>
					<p className="text-gray-600">
						The artisan you're looking for doesn't exist.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid md:grid-cols-3 gap-8">
					{/* Artisan Profile */}
					<div className="md:col-span-1">
						<Card>
							<CardContent className="p-6">
								{artisan.image && (
									<div className="mb-6">
										<img
											src={artisan.image}
											alt={artisan.name}
											className="w-full h-64 object-cover rounded-lg"
										/>
									</div>
								)}
								<h1 className="text-2xl font-display font-bold text-gray-900 mb-2">
									{artisan.name}
								</h1>
								<div className="flex items-center text-gray-600 mb-4">
									<MapPin className="w-4 h-4 mr-2" />
									{artisan.location}
								</div>
								<Badge className="mb-4 bg-craft-brown text-white">
									{artisan.specialization}
								</Badge>
								<div className="space-y-4">
									<div>
										<h3 className="font-semibold text-gray-900 mb-2">
											Experience
										</h3>
										<p className="text-gray-600">
											{artisan.experience}
										</p>
									</div>
									<div>
										<h3 className="font-semibold text-gray-900 mb-2">
											About
										</h3>
										<div
											className="text-gray-600"
											dangerouslySetInnerHTML={{
												__html: artisan.bio,
											}}
										/>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Artisan Story & Products */}
					<div className="md:col-span-2 space-y-8">
						{/* Story Section */}
						<Card>
							<CardHeader>
								<CardTitle>Artisan's Story</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-gray-700 leading-relaxed whitespace-pre-line">
									{artisan.story}
								</p>
							</CardContent>
						</Card>

						{/* Products Section */}
						<Card>
							<CardHeader>
								<CardTitle>
									Products by {artisan.name}
								</CardTitle>
							</CardHeader>
							<CardContent>
								{products.length === 0 ? (
									<p className="text-gray-600 text-center py-8">
										No products available from this artisan
										yet.
									</p>
								) : (
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										{products.map((product: Product) => (
											<div
												key={product.id}
												className="border rounded-lg p-4 hover:shadow-md transition-shadow">
												<img
													src={product.images[0]}
													alt={product.name}
													className="w-full h-32 object-cover rounded mb-3"
												/>
												<h3 className="font-semibold text-gray-900 mb-1">
													{product.name}
												</h3>
												<p className="text-sm text-gray-600 mb-2 line-clamp-2">
													{product.description}
												</p>
												<div className="flex justify-between items-center">
													<span className="font-bold text-craft-brown">
														₹
														{product.discountedPrice ||
															product.originalPrice}
													</span>
													<a
														href={`/product/${product.id}`}
														className="text-craft-brown hover:underline text-sm">
														View Product
													</a>
												</div>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
