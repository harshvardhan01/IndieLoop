import { Switch, Route } from "wouter";
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
		<div className="min-h-screen bg-background flex flex-col">
			<Header />
			<main className="flex-1">
				<Switch>
					<Route path="/" component={Home} />
					<Route path="/login" component={Login} />
					<Route path="/register" component={Register} />
					<Route path="/collections" component={Collections} />
					<Route path="/product/:id" component={ProductDetail} />
					<Route path="/cart" component={Cart} />
					<Route path="/checkout" component={Checkout} />
					<Route path="/orders" component={Orders} />
					<Route path="/addresses" component={Addresses} />
					<Route path="/about" component={About} />
					<Route path="/contact" component={Contact} />
					<Route path="/terms" component={Terms} />
					<Route path="/privacy" component={Privacy} />
					<Route path="/admin" component={Admin} />
					<Route path="/admin/products" component={AdminProducts} />
					<Route path="/admin/orders" component={AdminOrders} />
					<Route path="/admin/support" component={AdminSupport} />
					<Route component={NotFound} />
				</Switch>
			</main>
			<Footer />
		</div>
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
						<Router>
						</Router>
						<Toaster />
					</div>
				</ErrorContext.Provider>
			</TooltipProvider>
		</QueryClientProvider>
	);
}

export default App;