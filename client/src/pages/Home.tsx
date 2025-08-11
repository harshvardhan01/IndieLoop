import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";

export default function Home() {
	const { data: featuredProducts = [], isLoading } = useQuery<Product[]>({
		queryKey: ["featured-products"],
		queryFn: async () => {
			const response = await fetch("/api/products/featured");
			if (!response.ok)
				throw new Error("Failed to fetch featured products");
			return response.json();
		},
	});

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero Section */}
			<section className="relative gradient-craft py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h2 className="text-4xl md:text-6xl font-display font-bold text-craft-brown mb-4">
							Handcrafted with Love
						</h2>
						<p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
							Discover unique, artisan-made products that tell a
							story. Supporting artisans worldwide.
						</p>
						<Link href="/collections">
							<Button className="bg-craft-brown text-white px-8 py-3 rounded-lg font-semibold hover:bg-craft-brown/90 transition-all transform hover:scale-105">
								Explore Collections
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Featured Products Section */}
			<section className="py-16 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h3 className="text-3xl font-display font-bold text-craft-brown mb-4">
							Featured Products
						</h3>
						<p className="text-gray-600 max-w-2xl mx-auto">
							Handpicked by our team - discover the finest artisan
							creations from around the world.
						</p>
					</div>

					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-craft-brown"></div>
						</div>
					) : featuredProducts.length === 0 ? (
						<div className="text-center py-12">
							<h4 className="text-lg font-medium text-gray-900 mb-2">
								No featured products yet
							</h4>
							<p className="text-gray-600 mb-6">
								Our team is curating the best products for you.
							</p>
							<Link href="/collections">
								<Button className="bg-craft-brown hover:bg-craft-brown/90">
									Browse All Products
								</Button>
							</Link>
						</div>
					) : (
						<>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
								{featuredProducts.map((product) => (
									<ProductCard
										key={product.id}
										product={product}
										viewMode="grid"
									/>
								))}
							</div>
							<div className="text-center">
								<Link href="/collections">
									<Button className="bg-craft-brown hover:bg-craft-brown/90 px-8 py-3 text-lg">
										Explore All Collections
									</Button>
								</Link>
							</div>
						</>
					)}
				</div>
			</section>

			{/* Features Section */}
			<section className="bg-white py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h3 className="text-3xl font-display font-bold text-craft-brown mb-4">
							Why Choose IndieLoopStudio?
						</h3>
						<p className="text-gray-600 max-w-2xl mx-auto">
							We're committed to connecting you with authentic,
							handcrafted products while supporting artisans
							worldwide.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="text-center">
							<div className="w-16 h-16 bg-craft-tan rounded-full flex items-center justify-center mx-auto mb-4">
								<span className="text-2xl">🎨</span>
							</div>
							<h4 className="text-xl font-semibold text-gray-900 mb-2">
								Authentic Craftsmanship
							</h4>
							<p className="text-gray-600">
								Every product is handmade by skilled artisans
								using traditional techniques passed down through
								generations.
							</p>
						</div>

						<div className="text-center">
							<div className="w-16 h-16 bg-craft-tan rounded-full flex items-center justify-center mx-auto mb-4">
								<span className="text-2xl">🌍</span>
							</div>
							<h4 className="text-xl font-semibold text-gray-900 mb-2">
								Global Community
							</h4>
							<p className="text-gray-600">
								Support artisans from around the world and
								discover unique cultural treasures.
							</p>
						</div>

						<div className="text-center">
							<div className="w-16 h-16 bg-craft-tan rounded-full flex items-center justify-center mx-auto mb-4">
								<span className="text-2xl">♻️</span>
							</div>
							<h4 className="text-xl font-semibold text-gray-900 mb-2">
								Sustainable Choice
							</h4>
							<p className="text-gray-600">
								Choose eco-friendly, sustainable products that
								are made to last and respect our planet.
							</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
