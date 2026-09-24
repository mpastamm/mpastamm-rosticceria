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
      className="group relative flex flex-col items-center cursor-pointer transition-transform duration-300 hover:-translate-y-1 select-none w-full"
    >
      {/* THE COUNTERTOP GLASS DISPLAY CASE ("TECA DA BANCO") */}
      <div className="relative w-full aspect-[1/1] rounded-xl overflow-hidden shadow-[0_3px_9px_rgba(44,33,22,0.2)] border border-[#D7C8B4] bg-[#F8F3EB]">
        {/* Teca 3D Showcase Frame Image */}
        <img
          src={ASSET_IMAGES.glassDisplayCase}
          alt="Teca Vetrinetta Mpastamm"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* TOP SPOTLIGHT GLOW CONES OVER THE PRODUCT */}
        <div className="absolute top-[6%] left-[22%] w-12 h-16 bg-amber-200/25 rounded-full blur-md pointer-events-none" />
        <div className="absolute top-[6%] right-[22%] w-12 h-16 bg-amber-200/25 rounded-full blur-md pointer-events-none" />

        {/* INTERIOR DISPLAY CHAMBER - WHERE FOOD PRODUCT SITS */}
        <div className="absolute top-[17%] bottom-[29%] left-[13%] right-[13%] flex items-center justify-center overflow-hidden rounded-md">
          {image ? (
            <div className="relative w-full h-full flex items-center justify-center p-0.5">
              <img
                src={image}
                alt={name}
                className={`w-full h-full object-cover rounded shadow-md transition-transform duration-500 group-hover:scale-105 ${
                  isSoldOut ? 'grayscale contrast-75 opacity-40' : ''
                }`}
              />
              {/* Subtle glass bottom floor reflection shadow */}
              <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black/40 to-transparent pointer-events-none rounded-b" />
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
        <div className="absolute inset-x-[11%] top-[14%] bottom-[27%] bg-gradient-to-tr from-transparent via-white/[0.05] to-white/[0.15] pointer-events-none rounded" />

      </div>

      {/* Editorial product label below the glass case, as in the reference. */}
      <div className="w-full px-1 pt-1.5 text-center">
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
