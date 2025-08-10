import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Plus, Minus, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useCurrency } from "@/hooks/useCurrency";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export default function Cart() {
  const { cartItems, totalAmount, updateCart, removeFromCart } = useCart();
  const { formatPrice } = useCurrency();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }
    setLocation("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some beautiful handcrafted items to get started!</p>
            <Link href="/">
              <Button className="bg-craft-brown hover:bg-craft-brown/90">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item: any) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Link href={`/product/${item.product.id}`}>
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                      />
                    </Link>

                    <div className="flex-1">
                      <Link href={`/product/${item.product.id}`}>
                        <h3 className="font-semibold text-gray-900 hover:text-craft-brown cursor-pointer">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600">{item.product.material}</p>
                      <p className="text-sm text-gray-500">From {item.product.countryOfOrigin}</p>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-craft-brown">
                            {formatPrice(item.product.discountedPrice || item.product.originalPrice)}
                          </span>
                          {item.product.discountedPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              {formatPrice(item.product.originalPrice)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => updateCart({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm w-8 text-center">{item.quantity}</span>
                          <Button
                            onClick={() => updateCart({ id: item.id, quantity: item.quantity + 1 })}
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => removeFromCart(item.id)}
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700 ml-4"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Subtotal ({cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0)} items)</span>
                  <span className="font-semibold">{formatPrice(totalAmount)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Shipping</span>
                  <span className="text-craft-green font-semibold">Free</span>
                </div>

                <hr />

                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-craft-brown">{formatPrice(totalAmount)}</span>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full bg-craft-brown hover:bg-craft-brown/90"
                >
                  Proceed to Checkout
                </Button>

                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}