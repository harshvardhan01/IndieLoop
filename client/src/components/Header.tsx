import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Search, User, ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useQuery } from "@tanstack/react-query";
import CurrencySelector from "./CurrencySelector";
import CartSidebar from "./CartSidebar";
import SupportForm from "./SupportForm";

export default function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isCartOpen, setIsCartOpen] = useState(false);
	const [isSupportOpen, setIsSupportOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [, setLocation] = useLocation();
	const { isAuthenticated, user } = useAuth();
	const { totalItems } = useCart();
	const searchRef = useRef<HTMLDivElement>(null);

	// Fetch search suggestions with debouncing
	const { data: suggestions = [] } = useQuery({
		queryKey: ["/api/products/search", searchQuery.trim()],
		queryFn: async () => {
			if (searchQuery.trim().length < 2) return [];
			const response = await fetch(
				`/api/products/search?q=${encodeURIComponent(
					searchQuery.trim()
				)}&limit=6`
			);
			if (!response.ok) throw new Error("Failed to fetch suggestions");
			return response.json();
		},
		enabled: searchQuery.trim().length >= 2,
		staleTime: 5 * 60 * 1000, // Cache for 5 minutes
	});

	// Close suggestions when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				searchRef.current &&
				!searchRef.current.contains(event.target as Node)
			) {
				setShowSuggestions(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			setLocation(`/?search=${encodeURIComponent(searchQuery.trim())}`);
			setShowSuggestions(false);
		}
	};

	const handleSearchInputChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const value = e.target.value;
		setSearchQuery(value);
		setShowSuggestions(value.trim().length > 0);
	};

	const handleSuggestionClick = (suggestion: any) => {
		console.log("Clicking suggestion:", suggestion);
		setSearchQuery(suggestion.name);
		setShowSuggestions(false);
		setLocation(`/product/${suggestion.id}`);
	};

	const handleCategorySearch = (term: string) => {
		setSearchQuery(term);
		setShowSuggestions(false);
		setLocation(`/?search=${encodeURIComponent(term)}`);
	};

	const handleLogout = () => {
		const sessionId = localStorage.getItem("sessionId");
		if (sessionId) {
			fetch("/api/auth/logout", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${sessionId}`,
				},
			}).finally(() => {
				localStorage.removeItem("sessionId");
				window.location.reload();
			});
		}
	};

	return (
		<>
			<nav className="bg-white shadow-lg sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						{/* Logo */}
						<div className="flex-shrink-0">
							<Link href="/">
								<div className="cursor-pointer">
									<h1 className="text-2xl font-display font-bold text-craft-brown">
										IndieLoop
									</h1>
									<p className="text-xs text-gray-600">
										Artisan Crafted
									</p>
								</div>
							</Link>
						</div>

						{/* Search Bar - Desktop */}
						<div
							className="hidden md:block flex-1 max-w-lg mx-8"
							ref={searchRef}>
							<form onSubmit={handleSearch} className="relative">
								<Input
									type="text"
									placeholder="Search handcrafted products..."
									value={searchQuery}
									onChange={handleSearchInputChange}
									onFocus={() =>
										searchQuery.trim().length > 0 &&
										setShowSuggestions(true)
									}
									className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-craft-brown focus:border-transparent"
								/>
								<Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

								{/* Search Suggestions Dropdown */}
								{showSuggestions && suggestions.length > 0 && (
									<div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50 max-h-80 overflow-y-auto">
										{suggestions.map((product: any) => (
											<div
												key={product.id}
												onClick={() =>
													handleSuggestionClick(
														product
													)
												}
												className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
												<img
													src={product.images[0]}
													alt={product.name}
													className="w-10 h-10 object-cover rounded mr-3"
												/>
												<div className="flex-1">
													<div className="font-medium text-gray-900">
														{product.name}
													</div>
													<div className="text-sm text-gray-500">
														{product.material} •{" "}
														{
															product.countryOfOrigin
														}
													</div>
												</div>
											</div>
										))}

										{/* Quick category searches */}
										<div className="p-2 border-t border-gray-200 bg-gray-50">
											<div className="text-xs text-gray-500 mb-2">
												Quick searches:
											</div>
											<div className="flex flex-wrap gap-1">
												{[
													"Wood",
													"Textile",
													"Ceramic",
													"Metal",
													"Leather",
												].map((material) => (
													<button
														key={material}
														onClick={() =>
															handleCategorySearch(
																material
															)
														}
														className="text-xs px-2 py-1 bg-white border border-gray-200 rounded hover:bg-craft-brown hover:text-white transition-colors">
														{material}
													</button>
												))}
											</div>
										</div>
									</div>
								)}
							</form>
						</div>

						{/* Right Navigation - Desktop */}
						<div className="hidden md:flex items-center space-x-4">
							<CurrencySelector />

							{isAuthenticated ? (
								<div className="flex items-center space-x-4">
									<span className="text-sm text-gray-700">
										Hello, {user?.firstName}
									</span>
									<Link href="/orders">
										<Button variant="ghost" size="sm">
											Orders
										</Button>
									</Link>
									<Button
										onClick={handleLogout}
										variant="ghost"
										size="sm">
										Logout
									</Button>
								</div>
							) : (
								<Link href="/login">
									<Button
										variant="ghost"
										className="text-gray-700 hover:text-craft-brown">
										<User className="h-5 w-5" />
									</Button>
								</Link>
							)}

							<Button
								onClick={() => setIsCartOpen(true)}
								variant="ghost"
								className="relative text-gray-700 hover:text-craft-brown">
								<ShoppingCart className="h-5 w-5" />
								{totalItems > 0 && (
									<span className="absolute -top-2 -right-2 bg-craft-crimson text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
										{totalItems}
									</span>
								)}
							</Button>
						</div>

						{/* Mobile menu button */}
						<div className="md:hidden">
							<Button
								onClick={() => setIsMenuOpen(!isMenuOpen)}
								variant="ghost"
								size="sm">
								{isMenuOpen ? (
									<X className="h-6 w-6" />
								) : (
									<Menu className="h-6 w-6" />
								)}
							</Button>
						</div>
					</div>

					{/* Mobile Search */}
					<div className="md:hidden pb-4" ref={searchRef}>
						<form onSubmit={handleSearch} className="relative">
							<Input
								type="text"
								placeholder="Search handcrafted products..."
								value={searchQuery}
								onChange={handleSearchInputChange}
								onFocus={() =>
									searchQuery.trim().length > 0 &&
									setShowSuggestions(true)
								}
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-craft-brown focus:border-transparent"
							/>
							<Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

							{/* Mobile Search Suggestions */}
							{showSuggestions && suggestions.length > 0 && (
								<div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50 max-h-60 overflow-y-auto">
									{suggestions.map((product: any) => (
										<div
											key={product.id}
											onClick={() =>
												handleSuggestionClick(product)
											}
											className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
											<img
												src={product.images[0]}
												alt={product.name}
												className="w-8 h-8 object-cover rounded mr-3"
											/>
											<div className="flex-1">
												<div className="font-medium text-gray-900 text-sm">
													{product.name}
												</div>
												<div className="text-xs text-gray-500">
													{product.material} •{" "}
													{product.countryOfOrigin}
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</form>
					</div>

					{/* Mobile Currency Selector - Always Visible */}
					<div className="md:hidden border-t border-gray-200 py-2">
						<div className="flex justify-center">
							<CurrencySelector />
						</div>
					</div>
					{/* Mobile Navigation */}
					{isMenuOpen && (
						<div className="md:hidden border-t border-gray-200 py-4">
							<div className="flex flex-col space-y-4">
								{/* <CurrencySelector /> */}

								{isAuthenticated ? (
									<>
										<div className="text-sm text-gray-700">
											Hello, {user?.firstName}
										</div>
										<Link href="/orders">
											<Button
												variant="ghost"
												className="justify-start w-full">
												Orders
											</Button>
										</Link>
										<Button
											onClick={handleLogout}
											variant="ghost"
											className="justify-start w-full">
											Logout
										</Button>
									</>
								) : (
									<Link href="/login">
										<Button
											variant="ghost"
											className="justify-start w-full">
											<User className="h-4 w-4 mr-2" />
											Login
										</Button>
									</Link>
								)}

								<Button
									onClick={() => setIsCartOpen(true)}
									variant="ghost"
									className="justify-start w-full relative">
									<ShoppingCart className="h-4 w-4 mr-2" />
									Cart
									{totalItems > 0 && (
										<span className="ml-2 bg-craft-crimson text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
											{totalItems}
										</span>
									)}
								</Button>

								<Button
									onClick={() => setIsSupportOpen(true)}
									variant="ghost"
									className="justify-start w-full">
									Support
								</Button>
							</div>
						</div>
					)}
				</div>
			</nav>

			<CartSidebar
				isOpen={isCartOpen}
				onClose={() => setIsCartOpen(false)}
			/>
			<SupportForm
				isOpen={isSupportOpen}
				onClose={() => setIsSupportOpen(false)}
			/>
		</>
	);
}
