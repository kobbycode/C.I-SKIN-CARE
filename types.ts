
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
  productId: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  verified: boolean;
  images?: string[];
  status: 'Pending' | 'Approved' | 'Rejected';
}
export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string;
  time: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
  items: CartItem[];
  shippingAddress: string;
  paymentMethod: string;
}

export interface Category {
  id: string;
  name: string;
  status: 'Active' | 'Seasonal' | 'Draft';
  displayOrder?: number;
}
