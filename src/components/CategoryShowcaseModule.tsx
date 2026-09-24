import React from 'react';
import { ArrowRight, Utensils } from 'lucide-react';
import { Category, Product } from '../types';
import { GlassDisplayCase } from './GlassDisplayCase';

interface CategoryShowcaseModuleProps {
  category: Category;
  title: string;
  subtitle: string;
  heroImage: string;
  icon: React.ReactNode;
  products: Product[];
  onOpenProductModal: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  onExploreCategory: (categorySlug: string) => void;
}

export const CategoryShowcaseModule: React.FC<CategoryShowcaseModuleProps> = ({
  category,
  title,
  subtitle,
  heroImage,
  icon,
  products,
  onOpenProductModal,
  onQuickAdd,
  onExploreCategory,
}) => {
  // Take up to 3 products for the display tecas, or pad with empty placeholders if fewer
  const displayItems = products.slice(0, 3);
  const placeholderCount = Math.max(0, 3 - displayItems.length);

  return (
    <div className="relative bg-gradient-to-b from-[#382315] via-[#2A1A0F] to-[#1D1109] rounded-3xl p-5 sm:p-6 border border-[#523724] shadow-xl text-white flex flex-col justify-between overflow-hidden">
      {/* Subtle radial warmth glow inside */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row with Category Icon */}
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#F7F2EA]">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-[#C9B9A6] mt-0.5 max-w-[200px] sm:max-w-xs font-normal">
            {subtitle}
          </p>

          <button
            onClick={() => onExploreCategory(category.slug)}
            className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#16251A] hover:bg-[#203626] text-[#FAF7F2] text-xs font-medium border border-[#2B4332] shadow-sm transition-transform active:scale-95"
          >
            <span>Scopri di più</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Circular Icon Badge matching screenshot */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#16251A] border border-[#2E4A35] flex items-center justify-center text-[#B0CCA9] shrink-0 shadow-inner">
          {icon}
        </div>
      </div>

      {/* Center Featured Hero Food Photography matching screenshot */}
      <div className="relative my-4 flex items-center justify-center w-full">
        <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden shadow-2xl border border-[#5A3C26]/80 bg-black/20">
          <img
            src={heroImage}
            alt={title}
            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
          />
          {/* Subtle bottom shadow gradient */}
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#1D1109]/80 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Bottom Row: 3 Glass Display Cases ("Teche da banco") */}
      <div className="relative z-10 mt-auto pt-2 grid grid-cols-3 gap-2 sm:gap-3">
        {displayItems.map((prod) => (
          <GlassDisplayCase
            key={prod.id}
            product={prod}
            onClick={() => onOpenProductModal(prod)}
            onQuickAdd={onQuickAdd}
          />
        ))}

        {/* Fill placeholders if needed */}
        {Array.from({ length: placeholderCount }).map((_, idx) => (
          <GlassDisplayCase
            key={`placeholder-${idx}`}
            defaultName="Nome prodotto"
            defaultPrice={0}
            onClick={() => onExploreCategory(category.slug)}
          />
        ))}
      </div>
    </div>
  );
};
