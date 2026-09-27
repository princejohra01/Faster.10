import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Product, ProductVariant } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const CART_STORAGE_KEY = 'varenya_cart_items';
const COUPON_STORAGE_KEY = 'varenya_cart_coupon';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  couponCode: string;
  appliedCoupon: string | null;
  couponError: string | null;
  isCartOpen: boolean;
  isValidating: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [couponCode, setCouponCode] = useState<string>(() => {
    return localStorage.getItem(COUPON_STORAGE_KEY) || '';
  });

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(() => {
    return localStorage.getItem(COUPON_STORAGE_KEY) || null;
  });

  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [total, setTotal] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const { showToast } = useToast();
  const freeShippingThreshold = 1999;

  // Persist raw items
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Synchronize and validate with backend
  const validateWithServer = useCallback(async () => {
    if (items.length === 0) {
      setSubtotal(0);
      setDiscount(0);
      setShipping(0);
      setTotal(0);
      setCouponError(null);
      return;
    }

    setIsValidating(true);
    try {
      const res = await api.validateCart({
        items: items.map(i => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
        couponCode: appliedCoupon || undefined
      });

      setSubtotal(res.pricing.subtotal);
      setDiscount(res.pricing.discount);
      setShipping(res.pricing.shipping);
      setTotal(res.pricing.total);

      if (res.couponError) {
        setCouponError(res.couponError);
        setAppliedCoupon(null);
        localStorage.removeItem(COUPON_STORAGE_KEY);
      } else if (res.pricing.couponCode) {
        setCouponError(null);
      }
    } catch (err) {
      console.error('Cart validation error', err);
    } finally {
      setIsValidating(false);
    }
  }, [items, appliedCoupon]);

  useEffect(() => {
    validateWithServer();
  }, [validateWithServer]);

  const addToCart = (product: Product, variant?: ProductVariant, quantity = 1) => {
    const activeVariant = variant || product.variants[0];
    const variantId = activeVariant ? activeVariant.id : 'default';
    const variantTitle = activeVariant ? activeVariant.name : 'Standard';
    const price = activeVariant ? activeVariant.price : product.price;
    const originalPrice = activeVariant ? activeVariant.originalPrice : product.originalPrice;
    const stock = activeVariant ? activeVariant.stock : product.stockCount;

    if (stock <= 0) {
      showToast('This item is currently out of stock', 'error');
      return;
    }

    setItems(prev => {
      const existingIndex = prev.findIndex(
        i => i.productId === product.id && i.variantId === variantId
      );

      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = Math.min(stock, next[existingIndex].quantity + quantity);
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: newQty
        };
        return next;
      }

      return [
        ...prev,
        {
          productId: product.id,
          variantId,
          name: product.name,
          category: product.category,
          price,
          originalPrice,
          quantity: Math.min(stock, quantity),
          image: product.images[0] || '',
          variantTitle,
          stock
        }
      ];
    });

    showToast(`Added "${product.name}" to your bag`, 'success');
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }

    setItems(prev =>
      prev.map(item => {
        if (item.productId === productId && item.variantId === variantId) {
          return { ...item, quantity: Math.min(item.stock, quantity) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string, variantId: string) => {
    setItems(prev => prev.filter(i => !(i.productId === productId && i.variantId === variantId)));
    showToast('Item removed from shopping bag', 'info');
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponCode('');
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(COUPON_STORAGE_KEY);
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    if (!code.trim()) return false;
    try {
      const res = await api.applyCoupon(code.trim(), subtotal);
      if (res.valid) {
        setAppliedCoupon(res.code);
        setCouponCode(res.code);
        localStorage.setItem(COUPON_STORAGE_KEY, res.code);
        setCouponError(null);
        showToast(`Coupon ${res.code} applied: Save ₹${res.discount.toLocaleString('en-IN')}`, 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon');
      showToast(err.message || 'Invalid coupon code', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
    localStorage.removeItem(COUPON_STORAGE_KEY);
    showToast('Coupon removed', 'info');
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discount,
        shipping,
        total,
        freeShippingThreshold,
        freeShippingRemaining,
        couponCode,
        appliedCoupon,
        couponError,
        isCartOpen,
        isValidating,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
