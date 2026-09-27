import React, { useState } from 'react';
import { Search, ShoppingBag, Heart, User as UserIcon, Menu, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string, meta?: any) => void;
  onSearchOpen: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onNavigate, onSearchOpen }) => {
  const { user, openAuthModal, logout } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [topBannerDismissed, setTopBannerDismissed] = useState(false);

  const handleNav = (tab: string, meta?: any) => {
    onNavigate(tab, meta);
    setMobileMenuOpen(false);
    setAccountDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E8E5DF] transition-all">
      {/* Slim Promotional Bar (Section 2.C: <= 40px, dismissible) */}
      {!topBannerDismissed && (
        <aside aria-label="Complimentary shipping notice" className="bg-[#1C1A17] text-[#EDEAE4] text-xs py-2 px-4 flex items-center justify-between text-center tracking-wide">
          <div className="mx-auto flex items-center gap-2">
            <span>Complimentary express delivery across India on orders above ₹1,999</span>
            <span aria-hidden="true" className="text-stone-500">·</span>
            <span className="hidden sm:inline">Use code <strong className="text-amber-300 font-semibold">WELCOME10</strong> for 10% off</span>
          </div>
          <button
            onClick={() => setTopBannerDismissed(true)}
            className="text-stone-400 hover:text-white transition-colors p-0.5 ml-2"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}

      {/* Main Header adhering strictly to Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
        {/* Mobile Hamburger toggle */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#1C1A17] hover:text-stone-600 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => handleNav('home')}
          className="text-2xl sm:text-3xl font-serif tracking-[0.25em] text-[#1C1A17] font-semibold hover:opacity-85 transition-opacity text-left uppercase"
        >
          VARENYA
        </button>

        {/* Zone 2: 4-6 clean text navigation links with subtle hover underlines */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium tracking-wider text-[#2A2622] uppercase">
          <button
            onClick={() => handleNav('shop', { category: 'all' })}
            className={`transition-colors hover:text-stone-500 whitespace-nowrap py-1 relative ${
              currentTab === 'shop' ? 'font-semibold text-black after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#1C1A17]' : ''
            }`}
          >
            Shop All
          </button>
          <button
            onClick={() => handleNav('shop', { category: 'Apparel & Textiles' })}
            className="transition-colors hover:text-stone-500 whitespace-nowrap py-1"
          >
            Apparel
          </button>
          <button
            onClick={() => handleNav('shop', { category: 'Living & Objects' })}
            className="transition-colors hover:text-stone-500 whitespace-nowrap py-1"
          >
            Living
          </button>
          <button
            onClick={() => handleNav('shop', { category: 'Botanical Fragrance' })}
            className="transition-colors hover:text-stone-500 whitespace-nowrap py-1"
          >
            Fragrance
          </button>
          <button
            onClick={() => handleNav('shop', { category: 'Leather Goods' })}
            className="transition-colors hover:text-stone-500 whitespace-nowrap py-1"
          >
            Leather
          </button>
          <button
            onClick={() => handleNav('story')}
            className={`transition-colors hover:text-stone-500 whitespace-nowrap py-1 ${
              currentTab === 'story' ? 'font-semibold text-black' : ''
            }`}
          >
            Atelier
          </button>
        </nav>

        {/* Zone 3: 1-2 primary action clusters */}
        <div className="flex items-center gap-2 sm:gap-4 text-[#1C1A17]">
          {/* Search Trigger */}
          <button
            onClick={onSearchOpen}
            className="p-2 hover:text-stone-600 transition-colors"
            aria-label="Search products"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Wishlist */}
          <button
            onClick={() => {
              if (user) {
                handleNav('profile', { subTab: 'wishlist' });
              } else {
                openAuthModal('login', () => handleNav('profile', { subTab: 'wishlist' }));
              }
            }}
            className="p-2 hover:text-stone-600 transition-colors relative"
            aria-label="View wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#1C1A17] rounded-full" />
            )}
          </button>

          {/* User Account */}
          <div className="relative">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="flex items-center gap-1.5 p-2 text-sm font-medium hover:text-stone-600 transition-colors"
                  aria-label="Account menu"
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="hidden md:inline text-xs tracking-wider max-w-[90px] truncate">
                    {user.fullName.split(' ')[0]}
                  </span>
                </button>

                {/* Account dropdown */}
                {accountDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E8E5DF] rounded-md shadow-xl py-2 z-50 text-xs tracking-wider uppercase font-medium">
                    <div className="px-4 py-2 border-b border-stone-100 text-stone-500 normal-case">
                      <p className="font-semibold text-stone-900 truncate">{user.fullName}</p>
                      <p className="text-[11px] truncate">{user.email}</p>
                      {user.role === 'admin' && (
                        <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-amber-800 font-semibold">
                          <ShieldCheck className="w-3 h-3 text-amber-700" /> Admin Access
                        </span>
                      )}
                    </div>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => handleNav('admin')}
                        className="w-full text-left px-4 py-2.5 hover:bg-[#FAF9F6] text-amber-800 font-semibold"
                      >
                        Admin Dashboard
                      </button>
                    )}
                    <button
                      onClick={() => handleNav('profile', { subTab: 'orders' })}
                      className="w-full text-left px-4 py-2 hover:bg-[#FAF9F6]"
                    >
                      Orders & Tracking
                    </button>
                    <button
                      onClick={() => handleNav('profile', { subTab: 'addresses' })}
                      className="w-full text-left px-4 py-2 hover:bg-[#FAF9F6]"
                    >
                      Saved Addresses
                    </button>
                    <button
                      onClick={() => handleNav('profile', { subTab: 'wishlist' })}
                      className="w-full text-left px-4 py-2 hover:bg-[#FAF9F6]"
                    >
                      My Wishlist
                    </button>
                    <button
                      onClick={() => handleNav('profile', { subTab: 'settings' })}
                      className="w-full text-left px-4 py-2 hover:bg-[#FAF9F6]"
                    >
                      Account Details
                    </button>
                    <div className="border-t border-stone-100 my-1" />
                    <button
                      onClick={() => {
                        logout();
                        setAccountDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-rose-700 hover:bg-rose-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="p-2 hover:text-stone-600 transition-colors flex items-center gap-1 text-xs tracking-wider uppercase font-medium"
                aria-label="Sign in"
              >
                <UserIcon className="w-5 h-5" />
                <span className="hidden md:inline">Sign In</span>
              </button>
            )}
          </div>

          {/* Cart Bag */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 p-2 hover:text-stone-600 transition-colors relative"
            aria-label="Open cart bag"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#1C1A17] text-white text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-xs uppercase tracking-wider font-medium">Bag</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E8E5DF] bg-[#FAF9F6] px-6 py-6 space-y-5 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-3 text-sm tracking-wider uppercase font-medium">
            <button
              onClick={() => handleNav('shop', { category: 'all' })}
              className="block w-full text-left py-2 border-b border-stone-200 text-[#1C1A17]"
            >
              Shop All Creations
            </button>
            <button
              onClick={() => handleNav('shop', { category: 'Apparel & Textiles' })}
              className="block w-full text-left py-2 border-b border-stone-200 text-[#1C1A17]"
            >
              Apparel & Textiles
            </button>
            <button
              onClick={() => handleNav('shop', { category: 'Living & Objects' })}
              className="block w-full text-left py-2 border-b border-stone-200 text-[#1C1A17]"
            >
              Living & Objects
            </button>
            <button
              onClick={() => handleNav('shop', { category: 'Botanical Fragrance' })}
              className="block w-full text-left py-2 border-b border-stone-200 text-[#1C1A17]"
            >
              Botanical Fragrance
            </button>
            <button
              onClick={() => handleNav('shop', { category: 'Leather Goods' })}
              className="block w-full text-left py-2 border-b border-stone-200 text-[#1C1A17]"
            >
              Leather Goods
            </button>
            <button
              onClick={() => handleNav('story')}
              className="block w-full text-left py-2 border-b border-stone-200 text-[#1C1A17]"
            >
              Atelier & Craftsmanship
            </button>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {user ? (
              <>
                <button
                  onClick={() => handleNav('profile')}
                  className="w-full text-left py-2 text-xs tracking-wider uppercase font-medium text-stone-700 flex items-center justify-between"
                >
                  <span>My Account ({user.fullName})</span>
                  {user.role === 'admin' && <span className="text-amber-800 font-semibold">Admin</span>}
                </button>
                {user.role === 'admin' && (
                  <button
                    onClick={() => handleNav('admin')}
                    className="w-full text-left py-2 text-xs tracking-wider uppercase font-semibold text-amber-900"
                  >
                    Open Admin Dashboard
                  </button>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 text-xs tracking-wider uppercase font-medium text-rose-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                className="w-full py-2.5 px-4 bg-[#1C1A17] text-white text-xs tracking-widest uppercase font-medium text-center rounded-sm"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
