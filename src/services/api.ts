import { User, Product, Order, Coupon, Review, Address } from '../types';

const TOKEN_KEY = 'varenya_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(path, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `HTTP error ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (payload: { fullName: string; email: string; phone: string; password: string }) =>
    request<{ message: string; user: User; token: string; otpPreview?: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  verifyOtp: (otp: string) =>
    request<{ message: string; user: User }>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ otp })
    }),

  resendOtp: () =>
    request<{ message: string; otpPreview?: string }>('/api/auth/resend-otp', {
      method: 'POST'
    }),

  login: (payload: { identifier: string; password: string }) =>
    request<{ message: string; user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  logout: () =>
    request<{ message: string }>('/api/auth/logout', { method: 'POST' }),

  getMe: () =>
    request<{ user: User }>('/api/auth/me'),

  updateProfile: (payload: { fullName?: string; phone?: string }) =>
    request<{ message: string; user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  forgotPassword: (email: string) =>
    request<{ message: string; resetOtpPreview?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  resetPassword: (payload: { email: string; otp: string; newPassword: string }) =>
    request<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  addAddress: (address: Omit<Address, 'id'>) =>
    request<{ message: string; addresses: Address[] }>('/api/auth/addresses', {
      method: 'POST',
      body: JSON.stringify(address)
    }),

  deleteAddress: (id: string) =>
    request<{ message: string; addresses: Address[] }>(`/api/auth/addresses/${id}`, {
      method: 'DELETE'
    }),

  // Products
  getProducts: (params?: { category?: string; search?: string; sort?: string; minPrice?: number; maxPrice?: number; inStock?: boolean; featured?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.sort) query.set('sort', params.sort);
    if (params?.minPrice !== undefined) query.set('minPrice', params.minPrice.toString());
    if (params?.maxPrice !== undefined) query.set('maxPrice', params.maxPrice.toString());
    if (params?.inStock) query.set('inStock', 'true');
    if (params?.featured) query.set('featured', 'true');

    const qs = query.toString();
    return request<{ products: Product[]; total: number; categories: string[] }>(`/api/products${qs ? `?${qs}` : ''}`);
  },

  getProduct: (idOrSlug: string) =>
    request<{ product: Product; reviews: Review[] }>(`/api/products/${idOrSlug}`),

  // Cart & Coupon
  validateCart: (payload: { items: any[]; couponCode?: string }) =>
    request<{
      items: any[];
      pricing: { subtotal: number; discount: number; shipping: number; tax: number; total: number; couponCode?: string };
      couponError?: string | null;
    }>('/api/cart/validate', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  applyCoupon: (code: string, subtotal: number) =>
    request<{ valid: boolean; code: string; discount: number; description: string }>('/api/coupons/apply', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal })
    }),

  // Orders
  createOrder: (payload: {
    items: { productId: string; variantId: string; quantity: number }[];
    shippingAddress: Address;
    couponCode?: string;
    paymentMethod: string;
  }) =>
    request<{ message: string; order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  payOrder: (orderId: string, payload: { paymentMethod: string; upiId?: string; status?: 'success' | 'fail' }) =>
    request<{ message: string; order: Order }>(`/api/orders/${orderId}/pay`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getOrders: () =>
    request<{ orders: Order[] }>('/api/orders'),

  getOrder: (id: string) =>
    request<{ order: Order }>(`/api/orders/${id}`),

  cancelOrder: (id: string, reason?: string) =>
    request<{ message: string; order: Order }>(`/api/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),

  returnOrder: (id: string, reason?: string) =>
    request<{ message: string; order: Order }>(`/api/orders/${id}/return`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),

  // Reviews
  submitReview: (productId: string, payload: { rating: number; title: string; comment: string }) =>
    request<{ message: string; review: Review }>(`/api/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Admin
  getAdminMetrics: () =>
    request<{ metrics: { totalSales: number; totalOrders: number; lowStockCount: number; totalCustomers: number }; recentOrders: Order[] }>('/api/admin/metrics'),

  getAdminProducts: () =>
    request<{ products: Product[] }>('/api/admin/products'),

  createAdminProduct: (payload: any) =>
    request<{ message: string; product: Product }>('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  updateAdminProduct: (id: string, payload: any) =>
    request<{ message: string; product: Product }>(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  deleteAdminProduct: (id: string) =>
    request<{ message: string }>(`/api/admin/products/${id}`, {
      method: 'DELETE'
    }),

  getAdminOrders: () =>
    request<{ orders: Order[] }>('/api/admin/orders'),

  updateAdminOrderStatus: (id: string, status: string, note?: string) =>
    request<{ message: string; order: Order }>(`/api/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note })
    }),

  getAdminCustomers: () =>
    request<{ customers: any[] }>('/api/admin/customers'),

  getAdminCoupons: () =>
    request<{ coupons: Coupon[] }>('/api/admin/coupons'),

  createAdminCoupon: (payload: any) =>
    request<{ message: string; coupon: Coupon }>('/api/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  updateAdminCoupon: (id: string, payload: any) =>
    request<{ message: string; coupon: Coupon }>(`/api/admin/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  deleteAdminCoupon: (id: string) =>
    request<{ message: string }>(`/api/admin/coupons/${id}`, {
      method: 'DELETE'
    }),

  getAdminReviews: () =>
    request<{ reviews: Review[] }>('/api/admin/reviews'),

  updateAdminReviewStatus: (id: string, status: 'approved' | 'rejected') =>
    request<{ message: string; review: Review }>(`/api/admin/reviews/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
};
