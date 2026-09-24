import React from 'react';
import { Plus, Check } from 'lucide-react';
import { Product } from '../types';
import { AvailabilityBadge } from './AvailabilityBadge';

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  isAddedRecently?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetail,
  onQuickAdd,
  isAddedRecently = false,
}) => {
  const isSoldOut = product.availability_status === 'sold_out';

  return (
    <div
      onClick={() => onOpenDetail(product)}
      className={`group cursor-pointer flex flex-col bg-white rounded-2xl overflow-hidden border border-[#E8DFD1]/80 shadow-[0_4px_20px_-8px_rgba(27,59,43,0.06)] hover:shadow-[0_12px_28px_-6px_rgba(27,59,43,0.12)] transition-all duration-300 hover:-translate-y-0.5 ${
        isSoldOut ? 'bg-stone-50/90' : ''
      }`}
    >
      {/* Product Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F3EFE6]">
        <img
          src={product.image_url}
          alt={product.name}
          referrerPolicy="no-referrer"
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isSoldOut ? 'opacity-55 grayscale contrast-90' : ''
          }`}
        />

        {/* Top Badges overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1 pointer-events-none">
          {/* Editorial badge */}
          {product.badge && product.badge !== 'none' && !isSoldOut && (
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-[#1B3B2B]/90 text-[#FAF7F2] backdrop-blur-xs px-2.5 py-1 rounded-md shadow-xs">
              {product.badge}
            </span>
          )}

          {/* Availability Status Badge */}
          <div className="ml-auto">
            <AvailabilityBadge status={product.availability_status} size="sm" />
          </div>
        </div>

        {/* Sold Out Banner Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center">
            <span className="text-white text-xs sm:text-sm font-bold tracking-wider uppercase px-3 py-1.5 bg-red-600/90 rounded-md shadow-md">
              SOLD OUT
            </span>
            <span className="text-[11px] text-stone-200 mt-1 font-medium">
              Esaurito per oggi
            </span>
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Price Header */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-display text-base sm:text-lg font-bold text-[#1C211E] group-hover:text-[#1B3B2B] transition-colors leading-snug">
              {product.name}
            </h3>
            <span className="font-mono tabular-nums text-sm sm:text-base font-bold text-[#1B3B2B] shrink-0">
              €{product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>

          {/* Ingredients & description */}
          <p className="text-xs sm:text-sm text-[#55645A] line-clamp-2 leading-relaxed mb-3">
            {product.ingredients || product.description}
          </p>
        </div>

        {/* Bottom Actions Row */}
        <div className="pt-3 border-t border-[#F0EBE1] flex items-center justify-between gap-2 mt-auto">
          {/* Stock info if enabled */}
          <div className="text-[11px] text-[#7A8A7E]">
            {product.stock_management_enabled && product.stock_quantity > 0 && !isSoldOut ? (
              <span>Disponibili: <strong className="font-mono text-[#1B3B2B]">{product.stock_quantity}</strong></span>
            ) : (
              <span className="capitalize">{product.category_id.replace('cat_', '')}</span>
            )}
          </div>

          {/* Add / Sold Out Button */}
          {isSoldOut ? (
            <button
              disabled
              className="px-3.5 py-1.5 text-xs font-semibold text-stone-400 bg-stone-100 rounded-lg cursor-not-allowed border border-stone-200"
            >
              Non disponibile
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(product);
              }}
              className={`min-h-[38px] px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all active:scale-[0.96] shadow-xs ${
                isAddedRecently
                  ? 'bg-emerald-700 text-white'
                  : 'bg-[#1B3B2B] hover:bg-[#28553E] text-[#FAF7F2]'
              }`}
            >
              {isAddedRecently ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Aggiunto!</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Aggiungi</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
