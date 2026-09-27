import React, { useState } from 'react';
import { Heart, ShoppingBag, Truck, RefreshCw, ShieldCheck, Check, Star, ArrowRight, Share2 } from 'lucide-react';
import { Product, ProductVariant, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

interface ProductDetailPageProps {
  product: Product;
  reviews: Review[];
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigateToCheckout: () => void;
  onNavigateToShop: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  reviews: initialReviews,
  allProducts,
  onSelectProduct,
  onNavigateToCheckout,
  onNavigateToShop
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0] || { id: 'default', name: 'Standard', sku: product.sku, price: product.price, originalPrice: product.originalPrice, stock: product.stockCount }
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'materials' | 'dimensions' | 'care' | 'origin'>('materials');
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  // Review submission state
  const [reviewsList, setReviewsList] = useState<Review[]>(initialReviews);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const isFavorited = isInWishlist(product.id);
  const activePrice = selectedVariant ? selectedVariant.price : product.price;
  const activeOriginalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;
  const activeStock = selectedVariant ? selectedVariant.stock : product.stockCount;

  const handleAddToCart = () => {
    if (activeStock <= 0) return;
    addToCart(product, selectedVariant, quantity);
  };

  const handleBuyNow = () => {
    if (activeStock <= 0) return;
    addToCart(product, selectedVariant, quantity);
    onNavigateToCheckout();
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincodeInput.trim())) {
      setPincodeStatus('Please enter a valid 6-digit Indian PIN code');
      return;
    }
    setPincodeStatus(`Available! Estimated delivery within 2–3 business days via Bluedart Air to PIN ${pincodeInput.trim()}`);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard', 'info');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login', () => setShowReviewForm(true));
      return;
    }

    if (!newReviewComment.trim()) {
      showToast('Please provide your review comments', 'error');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await api.submitReview(product.id, {
        rating: newRating,
        title: newReviewTitle.trim() || 'Verified Review',
        comment: newReviewComment.trim()
      });
      setReviewsList([res.review, ...reviewsList]);
      setShowReviewForm(false);
      setNewReviewTitle('');
      setNewReviewComment('');
      showToast('Your review has been published. Thank you!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const relatedProducts = allProducts
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-stone-500 uppercase tracking-wider">
        <button onClick={onNavigateToShop} className="hover:text-black transition-colors">
          Catalog
        </button>
        <span aria-hidden="true">/</span>
        <button
          onClick={() => onNavigateToShop()}
          className="hover:text-black transition-colors"
        >
          {product.category}
        </button>
        <span aria-hidden="true">/</span>
        <span className="text-stone-900 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Contiguous Purchase Module (Rule 2.A: Sticky gallery left, Sticky purchase module right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* LEFT COLUMN: Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] rounded-sm overflow-hidden bg-[#F5F2EB] border border-[#E8E5DF] shadow-sm">
            <img
              src={product.images[activeImageIdx] || product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <button
              onClick={handleShare}
              className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full text-stone-700 shadow-sm transition-colors"
              aria-label="Share product"
              title="Copy share link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-20 h-20 rounded-sm overflow-hidden border-2 transition-all shrink-0 ${
                    activeImageIdx === idx ? 'border-[#1C1A17] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Contiguous Purchase Module */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
          <div>
            <div className="flex items-center justify-between text-xs tracking-wider uppercase text-stone-500 font-medium">
              <span>{product.category}</span>
              <div className="flex items-center gap-1 text-amber-800">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="font-semibold">{product.rating}</span>
                <span className="text-stone-400">({product.reviewCount} reviews)</span>
              </div>
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-serif font-bold text-[#1C1A17] tracking-tight">
              {product.name}
            </h1>

            <p className="mt-1 text-xs text-stone-600 leading-relaxed">
              {product.subtitle}
            </p>
          </div>

          {/* Price Baseline */}
          <div className="flex items-baseline gap-3 pt-2 border-t border-[#E8E5DF]">
            <span className="text-2xl font-bold text-[#1C1A17] tabular-nums">
              ₹{activePrice.toLocaleString('en-IN')}
            </span>
            {activeOriginalPrice > activePrice && (
              <span className="text-sm text-stone-400 line-through tabular-nums">
                ₹{activeOriginalPrice.toLocaleString('en-IN')}
              </span>
            )}
            {product.discountPercent > 0 && (
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-[2px]">
                Save {product.discountPercent}%
              </span>
            )}
          </div>
          <p className="text-[11px] text-stone-500">
            Price inclusive of all applicable taxes (GST). Complimentary insured courier on this order.
          </p>

          {/* Variants Selector */}
          {product.variants.length > 1 && (
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-800">
                Select Option: <span className="font-normal text-stone-900">{selectedVariant.name}</span>
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
                      className={`px-3.5 py-2 text-xs font-medium rounded-sm border transition-all ${
                        isSelected
                          ? 'border-[#1C1A17] bg-[#1C1A17] text-white shadow-sm'
                          : isAvailable
                          ? 'border-stone-300 bg-white text-stone-800 hover:border-stone-800'
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

          {/* Stock & Quantity */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="uppercase tracking-wider font-semibold text-stone-800">Quantity</span>
              {activeStock > 5 ? (
                <span className="text-emerald-800 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> In stock at atelier
                </span>
              ) : activeStock > 0 ? (
                <span className="text-amber-800 font-medium">Only {activeStock} units left</span>
              ) : (
                <span className="text-rose-700 font-medium">Out of Stock</span>
              )}
            </div>

            {activeStock > 0 && (
              <div className="flex items-center border border-stone-300 rounded-sm bg-white w-32">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 py-2 text-stone-600 hover:text-black font-semibold"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="flex-1 text-center text-xs font-semibold tabular-nums">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(activeStock, quantity + 1))}
                  className="w-10 py-2 text-stone-600 hover:text-black font-semibold"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-2">
            <div className="flex gap-3">
              <button
                disabled={activeStock <= 0}
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 px-4 rounded-sm text-xs font-semibold tracking-widest uppercase flex items-center justify-center gap-2 transition-all shadow-sm ${
                  activeStock > 0
                    ? 'bg-[#1C1A17] text-white hover:bg-black'
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{activeStock > 0 ? 'Add to Shopping Bag' : 'Out of Stock'}</span>
              </button>

              <button
                onClick={() => toggleWishlist(product.id, product.name)}
                className={`p-3.5 border rounded-sm transition-colors ${
                  isFavorited
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-stone-300 bg-white text-stone-700 hover:border-black'
                }`}
                aria-label="Toggle Wishlist"
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            {activeStock > 0 && (
              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 px-4 border border-[#1C1A17] text-[#1C1A17] hover:bg-[#1C1A17] hover:text-white text-xs font-semibold tracking-widest uppercase rounded-sm transition-colors"
              >
                Instant Buy Now
              </button>
            )}
          </div>

          {/* Delivery & Pincode Checker */}
          <div className="pt-4 border-t border-[#E8E5DF] space-y-3">
            <span className="block text-xs uppercase tracking-wider font-semibold text-stone-800">
              Check Pan-India Dispatch Timeline
            </span>
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincodeInput}
                onChange={e => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit PIN (e.g. 560038)"
                className="text-xs px-3 py-2 border border-stone-300 rounded-sm focus:outline-none focus:border-stone-800 grow"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-stone-800 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-sm shrink-0"
              >
                Check
              </button>
            </form>
            {pincodeStatus && (
              <p className="text-xs text-stone-700 bg-stone-100 p-2.5 rounded-sm border border-stone-200">
                {pincodeStatus}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-stone-500 shrink-0" />
                <span>Complimentary Delivery &gt; ₹1,999</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-stone-500 shrink-0" />
                <span>7-Day Doorstep Returns</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-stone-500 shrink-0" />
                <span>Artisan Certified Pure</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-stone-500 shrink-0" />
                <span>COD Available Pan-India</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Details Tabs */}
      <div className="border-t border-[#E8E5DF] pt-12 space-y-6">
        <div className="flex border-b border-[#E8E5DF] gap-8 text-xs uppercase tracking-widest font-semibold text-stone-500">
          <button
            onClick={() => setActiveTab('materials')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'materials' ? 'text-black after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-black' : 'hover:text-black'
            }`}
          >
            Materials & Weave
          </button>
          <button
            onClick={() => setActiveTab('dimensions')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'dimensions' ? 'text-black after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-black' : 'hover:text-black'
            }`}
          >
            Dimensions & Fit
          </button>
          <button
            onClick={() => setActiveTab('care')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'care' ? 'text-black after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-black' : 'hover:text-black'
            }`}
          >
            Preservation & Care
          </button>
          <button
            onClick={() => setActiveTab('origin')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'origin' ? 'text-black after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-black' : 'hover:text-black'
            }`}
          >
            Artisan Provenance
          </button>
        </div>

        <div className="text-xs sm:text-sm text-stone-700 leading-relaxed max-w-3xl">
          {activeTab === 'materials' && (
            <ul className="space-y-2 list-disc list-inside">
              {product.details.materials.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
              <li className="mt-3 text-stone-500 italic">
                {product.description}
              </li>
            </ul>
          )}

          {activeTab === 'dimensions' && (
            <p>{product.details.dimensions || 'Standard artisanal proportions.'}</p>
          )}

          {activeTab === 'care' && (
            <ul className="space-y-2 list-disc list-inside">
              {product.details.care.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          )}

          {activeTab === 'origin' && (
            <div className="space-y-2">
              <p><strong>Artisan Cluster:</strong> {product.details.origin}</p>
              <p className="text-stone-500">
                Created through generational artisanal lineages adhering strictly to fair wages, safe atelier conditions, and traditional zero-waste principles.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Verified Customer Reviews Section */}
      <section className="border-t border-[#E8E5DF] pt-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs tracking-[0.2em] uppercase font-semibold text-stone-500">
              Patron Reviews
            </span>
            <h2 className="mt-1 text-2xl font-serif font-bold text-[#1C1A17]">
              Customer Experiences ({reviewsList.length})
            </h2>
          </div>

          <button
            onClick={() => {
              if (!user) {
                openAuthModal('login', () => setShowReviewForm(true));
              } else {
                setShowReviewForm(!showReviewForm);
              }
            }}
            className="py-2.5 px-5 bg-white border border-stone-800 text-[#1C1A17] hover:bg-stone-100 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors self-start sm:self-auto"
          >
            {showReviewForm ? 'Close Form' : 'Write a Review'}
          </button>
        </div>

        {/* Add Review Form */}
        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} className="bg-white p-6 rounded-sm border border-[#E8E5DF] space-y-4 max-w-xl animate-in fade-in">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-900">
              Share Your Atelier Experience
            </h3>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Star Rating
              </label>
              <div className="flex gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-5 h-5 ${star <= newRating ? 'fill-current' : 'text-stone-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Headline
              </label>
              <input
                type="text"
                value={newReviewTitle}
                onChange={e => setNewReviewTitle(e.target.value)}
                placeholder="e.g. Sublime fabric weight and fit"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-sm focus:outline-none focus:border-stone-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Review Comments
              </label>
              <textarea
                rows={4}
                value={newReviewComment}
                onChange={e => setNewReviewComment(e.target.value)}
                placeholder="Describe the texture, weight, sizing, and everyday utility of this piece..."
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-sm focus:outline-none focus:border-stone-800"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingReview}
              className="py-2.5 px-6 bg-[#1C1A17] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors"
            >
              {isSubmittingReview ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="divide-y divide-[#E8E5DF] border-y border-[#E8E5DF]">
          {reviewsList.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-500">
              No reviews recorded for this creation yet. Be the first patron to share your experience.
            </div>
          ) : (
            reviewsList.map(review => (
              <div key={review.id} className="py-6 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900">{review.userName}</span>
                    {review.verifiedPurchase && (
                      <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-[2px] font-semibold">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-stone-400 text-[11px]">
                    {new Date(review.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-amber-700 text-xs">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                  <strong className="text-stone-900 font-semibold ml-2">{review.title}</strong>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
                  {review.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-[#E8E5DF] pt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif font-bold text-[#1C1A17]">
              Complements & Related Curations
            </h3>
            <button
              onClick={onNavigateToShop}
              className="text-xs font-semibold uppercase tracking-wider text-stone-700 hover:text-black flex items-center gap-1"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map(p => (
              <div
                key={p.id}
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  onSelectProduct(p);
                }}
                className="group cursor-pointer bg-white border border-[#E8E5DF] rounded-sm p-3 hover:shadow-md transition-all"
              >
                <div className="aspect-[4/3] bg-stone-100 rounded-sm overflow-hidden mb-3">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <h4 className="text-xs font-semibold text-stone-900 line-clamp-1">{p.name}</h4>
                <div className="mt-1 text-xs font-semibold text-stone-900 tabular-nums">
                  ₹{p.price.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
