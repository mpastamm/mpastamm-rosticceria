import React from 'react';
import { Plus, Camera } from 'lucide-react';
import { Product } from '../types';
import { ASSET_IMAGES } from '../services/imageMap';

interface GlassDisplayCaseProps {
  product?: Product;
  defaultName?: string;
  defaultPrice?: number;
  onClick: () => void;
  onQuickAdd?: (product: Product) => void;
}

export const GlassDisplayCase: React.FC<GlassDisplayCaseProps> = ({
  product,
  defaultName = 'Nome prodotto',
  defaultPrice = 0,
  onClick,
  onQuickAdd,
}) => {
  const isAvailable = product ? product.availability_status !== 'sold_out' : true;
  const isSoldOut = product ? product.availability_status === 'sold_out' : false;
  const name = product ? product.name : defaultName;
  const price = product ? product.price : defaultPrice;
  const image = product?.image_url;

  return (
    <div
      onClick={onClick}
      className="group relative flex h-full flex-col items-center cursor-pointer transition-transform duration-300 hover:-translate-y-1 select-none w-full"
    >
      {/* THE COUNTERTOP GLASS DISPLAY CASE ("TECA DA BANCO") */}
      <div className="relative w-full aspect-[5/4] overflow-hidden rounded-xl border border-[#A8B9AE]/80 bg-[#F8F3EB] shadow-[0_4px_12px_rgba(44,33,22,0.2)]">
        {/* Teca 3D Showcase Frame Image */}
        <img
          src={ASSET_IMAGES.glassDisplayCase}
          alt="Teca Vetrinetta Mpastamm"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* TOP SPOTLIGHT GLOW CONES OVER THE PRODUCT */}
        <div className="absolute top-[8%] left-[21%] h-12 w-12 rounded-full bg-amber-100/40 blur-lg pointer-events-none" />
        <div className="absolute top-[8%] right-[21%] h-12 w-12 rounded-full bg-amber-100/40 blur-lg pointer-events-none" />

        {/* INTERIOR DISPLAY CHAMBER - WHERE FOOD PRODUCT SITS */}
        <div className="absolute top-[16%] bottom-[27%] left-[14%] right-[14%] flex items-center justify-center overflow-hidden rounded-md border border-white/35 bg-[#F1E7D3]/35 shadow-[inset_0_0_18px_rgba(255,247,214,0.34)]">
          {image ? (
            <div className="relative flex h-full w-full items-center justify-center p-1.5">
              <img
                src={image}
                alt={name}
                className={`h-full w-full rounded object-cover shadow-[0_4px_10px_rgba(64,39,21,0.28)] transition-transform duration-500 group-hover:scale-[1.03] ${
                  isSoldOut ? 'grayscale contrast-75 opacity-40' : ''
                }`}
              />
              {/* Subtle glass bottom floor reflection shadow */}
              <div className="absolute inset-x-1.5 bottom-1.5 h-6 rounded-b bg-gradient-to-t from-black/35 to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-black/15 backdrop-blur-[0.5px] rounded border border-dashed border-amber-900/30 text-[#8C7A68] p-2 text-center group-hover:border-amber-700/50 transition-colors">
              <Camera className="w-4 h-4 mb-0.5 opacity-60 text-amber-700" />
              <span className="text-[8px] sm:text-[9px] font-sans font-medium text-[#7D6B5A] leading-tight">
                Inserisci foto
              </span>
            </div>
          )}

          {/* Sold out overlay tag inside the teca */}
          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px] rounded">
              <span className="px-2 py-0.5 bg-red-600/90 text-white text-[9px] font-bold uppercase tracking-wider rounded shadow-md">
                Sold Out
              </span>
            </div>
          )}

          {/* Quick Add icon button on hover */}
          {isAvailable && product && onQuickAdd && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(product);
              }}
              className="absolute top-1 right-1 p-1.5 rounded-full bg-[#16251A] hover:bg-[#233C29] text-white opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg active:scale-95"
              title="Aggiungi al carrello"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* REALISTIC GLASS FRONT SHIMMER */}
        <div className="absolute inset-x-[11%] top-[13%] bottom-[25%] rounded bg-gradient-to-tr from-white/[0.02] via-white/[0.1] to-white/[0.24] pointer-events-none" />

      </div>

      {/* Editorial product label below the glass case, as in the reference. */}
      <div className="flex min-h-[34px] w-full flex-col justify-start px-1 pt-1.5 text-center">
        <h4 className="font-serif font-semibold text-[10px] sm:text-[11px] lg:text-[12px] text-[#29231C] leading-tight truncate w-full tracking-tight">
          {name}
        </h4>
        <span className="font-sans font-semibold text-[9px] sm:text-[10px] lg:text-[10.5px] text-[#6D4A25] leading-none">
          € {price.toFixed(2).replace('.', ',')}
        </span>
      </div>
    </div>
  );
};
