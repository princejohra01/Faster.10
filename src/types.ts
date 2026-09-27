export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  originalPrice: number;
  stock: number;
  color?: string;
  size?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: 'Apparel & Textiles' | 'Living & Objects' | 'Botanical Fragrance' | 'Leather Goods';
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  images: string[];
  description: string;
  details: {
    materials: string[];
    care: string[];
    dimensions?: string;
    origin: string;
  };
  variants: ProductVariant[];
  sku: string;
  createdAt: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  isVerified: boolean;
  savedAddresses: Address[];
  createdAt: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: string;
  variantTitle: string;
  stock: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiresAt: string;
  usageCount: number;
  usageLimit?: number;
  isActive: boolean;
  description: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variantTitle: string;
}

export interface OrderTimeline {
  status: OrderStatus;
  title: string;
  time: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  shippingAddress: Address;
  items: OrderItem[];
  pricing: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number; // Included in total / GST
    total: number;
    couponCode?: string;
  };
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string;
    upiId?: string;
    paidAt?: string;
  };
  status: OrderStatus;
  timeline: OrderTimeline[];
  createdAt: string;
  updatedAt: string;
}
