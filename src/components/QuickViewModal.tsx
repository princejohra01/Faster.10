import React, { useState } from 'react';
import { X, Heart, ShoppingBag, ArrowRight, Check } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenDetails: (product: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose, onOpenDetails }) => {
  if (!product) return null;

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0] || { id: 'default', name: 'Standard', sku: product.sku, price: product.price, originalPrice: product.originalPrice, stock: product.stockCount }
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorited = isInWishlist(product.id);
  const activePrice = selectedVariant ? selectedVariant.price : product.price;
  const activeOriginalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;
  const activeStock = selectedVariant ? selectedVariant.stock : product.stockCount;

  const handleAddToCart = () => {
    if (activeStock <= 0) return;
    addToCart(product, selectedVariant, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-[#FAF9F6] border border-[#E8E5DF] rounded-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white text-stone-700 hover:text-black rounded-full transition-colors shadow-sm"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery Column */}
        <div className="md:w-1/2 p-6 bg-[#F5F2EB] flex flex-col justify-between">
          <div className="aspect-[4/3] rounded-sm overflow-hidden bg-stone-200 shadow-inner">
            <img
              src={product.images[activeImageIdx] || product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-14 h-14 rounded-sm overflow-hidden border-2 transition-all shrink-0 ${
                    activeImageIdx === idx ? 'border-[#1C1A17]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-[#E8E5DF] text-xs text-stone-600">
            <span className="font-semibold text-stone-800">Provenance: </span>
            {product.details.origin}
          </div>
        </div>

        {/* Info Column */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">
                {product.category}
              </span>
              <button
                onClick={() => toggleWishlist(product.id, product.name)}
                className={`p-1.5 rounded-full transition-colors ${
                  isFavorited ? 'text-rose-600' : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            <h2 className="mt-2 text-xl font-serif font-bold text-[#1C1A17] tracking-tight">
              {product.name}
            </h2>

            <p className="mt-1 text-xs text-stone-600 leading-relaxed">
              {product.subtitle}
            </p>

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-xl font-bold text-[#1C1A17] tabular-nums">
                ₹{activePrice.toLocaleString('en-IN')}
              </span>
              {activeOriginalPrice > activePrice && (
                <span className="text-sm text-stone-400 line-through tabular-nums">
                  ₹{activeOriginalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {product.discountPercent > 0 && (
                <span className="text-xs font-semibold text-emerald-800">
                  {product.discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Variants */}
            {product.variants.length > 1 && (
              <div className="mt-6">
                <label className="block text-xs uppercase tracking-wider font-semibold text-stone-700 mb-2">
                  Select Specification: <span className="font-normal text-stone-900">{selectedVariant.name}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(variant => {
                    const isSelected = selectedVariant.id === variant.id;
                    const isAvailable = variant.stock > 0;
                    return (
                      <button
                        key={variant.id}
                        disabled={!isAvailable}
                        onClick={() => {
                          setSelectedVariant(variant);
                          setQuantity(1);
                        }}
                        className={`px-3 py-2 text-xs font-medium rounded-sm border transition-all ${
                          isSelected
                            ? 'border-[#1C1A17] bg-[#1C1A17] text-white shadow-sm'
                            : isAvailable
                            ? 'border-stone-300 bg-white text-stone-800 hover:border-stone-600'
                            : 'border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed line-through'
                        }`}
                      >
                        {variant.size || variant.color || variant.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock indicator */}
            <div className="mt-4 text-xs">
              {activeStock > 5 ? (
                <span className="text-emerald-800 font-medium flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> In stock at Indian atelier
                </span>
              ) : activeStock > 0 ? (
                <span className="text-amber-800 font-medium">
                  Hurry, only {activeStock} units remaining
                </span>
              ) : (
                <span className="text-rose-700 font-medium">Currently Sold Out</span>
              )}
            </div>

            {/* Quantity */}
            {activeStock > 0 && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs uppercase tracking-wider font-semibold text-stone-700">Quantity</span>
                <div className="flex items-center border border-stone-300 rounded-sm bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-sm text-stone-600 hover:text-black"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-semibold tabular-nums">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(activeStock, quantity + 1))}
                    className="px-3 py-1 text-sm text-stone-600 hover:text-black"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-4 border-t border-[#E8E5DF] space-y-2">
            <button
              disabled={activeStock <= 0}
              onClick={handleAddToCart}
              className={`w-full py-3 px-4 rounded-sm text-xs font-semibold tracking-widest uppercase flex items-center justify-center gap-2 transition-all shadow-sm ${
                activeStock > 0
                  ? 'bg-[#1C1A17] text-white hover:bg-black'
                  : 'bg-stone-300 text-stone-500 cursor-not-allowed'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{activeStock > 0 ? 'Add to Shopping Bag' : 'Out of Stock'}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenDetails(product);
              }}
              className="w-full py-2.5 px-4 text-xs font-medium tracking-wider uppercase text-stone-700 hover:text-black hover:underline flex items-center justify-center gap-1 transition-colors"
            >
              <span>Explore Complete Details & Care</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
