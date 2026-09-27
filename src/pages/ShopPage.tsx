import React, { useState, useMemo } from 'react';
import { Filter, X, SlidersHorizontal, ArrowUpDown, Check } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

interface ShopPageProps {
  products: Product[];
  initialCategory?: string;
  initialSearch?: string;
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  initialCategory = 'all',
  initialSearch = '',
  onSelectProduct,
  onQuickView
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSort, setSelectedSort] = useState<string>('recommended');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [priceRange, setPriceRange] = useState<number>(20000);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  const categories = [
    'all',
    'Apparel & Textiles',
    'Living & Objects',
    'Botanical Fragrance',
    'Leather Goods'
  ];

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategory !== 'all') {
      list = list.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.details.materials.some(m => m.toLowerCase().includes(q))
      );
    }

    if (onlyInStock) {
      list = list.filter(p => p.inStock && p.stockCount > 0);
    }

    list = list.filter(p => p.price <= priceRange);

    if (selectedSort === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (selectedSort === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (selectedSort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (selectedSort === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (selectedSort === 'discount') {
      list.sort((a, b) => b.discountPercent - a.discountPercent);
    }

    return list;
  }, [products, selectedCategory, searchQuery, onlyInStock, priceRange, selectedSort]);

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setOnlyInStock(false);
    setPriceRange(20000);
    setSelectedSort('recommended');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    searchQuery.trim() !== '' ||
    onlyInStock ||
    priceRange < 20000;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Title & Description */}
      <div className="border-b border-[#E8E5DF] pb-8 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs tracking-[0.2em] uppercase font-semibold text-stone-500">
            The Atelier Catalog
          </span>
          <h1 className="mt-1 text-3xl sm:text-4xl font-serif font-bold text-[#1C1A17]">
            {selectedCategory === 'all' ? 'All Handcrafted Creations' : selectedCategory}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-stone-600 max-w-xl">
            Ethically sourced natural textiles, sand-cast brass homeware, and pure botanical perfumery.
          </p>
        </div>

        {/* Total counts */}
        <div className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
          Showing <span className="text-stone-900 tabular-nums">{filteredProducts.length}</span> of <span className="tabular-nums">{products.length}</span> items
        </div>
      </div>

      {/* Control Bar: Mobile Filter Button & Desktop Sort */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {/* Mobile filter toggle */}
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="lg:hidden py-2 px-3 bg-white border border-stone-300 rounded-sm text-xs font-semibold uppercase tracking-wider text-stone-800 flex items-center gap-2"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filters {hasActiveFilters && '•'}</span>
        </button>

        {/* Search status / Clear tag */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          {searchQuery && (
            <span className="bg-stone-200 text-stone-800 px-2.5 py-1 rounded-sm flex items-center gap-1.5">
              &ldquo;{searchQuery}&rdquo;
              <button onClick={() => setSearchQuery('')} aria-label="Clear search">
                <X className="w-3 h-3 hover:text-black" />
              </button>
            </span>
          )}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-stone-500 hover:text-black underline text-xs whitespace-nowrap ml-2"
            >
              Reset All Filters
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 ml-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 hidden sm:inline" />
          <span className="text-xs uppercase tracking-wider font-semibold text-stone-600 hidden sm:inline">
            Sort By:
          </span>
          <select
            value={selectedSort}
            onChange={e => setSelectedSort(e.target.value)}
            className="text-xs bg-white border border-stone-300 py-1.5 px-3 rounded-sm text-stone-800 focus:outline-none focus:border-stone-800 cursor-pointer"
          >
            <option value="recommended">Recommended</option>
            <option value="newest">Newest Additions</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Customer Rating</option>
            <option value="discount">Highest Discount</option>
          </select>
        </div>
      </div>

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="hidden lg:block space-y-6 pr-4 border-r border-[#E8E5DF]">
          {/* Category Filter */}
          <div>
            <h3 className="text-xs uppercase tracking-widest font-semibold text-stone-800 mb-3">
              Category
            </h3>
            <div className="space-y-1.5">
              {categories.map(cat => {
                const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`block w-full text-left text-xs py-1.5 px-2 rounded-sm transition-colors ${
                      isSelected
                        ? 'bg-[#1C1A17] text-white font-semibold'
                        : 'text-stone-600 hover:bg-[#F2EFEB] hover:text-stone-900'
                    }`}
                  >
                    {cat === 'all' ? 'All Curations' : cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="pt-6 border-t border-[#E8E5DF]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="uppercase tracking-widest font-semibold text-stone-800">
                Max Price
              </span>
              <span className="font-semibold text-stone-900 tabular-nums">
                ₹{priceRange.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="2000"
              max="20000"
              step="500"
              value={priceRange}
              onChange={e => setPriceRange(Number(e.target.value))}
              className="w-full accent-[#1C1A17] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-400 mt-1">
              <span>₹2,000</span>
              <span>₹20,000</span>
            </div>
          </div>

          {/* Availability */}
          <div className="pt-6 border-t border-[#E8E5DF]">
            <h3 className="text-xs uppercase tracking-widest font-semibold text-stone-800 mb-3">
              Availability
            </h3>
            <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={e => setOnlyInStock(e.target.checked)}
                className="rounded-sm accent-[#1C1A17] w-4 h-4 cursor-pointer"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          {/* Trust note */}
          <div className="p-4 bg-[#F5F2EB] rounded-sm text-xs text-stone-600 leading-relaxed border border-[#E8E5DF]">
            <p className="font-semibold text-[#1C1A17] mb-1">Direct From Master Guilds</p>
            Every piece is certified authentic, inspected individually, and backed by a 7-day atelier return guarantee.
          </div>
        </aside>

        {/* PRODUCT GRID */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center bg-white border border-[#E8E5DF] rounded-sm p-8 space-y-4">
              <SlidersHorizontal className="w-10 h-10 text-stone-400 mx-auto" />
              <h3 className="text-lg font-serif font-semibold text-stone-800">
                No matching creations found
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                We couldn&rsquo;t find any products matching your specific combination of filters. Try broadening your criteria or resetting filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="py-2.5 px-6 bg-[#1C1A17] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-black transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                  onQuickView={onQuickView}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FILTER BOTTOM SHEET */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative bg-[#FAF9F6] border-t border-[#E8E5DF] rounded-t-xl p-6 max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DF]">
              <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-stone-900">
                Refine Curations
              </h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-stone-500 hover:text-black"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category selection */}
            <div>
              <span className="block text-xs uppercase tracking-wider font-semibold text-stone-800 mb-2">
                Category
              </span>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`py-2 px-3 text-xs rounded-sm border transition-colors ${
                      selectedCategory.toLowerCase() === cat.toLowerCase()
                        ? 'border-[#1C1A17] bg-[#1C1A17] text-white font-semibold'
                        : 'border-stone-300 bg-white text-stone-800'
                    }`}
                  >
                    {cat === 'all' ? 'All Curations' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price slider */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="font-semibold uppercase tracking-wider text-stone-800">Max Price</span>
                <span className="font-semibold text-stone-900 tabular-nums">₹{priceRange.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="2000"
                max="20000"
                step="500"
                value={priceRange}
                onChange={e => setPriceRange(Number(e.target.value))}
                className="w-full accent-[#1C1A17]"
              />
            </div>

            {/* Stock checkbox */}
            <div>
              <label className="flex items-center gap-2.5 text-xs text-stone-800">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={e => setOnlyInStock(e.target.checked)}
                  className="rounded-sm accent-[#1C1A17] w-4 h-4"
                />
                <span>In Stock Only</span>
              </label>
            </div>

            <div className="pt-4 border-t border-[#E8E5DF] flex gap-3">
              <button
                onClick={() => {
                  clearAllFilters();
                  setMobileFilterOpen(false);
                }}
                className="flex-1 py-3 border border-stone-300 text-stone-800 text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-stone-100"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 bg-[#1C1A17] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-black"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
