import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, ShieldCheck, CreditCard, QrCode, Building, Banknote, ArrowRight, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Address, Order, PaymentMethod } from '../types';

interface CheckoutPageProps {
  onOrderSuccess: (order: Order) => void;
  onBackToShopping: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onOrderSuccess, onBackToShopping }) => {
  const { items, subtotal, discount, shipping, total, appliedCoupon, clearCart } = useCart();
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [activeStep, setActiveStep] = useState<number>(1); // 1: Address, 2: Delivery, 3: Payment
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  // Shipping form fields
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Delivery method
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express'>('standard');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  const [isProcessing, setIsProcessing] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Initialize with saved address if available
  useEffect(() => {
    if (user && user.savedAddresses.length > 0) {
      const defaultAddr = user.savedAddresses.find(a => a.isDefault) || user.savedAddresses[0];
      setSelectedAddressId(defaultAddr.id);
      setFullName(defaultAddr.fullName);
      setPhone(defaultAddr.phone);
      setAddressLine1(defaultAddr.addressLine1);
      setAddressLine2(defaultAddr.addressLine2 || '');
      setLandmark(defaultAddr.landmark || '');
      setCity(defaultAddr.city);
      setState(defaultAddr.state);
      setPostalCode(defaultAddr.postalCode);
    } else if (user) {
      setFullName(user.fullName);
      setPhone(user.phone);
    }
  }, [user]);

  // Auth requirement guard
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 bg-[#F2EFEB] rounded-full flex items-center justify-center mx-auto text-[#1C1A17]">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#1C1A17]">
          Authentication Required to Continue
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
          Create an account or log in to continue with your purchase. An account is required to securely manage orders, doorstep returns, and customer information.
        </p>
        <div className="pt-2 flex justify-center gap-4">
          <button
            onClick={() => openAuthModal('login')}
            className="py-3 px-8 bg-[#1C1A17] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-black transition-colors"
          >
            Sign In / Register
          </button>
          <button
            onClick={onBackToShopping}
            className="py-3 px-6 border border-stone-300 text-stone-700 text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-stone-50 transition-colors"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !createdOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-[#1C1A17]">Your shopping bag is empty</h2>
        <p className="text-xs text-stone-500">Add artisanal creations to your bag before proceeding to checkout.</p>
        <button
          onClick={onBackToShopping}
          className="mt-4 py-3 px-8 bg-[#1C1A17] text-white text-xs font-semibold uppercase tracking-wider rounded-sm"
        >
          Discover Catalog
        </button>
      </div>
    );
  }

  const handleSelectSavedAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || '');
    setLandmark(addr.landmark || '');
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !addressLine1.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      showToast('Please complete all required address fields', 'error');
      return;
    }
    if (!/^\d{6}$/.test(postalCode.trim())) {
      showToast('PIN code must be a 6-digit number', 'error');
      return;
    }
    setActiveStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveStep(3);
  };

  const handleFinalOrderSubmit = async () => {
    setIsProcessing(true);
    try {
      const shippingAddress: Address = {
        id: selectedAddressId || `addr-${Date.now()}`,
        fullName: fullName.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        landmark: landmark.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim()
      };

      // 1. Create order on server (verifies pricing, discounts, stock reservation)
      const orderRes = await api.createOrder({
        items: items.map(i => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
        shippingAddress,
        couponCode: appliedCoupon || undefined,
        paymentMethod
      });

      const newOrder = orderRes.order;

      // 2. Complete payment verification on server
      const payRes = await api.payOrder(newOrder.id, {
        paymentMethod,
        upiId: paymentMethod === 'upi' ? upiId : undefined,
        status: 'success'
      });

      clearCart();
      setCreatedOrder(payRes.order);
      showToast('Your order has been confirmed successfully!', 'success');
      onOrderSuccess(payRes.order);
    } catch (err: any) {
      showToast(err.message || 'Payment processing error', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between pb-6 border-b border-[#E8E5DF]">
        <button
          onClick={onBackToShopping}
          className="text-xs uppercase tracking-wider font-semibold text-stone-600 hover:text-black flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Store</span>
        </button>

        <span className="text-xl font-serif tracking-[0.2em] uppercase font-bold text-[#1C1A17]">
          VARENYA Atelier Checkout
        </span>

        <div className="flex items-center gap-1 text-xs text-emerald-800 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span className="hidden sm:inline">256-Bit SSL Secured</span>
        </div>
      </div>

      {/* Stepper Bar */}
      <div className="max-w-3xl mx-auto mb-10">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
          <div className={`flex items-center gap-2 ${activeStep >= 1 ? 'text-[#1C1A17]' : 'text-stone-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${activeStep >= 1 ? 'bg-[#1C1A17] text-white' : 'bg-stone-200'}`}>
              1
            </span>
            <span>Shipping</span>
          </div>

          <div className="flex-1 h-[1px] bg-stone-300 mx-4" />

          <div className={`flex items-center gap-2 ${activeStep >= 2 ? 'text-[#1C1A17]' : 'text-stone-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${activeStep >= 2 ? 'bg-[#1C1A17] text-white' : 'bg-stone-200'}`}>
              2
            </span>
            <span>Dispatch</span>
          </div>

          <div className="flex-1 h-[1px] bg-stone-300 mx-4" />

          <div className={`flex items-center gap-2 ${activeStep >= 3 ? 'text-[#1C1A17]' : 'text-stone-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${activeStep >= 3 ? 'bg-[#1C1A17] text-white' : 'bg-stone-200'}`}>
              3
            </span>
            <span>Payment</span>
          </div>
        </div>
      </div>

      {/* Checkout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-sm border border-[#E8E5DF] shadow-sm">
          {/* STEP 1: SHIPPING ADDRESS */}
          {activeStep === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-5">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="text-base font-serif font-bold uppercase tracking-wider text-[#1C1A17]">
                  Delivery Address
                </h3>
                <span className="text-xs text-stone-500">Step 1 of 3</span>
              </div>

              {/* Saved Addresses Selector */}
              {user.savedAddresses.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-stone-700 block">
                    Choose from Saved Addresses:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {user.savedAddresses.map(addr => (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectSavedAddress(addr)}
                        className={`p-3 rounded-sm border text-xs cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? 'border-[#1C1A17] bg-[#F7F5F0] shadow-sm'
                            : 'border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        <p className="font-semibold text-stone-900">{addr.fullName}</p>
                        <p className="text-stone-600 line-clamp-1">{addr.addressLine1}</p>
                        <p className="text-stone-500">{addr.city}, {addr.state} - {addr.postalCode}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-300 rounded-sm text-xs focus:outline-none focus:border-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-300 rounded-sm text-xs focus:outline-none focus:border-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Street Address & Flat / House / Villa *
                </label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={e => setAddressLine1(e.target.value)}
                  placeholder="e.g. 402, Lotus Court, 14th Main Road"
                  required
                  className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-300 rounded-sm text-xs focus:outline-none focus:border-stone-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Apartment / Suite (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={e => setAddressLine2(e.target.value)}
                    placeholder="Floor, Wing, etc."
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-300 rounded-sm text-xs focus:outline-none focus:border-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={e => setLandmark(e.target.value)}
                    placeholder="Nearby landmark"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-300 rounded-sm text-xs focus:outline-none focus:border-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    required
                    placeholder="e.g. Mumbai"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-300 rounded-sm text-xs focus:outline-none focus:border-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    required
                    placeholder="e.g. Maharashtra"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-300 rounded-sm text-xs focus:outline-none focus:border-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={postalCode}
                    onChange={e => setPostalCode(e.target.value.replace(/\D/g, ''))}
                    required
                    placeholder="400050"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-stone-300 rounded-sm text-xs focus:outline-none focus:border-stone-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3.5 bg-[#1C1A17] hover:bg-black text-white text-xs font-semibold uppercase tracking-widest rounded-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>Continue to Dispatch Options</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: DISPATCH METHOD */}
          {activeStep === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="text-base font-serif font-bold uppercase tracking-wider text-[#1C1A17]">
                  Dispatch & Transit Method
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="text-xs text-stone-500 hover:text-black underline"
                >
                  Edit Address
                </button>
              </div>

              <div className="space-y-3">
                <div
                  onClick={() => setDeliveryMethod('standard')}
                  className={`p-4 rounded-sm border cursor-pointer transition-all flex items-start justify-between ${
                    deliveryMethod === 'standard'
                      ? 'border-[#1C1A17] bg-[#F7F5F0]'
                      : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                        Bluedart Insured Air Express
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-[2px] font-semibold">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1">
                      Pan-India express delivery within 2–3 business days with botanical sachet seal.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-800 tabular-nums">
                    {shipping === 0 ? 'Complimentary' : `₹${shipping}`}
                  </span>
                </div>

                <div
                  onClick={() => setDeliveryMethod('express')}
                  className={`p-4 rounded-sm border cursor-pointer transition-all flex items-start justify-between ${
                    deliveryMethod === 'express'
                      ? 'border-[#1C1A17] bg-[#F7F5F0]'
                      : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                      White-Glove Direct Atelier Courier
                    </span>
                    <p className="text-xs text-stone-600 mt-1">
                      Priority priority dispatch with hand-tied cotton ribbon gift wrapping.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-stone-900 tabular-nums">
                    Complimentary
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="py-3 px-6 border border-stone-300 text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-stone-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#1C1A17] hover:bg-black text-white text-xs font-semibold uppercase tracking-widest rounded-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: PAYMENT METHOD */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="text-base font-serif font-bold uppercase tracking-wider text-[#1C1A17]">
                  Payment Authorization
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="text-xs text-stone-500 hover:text-black underline"
                >
                  Change Delivery
                </button>
              </div>

              {/* Payment selector tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`py-2.5 px-3 text-xs font-medium rounded-sm border flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-[#1C1A17] bg-[#1C1A17] text-white shadow-sm'
                      : 'border-stone-300 bg-white text-stone-800 hover:border-stone-600'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-2.5 px-3 text-xs font-medium rounded-sm border flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#1C1A17] bg-[#1C1A17] text-white shadow-sm'
                      : 'border-stone-300 bg-white text-stone-800 hover:border-stone-600'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`py-2.5 px-3 text-xs font-medium rounded-sm border flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'border-[#1C1A17] bg-[#1C1A17] text-white shadow-sm'
                      : 'border-stone-300 bg-white text-stone-800 hover:border-stone-600'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>Net Banking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`py-2.5 px-3 text-xs font-medium rounded-sm border flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#1C1A17] bg-[#1C1A17] text-white shadow-sm'
                      : 'border-stone-300 bg-white text-stone-800 hover:border-stone-600'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Cash on Del.</span>
                </button>
              </div>

              {/* UPI Tab */}
              {paymentMethod === 'upi' && (
                <div className="p-5 bg-[#FAF9F6] border border-stone-300 rounded-sm space-y-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-800">
                    <QrCode className="w-4 h-4 text-stone-700" />
                    <span>Instant UPI Checkout (GPay / PhonePe / Paytm)</span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Enter UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      placeholder="e.g. mobile@okhdfcbank or user@paytm"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs focus:outline-none focus:border-stone-800"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500">
                    A payment request of <strong>₹{total.toLocaleString('en-IN')}</strong> will be verified via bank gateway.
                  </p>
                </div>
              )}

              {/* Cards Tab */}
              {paymentMethod === 'card' && (
                <div className="p-5 bg-[#FAF9F6] border border-stone-300 rounded-sm space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      maxLength={19}
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                      placeholder="4532 8923 1092 8491"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        placeholder="12/28"
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Visa, Mastercard, RuPay & American Express supported. Bank-grade 256-bit encryption.
                  </p>
                </div>
              )}

              {/* Netbanking */}
              {paymentMethod === 'netbanking' && (
                <div className="p-5 bg-[#FAF9F6] border border-stone-300 rounded-sm space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Select Your Bank
                  </label>
                  <select
                    value={selectedBank}
                    onChange={e => setSelectedBank(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-sm text-xs focus:outline-none focus:border-stone-800"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              {/* Cash on Delivery */}
              {paymentMethod === 'cod' && (
                <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-sm space-y-2 text-xs text-amber-900">
                  <p className="font-semibold uppercase tracking-wider">
                    Cash on Delivery Terms
                  </p>
                  <p className="text-amber-800 leading-relaxed">
                    Pay exactly <strong>₹{total.toLocaleString('en-IN')}</strong> in cash or via delivery agent UPI upon delivery. To prevent logistical fraud, our concierge may call or send an automated SMS confirmation before parcel dispatch.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="py-3 px-6 border border-stone-300 text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-stone-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleFinalOrderSubmit}
                  className="flex-1 py-3.5 bg-[#1C1A17] hover:bg-black text-white text-xs font-semibold uppercase tracking-widest rounded-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isProcessing
                      ? 'Authorizing Transaction...'
                      : paymentMethod === 'cod'
                      ? `Book COD Order (₹${total.toLocaleString('en-IN')})`
                      : `Authorize & Pay ₹${total.toLocaleString('en-IN')}`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sticky Column */}
        <div className="lg:col-span-5 bg-white p-6 rounded-sm border border-[#E8E5DF] shadow-sm space-y-5 lg:sticky lg:top-28">
          <h3 className="text-xs uppercase tracking-widest font-bold text-stone-900 border-b border-stone-200 pb-3">
            Order Summary ({items.length} items)
          </h3>

          <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto pr-1">
            {items.map(item => (
              <div key={`${item.productId}-${item.variantId}`} className="py-3 flex gap-3 text-xs">
                <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-sm shrink-0 bg-stone-100" />
                <div className="flex-1">
                  <p className="font-semibold text-stone-900 line-clamp-1">{item.name}</p>
                  <p className="text-stone-500 text-[11px]">{item.variantTitle} · Qty: {item.quantity}</p>
                </div>
                <span className="font-semibold text-stone-900 tabular-nums shrink-0">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-200 pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span className="tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-800 font-medium">
                <span>Discount ({appliedCoupon})</span>
                <span className="tabular-nums">-₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-600">
              <span>Insured Air Shipping</span>
              <span className="tabular-nums">
                {shipping === 0 ? <span className="text-emerald-800 font-medium">Complimentary</span> : `₹${shipping}`}
              </span>
            </div>
            <div className="flex justify-between text-stone-500 text-[11px]">
              <span>Taxes (GST 18% / 12%)</span>
              <span>Included</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#1C1A17] pt-2 border-t border-stone-200">
              <span>Grand Total</span>
              <span className="tabular-nums">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="p-3 bg-[#FAF9F6] border border-stone-200 rounded-sm text-[11px] text-stone-600 space-y-1">
            <p className="font-semibold text-stone-800 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-700" /> 7-Day Atelier Guarantee
            </p>
            <p>Every piece is accompanied by artisan certification and tamper-proof wax seal packaging.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
