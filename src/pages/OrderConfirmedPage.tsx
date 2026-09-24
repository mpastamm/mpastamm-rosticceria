import React from 'react';
import { CheckCircle2, MessageSquare, Calendar, Clock, MapPin, ArrowRight, Share2, Printer } from 'lucide-react';
import { Order, BusinessSettings } from '../types';
import { generateDirectWhatsAppUrl, formatWhatsAppMessage } from '../services/whatsapp';

interface OrderConfirmedPageProps {
  order: Order | null;
  settings: BusinessSettings;
  onNavigate: (path: string) => void;
}

export const OrderConfirmedPage: React.FC<OrderConfirmedPageProps> = ({
  order,
  settings,
  onNavigate,
}) => {
  if (!order) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 px-4">
        <h2 className="font-display text-2xl font-bold text-[#1C211E]">Ordine non trovato</h2>
        <p className="text-sm text-[#55645A]">
          Non è stato possibile caricare i dettagli di questo ordine.
        </p>
        <button
          onClick={() => onNavigate('/')}
          className="px-5 py-2.5 bg-[#1B3B2B] text-white text-xs font-semibold rounded-xl"
        >
          Torna alla Home
        </button>
      </div>
    );
  }

  // Format date in Italian
  let formattedDate = order.pickup_date;
  try {
    const d = new Date(order.pickup_date + 'T12:00:00');
    formattedDate = d.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  } catch {}

  const whatsappMessage = formatWhatsAppMessage(order);
  const whatsappUrl = generateDirectWhatsAppUrl(
    settings.whatsapp_notification_phone || '393331234567',
    whatsappMessage
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6 animate-fadeIn">
      {/* Success Badge & Headline */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Prenotazione Ricevuta
          </span>
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-[#1C211E] mt-3">
            Grazie, {order.customer_name}!
          </h1>
          <p className="text-sm sm:text-base text-[#55645A] mt-1">
            Il tuo ordine <strong className="text-[#1B3B2B] font-mono text-base sm:text-lg">{order.order_number}</strong> è stato registrato nei nostri sistemi.
          </p>
        </div>
      </div>

      {/* Main Order Receipt Card */}
      <div className="bg-white rounded-3xl border border-[#E8DFD1] shadow-md p-6 sm:p-8 space-y-6">
        {/* Pickup Time Banner */}
        <div className="bg-[#FAF7F2] p-4 sm:p-5 rounded-2xl border border-[#E8DFD1] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#1B3B2B] text-white flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#7A8A7E] font-bold block">
                Orario di Ritiro Previsto
              </span>
              <span className="font-display font-bold text-lg sm:text-xl text-[#1C211E]">
                {formattedDate}, Ore {order.pickup_time}
              </span>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-[#E8DFD1] sm:pl-4">
            <span className="text-[11px] uppercase tracking-wider text-[#7A8A7E] font-bold block">
              Stato
            </span>
            <span className="inline-block px-2.5 py-1 bg-sky-100 text-sky-800 font-bold text-xs rounded-md mt-0.5">
              IN ATTESA DI CONFERMA
            </span>
          </div>
        </div>

        {/* Itemized List */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-wider font-bold text-[#1B3B2B] border-b border-[#F0EBE1] pb-2">
            Riepilogo Specialità Ordinate
          </h3>

          <div className="divide-y divide-[#F5F2EB]">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-start justify-between text-sm">
                <div>
                  <span className="font-bold text-[#1C211E]">
                    {item.quantity}x {item.product_name_snapshot}
                  </span>
                  {item.notes && (
                    <p className="text-xs text-[#8C765C] italic mt-0.5">
                      Nota: {item.notes}
                    </p>
                  )}
                </div>
                <span className="font-mono tabular-nums font-semibold text-[#1B3B2B] shrink-0">
                  €{item.subtotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
            ))}
          </div>

          {order.notes && (
            <div className="p-3 bg-[#FAF7F2] rounded-xl text-xs text-[#55645A] border border-[#E8DFD1]">
              <strong>Note generali:</strong> {order.notes}
            </div>
          )}
        </div>

        {/* Total & Payment Method */}
        <div className="pt-4 border-t border-[#E8DFD1] space-y-2">
          <div className="flex justify-between items-baseline font-bold text-lg text-[#1C211E]">
            <span>Totale da saldare al banco</span>
            <span className="font-mono tabular-nums text-2xl text-[#1B3B2B]">
              €{order.total.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <p className="text-xs text-[#7A8A7E]">
            Modalità: <strong>Pagamento al ritiro</strong> (Contanti o Carta)
          </p>
        </div>

        {/* Location & Contact Notice */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
          <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Dove ritirare il tuo ordine:</p>
            <p className="mt-0.5">
              Rosticceria 'Mpastamm — {settings.address}, {settings.city}
            </p>
            <p className="text-emerald-800 mt-1">
              Mostra questo numero ordine al banco caldo: <strong>{order.order_number}</strong>
            </p>
          </div>
        </div>

        {/* Optional WhatsApp Direct Link (Customer Action) */}
        <div className="pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Invia conferma anche su WhatsApp alla rosticceria</span>
          </a>
        </div>
      </div>

      {/* Navigation Return */}
      <div className="text-center pt-2">
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1B3B2B] hover:underline"
        >
          <span>Torna alla Homepage</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
