import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
	User,
	ShoppingCart,
	Menu,
	X,
	ChevronDown,
	Package,
	MessageSquare,
	MapPin,
	LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import CurrencySelector from "./CurrencySelector";
import CartSidebar from "./CartSidebar";
import SupportForm from "./SupportForm";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isCartOpen, setIsCartOpen] = useState(false);
	const [isSupportOpen, setIsSupportOpen] = useState(false);
	const [, setLocation] = useLocation();
	const { isAuthenticated, user } = useAuth();
	const { totalItems } = useCart();

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
										IndieLoopStudio
									</h1>
									<p className="text-xs text-gray-600">
										Artisan Crafted
									</p>
								</div>
							</Link>
						</div>

						{/* Right Navigation - Desktop */}
						<div className="hidden md:flex items-center space-x-4">
							<CurrencySelector />

							{isAuthenticated ? (
								<div className="flex items-center space-x-4">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												className="flex items-center gap-2">
												<User className="h-4 w-4" />
												<span className="hidden sm:inline">
													Hello, {user?.firstName}
												</span>
												<ChevronDown className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											align="end"
											className="w-56">
											<DropdownMenuItem asChild>
												<Link
													href="/orders"
													className="flex items-center gap-2 w-full">
													<Package className="h-4 w-4" />
													My Orders
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link
													href="/addresses"
													className="flex items-center gap-2 w-full">
													<MapPin className="h-4 w-4" />
													My Addresses
												</Link>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												onClick={handleLogout}
												className="flex items-center gap-2">
												<LogOut className="h-4 w-4" />
												Logout
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>

									{user?.isAdmin && (
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													className="flex items-center gap-1">
													Admin
													<ChevronDown className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem asChild>
													<Link
														href="/admin/products"
														className="flex items-center gap-2 w-full">
														<Package className="h-4 w-4" />
														Products
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link
														href="/admin/orders"
														className="flex items-center gap-2 w-full">
														<ShoppingCart className="h-4 w-4" />
														Orders
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link
														href="/admin/support"
														className="flex items-center gap-2 w-full">
														<MessageSquare className="h-4 w-4" />
														Support
													</Link>
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									)}
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
												<Package className="h-4 w-4 mr-2" />
												My Orders
											</Button>
										</Link>
										<Link href="/addresses">
											<Button
												variant="ghost"
												className="justify-start w-full">
												<MapPin className="h-4 w-4 mr-2" />
												My Addresses
											</Button>
										</Link>
										{user?.isAdmin && (
											<div className="w-full">
												<div className="text-sm text-gray-600 font-medium mb-2 px-2">
													Admin
												</div>
												<Link href="/admin/products">
													<Button
														variant="ghost"
														className="justify-start w-full pl-4">
														<Package className="h-4 w-4 mr-2" />
														Products
													</Button>
												</Link>
												<Link href="/admin/orders">
													<Button
														variant="ghost"
														className="justify-start w-full pl-4">
														<ShoppingCart className="h-4 w-4 mr-2" />
														Orders
													</Button>
												</Link>
												<Link href="/admin/support">
													<Button
														variant="ghost"
														className="justify-start w-full pl-4">
														<MessageSquare className="h-4 w-4 mr-2" />
														Support
													</Button>
												</Link>
											</div>
										)}
										<Button
											onClick={handleLogout}
											variant="ghost"
											className="justify-start w-full">
											<LogOut className="h-4 w-4 mr-2" />
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
