import React from 'react';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, onQuickView }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorited = isInWishlist(product.id);
  const primaryImage = product.images[0] || '';
  const secondaryImage = product.images[1] || primaryImage;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.inStock || product.stockCount <= 0) return;
    addToCart(product);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id, product.name);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickView(product);
  };

  return (
    <article
      onClick={() => onSelect(product)}
      className="group cursor-pointer flex flex-col bg-white border border-[#ECE9E2] rounded-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
    >
      {/* Product Image Frame */}
      <div className="relative aspect-[4/3] bg-[#F7F5F0] overflow-hidden">
        <img
          src={primaryImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Secondary image preview on hover if available */}
        {secondaryImage !== primaryImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
            loading="lazy"
          />
        )}

        {/* Subtle Text Tag (Rule: Zero pills, max 1 quiet tag) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isNewArrival && (
            <span className="text-[11px] font-medium tracking-wider uppercase bg-[#1C1A17]/85 text-white px-2 py-0.5 rounded-[2px]">
              New Arrival
            </span>
          )}
          {product.isBestSeller && !product.isNewArrival && (
            <span className="text-[11px] font-medium tracking-wider uppercase bg-amber-900/80 text-white px-2 py-0.5 rounded-[2px]">
              Atelier Classic
            </span>
          )}
          {!product.inStock && (
            <span className="text-[11px] font-medium tracking-wider uppercase bg-stone-700 text-stone-200 px-2 py-0.5 rounded-[2px]">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
            isFavorited
              ? 'bg-rose-50 text-rose-600 shadow-sm'
              : 'bg-white/80 text-stone-700 hover:bg-white hover:text-black shadow-sm'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Action Overlay Bar */}
        <div className="absolute bottom-3 inset-x-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleQuickViewClick}
            className="flex-1 py-2 px-3 bg-white/95 hover:bg-white text-stone-900 text-xs font-medium tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-sm rounded-sm transition-colors backdrop-blur-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>

          {product.inStock && product.stockCount > 0 ? (
            <button
              onClick={handleQuickAdd}
              className="p-2 bg-[#1C1A17] hover:bg-[#332F2A] text-white rounded-sm shadow-sm transition-colors"
              aria-label="Quick Add to Bag"
              title="Add to Bag"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Metadata: unboxed clean text with typographic separator (Zero-Pill rule) */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 tracking-wider uppercase">
            <span>{product.category}</span>
            {product.rating > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-800 font-medium">★ {product.rating}</span>
                <span className="text-stone-400">({product.reviewCount})</span>
              </>
            )}
          </div>

          {/* Product Name */}
          <h3 className="mt-1.5 text-base font-semibold text-[#1C1A17] tracking-tight group-hover:text-stone-700 transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="mt-1 text-xs text-stone-500 line-clamp-1 leading-relaxed">
            {product.subtitle}
          </p>
        </div>

        {/* Pricing Baseline */}
        <div className="pt-2 border-t border-[#F2EFEB] flex items-center justify-between">
          <div className="flex items-baseline gap-2 tabular-nums">
            <span className="text-base font-semibold text-[#1C1A17]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-stone-400 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Stock state / discount label */}
          {product.inStock && product.discountPercent > 0 ? (
            <span className="text-xs font-medium text-emerald-800 tracking-wider">
              {product.discountPercent}% Off
            </span>
          ) : !product.inStock ? (
            <span className="text-xs text-stone-500 font-medium">Out of Stock</span>
          ) : product.stockCount <= 5 ? (
            <span className="text-xs text-amber-800 font-medium">Only {product.stockCount} left</span>
          ) : (
            <span className="text-xs text-stone-400 uppercase tracking-wider">In Stock</span>
          )}
        </div>
      </div>
    </article>
  );
};
