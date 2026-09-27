import React, { useState, useEffect } from 'react';
import { Package, MapPin, Heart, Settings, LogOut, CheckCircle2, Clock, X, AlertCircle, ArrowRight, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Order, Product, Address } from '../types';

interface AccountPageProps {
  initialSubTab?: 'orders' | 'addresses' | 'wishlist' | 'settings';
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigateToShop: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  initialSubTab = 'orders',
  allProducts,
  onSelectProduct,
  onNavigateToShop
}) => {
  const { user, logout, updateProfile, addAddress, deleteAddress } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist' | 'settings'>(initialSubTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);

  // Address form modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddrName, setNewAddrName] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrLine1, setNewAddrLine1] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrState, setNewAddrState] = useState('');
  const [newAddrPin, setNewAddrPin] = useState('');

  // Profile edit state
  const [editName, setEditName] = useState(user?.fullName || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await api.getOrders();
        setOrders(data.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingOrders(false);
      }
    }
    fetchOrders();
  }, []);

  if (!user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    await updateProfile({ fullName: editName, phone: editPhone });
    setIsUpdatingProfile(false);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrName || !newAddrPhone || !newAddrLine1 || !newAddrCity || !newAddrState || !newAddrPin) {
      showToast('All address fields are required', 'error');
      return;
    }

    const success = await addAddress({
      fullName: newAddrName.trim(),
      phone: newAddrPhone.trim(),
      addressLine1: newAddrLine1.trim(),
      city: newAddrCity.trim(),
      state: newAddrState.trim(),
      postalCode: newAddrPin.trim()
    });

    if (success) {
      setShowAddressModal(false);
      setNewAddrName('');
      setNewAddrPhone('');
      setNewAddrLine1('');
      setNewAddrCity('');
      setNewAddrState('');
      setNewAddrPin('');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you wish to cancel this order?')) return;
    try {
      const res = await api.cancelOrder(orderId, 'Cancelled upon customer request');
      setOrders(prev => prev.map(o => o.id === orderId ? res.order : o));
      if (selectedOrderForTracking?.id === orderId) {
        setSelectedOrderForTracking(res.order);
      }
      showToast('Order cancelled successfully', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel order', 'error');
    }
  };

  const handleReturnOrder = async (orderId: string) => {
    const reason = window.prompt('Please provide the reason for return/exchange:');
    if (!reason) return;
    try {
      const res = await api.returnOrder(orderId, reason);
      setOrders(prev => prev.map(o => o.id === orderId ? res.order : o));
      if (selectedOrderForTracking?.id === orderId) {
        setSelectedOrderForTracking(res.order);
      }
      showToast('Return request recorded. Our atelier team will contact you.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to initiate return', 'error');
    }
  };

  const wishlistProducts = allProducts.filter(p => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Account Header */}
      <div className="border-b border-[#E8E5DF] pb-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-stone-500">
            Patron Concierge
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-serif font-bold text-[#1C1A17]">
            {user.fullName}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {user.email} · {user.phone} · Member since {new Date(user.createdAt).getFullYear()}
          </p>
        </div>

        <button
          onClick={logout}
          className="self-start sm:self-auto py-2 px-4 border border-stone-300 hover:border-black text-xs font-semibold uppercase tracking-wider text-stone-700 hover:text-black rounded-sm transition-colors flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Tabs Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="md:col-span-3 space-y-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors flex items-center gap-2.5 ${
              activeTab === 'orders'
                ? 'bg-[#1C1A17] text-white shadow-sm'
                : 'text-stone-700 hover:bg-[#F2EFEB]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Orders & Dispatch ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors flex items-center gap-2.5 ${
              activeTab === 'addresses'
                ? 'bg-[#1C1A17] text-white shadow-sm'
                : 'text-stone-700 hover:bg-[#F2EFEB]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses ({user.savedAddresses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`w-full text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors flex items-center gap-2.5 ${
              activeTab === 'wishlist'
                ? 'bg-[#1C1A17] text-white shadow-sm'
                : 'text-stone-700 hover:bg-[#F2EFEB]'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>My Wishlist ({wishlist.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors flex items-center gap-2.5 ${
              activeTab === 'settings'
                ? 'bg-[#1C1A17] text-white shadow-sm'
                : 'text-stone-700 hover:bg-[#F2EFEB]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Personal Details</span>
          </button>
        </aside>

        {/* Tab Content Panes */}
        <main className="md:col-span-9 bg-white p-6 sm:p-8 rounded-sm border border-[#E8E5DF] shadow-sm min-h-[400px]">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h2 className="text-base font-serif font-bold uppercase tracking-wider text-[#1C1A17]">
                  Order History & Real-Time Tracking
                </h2>
                <span className="text-xs text-stone-500 font-semibold">{orders.length} Records</span>
              </div>

              {isLoadingOrders ? (
                <div className="py-12 text-center text-xs text-stone-500">Loading order history...</div>
              ) : orders.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <Package className="w-10 h-10 text-stone-400 mx-auto" />
                  <p className="text-sm font-semibold text-stone-800">No orders placed yet</p>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    When you purchase our handcrafted creations, track their status from loom to doorstep right here.
                  </p>
                  <button
                    onClick={onNavigateToShop}
                    className="py-2.5 px-6 bg-[#1C1A17] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-black"
                  >
                    Browse Collections
                  </button>
                </div>
              ) : (
                <div className="space-y-6 divide-y divide-stone-200">
                  {orders.map(order => (
                    <div key={order.id} className="pt-6 first:pt-0 space-y-4">
                      {/* Top Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-stone-900 text-sm">
                            {order.orderNumber}
                          </span>
                          <span className="text-stone-400">·</span>
                          <span className="text-stone-600">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-[2px] font-semibold uppercase tracking-wider text-[11px] ${
                              order.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.status === 'cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : order.status === 'returned'
                                ? 'bg-stone-200 text-stone-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="divide-y divide-stone-100 bg-[#FAF9F6] p-4 rounded-sm border border-stone-200">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs">
                            <div className="flex items-center gap-3">
                              <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-sm bg-stone-100 shrink-0" />
                              <div>
                                <p className="font-semibold text-stone-900 line-clamp-1">{item.name}</p>
                                <p className="text-stone-500 text-[11px]">{item.variantTitle} · Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="font-semibold text-stone-900 tabular-nums shrink-0">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Footer Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-4 text-xs pt-1">
                        <div className="text-stone-600">
                          Total: <strong className="text-stone-900 font-bold tabular-nums">₹{order.pricing.total.toLocaleString('en-IN')}</strong> ({order.payment.method.toUpperCase()})
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedOrderForTracking(order)}
                            className="py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium rounded-sm border border-stone-300 transition-colors flex items-center gap-1.5"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Track Order</span>
                          </button>

                          {['pending', 'confirmed'].includes(order.status) && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="py-1.5 px-3 border border-rose-300 text-rose-700 hover:bg-rose-50 font-medium rounded-sm transition-colors"
                            >
                              Cancel Order
                            </button>
                          )}

                          {order.status === 'delivered' && (
                            <button
                              onClick={() => handleReturnOrder(order.id)}
                              className="py-1.5 px-3 border border-stone-300 text-stone-700 hover:bg-stone-100 font-medium rounded-sm transition-colors"
                            >
                              Request 7-Day Return
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h2 className="text-base font-serif font-bold uppercase tracking-wider text-[#1C1A17]">
                  Saved Shipping Addresses
                </h2>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="py-1.5 px-3 bg-[#1C1A17] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-black"
                >
                  + Add New Address
                </button>
              </div>

              {user.savedAddresses.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-500 space-y-3">
                  <p>You have no saved addresses.</p>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="py-2 px-4 border border-stone-400 text-stone-800 text-xs font-semibold uppercase tracking-wider rounded-sm"
                  >
                    Add Your First Address
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.savedAddresses.map(addr => (
                    <div key={addr.id} className="p-4 bg-[#FAF9F6] border border-stone-200 rounded-sm relative flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">{addr.fullName}</h4>
                          {addr.isDefault && (
                            <span className="text-[10px] bg-stone-200 text-stone-800 px-2 py-0.5 rounded-[2px] font-semibold">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-600">{addr.addressLine1}</p>
                        {addr.addressLine2 && <p className="text-xs text-stone-500">{addr.addressLine2}</p>}
                        <p className="text-xs text-stone-600">{addr.city}, {addr.state} - {addr.postalCode}</p>
                        <p className="text-xs text-stone-500 mt-2">Phone: {addr.phone}</p>
                      </div>

                      <div className="flex justify-end pt-2 border-t border-stone-200">
                        <button
                          onClick={() => deleteAddress(addr.id)}
                          className="text-stone-400 hover:text-rose-700 p-1 transition-colors"
                          aria-label="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h2 className="text-base font-serif font-bold uppercase tracking-wider text-[#1C1A17]">
                  Curated Wishlist
                </h2>
                <span className="text-xs text-stone-500 font-semibold">{wishlist.length} Items</span>
              </div>

              {wishlistProducts.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <Heart className="w-10 h-10 text-stone-400 mx-auto" />
                  <p className="text-sm font-semibold text-stone-800">Your wishlist is currently empty</p>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Save your favorite creations by clicking the heart icon on any product card or details view.
                  </p>
                  <button
                    onClick={onNavigateToShop}
                    className="py-2.5 px-6 bg-[#1C1A17] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-black"
                  >
                    Discover Catalog
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistProducts.map(prod => (
                    <div key={prod.id} className="bg-[#FAF9F6] border border-stone-200 rounded-sm p-4 flex flex-col justify-between space-y-3">
                      <div className="aspect-[4/3] bg-stone-200 rounded-sm overflow-hidden cursor-pointer" onClick={() => onSelectProduct(prod)}>
                        <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-stone-500">{prod.category}</span>
                        <h4 className="text-xs font-semibold text-stone-900 line-clamp-1">{prod.name}</h4>
                        <span className="text-xs font-bold text-stone-900 tabular-nums">₹{prod.price.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-stone-200">
                        <button
                          onClick={() => addToCart(prod)}
                          className="flex-1 py-2 bg-[#1C1A17] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-sm"
                        >
                          Add to Bag
                        </button>
                        <button
                          onClick={() => toggleWishlist(prod.id, prod.name)}
                          className="p-2 border border-stone-300 hover:border-black rounded-sm text-stone-600"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="border-b border-stone-200 pb-3">
                <h2 className="text-base font-serif font-bold uppercase tracking-wider text-[#1C1A17]">
                  Personal Profile & Credentials
                </h2>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-300 rounded-sm text-xs focus:outline-none focus:border-stone-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Email Address (Immutable)
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-sm text-xs text-stone-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-300 rounded-sm text-xs focus:outline-none focus:border-stone-800"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="py-2.5 px-6 bg-[#1C1A17] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors"
                >
                  {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* TRACKING DETAILS MODAL */}
      {selectedOrderForTracking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#FAF9F6] border border-[#E8E5DF] rounded-md shadow-2xl p-6 sm:p-8 space-y-6">
            <button
              onClick={() => setSelectedOrderForTracking(null)}
              className="absolute top-4 right-4 p-2 text-stone-500 hover:text-black"
              aria-label="Close tracking"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">Live Fulfillment Dossier</span>
              <h3 className="text-lg font-serif font-bold text-stone-900 mt-0.5">
                Tracking {selectedOrderForTracking.orderNumber}
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Status: <strong className="uppercase font-semibold text-stone-900">{selectedOrderForTracking.status}</strong>
              </p>
            </div>

            {/* Timeline */}
            <div className="relative pl-6 border-l-2 border-stone-300 space-y-5 max-h-72 overflow-y-auto">
              {selectedOrderForTracking.timeline.map((event, idx) => (
                <div key={idx} className="relative text-xs">
                  <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-[#1C1A17] ring-4 ring-white" />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-900">{event.title}</span>
                    <span className="text-stone-400 text-[11px]">
                      {new Date(event.time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {event.note && <p className="text-stone-500 mt-0.5 text-[11px]">{event.note}</p>}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setSelectedOrderForTracking(null)}
                className="py-2 px-5 bg-[#1C1A17] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW ADDRESS MODAL */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#FAF9F6] border border-[#E8E5DF] rounded-md shadow-2xl p-6 sm:p-8 space-y-4">
            <button
              onClick={() => setShowAddressModal(false)}
              className="absolute top-4 right-4 p-2 text-stone-500 hover:text-black"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-serif font-bold uppercase tracking-wider text-stone-900">
              Add New Shipping Address
            </h3>

            <form onSubmit={handleSaveAddress} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={newAddrName}
                  onChange={e => setNewAddrName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={newAddrPhone}
                  onChange={e => setNewAddrPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Street & Building
                </label>
                <input
                  type="text"
                  value={newAddrLine1}
                  onChange={e => setNewAddrLine1(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={newAddrCity}
                    onChange={e => setNewAddrCity(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={newAddrState}
                    onChange={e => setNewAddrState(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    PIN
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={newAddrPin}
                    onChange={e => setNewAddrPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="py-2 px-4 border border-stone-300 text-xs font-semibold uppercase tracking-wider rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-6 bg-[#1C1A17] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-black"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
