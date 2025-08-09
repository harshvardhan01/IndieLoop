export interface ProductWithReviews {
  id: string;
  name: string;
  description: string;
  originalPrice: string;
  discountedPrice?: string | null;
  material: string;
  countryOfOrigin: string;
  images: string[];
  dimensions?: string | null;
  weight?: string | null;
  inStock: boolean;
  reviews?: Review[];
  averageRating?: number;
  reviewCount?: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment?: string | null;
  createdAt: Date;
  userName?: string;
}

export interface CartItemWithProduct {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  product: ProductWithReviews;
  createdAt: Date;
}

export interface ViewMode {
  grid: "grid";
  list: "list";
}

export interface FilterOptions {
  country?: string;
  material?: string;
  search?: string;
}

export interface Product {
	id: string;
	asin: string;
	name: string;
	description: string;
	originalPrice: string;
	discountedPrice?: string;
	material: string;
	countryOfOrigin: string;
	images: string[];
	dimensions?: string;
	weight?: string;
	inStock: boolean;
	featured: boolean;
	createdAt: string;
}