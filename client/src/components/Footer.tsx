import { Link } from "react-router-dom";

export default function Footer() {
	return (
		<footer className="bg-craft-brown text-white py-12">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					{/* Company Info */}
					<div>
						<h3 className="text-2xl font-display font-bold mb-4">
							IndieLoopStudio
						</h3>
						<p className="text-craft-tan">
							Connecting you with authentic, handcrafted products
							from artisans worldwide.
						</p>
					</div>

					{/* Quick Links */}
					<div>
						<h4 className="font-semibold mb-4">Quick Links</h4>
						<ul className="space-y-2 text-craft-tan">
							<li>
								<Link
									to="/"
									className="hover:text-white transition-colors">
									Home
								</Link>
							</li>
							<li>
								<Link
									to="/collections"
									className="hover:text-white transition-colors">
									Collections
								</Link>
							</li>
							<li>
								<Link
									to="/about"
									className="hover:text-white transition-colors">
									About Us
								</Link>
							</li>
						</ul>
					</div>

					{/* Customer Service */}
					<div>
						<h4 className="font-semibold mb-4">Customer Service</h4>
						<ul className="space-y-2 text-craft-tan">
							<li>
								<Link
									to="/orders"
									className="hover:text-white transition-colors">
									Track Your Order
								</Link>
							</li>
							<li>
								<Link
									to="/terms"
									className="hover:text-white transition-colors">
									Terms & Conditions
								</Link>
							</li>
							<li>
								<Link
									to="/privacy"
									className="hover:text-white transition-colors">
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link
									to="/contact"
									className="hover:text-white transition-colors">
									Contact
								</Link>
							</li>
						</ul>
					</div>

					{/* Contact Info */}
					<div>
						<h4 className="font-semibold mb-4">Get in Touch</h4>
						<div className="space-y-2 text-craft-tan">
							<p>Email: support@indieloopstudio.com</p>
							<p>Phone: +91 9460392689</p>
							<p>Hours: Mon-Fri 9AM-6PM IST</p>
						</div>
					</div>
				</div>

				<div className="border-t border-gray-800 mt-8 pt-8">
					<div className="flex flex-col md:flex-row justify-between items-center">
						<p className="space-y-2 text-craft-tan">
							© 2025 IndieLoopStudio. All rights reserved.
						</p>
						<div className="flex space-x-6 mt-4 md:mt-0">
							<span className="space-y-2 text-craft-tan">
								Made with ❤️ for artisans worldwide
							</span>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}