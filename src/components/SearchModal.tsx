import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { api } from '../services/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onSearchSubmit: (query: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onSearchSubmit
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await api.getProducts({ search: query.trim() });
        setResults(data.products.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && query.trim()) {
      onSearchSubmit(query.trim());
      onClose();
    }
  };

  const trendingQueries = [
    'Mulberry Silk',
    'Cast Brass Vessel',
    'Kashmir Amber',
    'Vegetable-Tanned Leather',
    'Organic Linen'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#FAF9F6] border border-[#E8E5DF] rounded-md shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E8E5DF] flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-stone-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search handcrafted apparel, homeware, fragrance, leather..."
            className="w-full text-sm text-[#1C1A17] placeholder-stone-400 bg-transparent focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-stone-400 hover:text-stone-700"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs uppercase tracking-wider font-semibold text-stone-500 hover:text-black shrink-0 px-2 py-1"
          >
            Cancel
          </button>
        </div>

        {/* Results or Suggestions */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {query.trim() === '' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-stone-500 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Trending Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingQueries.map(tq => (
                  <button
                    key={tq}
                    onClick={() => {
                      setQuery(tq);
                      onSearchSubmit(tq);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-[#F2EFEB] hover:bg-stone-200 text-stone-800 text-xs rounded-sm transition-colors"
                  >
                    {tq}
                  </button>
                ))}
              </div>
            </div>
          ) : isSearching ? (
            <div className="py-8 text-center text-xs text-stone-500">Searching atelier catalog...</div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                Catalog Matches ({results.length})
              </span>
              <div className="divide-y divide-[#E8E5DF]">
                {results.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      onSelectProduct(prod);
                      onClose();
                    }}
                    className="py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F5F2EB] px-2 rounded-sm transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-sm object-cover shrink-0"
                      />
                      <div>
                        <h4 className="text-xs font-semibold text-[#1C1A17]">{prod.name}</h4>
                        <span className="text-[11px] text-stone-500 uppercase tracking-wider">
                          {prod.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-semibold text-[#1C1A17] tabular-nums">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  onSearchSubmit(query.trim());
                  onClose();
                }}
                className="w-full mt-2 py-2 text-xs font-semibold uppercase tracking-wider text-stone-800 hover:text-black flex items-center justify-center gap-1 border-t border-[#E8E5DF] pt-3"
              >
                <span>View all results for &ldquo;{query}&rdquo;</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs text-stone-600 font-medium">No creations match &ldquo;{query}&rdquo;</p>
              <p className="text-[11px] text-stone-400">Try searching for &ldquo;Linen&rdquo;, &ldquo;Brass&rdquo;, or &ldquo;Parfum&rdquo;</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
