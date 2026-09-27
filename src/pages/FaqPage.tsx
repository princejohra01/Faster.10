import React, { useState } from 'react';
import { ChevronDown, Truck, RefreshCw, ShieldCheck, HelpCircle } from 'lucide-react';

export const FaqPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const sections = [
    {
      title: 'Dispatch & Shipping Logistics',
      items: [
        {
          q: 'What are the delivery timelines and carriers across India?',
          a: 'All orders are prioritized and dispatched within 24 to 48 hours from our Bengaluru atelier. We partner exclusively with Bluedart Air Express. Metro locations generally receive shipments within 2–3 business days. Non-metro and regional PIN codes require 4–5 business days.'
        },
        {
          q: 'Is shipping complimentary?',
          a: 'Yes, all orders exceeding ₹1,999 qualify for complimentary express air courier anywhere in India. For orders below ₹1,999, a nominal flat logistical fee of ₹150 is applied at checkout.'
        },
        {
          q: 'Do you ship to remote regions in India?',
          a: 'We service over 19,000+ PIN codes across all Indian states and Union Territories, including Jammu & Kashmir, Ladakh, and North-Eastern states.'
        }
      ]
    },
    {
      title: 'Payments & Security',
      items: [
        {
          q: 'Which payment instruments do you support?',
          a: 'We accept all major Indian payment gateways: Instant UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit cards (Visa, Mastercard, RuPay, Amex), Net Banking across 50+ Indian banks, and Cash on Delivery (COD).'
        },
        {
          q: 'Is Cash on Delivery (COD) allowed?',
          a: 'Yes, Cash on Delivery is supported pan-India up to ₹25,000. Prior to parcel dispatch, our atelier concierge may place a brief confirmation call or send an automated SMS verification to validate the recipient address.'
        }
      ]
    },
    {
      title: 'Returns & Atelier Exchanges',
      items: [
        {
          q: 'What is your return window?',
          a: 'We provide an effortless 7-day doorstep return and exchange policy from the date of delivery. Items must remain unwashed, unworn, and with their original artisan packaging and wax seal intact.'
        },
        {
          q: 'How do I schedule a return?',
          a: 'Simply log into your VARENYA account, navigate to Orders, and click "Request 7-Day Return". Our reverse courier will arrive at your address within 48 hours. Once verified, refunds are credited back to the original source within 3–5 banking days.'
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-stone-500">
          Client Services
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1C1A17]">
          Concierge Policies & FAQ
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
          Everything you need to know regarding artisan dispatch, payment authorization, and our complimentary doorstep returns.
        </p>
      </div>

      <div className="space-y-10">
        {sections.map((sec, sIdx) => (
          <div key={sIdx} className="space-y-4">
            <h2 className="text-sm font-serif font-bold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2">
              {sec.title}
            </h2>

            <div className="divide-y divide-[#E8E5DF] border-y border-[#E8E5DF]">
              {sec.items.map((item, iIdx) => {
                const globalIdx = sIdx * 10 + iIdx;
                const isOpen = openIdx === globalIdx;
                return (
                  <div key={iIdx} className="py-4">
                    <button
                      onClick={() => setOpenIdx(isOpen ? null : globalIdx)}
                      className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-[#1C1A17] hover:text-stone-700 transition-colors"
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-stone-500 transition-transform duration-200 shrink-0 ml-4 ${
                          isOpen ? 'rotate-180 text-black' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-3 text-xs text-stone-600 leading-relaxed pr-6 animate-in fade-in">
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
