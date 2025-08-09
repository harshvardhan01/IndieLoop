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
		<div className="min-h-screen bg-gray-50">
			<Header />
			<Switch>
				<Route path="/" component={Home} />
				<Route path="/collections" component={Collections} />
				<Route path="/about" component={About} />
				<Route path="/contact" component={Contact} />
				<Route path="/privacy" component={Privacy} />
				<Route path="/terms" component={Terms} />
				<Route path="/product/:id" component={ProductDetail} />
				<Route path="/cart" component={Cart} />
				<Route path="/login" component={Login} />
				<Route path="/register" component={Register} />
				{isAuthenticated && <Route path="/orders" component={Orders} />}
				{isAuthenticated && <Route path="/admin" component={Admin} />}
				{isAuthenticated && <Route path="/admin/products" component={AdminProducts} />}
				{isAuthenticated && <Route path="/admin/orders" component={AdminOrders} />}
				{isAuthenticated && <Route path="/admin/support" component={AdminSupport} />}
				<Route component={NotFound} />
			</Switch>
		</div>
	);
}

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>
				<Toaster />
				<Router />
			</TooltipProvider>
		</QueryClientProvider>
	);
}

export default App;
