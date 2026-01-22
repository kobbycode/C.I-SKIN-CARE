
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  tags: string[];
  sku?: string;
  stock?: number;
  status?: 'Active' | 'Draft' | 'Low Stock' | 'Out of Stock';
  brand?: string;
  skinTypes?: string[];
  concerns?: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  verified: boolean;
  images?: string[];
}
