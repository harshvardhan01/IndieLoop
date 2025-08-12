
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Orders from "@/pages/Orders";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Collections from "@/pages/Collections";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Admin from "@/pages/Admin";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminSupport from "@/pages/admin/AdminSupport";
import AdminArtisans from "@/pages/admin/AdminArtisans";
import ArtisanDetail from "@/pages/ArtisanDetail";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Addresses from "@/pages/Addresses";
import ErrorBanner from "@/components/ErrorBanner";
import { ErrorContext, useErrorProvider } from "@/hooks/useError";
import Checkout from "@/pages/Checkout";

function Router() {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-craft-brown"></div>
			</div>
		);
	}

	return (
		<BrowserRouter>
			<div className="min-h-screen bg-background flex flex-col">
				<Header />
				<main className="flex-1">
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Register />} />
						<Route path="/collections" element={<Collections />} />
						<Route path="/product/:id" element={<ProductDetail />} />
						<Route path="/artisan/:id" element={<ArtisanDetail />} />
						<Route path="/cart" element={<Cart />} />
						<Route path="/checkout" element={<Checkout />} />
						<Route path="/orders" element={<Orders />} />
						<Route path="/addresses" element={<Addresses />} />
						<Route path="/about" element={<About />} />
						<Route path="/contact" element={<Contact />} />
						<Route path="/terms" element={<Terms />} />
						<Route path="/privacy" element={<Privacy />} />
						<Route path="/admin" element={<Admin />} />
						<Route path="/admin/products" element={<AdminProducts />} />
						<Route path="/admin/orders" element={<AdminOrders />} />
						<Route path="/admin/support" element={<AdminSupport />} />
						<Route path="/admin/artisans" element={<AdminArtisans />} />
						<Route path="*" element={<NotFound />} />
					</Routes>
				</main>
				<Footer />
			</div>
		</BrowserRouter>
	);
}

function App() {
	const errorContext = useErrorProvider();

	return (
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>
				<ErrorContext.Provider value={errorContext}>
					<div className="min-h-screen">
						<ErrorBanner
							error={errorContext.error}
							onDismiss={errorContext.clearError}
						/>
						<Router />
						<Toaster />
					</div>
				</ErrorContext.Provider>
			</TooltipProvider>
		</QueryClientProvider>
	);
}

export default App;
