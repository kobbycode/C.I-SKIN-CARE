
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
  status?: 'Active' | 'Draft' | 'Low Stock' | 'Out of Stock' | 'Archived';
  brand?: string;
  skinTypes?: string[];
  concerns?: string[];
  cost?: number;
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
  deliveryNotes?: string;
  deliveryMapLink?: string;
  deliveryContactPhone?: string;
}

export interface Category {
  id: string;
  name: string;
  status: 'Active' | 'Seasonal' | 'Draft';
  displayOrder?: number;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  statusLabel: string;
  skinType: string;
  skinTypeDetail: string;
  focusRitual: string;
  focusRitualDetail: string;
  points: number;
  pointsTier: string;
  pointsToNextTier: number;
  joinedDate: string;
  avatar?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryZipCode?: string;
  deliveryPhone?: string;
  deliveryLandmark?: string;
  deliveryInstructions?: string;
  deliveryLocationLat?: number;
  deliveryLocationLng?: number;
}
