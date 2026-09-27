import React, { useState } from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface CartDrawerProps {
  onNavigateToCheckout: () => void;
  onNavigateToShop: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigateToCheckout, onNavigateToShop }) => {
  const {
    items,
    itemCount,
    subtotal,
    discount,
    shipping,
    total,
    freeShippingThreshold,
    freeShippingRemaining,
    appliedCoupon,
    couponError,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon
  } = useCart();

  const { user, openAuthModal } = useAuth();
  const [promoInput, setPromoInput] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    setIsApplyingPromo(true);
    await applyCoupon(promoInput.trim());
    setIsApplyingPromo(false);
    setPromoInput('');
  };

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    if (!user) {
      openAuthModal('login', () => {
        onNavigateToCheckout();
      });
    } else {
      onNavigateToCheckout();
    }
  };

  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF9F6] border-l border-[#E8E5DF] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#E8E5DF] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#1C1A17]" />
              <h2 className="text-base font-serif font-bold uppercase tracking-wider text-[#1C1A17]">
                Shopping Bag ({itemCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-stone-500 hover:text-black transition-colors rounded-sm"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="bg-[#F2EFEB] px-6 py-3 border-b border-[#E8E5DF] text-xs">
            {freeShippingRemaining > 0 ? (
              <p className="text-stone-700">
                Add <strong className="text-[#1C1A17] font-semibold">₹{freeShippingRemaining.toLocaleString('en-IN')}</strong> more for complimentary insured delivery.
              </p>
            ) : (
              <p className="text-emerald-800 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                You have unlocked complimentary express delivery!
              </p>
            )}
            <div className="w-full bg-stone-300 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#1C1A17] h-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#E8E5DF]">
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-14 h-14 bg-stone-200 rounded-full flex items-center justify-center mx-auto text-stone-500">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="text-base font-serif font-semibold text-stone-800">Your bag is empty</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Explore our handcrafted linen tunics, sand-cast brass homeware, and botanical fragrances.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigateToShop();
                  }}
                  className="mt-2 py-2.5 px-6 bg-[#1C1A17] text-white text-xs font-semibold tracking-widest uppercase rounded-sm hover:bg-black transition-colors"
                >
                  Discover Collections
                </button>
              </div>
            ) : (
              items.map(item => (
                <div key={`${item.productId}-${item.variantId}`} className="py-4 flex gap-4">
                  <div className="w-20 h-20 bg-stone-200 rounded-sm overflow-hidden shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-[#1C1A17] line-clamp-1">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.productId, item.variantId)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-0.5"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {item.variantTitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity stepper */}
                      <div className="flex items-center border border-stone-300 rounded-sm bg-white">
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-stone-600 hover:text-black"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-stone-600 hover:text-black"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Line price */}
                      <span className="text-xs font-semibold text-[#1C1A17] tabular-nums">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="border-t border-[#E8E5DF] p-6 bg-white space-y-4">
              {/* Coupon Form */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-sm text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Coupon <strong>{appliedCoupon}</strong> active</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-stone-500 hover:text-rose-700 font-semibold underline text-[11px]"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={e => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code (e.g. WELCOME10)"
                    className="border border-stone-300 px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-stone-800 grow uppercase tracking-wider"
                  />
                  <button
                    type="submit"
                    disabled={isApplyingPromo}
                    className="px-4 py-2 bg-stone-800 text-white text-xs font-semibold tracking-wider uppercase rounded-sm hover:bg-black transition-colors shrink-0"
                  >
                    Apply
                  </button>
                </form>
              )}

              {couponError && (
                <p className="text-[11px] text-rose-600">{couponError}</p>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs border-t border-stone-100 pt-3">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-medium">
                    <span>Discount</span>
                    <span className="tabular-nums">-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Insured Shipping</span>
                  <span className="tabular-nums">
                    {shipping === 0 ? <span className="text-emerald-800 font-medium">Complimentary</span> : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-stone-500 text-[11px]">
                  <span>GST (Inclusive)</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#1C1A17] pt-2 border-t border-stone-200">
                  <span>Estimated Total</span>
                  <span className="tabular-nums">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckoutClick}
                className="w-full py-3.5 px-4 bg-[#1C1A17] hover:bg-black text-white text-xs font-semibold tracking-widest uppercase rounded-sm flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsCartOpen(false)}
                className="w-full text-center text-xs text-stone-600 hover:text-black font-medium transition-colors"
              >
                Continue Browsing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
