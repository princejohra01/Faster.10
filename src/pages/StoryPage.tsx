import React from 'react';
import { Feather, Layers, Compass, ShieldCheck, ArrowRight } from 'lucide-react';
import { IMAGES } from '../assets';

interface StoryPageProps {
  onNavigateToShop: () => void;
}

export const StoryPage: React.FC<StoryPageProps> = ({ onNavigateToShop }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16 sm:space-y-24">
      {/* Editorial Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-stone-500">
          The Provenance Dossier
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#1C1A17] tracking-tight leading-tight">
          Craft as an Architecture of Time.
        </h1>
        <p className="text-xs sm:text-base text-stone-600 leading-relaxed max-w-2xl mx-auto">
          VARENYA was founded upon a single imperative: that contemporary luxury should not compromise the integrity of ancestral handcraft, natural fibre, or artisanal dignity.
        </p>
      </div>

      {/* Feature Visual */}
      <div className="aspect-[16/9] rounded-sm overflow-hidden bg-stone-200 border border-[#E8E5DF] shadow-md">
        <img
          src={IMAGES.hero}
          alt="VARENYA Atelier Still Life"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <Feather className="w-6 h-6 text-amber-800" />
          <h3 className="text-base font-serif font-bold text-stone-900">
            01. Pure Fibre Integrity
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            We exclusively harvest European certified organic flax and wild mulberry silk from central India. Our yarns contain zero synthetic polymers or polyester sizing agents.
          </p>
        </div>

        <div className="space-y-3">
          <Layers className="w-6 h-6 text-amber-800" />
          <h3 className="text-base font-serif font-bold text-stone-900">
            02. Monolithic Cast Metals
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Our brassware is sand-cast using traditional river silt molds in Moradabad. Each piece remains chemically uncoated, encouraging the metal to breathe and mature into a singular patina.
          </p>
        </div>

        <div className="space-y-3">
          <Compass className="w-6 h-6 text-amber-800" />
          <h3 className="text-base font-serif font-bold text-stone-900">
            03. Ancestral Distillation
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Our botanical extractions are distilled in century-old copper deg-bhapka cauldrons in Kannauj, capturing true wood essences, amber resins, and soil petrichor without chemical fixatives.
          </p>
        </div>
      </div>

      {/* Commitment Section */}
      <div className="bg-[#FAF9F6] border border-[#E8E5DF] p-8 sm:p-12 rounded-sm space-y-6">
        <h2 className="text-2xl font-serif font-bold text-[#1C1A17]">
          Our Covenant With Indian Artisans
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-stone-600 leading-relaxed">
          <p>
            Every single craftsman and artisan partner involved in creating VARENYA collections receives compensation at least 2.5 times the regional minimum wage. We fund loom upgrades and health coverage for weaver cooperatives in Maheshwar and Murshidabad.
          </p>
          <p>
            By designing collections that ignore transient seasonal fashion cycles, we protect our artisans from brutal demand spikes and seasonal unemployment, providing year-round sustainable livelihood.
          </p>
        </div>

        <div className="pt-4 border-t border-stone-200 flex justify-between items-center">
          <span className="text-xs uppercase tracking-widest font-semibold text-stone-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" /> Certified Direct Guild Sourcing
          </span>
          <button
            onClick={onNavigateToShop}
            className="py-2.5 px-6 bg-[#1C1A17] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors flex items-center gap-2"
          >
            <span>Explore The Artifacts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
