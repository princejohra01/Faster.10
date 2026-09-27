import React, { useState } from 'react';
import { ArrowRight, ChevronDown, Sparkles, Feather, Compass, Layers, ShieldCheck } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { IMAGES } from '../assets';

interface HomePageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onNavigate: (tab: string, meta?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  onSelectProduct,
  onQuickView,
  onNavigate
}) => {
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);

  const categories = [
    {
      title: 'Apparel & Textiles',
      subtitle: 'Belgian flax linen & wild mulberry silk tunics',
      categoryKey: 'Apparel & Textiles',
      image: IMAGES.linenTunic
    },
    {
      title: 'Living & Objects',
      subtitle: 'Sand-cast solid brass vessels & old teak monoliths',
      categoryKey: 'Living & Objects',
      image: IMAGES.brassVessel
    },
    {
      title: 'Botanical Fragrance',
      subtitle: 'Aged Himalayan deodar, resinous amber & vetiver extraits',
      categoryKey: 'Botanical Fragrance',
      image: IMAGES.botanicalPerfume
    },
    {
      title: 'Leather Goods',
      subtitle: 'Full-grain vegetable-tanned weekender holdalls & folios',
      categoryKey: 'Leather Goods',
      image: IMAGES.leatherWeekender
    }
  ];

  const faqs = [
    {
      q: 'Where are VARENYA creations designed and manufactured?',
      a: 'All pieces are prototyped in our Bengaluru design studio and produced in collaboration with master artisan guilds across India: handwoven linens in Maheshwar, brass castings in Moradabad, perfume extractions in Kannauj, and vegetable-tanned leatherwork in Mumbai.'
    },
    {
      q: 'What are the delivery timelines across India?',
      a: 'Orders are dispatched within 24–48 hours via Bluedart Air Express. Metro cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata) typically receive deliveries within 2–3 business days. Complimentary express delivery applies on all orders above ₹1,999.'
    },
    {
      q: 'Do you offer Cash on Delivery (COD)?',
      a: 'Yes, Cash on Delivery is available pan-India for orders up to ₹25,000. For security and fraud prevention, our concierge may send an automated SMS or phone verification prior to dispatch.'
    },
    {
      q: 'What is your return and exchange policy?',
      a: 'We offer an effortless 7-day doorstep return and exchange service for unworn, unused items in their original packaging with atelier seals intact. Return shipping is complimentary.'
    },
    {
      q: 'How should I care for natural linen garments and solid brass?',
      a: 'Our organic linen should be gently hand-washed in cold water or dry-cleaned and line-dried in the shade. Solid cast brass pieces are naturally uncoated and will develop an authentic, living antique patina over time. You may restore their mirror brilliance anytime with natural brass wax.'
    }
  ];

  return (
    <div className="space-y-20 sm:space-y-28 pb-20">
      {/* 1. HERO SECTION (Campaign focal point with direct route into featured collection) */}
      <section className="relative bg-[#F4F1EA] border-b border-[#E8E5DF] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2 text-xs tracking-[0.25em] uppercase font-semibold text-stone-600">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Autumn / Winter 2026 Collection</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#1C1A17] tracking-tight leading-[1.15] text-balance">
              Handcrafted Essentials for Intentional Living.
            </h1>

            <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl">
              From unbleached Belgian linen and wild mulberry silk to monolithic sand-cast brass and botanical parfums, each VARENYA artifact honors ancestral Indian craftsmanship through a disciplined contemporary lens.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('shop', { category: 'all' })}
                className="py-3.5 px-8 bg-[#1C1A17] hover:bg-black text-white text-xs font-semibold tracking-widest uppercase rounded-sm transition-all shadow-sm flex items-center gap-2"
              >
                <span>Explore The Collection</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('story')}
                className="py-3.5 px-6 border border-stone-400 hover:border-black text-[#1C1A17] text-xs font-semibold tracking-widest uppercase rounded-sm transition-colors"
              >
                Our Provenance
              </button>
            </div>

            {/* Zero-Pill Quiet Trust Markers */}
            <div className="pt-6 border-t border-stone-300 flex items-center gap-4 text-xs text-stone-500">
              <span>Pure Natural Fibres</span>
              <span aria-hidden="true">·</span>
              <span>Solid Cast Metals</span>
              <span aria-hidden="true">·</span>
              <span>Artisan Direct</span>
            </div>
          </div>

          {/* Hero Visual Asset */}
          <div className="lg:col-span-6">
            <div className="relative rounded-sm overflow-hidden shadow-2xl border border-stone-200 aspect-[16/10] bg-stone-300">
              <img
                src={IMAGES.hero}
                alt="VARENYA Autumn Atelier Showcase"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-sm border border-white/60 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-stone-900">Atelier Capsule Edition</p>
                  <p className="text-stone-500 text-[11px]">Limited harvest batch — 50 units crafted</p>
                </div>
                <button
                  onClick={() => onNavigate('shop', { category: 'all' })}
                  className="text-xs uppercase font-semibold text-stone-900 hover:underline flex items-center gap-1"
                >
                  View Pieces <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY ARCHITECTURE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs tracking-[0.2em] uppercase font-semibold text-stone-500">
              Curated Mediums
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-serif font-bold text-[#1C1A17]">
              Explore by Atelier Discipline
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop', { category: 'all' })}
            className="text-xs tracking-wider uppercase font-semibold text-stone-700 hover:text-black flex items-center gap-1.5"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate('shop', { category: cat.categoryKey })}
              className="group cursor-pointer bg-white border border-[#E8E5DF] rounded-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="aspect-[4/3] bg-stone-100 overflow-hidden relative">
                <img
                  src={cat.image}
                  alt={cat.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <h3 className="text-base font-serif font-bold text-[#1C1A17] group-hover:text-amber-900 transition-colors">
                  {cat.title}
                </h3>
                <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                  {cat.subtitle}
                </p>
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold tracking-wider uppercase text-stone-800">
                  <span>Explore Guild</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED CURATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs tracking-[0.2em] uppercase font-semibold text-stone-500">
              Signature Releases
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-serif font-bold text-[#1C1A17]">
              Featured Atelier Creations
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop', { featured: true })}
            className="text-xs tracking-wider uppercase font-semibold text-stone-700 hover:text-black flex items-center gap-1.5"
          >
            <span>View All Featured</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </section>

      {/* 4. ATELIER STORY & CRAFTSMANSHIP PROVENANCE */}
      <section className="bg-[#1C1A17] text-[#FAF9F6] py-20 border-y border-[#332F2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs tracking-[0.25em] uppercase font-semibold text-amber-300">
                Artisanal Provenance
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
                Honoring Hands, Heritage, and Natural Integrity.
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                In an era dominated by rapid synthetic production, VARENYA operates at the deliberate tempo of master craftsmen. We partner directly with generational weaving clusters in Madhya Pradesh, metal smiths in Uttar Pradesh, and traditional perfumers in Kannauj to craft artifacts destined to outlive fleeting seasons.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-stone-700 text-xs">
                <div>
                  <span className="text-xl font-bold font-serif text-white block">100%</span>
                  <span className="text-stone-400 mt-1 block">Transparent Indian Sourcing</span>
                </div>
                <div>
                  <span className="text-xl font-bold font-serif text-white block">0%</span>
                  <span className="text-stone-400 mt-1 block">Synthetic Fillers or Plastics</span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('story')}
                className="py-3 px-6 bg-white text-[#1C1A17] text-xs font-semibold tracking-widest uppercase rounded-sm hover:bg-stone-200 transition-colors"
              >
                Read The Provenance Journal
              </button>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-[#26231F] p-6 rounded-sm border border-stone-800 space-y-3">
                <Feather className="w-6 h-6 text-amber-300" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Master Weavers</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Wild mulberry silk spun on traditional pit-looms with organic European flax yarn.
                </p>
              </div>

              <div className="bg-[#26231F] p-6 rounded-sm border border-stone-800 space-y-3">
                <Layers className="w-6 h-6 text-amber-300" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Sand-Casting</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Generational metal-smiths pour molten virgin brass into hand-packed river-sand moulds.
                </p>
              </div>

              <div className="bg-[#26231F] p-6 rounded-sm border border-stone-800 space-y-3">
                <Compass className="w-6 h-6 text-amber-300" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Hydro-Distillation</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Aged botanical extractions distilled in traditional copper deg-bhapka stills in Kannauj.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BEST SELLERS */}
      {bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs tracking-[0.2em] uppercase font-semibold text-stone-500">
                Atelier Favorites
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-serif font-bold text-[#1C1A17]">
                Cherished Across India
              </h2>
            </div>
            <button
              onClick={() => onNavigate('shop', { sort: 'rating' })}
              className="text-xs tracking-wider uppercase font-semibold text-stone-700 hover:text-black flex items-center gap-1.5"
            >
              <span>Explore All Best Sellers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. GENUINE CUSTOMER EXPERIENCES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs tracking-[0.2em] uppercase font-semibold text-stone-500">
            Verified Testimonials
          </span>
          <h2 className="mt-1 text-2xl sm:text-3xl font-serif font-bold text-[#1C1A17]">
            Words From Our Patrons
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-sm border border-[#E8E5DF] flex flex-col justify-between space-y-4">
            <div>
              <div className="text-amber-700 text-sm">★★★★★</div>
              <h4 className="mt-2 text-sm font-semibold text-[#1C1A17]">
                &ldquo;Remarkable drape and artisanal touch&rdquo;
              </h4>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                The Mulberry Silk & Linen overshirt is a masterpiece. The tactile breathability is unparalleled in humid coastal weather. Packaged in a beautiful reusable linen drawstring sachet.
              </p>
            </div>
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-900">Riya Sharma</span>
              <span className="text-stone-500">Mumbai · Verified Buyer</span>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-sm border border-[#E8E5DF] flex flex-col justify-between space-y-4">
            <div>
              <div className="text-amber-700 text-sm">★★★★★</div>
              <h4 className="mt-2 text-sm font-semibold text-[#1C1A17]">
                &ldquo;Solid brass with genuine gravitational heft&rdquo;
              </h4>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                The cast brass incense burner has such gravitas. You can clearly feel the hand-chiseled ridges from the metal-smith. It looks magnificent on dark walnut wood.
              </p>
            </div>
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-900">Kabir Mehta</span>
              <span className="text-stone-500">Bengaluru · Verified Buyer</span>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-sm border border-[#E8E5DF] flex flex-col justify-between space-y-4">
            <div>
              <div className="text-amber-700 text-sm">★★★★★</div>
              <h4 className="mt-2 text-sm font-semibold text-[#1C1A17]">
                &ldquo;World-class leather patina&rdquo;
              </h4>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                Took the Cognac Weekender on two international trips. The vegetable-tanned leather has aged into a rich honey lustre. Solid brass hardware glides with zero catch.
              </p>
            </div>
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-900">Vikramaditya Roy</span>
              <span className="text-stone-500">New Delhi · Verified Buyer</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs tracking-[0.2em] uppercase font-semibold text-stone-500">
            Assistance & Queries
          </span>
          <h2 className="mt-1 text-2xl sm:text-3xl font-serif font-bold text-[#1C1A17]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="divide-y divide-[#E8E5DF] border-y border-[#E8E5DF]">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-4">
              <button
                onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left text-sm font-semibold text-[#1C1A17] hover:text-stone-700 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-stone-500 transition-transform duration-200 shrink-0 ml-4 ${
                    openFaqIdx === idx ? 'rotate-180 text-black' : ''
                  }`}
                />
              </button>
              {openFaqIdx === idx && (
                <p className="mt-3 text-xs text-stone-600 leading-relaxed pr-6 animate-in fade-in">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. FINAL INVITATION CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF9F6] border border-[#E8E5DF] p-8 sm:p-12 text-center rounded-sm space-y-4">
          <span className="text-xs tracking-[0.25em] uppercase font-semibold text-stone-500">
            Direct Atelier Dispatch
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#1C1A17] tracking-tight">
            Elevate Your Everyday Surroundings
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
            Every creation is inspected by hand, sealed with botanical aromatics, and dispatched with complimentary insurance across India.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('shop', { category: 'all' })}
              className="py-3.5 px-8 bg-[#1C1A17] hover:bg-black text-white text-xs font-semibold tracking-widest uppercase rounded-sm transition-all shadow-sm"
            >
              Shop All Creations
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
