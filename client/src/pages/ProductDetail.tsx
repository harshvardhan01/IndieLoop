import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Star, MapPin, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ImageSlideshow from "@/components/ImageSlideshow";
import { useCart } from "@/hooks/useCart";
import { useCurrency } from "@/hooks/useCurrency";
import { useState } from "react";

export default function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const { addToCart, isAdding } = useCart();
  const { formatPrice } = useCurrency();

  const { data: product, isLoading } = useQuery({
    queryKey: ["/api/products", id],
    queryFn: async () => {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error("Failed to fetch product");
      return response.json();
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["/api/products", id, "reviews"],
    queryFn: async () => {
      const response = await fetch(`/api/products/${id}/reviews`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-craft-brown"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const hasDiscount = product.discountedPrice && parseFloat(product.discountedPrice) < parseFloat(product.originalPrice);
  const discountPercentage = hasDiscount 
    ? Math.round(((parseFloat(product.originalPrice) - parseFloat(product.discountedPrice)) / parseFloat(product.originalPrice)) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart({ productId: product.id, quantity });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Slideshow */}
          <div>
            <ImageSlideshow images={product.images} alt={product.name} />
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-600 mb-4">{product.description}</p>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold text-craft-brown">
                    {formatPrice(product.discountedPrice || product.originalPrice)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                      <Badge className="bg-craft-crimson text-white">
                        {discountPercentage}% OFF
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center">
                  <div className="flex text-yellow-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                  <span className="text-gray-600">4.8 ({reviews.length} reviews)</span>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Product Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Material:</span>
                    <span className="ml-2 font-medium">{product.material}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Country of Origin:</span>
                    <span className="ml-2 font-medium flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {product.countryOfOrigin}
                    </span>
                  </div>
                  {product.dimensions && (
                    <div>
                      <span className="text-gray-600">Dimensions:</span>
                      <span className="ml-2 font-medium">{product.dimensions}</span>
                    </div>
                  )}
                  {product.weight && (
                    <div>
                      <span className="text-gray-600">Weight:</span>
                      <span className="ml-2 font-medium">{product.weight}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <Button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    variant="ghost"
                    size="sm"
                    className="px-3 py-1"
                  >
                    -
                  </Button>
                  <span className="px-4 py-1 border-l border-r border-gray-300">{quantity}</span>
                  <Button
                    onClick={() => setQuantity(quantity + 1)}
                    variant="ghost"
                    size="sm"
                    className="px-3 py-1"
                  >
                    +
                  </Button>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={isAdding || !product.inStock}
                  className="flex-1 bg-craft-brown hover:bg-craft-brown/90"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {product.inStock ? (isAdding ? "Adding..." : "Add to Cart") : "Out of Stock"}
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-display font-bold text-gray-900 mb-6">Customer Reviews</h3>
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reviews.map((review: any) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Customer</span>
                        <div className="flex text-yellow-400 text-sm">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
