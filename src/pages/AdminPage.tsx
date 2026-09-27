import React, { useState, useEffect } from 'react';
import { ShieldCheck, Package, ShoppingCart, Users, AlertTriangle, Tag, MessageSquare, Plus, Trash2, Edit2, CheckCircle, XCircle, Search, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Product, Order, Coupon, Review, OrderStatus } from '../types';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'products' | 'orders' | 'customers' | 'inventory' | 'coupons' | 'reviews'>('overview');

  const [metrics, setMetrics] = useState<{ totalSales: number; totalOrders: number; lowStockCount: number; totalCustomers: number } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Status update modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('processing');
  const [statusNote, setStatusNote] = useState('');

  // Product Add/Edit Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodSubtitle, setProdSubtitle] = useState('');
  const [prodCategory, setProdCategory] = useState<'Apparel & Textiles' | 'Living & Objects' | 'Botanical Fragrance' | 'Leather Goods'>('Apparel & Textiles');
  const [prodPrice, setProdPrice] = useState(4500);
  const [prodOriginalPrice, setProdOriginalPrice] = useState(5500);
  const [prodStock, setProdStock] = useState(10);
  const [prodDesc, setProdDesc] = useState('');

  // Coupon create modal
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [couponValue, setCouponValue] = useState(15);
  const [couponMinOrder, setCouponMinOrder] = useState(2500);
  const [couponDesc, setCouponDesc] = useState('');

  const loadAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [metricsRes, prodRes, orderRes, custRes, coupRes, revRes] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminProducts(),
        api.getAdminOrders(),
        api.getAdminCustomers(),
        api.getAdminCoupons(),
        api.getAdminReviews()
      ]);

      setMetrics(metricsRes.metrics);
      setProducts(prodRes.products);
      setOrders(orderRes.orders);
      setCustomers(custRes.customers);
      setCoupons(coupRes.coupons);
      setReviews(revRes.reviews);
    } catch (err: any) {
      showToast(err.message || 'Failed to load admin dataset', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAllAdminData();
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-xl font-serif font-bold text-stone-900">Access Restricted</h2>
        <p className="text-xs text-stone-500">
          This portal requires administrator privileges. Please log in with an administrative credential (admin@varenya.com).
        </p>
      </div>
    );
  }

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      const res = await api.updateAdminOrderStatus(selectedOrder.id, newStatus, statusNote);
      setOrders(orders.map(o => o.id === selectedOrder.id ? res.order : o));
      setSelectedOrder(null);
      setStatusNote('');
      showToast(`Order status updated to ${newStatus}`, 'success');
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  // Handle Product Save
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice) {
      showToast('Name and price are required', 'error');
      return;
    }

    try {
      if (editingProductId) {
        const res = await api.updateAdminProduct(editingProductId, {
          name: prodName,
          subtitle: prodSubtitle,
          category: prodCategory,
          price: prodPrice,
          originalPrice: prodOriginalPrice,
          stockCount: prodStock,
          description: prodDesc
        });
        setProducts(products.map(p => p.id === editingProductId ? res.product : p));
        showToast('Product updated successfully', 'success');
      } else {
        const res = await api.createAdminProduct({
          name: prodName,
          subtitle: prodSubtitle,
          category: prodCategory,
          price: prodPrice,
          originalPrice: prodOriginalPrice,
          stockCount: prodStock,
          description: prodDesc
        });
        setProducts([res.product, ...products]);
        showToast('Product created successfully', 'success');
      }
      setShowProductModal(false);
      setEditingProductId(null);
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Product save failed', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await api.deleteAdminProduct(id);
      setProducts(products.filter(p => p.id !== id));
      showToast('Product removed', 'info');
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode || !couponValue) return;

    try {
      const res = await api.createAdminCoupon({
        code: couponCode,
        discountType: couponType,
        discountValue: couponValue,
        minOrderAmount: couponMinOrder,
        description: couponDesc || `${couponValue}${couponType === 'percentage' ? '%' : ' INR'} Off`
      });
      setCoupons([res.coupon, ...coupons]);
      setShowCouponModal(false);
      setCouponCode('');
      showToast(`Coupon ${res.coupon.code} created`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create coupon', 'error');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      await api.deleteAdminCoupon(id);
      setCoupons(coupons.filter(c => c.id !== id));
      showToast('Coupon removed', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete coupon', 'error');
    }
  };

  const handleReviewStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await api.updateAdminReviewStatus(id, status);
      setReviews(reviews.map(r => r.id === id ? res.review : r));
      showToast(`Review ${status}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Status change failed', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-800" />
            <span>Master Atelier Console</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-serif font-bold text-[#1C1A17]">
            VARENYA Operations & Governance
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time server synchronization · Multi-role RBAC · Indian Rupee (INR ₹)
          </p>
        </div>

        <button
          onClick={loadAllAdminData}
          className="self-start sm:self-auto py-2 px-3 border border-stone-300 hover:border-black rounded-sm text-xs font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Live State</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#E8E5DF] overflow-x-auto gap-6 text-xs uppercase tracking-widest font-semibold text-stone-500 pb-2">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'products', label: `Products (${products.length})` },
          { key: 'orders', label: `Orders (${orders.length})` },
          { key: 'customers', label: `Customers (${customers.length})` },
          { key: 'inventory', label: 'Inventory' },
          { key: 'coupons', label: `Coupons (${coupons.length})` },
          { key: 'reviews', label: `Reviews (${reviews.length})` }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveAdminTab(tab.key as any)}
            className={`pb-2 relative whitespace-nowrap transition-colors ${
              activeAdminTab === tab.key
                ? 'text-black font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-black'
                : 'hover:text-black'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW METRICS */}
      {activeAdminTab === 'overview' && metrics && (
        <div className="space-y-8 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white border border-[#E8E5DF] rounded-sm shadow-xs">
              <span className="text-xs uppercase tracking-widest font-semibold text-stone-500">Gross Sales</span>
              <div className="mt-2 text-2xl font-serif font-bold text-stone-900 tabular-nums">
                ₹{metrics.totalSales.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-stone-400 mt-1 block">Net of verified cancellations</span>
            </div>

            <div className="p-6 bg-white border border-[#E8E5DF] rounded-sm shadow-xs">
              <span className="text-xs uppercase tracking-widest font-semibold text-stone-500">Orders Handled</span>
              <div className="mt-2 text-2xl font-serif font-bold text-stone-900 tabular-nums">
                {metrics.totalOrders}
              </div>
              <span className="text-[11px] text-stone-400 mt-1 block">Live across all fulfillment states</span>
            </div>

            <div className="p-6 bg-white border border-[#E8E5DF] rounded-sm shadow-xs">
              <span className="text-xs uppercase tracking-widest font-semibold text-stone-500">Patron Profiles</span>
              <div className="mt-2 text-2xl font-serif font-bold text-stone-900 tabular-nums">
                {metrics.totalCustomers}
              </div>
              <span className="text-[11px] text-stone-400 mt-1 block">Verified customer accounts</span>
            </div>

            <div className="p-6 bg-white border border-[#E8E5DF] rounded-sm shadow-xs">
              <span className="text-xs uppercase tracking-widest font-semibold text-stone-500">Low Stock SKUs</span>
              <div className="mt-2 text-2xl font-serif font-bold text-amber-800 tabular-nums">
                {metrics.lowStockCount}
              </div>
              <span className="text-[11px] text-amber-700 mt-1 block">&le; 5 units remaining</span>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-white border border-[#E8E5DF] rounded-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-stone-900">
                Recent Orders Stream
              </h3>
              <button
                onClick={() => setActiveAdminTab('orders')}
                className="text-xs uppercase tracking-wider font-semibold text-stone-600 hover:text-black underline"
              >
                View All
              </button>
            </div>

            <div className="divide-y divide-stone-100">
              {orders.slice(0, 5).map(o => (
                <div key={o.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-stone-900">{o.orderNumber}</span>
                    <span className="text-stone-400 ml-2">· {o.customer.fullName} ({o.customer.phone})</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-stone-900 tabular-nums">₹{o.pricing.total.toLocaleString('en-IN')}</span>
                    <span className="uppercase text-[10px] font-bold px-2 py-0.5 bg-stone-100 rounded text-stone-800">
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS TAB */}
      {activeAdminTab === 'products' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-stone-900">
              Atelier Product Catalog ({products.length})
            </h3>
            <button
              onClick={() => {
                setEditingProductId(null);
                setProdName('');
                setProdSubtitle('');
                setProdPrice(4500);
                setProdOriginalPrice(5500);
                setProdStock(10);
                setProdDesc('');
                setShowProductModal(true);
              }}
              className="py-2 px-4 bg-[#1C1A17] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Product</span>
            </button>
          </div>

          <div className="bg-white border border-[#E8E5DF] rounded-sm overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] border-b border-[#E8E5DF] text-stone-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Creation</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded-sm bg-stone-100 shrink-0" />
                      <div>
                        <p className="font-semibold text-stone-900 line-clamp-1">{p.name}</p>
                        <p className="text-[11px] text-stone-400 font-mono">{p.sku}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-stone-600">{p.category}</td>
                    <td className="py-3 px-4 font-semibold text-stone-900 tabular-nums">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold tabular-nums ${p.stockCount <= 5 ? 'bg-amber-100 text-amber-900' : 'bg-stone-100 text-stone-800'}`}>
                        {p.stockCount} units
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-600">★ {p.rating} ({p.reviewCount})</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingProductId(p.id);
                          setProdName(p.name);
                          setProdSubtitle(p.subtitle);
                          setProdCategory(p.category);
                          setProdPrice(p.price);
                          setProdOriginalPrice(p.originalPrice);
                          setProdStock(p.stockCount);
                          setProdDesc(p.description);
                          setShowProductModal(true);
                        }}
                        className="p-1 text-stone-500 hover:text-black"
                        aria-label="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1 text-stone-400 hover:text-rose-600"
                        aria-label="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeAdminTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-stone-900">
              Orders & Dispatch Fulfillment
            </h3>
          </div>

          <div className="bg-white border border-[#E8E5DF] rounded-sm overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] border-b border-[#E8E5DF] text-stone-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-stone-900">{o.orderNumber}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-stone-900">{o.customer.fullName}</p>
                      <p className="text-[11px] text-stone-500">{o.customer.phone}</p>
                    </td>
                    <td className="py-3 px-4 text-stone-600">{o.shippingAddress.city}, {o.shippingAddress.state}</td>
                    <td className="py-3 px-4 font-semibold text-stone-900 tabular-nums">₹{o.pricing.total.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 uppercase text-[11px]">{o.payment.method} ({o.payment.status})</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-stone-100 text-stone-800 rounded font-semibold uppercase text-[10px]">
                        {o.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(o);
                          setNewStatus(o.status);
                        }}
                        className="py-1 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-sm text-[11px] uppercase tracking-wider"
                      >
                        Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CUSTOMERS TAB */}
      {activeAdminTab === 'customers' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-stone-900">
              Registered Atelier Patrons ({customers.length})
            </h3>
          </div>

          <div className="bg-white border border-[#E8E5DF] rounded-sm overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] border-b border-[#E8E5DF] text-stone-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Patron Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Verified</th>
                  <th className="py-3 px-4">Orders</th>
                  <th className="py-3 px-4">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-stone-900">{c.fullName}</td>
                    <td className="py-3 px-4 text-stone-600">{c.email}</td>
                    <td className="py-3 px-4 text-stone-600">{c.phone}</td>
                    <td className="py-3 px-4">
                      {c.isVerified ? (
                        <span className="text-emerald-700 font-semibold">Verified</span>
                      ) : (
                        <span className="text-stone-400">Unverified</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold tabular-nums">{c.orderCount}</td>
                    <td className="py-3 px-4 font-semibold text-stone-900 tabular-nums">
                      ₹{c.totalSpent.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INVENTORY TAB */}
      {activeAdminTab === 'inventory' && (
        <div className="space-y-6 animate-in fade-in">
          <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-stone-900">
            Real-Time Inventory & Stock Depletion
          </h3>

          <div className="bg-white border border-[#E8E5DF] rounded-sm p-6 space-y-4 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <div key={p.id} className="p-4 bg-[#FAF9F6] border border-stone-200 rounded-sm flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-stone-900 line-clamp-1">{p.name}</h4>
                    <p className="text-[11px] text-stone-500 font-mono mt-0.5">{p.sku}</p>
                    <div className="mt-1">
                      {p.stockCount <= 5 ? (
                        <span className="text-[10px] text-rose-800 bg-rose-50 px-2 py-0.5 rounded font-bold">
                          Low Stock Alert
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                          Healthy
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold font-mono tabular-nums text-stone-900 block">
                      {p.stockCount}
                    </span>
                    <span className="text-[10px] text-stone-400 uppercase">Available</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COUPONS TAB */}
      {activeAdminTab === 'coupons' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-stone-900">
              Active Promo Vouchers ({coupons.length})
            </h3>
            <button
              onClick={() => setShowCouponModal(true)}
              className="py-2 px-4 bg-[#1C1A17] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Coupon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {coupons.map(c => (
              <div key={c.id} className="p-4 bg-white border border-[#E8E5DF] rounded-sm flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm tracking-wider text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {c.code}
                    </span>
                    <button onClick={() => handleDeleteCoupon(c.id)} className="text-stone-400 hover:text-rose-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-stone-600 mt-2 font-medium">{c.description}</p>
                  <p className="text-[11px] text-stone-400 mt-1">Min spend: ₹{c.minOrderAmount.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-[11px] text-stone-500 pt-2 border-t border-stone-100 flex justify-between">
                  <span>Redemptions: {c.usageCount}</span>
                  <span className="text-emerald-700 font-semibold">{c.isActive ? 'Active' : 'Disabled'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REVIEWS TAB */}
      {activeAdminTab === 'reviews' && (
        <div className="space-y-6 animate-in fade-in">
          <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-stone-900">
            Patron Reviews Moderation Queue ({reviews.length})
          </h3>

          <div className="bg-white border border-[#E8E5DF] rounded-sm divide-y divide-stone-100">
            {reviews.map(r => (
              <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900">{r.userName}</span>
                    <span className="text-stone-400">({r.userEmail})</span>
                    <span className="text-amber-800">★ {r.rating}</span>
                  </div>
                  <h4 className="font-semibold text-stone-800 mt-1">{r.title}</h4>
                  <p className="text-stone-600 text-xs mt-0.5 max-w-xl">{r.comment}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded uppercase text-[10px] font-bold ${r.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {r.status}
                  </span>
                  {r.status !== 'approved' && (
                    <button
                      onClick={() => handleReviewStatus(r.id, 'approved')}
                      className="py-1 px-2.5 bg-emerald-700 text-white rounded text-[11px] font-semibold"
                    >
                      Approve
                    </button>
                  )}
                  {r.status !== 'rejected' && (
                    <button
                      onClick={() => handleReviewStatus(r.id, 'rejected')}
                      className="py-1 px-2.5 bg-rose-700 text-white rounded text-[11px] font-semibold"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ORDER STATUS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#FAF9F6] border border-[#E8E5DF] rounded-md shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-stone-900">
              Update Status for {selectedOrder.orderNumber}
            </h3>

            <form onSubmit={handleUpdateOrderStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Select Status
                </label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs font-semibold uppercase tracking-wider"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned">Returned</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Courier / Tracking Note
                </label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={e => setStatusNote(e.target.value)}
                  placeholder="e.g. Dispatched via Bluedart Air AWB #849102"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="py-2 px-4 border border-stone-300 text-xs font-semibold uppercase tracking-wider rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-6 bg-[#1C1A17] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-black"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE/EDIT PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#FAF9F6] border border-[#E8E5DF] rounded-md shadow-2xl p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-serif font-bold uppercase tracking-wider text-stone-900">
              {editingProductId ? 'Edit Product Details' : 'Add New Atelier Creation'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  value={prodName}
                  onChange={e => setProdName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={prodSubtitle}
                  onChange={e => setProdSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={prodCategory}
                    onChange={e => setProdCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs"
                  >
                    <option value="Apparel & Textiles">Apparel & Textiles</option>
                    <option value="Living & Objects">Living & Objects</option>
                    <option value="Botanical Fragrance">Botanical Fragrance</option>
                    <option value="Leather Goods">Leather Goods</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Stock Inventory Count
                  </label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={e => setProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Price (INR ₹) *
                  </label>
                  <input
                    type="number"
                    value={prodPrice}
                    onChange={e => setProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Original Price (INR ₹)
                  </label>
                  <input
                    type="number"
                    value={prodOriginalPrice}
                    onChange={e => setProdOriginalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Atelier Description
                </label>
                <textarea
                  rows={3}
                  value={prodDesc}
                  onChange={e => setProdDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="py-2 px-4 border border-stone-300 text-xs font-semibold uppercase tracking-wider rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-6 bg-[#1C1A17] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-black"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE COUPON MODAL */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#FAF9F6] border border-[#E8E5DF] rounded-md shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-stone-900">
              Generate Promo Voucher
            </h3>

            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. LUXURY20"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs uppercase font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={couponType}
                    onChange={e => setCouponType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat Amount (INR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Value ({couponType === 'percentage' ? '%' : '₹'})
                  </label>
                  <input
                    type="number"
                    value={couponValue}
                    onChange={e => setCouponValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Min Spend Threshold (₹)
                </label>
                <input
                  type="number"
                  value={couponMinOrder}
                  onChange={e => setCouponMinOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="py-2 px-4 border border-stone-300 text-xs font-semibold uppercase tracking-wider rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-6 bg-[#1C1A17] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-black"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
