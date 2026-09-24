import React from 'react';
import { Edit, Check, AlertCircle, Ban, Layers } from 'lucide-react';
import { Product, AvailabilityStatus } from '../../types';
import { AvailabilityBadge } from '../AvailabilityBadge';

interface ProductAdminCardProps {
  product: Product;
  categoryName?: string;
  onStatusChange: (status: AvailabilityStatus) => void;
  onEdit: () => void;
}

export const ProductAdminCard: React.FC<ProductAdminCardProps> = ({
  product,
  categoryName,
  onStatusChange,
  onEdit,
}) => {
  const currentStatus = product.availability_status;

  return (
    <div className="bg-white rounded-2xl border border-[#E8DFD1] overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col">
      {/* Top Media & Details Header */}
      <div className="p-3.5 sm:p-4 flex gap-3.5 items-start">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
          <img
            src={product.image_url}
            alt={product.name}
            className={`w-full h-full object-cover ${currentStatus === 'sold_out' ? 'grayscale opacity-60' : ''}`}
          />
          {product.featured && (
            <span className="absolute bottom-1 left-1 bg-[#1B3B2B] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              In evidenza
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <h4 className="font-display font-bold text-base text-[#1C211E] truncate">
              {product.name}
            </h4>
            <span className="font-mono tabular-nums font-bold text-sm sm:text-base text-[#1B3B2B] shrink-0">
              €{product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            {categoryName && (
              <span className="text-[11px] font-semibold text-[#6C7B70] uppercase">
                {categoryName}
              </span>
            )}
            <span className="text-stone-300">·</span>
            <AvailabilityBadge status={currentStatus} size="sm" />
          </div>

          {/* Stock info if managed */}
          <div className="mt-2 text-xs text-[#55645A]">
            {product.stock_management_enabled ? (
              <span className="flex items-center gap-1 font-mono">
                <Layers className="w-3.5 h-3.5 text-[#8A9A86]" />
                Giacenza: <strong>{product.stock_quantity} pz</strong>
              </span>
            ) : (
              <span className="text-stone-400 text-[11px]">Gestione manuale</span>
            )}
          </div>
        </div>

        <button
          onClick={onEdit}
          className="p-2 text-stone-400 hover:text-[#1B3B2B] hover:bg-stone-100 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
          title="Modifica scheda completa"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>

      {/* Rapid Action Buttons for Counter / Kitchen (section 16) */}
      <div className="p-2.5 sm:p-3 bg-[#FAF7F2] border-t border-[#E8DFD1] grid grid-cols-3 gap-1.5 sm:gap-2">
        {/* DISPONIBILE */}
        <button
          type="button"
          onClick={() => onStatusChange('available')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all min-h-[44px] flex flex-col items-center justify-center gap-1 ${
            currentStatus === 'available'
              ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-500'
              : 'bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-50 active:scale-95'
          }`}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>DISPONIBILE</span>
        </button>

        {/* QUASI FINITO */}
        <button
          type="button"
          onClick={() => onStatusChange('low_stock')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all min-h-[44px] flex flex-col items-center justify-center gap-1 ${
            currentStatus === 'low_stock'
              ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400'
              : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-50 active:scale-95'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>QUASI FINITO</span>
        </button>

        {/* SOLD OUT */}
        <button
          type="button"
          onClick={() => onStatusChange('sold_out')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all min-h-[44px] flex flex-col items-center justify-center gap-1 ${
            currentStatus === 'sold_out'
              ? 'bg-red-700 text-white shadow-sm ring-2 ring-red-500'
              : 'bg-white text-red-700 border border-red-200 hover:bg-red-50 active:scale-95'
          }`}
        >
          <Ban className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>SOLD OUT</span>
        </button>
      </div>
    </div>
  );
};
