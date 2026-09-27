import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, RefreshCw, Truck, HeartHandshake } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface FooterProps {
  onNavigate: (tab: string, meta?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    setIsSubscribed(true);
    showToast('Thank you for subscribing to VARENYA Gazette', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-[#181614] text-[#E5E2DC] pt-16 pb-12 border-t border-[#2A2622]">
      {/* Brand Trust Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 border-b border-[#2A2622]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <Truck className="w-5 h-5 text-amber-300 mt-1 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase text-white">Insured Pan-India Transit</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Complimentary express air delivery on orders exceeding ₹1,999 with tamper-proof seal packaging.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <RefreshCw className="w-5 h-5 text-amber-300 mt-1 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase text-white">7-Day Atelier Returns</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Effortless doorstep reverse pickups arranged directly by our concierge for unworn, tagged items.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <ShieldCheck className="w-5 h-5 text-amber-300 mt-1 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase text-white">Encrypted Checkouts</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Bank-grade 256-bit encryption for UPI, Cards, Net Banking, and Cash on Delivery.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <HeartHandshake className="w-5 h-5 text-amber-300 mt-1 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase text-white">Generational Craft</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Partnering directly with master weavers, brass-casters, and perfumers across India.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Brand & Story */}
        <div className="md:col-span-4 space-y-4">
          <span className="text-2xl font-serif tracking-[0.25em] text-white font-semibold uppercase block">
            VARENYA
          </span>
          <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
            Rooted in timeless Indian craft traditions and disciplined minimalist sensibilities. Hand-tailored linens, sand-cast brass homeware, and natural botanical extractions.
          </p>
          <div className="pt-2 text-xs text-stone-400 space-y-1">
            <p>Atelier & Concierge: concierge@varenya.com</p>
            <p>Customer Care: +91 98765 43210 (Mon – Sat, 10am – 7pm IST)</p>
          </div>
        </div>

        {/* Categories */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs tracking-widest uppercase font-semibold text-white">Collections</h4>
          <ul className="text-xs space-y-2.5 text-stone-400">
            <li>
              <button
                onClick={() => onNavigate('shop', { category: 'Apparel & Textiles' })}
                className="hover:text-white transition-colors"
              >
                Apparel & Textiles
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('shop', { category: 'Living & Objects' })}
                className="hover:text-white transition-colors"
              >
                Living & Objects
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('shop', { category: 'Botanical Fragrance' })}
                className="hover:text-white transition-colors"
              >
                Botanical Fragrance
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('shop', { category: 'Leather Goods' })}
                className="hover:text-white transition-colors"
              >
                Leather Goods
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('shop', { category: 'all' })}
                className="hover:text-white transition-colors"
              >
                All Curations
              </button>
            </li>
          </ul>
        </div>

        {/* Client Concierge */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs tracking-widest uppercase font-semibold text-white">Concierge</h4>
          <ul className="text-xs space-y-2.5 text-stone-400">
            <li>
              <button
                onClick={() => onNavigate('profile', { subTab: 'orders' })}
                className="hover:text-white transition-colors"
              >
                Track Your Order
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('profile', { subTab: 'orders' })}
                className="hover:text-white transition-colors"
              >
                Returns & Exchanges
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('story')}
                className="hover:text-white transition-colors"
              >
                Artisan Provenance
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('faq')}
                className="hover:text-white transition-colors"
              >
                Frequently Asked Questions
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('profile', { subTab: 'settings' })}
                className="hover:text-white transition-colors"
              >
                Account Settings
              </button>
            </li>
          </ul>
        </div>

        {/* Gazette / Newsletter */}
        <div className="md:col-span-4 space-y-3">
          <h4 className="text-xs tracking-widest uppercase font-semibold text-white">The VARENYA Gazette</h4>
          <p className="text-xs text-stone-400 leading-relaxed">
            Invitations to limited-edition seasonal weaves, artisanal previews, and olfactory notes.
          </p>
          {isSubscribed ? (
            <div className="p-3 bg-stone-800 text-stone-200 text-xs rounded border border-stone-700">
              Welcome to the inner circle. Your personal welcome code is <strong className="text-amber-300">WELCOME10</strong>.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="bg-[#24211D] border border-stone-700 text-stone-200 text-xs px-3.5 py-2.5 rounded-sm focus:outline-none focus:border-amber-300 grow"
                required
              />
              <button
                type="submit"
                className="bg-[#FAF9F6] text-[#181614] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-stone-200 transition-colors flex items-center justify-center shrink-0"
                aria-label="Subscribe to newsletter"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
          <p className="text-[11px] text-stone-500">
            By signing up, you agree to our privacy policy. Unsubscribe anytime.
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-[#2A2622] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
        <p>© {new Date().getFullYear()} VARENYA Crafts & Lifestyle Private Limited. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <span>Prices in INR (₹)</span>
          <span aria-hidden="true">·</span>
          <span>Made in India</span>
          <span aria-hidden="true">·</span>
          <button onClick={() => onNavigate('faq')} className="hover:text-stone-300 transition-colors">
            Shipping & Policies
          </button>
        </div>
      </div>
    </footer>
  );
};
