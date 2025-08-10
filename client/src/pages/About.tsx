import { Heart, Award, Globe } from "lucide-react";

export default function About() {
	return (
		<div className="min-h-screen bg-gray-50 py-12">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-12">
					<h1 className="text-4xl font-display font-bold text-craft-brown mb-4">
						About IndieLoop
					</h1>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						Connecting customers with talented artisans and their
						handcrafted treasures from around the world.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
					<div className="bg-white p-6 rounded-lg shadow-md text-center">
						<Heart className="h-12 w-12 text-craft-brown mx-auto mb-4" />
						<h3 className="text-xl font-semibold mb-2">
							Our Mission
						</h3>
						<p className="text-gray-600">
							To preserve traditional craftsmanship while
							providing artisans with a global marketplace to
							showcase their unique skills.
						</p>
					</div>

					<div className="bg-white p-6 rounded-lg shadow-md text-center">
						<Award className="h-12 w-12 text-craft-brown mx-auto mb-4" />
						<h3 className="text-xl font-semibold mb-2">
							Quality Promise
						</h3>
						<p className="text-gray-600">
							Every product is carefully curated for authenticity,
							quality, and the story behind its creation.
						</p>
					</div>

					<div className="bg-white p-6 rounded-lg shadow-md text-center">
						<Globe className="h-12 w-12 text-craft-brown mx-auto mb-4" />
						<h3 className="text-xl font-semibold mb-2">
							Global Impact
						</h3>
						<p className="text-gray-600">
							Supporting artisans and preserving cultural heritage
							one handcrafted piece at a time.
						</p>
					</div>
				</div>

				<div className="bg-white p-8 rounded-lg shadow-md">
					<h2 className="text-2xl font-display font-bold text-craft-brown mb-6">
						Our Story
					</h2>
					<div className="prose prose-lg text-gray-700">
						<p className="mb-4">
							IndieLoop was born from a simple belief: that
							authentic, handcrafted goods tell stories that
							mass-produced items never could. Every wooden bowl
							carries the grain of its tree and the hands that
							shaped it. Every textile weaves together tradition,
							skill, and the artist's vision.
						</p>
						<p className="mb-4">
							We work directly with artisans from multiple
							countries, ensuring they receive fair compensation
							for their incredible skills. Our platform bridges
							the gap between traditional craftsmanship and modern
							consumers who value authenticity and quality.
						</p>
						<p>
							When you shop with IndieLoop, you're not just buying
							a product – you're supporting a craftsperson,
							preserving a tradition, and bringing a piece of
							authentic artistry into your life.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
