import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, notes?: string) => void;
  onRemoveItem: (productId: string, notes?: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const total = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-fadeIn">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Drawer panel */}
      <div className="relative w-full max-w-md bg-[#FAF7F2] h-full shadow-2xl flex flex-col z-10 animate-slideLeft">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#E8DFD1] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#1B3B2B]" />
            <h2 className="font-display text-lg font-bold text-[#1C211E]">
              Il tuo Ordine
            </h2>
            <span className="text-xs bg-[#E8DFD1] text-[#1B3B2B] px-2 py-0.5 rounded-full font-bold">
              {items.length} {items.length === 1 ? 'prodotto' : 'prodotti'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none"
            aria-label="Chiudi carrello"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#7A8A7E]">
              <div className="w-16 h-16 rounded-full bg-[#EFE9DF] flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8 text-[#A89F91]" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#1C211E] mb-1">
                Il carrello è vuoto
              </h3>
              <p className="text-sm max-w-xs mb-5">
                Esplora la nostra vetrina per aggiungere i tuoi piatti d'asporto preferiti!
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-[#1B3B2B] text-white text-xs font-semibold rounded-xl"
              >
                Guarda la Vetrina
              </button>
            </div>
          ) : (
            items.map((item, idx) => {
              const itemSubtotal = item.product.price * item.quantity;
              return (
                <div
                  key={`${item.product.id}_${idx}`}
                  className="bg-white p-3.5 rounded-xl border border-[#E8DFD1] shadow-xs flex gap-3 items-center"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-lg object-cover bg-stone-100 shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-semibold text-sm text-[#1C211E] truncate">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.product.id, item.notes)}
                        className="text-stone-400 hover:text-red-600 p-1 -mr-1"
                        aria-label="Rimuovi prodotto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-[#8C765C] italic truncate">
                        Nota: {item.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <span className="font-mono tabular-nums text-xs font-semibold text-[#1B3B2B]">
                        €{itemSubtotal.toFixed(2).replace('.', ',')}
                      </span>

                      {/* Stepper */}
                      <div className="flex items-center border border-[#D8C3A5] rounded-lg bg-[#FAF7F2]">
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.product.id, item.quantity - 1, item.notes)
                          }
                          className="p-1 text-[#1B3B2B] hover:bg-stone-200 rounded-l-md"
                          aria-label="Riduci quantità"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.product.id, item.quantity + 1, item.notes)
                          }
                          className="p-1 text-[#1B3B2B] hover:bg-stone-200 rounded-r-md"
                          aria-label="Aumenta quantità"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-[#E8DFD1] space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[#55645A]">
                <span>Subtotale</span>
                <span className="font-mono tabular-nums">
                  €{total.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#1C211E] pt-1 border-t border-[#F0EBE1]">
                <span>Totale da saldare al ritiro</span>
                <span className="font-mono tabular-nums text-lg text-[#1B3B2B]">
                  €{total.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 px-4 bg-[#1B3B2B] hover:bg-[#28553E] text-[#FAF7F2] font-semibold text-sm rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Continua con la prenotazione</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
