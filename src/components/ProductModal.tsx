import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Product, Category } from '../types';
import { AvailabilityBadge } from './AvailabilityBadge';

interface ProductModalProps {
  product: Product | null;
  categoryName?: string;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, notes?: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  categoryName,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  if (!isOpen || !product) return null;

  const isSoldOut = product.availability_status === 'sold_out';
  const maxStock = product.stock_management_enabled ? product.stock_quantity : 99;

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < maxStock) setQuantity(quantity + 1);
  };

  const handleAdd = () => {
    onAddToCart(product, quantity, notes.trim() || undefined);
    setQuantity(1);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      {/* Container / Sheet */}
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Grab handle */}
        <div className="sm:hidden w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2.5" />

        {/* Header & Image */}
        <div className="relative aspect-[16/10] w-full bg-[#F3EFE6] overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover ${isSoldOut ? 'opacity-60 grayscale' : ''}`}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center focus:outline-none"
            aria-label="Chiudi finestra"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.badge && product.badge !== 'none' && (
              <span className="text-xs font-bold uppercase tracking-wider bg-[#1B3B2B] text-white px-2.5 py-1 rounded-md shadow-xs">
                {product.badge}
              </span>
            )}
            <AvailabilityBadge status={product.availability_status} size="sm" />
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#1C211E]">
                {product.name}
              </h2>
              <span className="font-mono tabular-nums text-xl font-bold text-[#1B3B2B]">
                €{(product.price * quantity).toFixed(2).replace('.', ',')}
              </span>
            </div>

            {categoryName && (
              <p className="text-xs uppercase tracking-wider text-[#7A8A7E] font-semibold mt-0.5">
                {categoryName}
              </p>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-[#425046] leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Ingredients list */}
          {product.ingredients && (
            <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E8DFD1]">
              <span className="text-xs font-bold text-[#1B3B2B] uppercase tracking-wider block mb-1">
                Ingredienti
              </span>
              <p className="text-xs sm:text-sm text-[#55645A]">
                {product.ingredients}
              </p>
            </div>
          )}

          {/* Stock info banner */}
          {product.stock_management_enabled && (
            <div className="text-xs text-[#556B2F] font-medium flex items-center gap-1.5">
              <span>Disponibilità rimasta per oggi:</span>
              <strong className="font-mono text-[#1B3B2B]">{product.stock_quantity} pezzi</strong>
            </div>
          )}

          {/* Optional notes */}
          {!isSoldOut && (
            <div className="space-y-1.5 pt-1">
              <label htmlFor="product-notes" className="text-xs font-bold text-[#2E3B32] uppercase tracking-wider">
                Note per questo prodotto (opzionale)
              </label>
              <input
                id="product-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Es. Senza maionese, ben cotto, taglio a metà..."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-[#D8C3A5] bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3B2B] focus:border-transparent text-[#1C211E] placeholder:text-[#9A9A9A]"
              />
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-[#FAF7F2] border-t border-[#E8DFD1] flex items-center gap-3">
          {isSoldOut ? (
            <div className="w-full text-center py-3 text-sm font-semibold text-red-700 bg-red-50 rounded-xl border border-red-200">
              Prodotto esaurito per oggi
            </div>
          ) : (
            <>
              {/* Stepper */}
              <div className="flex items-center bg-white border border-[#D8C3A5] rounded-xl p-1 shadow-xs">
                <button
                  onClick={handleDecrease}
                  disabled={quantity <= 1}
                  className="p-2 text-[#1B3B2B] hover:bg-[#FAF7F2] disabled:opacity-30 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center"
                  aria-label="Diminuisci quantità"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-mono tabular-nums font-bold text-base text-[#1C211E]">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrease}
                  disabled={quantity >= maxStock}
                  className="p-2 text-[#1B3B2B] hover:bg-[#FAF7F2] disabled:opacity-30 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center"
                  aria-label="Aumenta quantità"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Submit CTA */}
              <button
                onClick={handleAdd}
                className="flex-1 py-3 px-4 bg-[#1B3B2B] hover:bg-[#28553E] text-[#FAF7F2] font-semibold text-sm sm:text-base rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-h-[48px]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Aggiungi all'ordine</span>
                <span className="font-mono ml-1 text-[#E8DFD1]">
                  • €{(product.price * quantity).toFixed(2).replace('.', ',')}
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
