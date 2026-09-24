import React from 'react';
import { ArrowLeft, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';

interface CartPageProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, notes?: string) => void;
  onRemoveItem: (productId: string, notes?: string) => void;
  onNavigate: (path: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onNavigate,
}) => {
  const total = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#EFE9DF] text-[#7A8A7E] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-display text-2xl font-bold text-[#1C211E]">Il tuo carrello è vuoto</h2>
        <p className="text-sm text-[#55645A] max-w-sm mx-auto">
          Non hai ancora aggiunto prodotti al tuo ordine. Esplora la vetrina per selezionare le nostre specialità da forno e friggitoria.
        </p>
        <button
          onClick={() => onNavigate('/vetrina')}
          className="px-6 py-3 bg-[#1B3B2B] hover:bg-[#28553E] text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
        >
          Vai alla Vetrina
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('/vetrina')}
          className="p-2 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100"
          aria-label="Torna alla vetrina"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1C211E]">
          Riepilogo Carrello
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Products List */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item, idx) => {
            const itemSubtotal = item.product.price * item.quantity;
            return (
              <div
                key={`${item.product.id}_${idx}`}
                className="bg-white p-4 rounded-2xl border border-[#E8DFD1] shadow-xs flex items-center gap-4"
              >
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-20 h-20 rounded-xl object-cover bg-stone-100 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-display font-bold text-base text-[#1C211E] truncate">
                      {item.product.name}
                    </h3>
                    <button
                      onClick={() => onRemoveItem(item.product.id, item.notes)}
                      className="text-stone-400 hover:text-red-600 p-1"
                      aria-label="Rimuovi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-[#7A8A7E]">
                    Prezzo unitario: €{item.product.price.toFixed(2).replace('.', ',')}
                  </p>

                  {item.notes && (
                    <p className="text-xs text-[#8C765C] bg-[#FAF7F2] px-2 py-1 rounded-md mt-1 italic">
                      Nota: {item.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F5F2EB]">
                    <span className="font-mono tabular-nums font-bold text-sm text-[#1B3B2B]">
                      Subtotale: €{itemSubtotal.toFixed(2).replace('.', ',')}
                    </span>

                    <div className="flex items-center border border-[#D8C3A5] rounded-xl bg-[#FAF7F2]">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity - 1, item.notes)
                        }
                        className="p-1.5 text-[#1B3B2B] hover:bg-stone-200 rounded-l-lg"
                        aria-label="Diminuisci"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-mono font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity + 1, item.notes)
                        }
                        className="p-1.5 text-[#1B3B2B] hover:bg-stone-200 rounded-r-lg"
                        aria-label="Aumenta"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Checkout Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8DFD1] shadow-xs h-fit space-y-5">
          <h2 className="font-display text-lg font-bold text-[#1C211E] border-b border-[#F0EBE1] pb-3">
            Totale Ordine
          </h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-[#55645A]">
              <span>Totale prodotti ({items.length})</span>
              <span className="font-mono tabular-nums">
                €{total.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <div className="flex justify-between text-[#55645A]">
              <span>Costo servizio d'asporto</span>
              <span className="text-emerald-700 font-medium">Gratuito</span>
            </div>
            <div className="pt-3 border-t border-[#F0EBE1] flex justify-between items-baseline font-bold text-lg text-[#1C211E]">
              <span>Totale al ritiro</span>
              <span className="font-mono tabular-nums text-xl text-[#1B3B2B]">
                €{total.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          <p className="text-xs text-[#7A8A7E] bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DFD1]">
            💡 Il pagamento avverrà al momento del ritiro presso la nostra rosticceria in contanti o con POS.
          </p>

          <button
            onClick={() => onNavigate('/checkout')}
            className="w-full py-3.5 bg-[#1B3B2B] hover:bg-[#28553E] text-white font-semibold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <span>Continua con la Prenotazione</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
