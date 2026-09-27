import React from 'react';
import { CheckCircle2, Package, Printer, ArrowRight, ShieldCheck, MapPin, CreditCard } from 'lucide-react';
import { Order } from '../types';

interface OrderConfirmationPageProps {
  order: Order;
  onNavigateToShop: () => void;
  onTrackInProfile: () => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  order,
  onNavigateToShop,
  onTrackInProfile
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Success Banner */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700 shadow-sm animate-in zoom-in duration-300">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-emerald-800 block">
          Order Successfully Confirmed
        </span>

        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1C1A17] tracking-tight">
          Thank you for patronizing VARENYA
        </h1>

        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
          Your order reference is <strong className="text-stone-900 font-mono font-bold">{order.orderNumber}</strong>. A formal confirmation dossier and invoice have been dispatched to <strong>{order.customer.email}</strong>.
        </p>
      </div>

      {/* Main Order Card */}
      <div className="bg-white border border-[#E8E5DF] rounded-sm p-6 sm:p-8 shadow-sm space-y-8">
        {/* Top Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-200 text-xs">
          <div>
            <span className="text-stone-500 uppercase tracking-wider block">Order Number</span>
            <span className="font-mono font-bold text-stone-900 text-sm">{order.orderNumber}</span>
          </div>

          <div>
            <span className="text-stone-500 uppercase tracking-wider block">Date Placed</span>
            <span className="font-medium text-stone-900">
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>

          <div>
            <span className="text-stone-500 uppercase tracking-wider block">Payment</span>
            <span className="font-medium text-stone-900 uppercase">
              {order.payment.method} · {order.payment.status}
            </span>
          </div>

          <div>
            <span className="text-stone-500 uppercase tracking-wider block">Total Amount</span>
            <span className="font-bold text-stone-900 text-sm tabular-nums">
              ₹{order.pricing.total.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={handlePrint}
            className="py-2 px-3 border border-stone-300 rounded-sm text-stone-700 hover:text-black hover:border-black flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>

        {/* Live Timeline */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-widest font-bold text-stone-900">
            Dispatch & Fulfillment Timeline
          </h3>

          <div className="relative pl-6 border-l-2 border-stone-200 space-y-6">
            {order.timeline.map((event, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-[#1C1A17] ring-4 ring-white" />
                <div className="text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-900">{event.title}</span>
                    <span className="text-stone-400 text-[11px]">
                      {new Date(event.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {event.note && (
                    <p className="text-stone-500 mt-0.5 text-[11px]">{event.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Purchased Items */}
        <div className="space-y-4 border-t border-stone-200 pt-6">
          <h3 className="text-xs uppercase tracking-widest font-bold text-stone-900">
            Ordered Creations ({order.items.length})
          </h3>

          <div className="divide-y divide-stone-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-sm bg-stone-100" />
                  <div>
                    <h4 className="font-semibold text-stone-900">{item.name}</h4>
                    <span className="text-stone-500 text-[11px]">{item.variantTitle} · Qty: {item.quantity}</span>
                  </div>
                </div>
                <span className="font-semibold text-stone-900 tabular-nums">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Payment Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-stone-200 text-xs text-stone-600">
          <div className="space-y-2 p-4 bg-[#FAF9F6] rounded-sm border border-stone-200">
            <span className="font-semibold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-700" /> Shipping Destination
            </span>
            <p className="font-medium text-stone-900">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
            <p>Contact: {order.shippingAddress.phone}</p>
          </div>

          <div className="space-y-2 p-4 bg-[#FAF9F6] rounded-sm border border-stone-200">
            <span className="font-semibold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-stone-700" /> Payment & Billing
            </span>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="tabular-nums font-medium text-stone-900">₹{order.pricing.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {order.pricing.discount > 0 && (
                <div className="flex justify-between text-emerald-800">
                  <span>Coupon Discount</span>
                  <span className="tabular-nums">-₹{order.pricing.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Insured Delivery</span>
                <span>{order.pricing.shipping === 0 ? 'Complimentary' : `₹${order.pricing.shipping}`}</span>
              </div>
              <div className="flex justify-between font-bold text-stone-900 pt-1 border-t border-stone-200">
                <span>Total Paid</span>
                <span className="tabular-nums">₹{order.pricing.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onTrackInProfile}
          className="w-full sm:w-auto py-3 px-8 bg-[#1C1A17] hover:bg-black text-white text-xs font-semibold uppercase tracking-widest rounded-sm transition-colors flex items-center justify-center gap-2"
        >
          <Package className="w-4 h-4" />
          <span>Track Order in Account</span>
        </button>

        <button
          onClick={onNavigateToShop}
          className="w-full sm:w-auto py-3 px-6 border border-stone-300 text-stone-800 hover:border-black text-xs font-semibold uppercase tracking-widest rounded-sm transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};
