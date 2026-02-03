
export interface ProductVariant {
  id: string;
  name: string; // e.g. "50ml", "Small"
  price: number;
  stock?: number;
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  images?: string[];
  videoUrl?: string;
  tags: string[];
  sku?: string;
  stock?: number;
  status?: 'Active' | 'Draft' | 'Low Stock' | 'Out of Stock' | 'Archived';
  brand?: string;
  skinTypes?: string[];
  concerns?: string[];
  cost?: number;
  variants?: ProductVariant[];
  couponCodes?: string[];
  gallery?: string[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariant?: ProductVariant;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number; // 1-5
  date: string;
  title?: string;
  content: string;
  verified?: boolean;
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
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentReference?: string;
  couponCode?: string;
  discount?: number;
  returnRequested?: boolean;
  returnReason?: string;
  returnStatus?: 'Pending' | 'Approved' | 'Rejected';
  returnDate?: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  items: CartItem[];
  shippingAddress: string;
  paymentMethod: string;
  deliveryNotes?: string;
  deliveryMapLink?: string;
  deliveryContactPhone?: string;
  trackingNumber?: string;
  returnTrackingNumber?: string;
  userId?: string;
}

export interface Category {
  id: string;
  name: string;
  status: 'Active' | 'Seasonal' | 'Draft';
  displayOrder?: number;
}

export interface UserProfile {
  id: string;
  /** Display username for staff/customer (not auth identifier) */
  username?: string;
  fullName: string;
  email: string;
  statusLabel: string;
  /** Authorization role for admin panel access */
  role?: 'customer' | 'super-admin' | 'admin' | 'manager' | 'editor';
  registrationMethod?: 'admin' | 'web';
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
  // Notification preferences
  notifyMarketing?: boolean;
  notifyOrders?: boolean;
  notifyNewsletter?: boolean;
  wishlist?: string[]; // Array of Product IDs
}

export interface InAppNotification {
  id: string;
  recipientId: string; // 'admin' or userId
  title: string;
  message: string;
  date: string;
  read: boolean;
  link?: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface Coupon {
  id: string; // The code itself will be the document ID
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  expirationDate?: string; // ISO string
  usageLimit?: number;
  usedCount: number;
  status: 'active' | 'disabled';
  isGlobal?: boolean;
}
