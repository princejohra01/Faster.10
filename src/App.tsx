/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { SearchModal } from './components/SearchModal';
import { AuthModal } from './components/AuthModal';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AccountPage } from './pages/AccountPage';
import { AdminPage } from './pages/AdminPage';
import { StoryPage } from './pages/StoryPage';
import { FaqPage } from './pages/FaqPage';

import { api } from './services/api';
import { Product, Order, Review } from './types';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [navMeta, setNavMeta] = useState<any>({});

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState<boolean>(true);

  // Modals & Active Selections
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activeProductReviews, setActiveProductReviews] = useState<Review[]>([]);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Fetch initial catalog from backend
  useEffect(() => {
    async function fetchCatalog() {
      try {
        const data = await api.getProducts();
        setProducts(data.products);
      } catch (err) {
        console.error('Error fetching catalog:', err);
      } finally {
        setIsLoadingCatalog(false);
      }
    }
    fetchCatalog();
  }, []);

  const handleNavigate = (tab: string, meta: any = {}) => {
    setCurrentTab(tab);
    setNavMeta(meta);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = async (prod: Product) => {
    try {
      const data = await api.getProduct(prod.id);
      setActiveProduct(data.product);
      setActiveProductReviews(data.reviews);
    } catch {
      setActiveProduct(prod);
      setActiveProductReviews([]);
    }
    setCurrentTab('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: Order) => {
    setConfirmedOrder(order);
    setCurrentTab('order-confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1C1A17] font-sans antialiased">
      {/* Universal Top Bar */}
      <Header
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onSearchOpen={() => setIsSearchOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {isLoadingCatalog && currentTab === 'home' && products.length === 0 ? (
          <div className="py-32 text-center text-xs uppercase tracking-widest text-stone-500 font-semibold animate-pulse">
            Loading VARENYA Atelier...
          </div>
        ) : (
          <>
            {currentTab === 'home' && (
              <HomePage
                products={products}
                onSelectProduct={handleSelectProduct}
                onQuickView={prod => setQuickViewProduct(prod)}
                onNavigate={handleNavigate}
              />
            )}

            {currentTab === 'shop' && (
              <ShopPage
                products={products}
                initialCategory={navMeta?.category || 'all'}
                initialSearch={navMeta?.search || ''}
                onSelectProduct={handleSelectProduct}
                onQuickView={prod => setQuickViewProduct(prod)}
              />
            )}

            {currentTab === 'product' && activeProduct && (
              <ProductDetailPage
                product={activeProduct}
                reviews={activeProductReviews}
                allProducts={products}
                onSelectProduct={handleSelectProduct}
                onNavigateToCheckout={() => handleNavigate('checkout')}
                onNavigateToShop={() => handleNavigate('shop', { category: 'all' })}
              />
            )}

            {currentTab === 'checkout' && (
              <CheckoutPage
                onOrderSuccess={handleOrderSuccess}
                onBackToShopping={() => handleNavigate('shop', { category: 'all' })}
              />
            )}

            {currentTab === 'order-confirmation' && confirmedOrder && (
              <OrderConfirmationPage
                order={confirmedOrder}
                onNavigateToShop={() => handleNavigate('shop', { category: 'all' })}
                onTrackInProfile={() => handleNavigate('profile', { subTab: 'orders' })}
              />
            )}

            {currentTab === 'profile' && (
              <AccountPage
                initialSubTab={navMeta?.subTab || 'orders'}
                allProducts={products}
                onSelectProduct={handleSelectProduct}
                onNavigateToShop={() => handleNavigate('shop', { category: 'all' })}
              />
            )}

            {currentTab === 'admin' && (
              <AdminPage />
            )}

            {currentTab === 'story' && (
              <StoryPage onNavigateToShop={() => handleNavigate('shop', { category: 'all' })} />
            )}

            {currentTab === 'faq' && (
              <FaqPage />
            )}
          </>
        )}
      </main>

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        onNavigateToCheckout={() => handleNavigate('checkout')}
        onNavigateToShop={() => handleNavigate('shop', { category: 'all' })}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onOpenDetails={prod => {
          setQuickViewProduct(null);
          handleSelectProduct(prod);
        }}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={prod => {
          setIsSearchOpen(false);
          handleSelectProduct(prod);
        }}
        onSearchSubmit={q => {
          setIsSearchOpen(false);
          handleNavigate('shop', { search: q });
        }}
      />

      {/* Authentication Modal */}
      <AuthModal />

      {/* Complete Luxury Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <MainApp />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
