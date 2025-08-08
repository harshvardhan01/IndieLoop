import { useLocation, Link } from "wouter";
import ProductGrid from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";

export default function Home() {
	const [location] = useLocation();
	const searchParams = new URLSearchParams(location.split("?")[1] || "");
	const search = searchParams.get("search") || "";

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

			{/* Products Section */}
			<section className="py-8">
				<ProductGrid filters={{ search }} />
			</section>

			{/* Features Section */}
			<section className="bg-white py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h3 className="text-3xl font-display font-bold text-craft-brown mb-4">
							Why Choose IndieLoop?
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

			{/* Footer */}
			<footer className="bg-craft-brown text-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
						<div>
							<h3 className="text-2xl font-display font-bold mb-4">
								IndieLoop
							</h3>
							<p className="text-craft-tan">
								Connecting you with authentic, handcrafted
								products from artisans worldwide.
							</p>
						</div>
						<div>
							<h4 className="font-semibold mb-4">Quick Links</h4>
							<ul className="space-y-2 text-craft-tan">
								<li>
									<Link
										href="/about"
										className="hover:text-white transition-colors">
										About Us
									</Link>
								</li>
								<li>
									<Link
										href="/collections"
										className="hover:text-white transition-colors">
										Collections
									</Link>
								</li>
								<li>
									<Link
										href="/contact"
										className="hover:text-white transition-colors">
										Contact Us
									</Link>
								</li>
								<li>
									<Link
										href="/terms"
										className="hover:text-white transition-colors">
										Terms of Service
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold mb-4">
								Customer Care
							</h4>
							<ul className="space-y-2 text-craft-tan">
								<li>
									<Link
										href="/contact"
										className="hover:text-white transition-colors">
										Contact Support
									</Link>
								</li>
								<li>
									<Link
										href="/privacy"
										className="hover:text-white transition-colors">
										Privacy Policy
									</Link>
								</li>
								<li>
									<Link
										href="/orders"
										className="hover:text-white transition-colors">
										Track Order
									</Link>
								</li>
								<li>
									<Link
										href="/cart"
										className="hover:text-white transition-colors">
										View Cart
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold mb-4">Follow Us</h4>
							<div className="flex space-x-4">
								<a
									href="#"
									className="text-craft-tan hover:text-white transition-colors">
									<span className="text-xl">📷</span>
								</a>
								<a
									href="#"
									className="text-craft-tan hover:text-white transition-colors">
									<span className="text-xl">📘</span>
								</a>
								<a
									href="#"
									className="text-craft-tan hover:text-white transition-colors">
									<span className="text-xl">🐦</span>
								</a>
								<a
									href="#"
									className="text-craft-tan hover:text-white transition-colors">
									<span className="text-xl">📌</span>
								</a>
							</div>
						</div>
					</div>
					<div className="border-t border-craft-tan mt-8 pt-8 text-center text-craft-tan">
						<p>
							&copy; 2024 IndieLoop. All rights reserved.
							Supporting artisans worldwide.
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
