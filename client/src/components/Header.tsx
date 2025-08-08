import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, User, ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import CurrencySelector from "./CurrencySelector";
import CartSidebar from "./CartSidebar";
import SupportForm from "./SupportForm";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { totalItems } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
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
                  <h1 className="text-2xl font-display font-bold text-craft-brown">IndieLoop</h1>
                  <p className="text-xs text-gray-600">Artisan Crafted</p>
                </div>
              </Link>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:block flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search handcrafted products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-craft-brown focus:border-transparent"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </form>
            </div>

            {/* Right Navigation - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <CurrencySelector />
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">Hello, {user?.username}</span>
                  <Link href="/orders">
                    <Button variant="ghost" size="sm">Orders</Button>
                  </Link>
                  <Button onClick={handleLogout} variant="ghost" size="sm">
                    Logout
                  </Button>
                </div>
              ) : (
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-700 hover:text-craft-brown">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}

              <Button
                onClick={() => setIsCartOpen(true)}
                variant="ghost"
                className="relative text-gray-700 hover:text-craft-brown"
              >
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
                size="sm"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search handcrafted products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-craft-brown focus:border-transparent"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </form>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-4">
                <CurrencySelector />
                
                {isAuthenticated ? (
                  <>
                    <div className="text-sm text-gray-700">Hello, {user?.username}</div>
                    <Link href="/orders">
                      <Button variant="ghost" className="justify-start w-full">Orders</Button>
                    </Link>
                    <Button onClick={handleLogout} variant="ghost" className="justify-start w-full">
                      Logout
                    </Button>
                  </>
                ) : (
                  <Link href="/login">
                    <Button variant="ghost" className="justify-start w-full">
                      <User className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                )}

                <Button
                  onClick={() => setIsCartOpen(true)}
                  variant="ghost"
                  className="justify-start w-full relative"
                >
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
                  className="justify-start w-full"
                >
                  Support
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <SupportForm isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
    </>
  );
}
