import React from 'react';
import { ArrowRight } from 'lucide-react';
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
    <article className="relative overflow-hidden rounded-[18px] border border-[#D0C4B2] bg-[#F7F1E8] shadow-[0_8px_24px_rgba(73,54,35,0.14)] text-white">
      {/* Compact editorial category header: copy left, food photography right. */}
      <div className="relative h-[154px] sm:h-[166px] overflow-hidden bg-[#3B2516]">
        <img
          src={heroImage}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2A180D]/95 via-[#3A2113]/78 via-[45%] to-[#3A2113]/8" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2A180D]/55 via-transparent to-transparent" />

        <div className="relative z-10 flex h-full items-start justify-between gap-3 px-5 py-4 sm:px-6 sm:py-5">
          <div className="max-w-[58%]">
            <h3 className="font-serif text-[1.85rem] sm:text-[2rem] font-bold tracking-[-0.03em] text-[#FCF7EF] leading-[0.98]">
              {title}
            </h3>
            <p className="mt-1.5 max-w-[170px] text-[0.83rem] sm:text-[0.88rem] leading-[1.12] text-[#F0E3D2]">
              {subtitle}
            </p>
            <button
              onClick={() => onExploreCategory(category.slug)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#9CB28B]/75 bg-[#294426]/90 px-3.5 py-1.5 text-[0.72rem] font-medium text-[#FBF7EE] shadow-sm transition hover:bg-[#355A31] active:scale-95"
            >
              <span>Scopri di più</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#A8BF91]/60 bg-[#2E512A]/95 text-[#DDE8D1] shadow-md">
            {icon}
          </div>
        </div>
      </div>

      {/* Three glass display cases on the warm paper surface. */}
      <div className="grid grid-cols-3 gap-1.5 bg-[#F7F1E8] p-2.5 sm:gap-2 sm:p-3">
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
    </article>
  );
};
