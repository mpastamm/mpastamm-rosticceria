import React, { useEffect, useState } from 'react';
import { CheckCircle2, MessageSquare, Calendar, Clock, ArrowRight, Share2, Printer, Store, Truck, ExternalLink, CreditCard, Loader2 } from 'lucide-react';
import { Order, BusinessSettings, PaymentStatus } from '../types';
import { generateDirectWhatsAppUrl, formatWhatsAppMessage } from '../services/whatsapp';
import { StorageService } from '../services/storage';

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
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(order?.payment_status || 'pending');

  useEffect(() => {
    if (!order) return;
    setPaymentStatus(order.payment_status || 'pending');

    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    if (!sessionId) return;

    let active = true;
    fetch(`/api/stripe-session?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Impossibile verificare il pagamento');
        return data;
      })
      .then((data) => {
        if (!active) return;
        const nextStatus: PaymentStatus = data.paymentStatus === 'paid' ? 'paid' : 'pending';
        setPaymentStatus(nextStatus);
        StorageService.updateOrder(order.id, {
          payment_status: nextStatus,
          stripe_checkout_session_id: data.sessionId,
          stripe_payment_intent_id: data.paymentIntentId || undefined,
          paid_at: nextStatus === 'paid' ? new Date().toISOString() : undefined,
        });
        if (nextStatus === 'paid') StorageService.clearCart();
      })
      .catch((error) => {
        console.warn('Pagamento Stripe ancora in verifica:', error);
      });

    return () => {
      active = false;
    };
  }, [order?.id]);

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
  const isDelivery = order.fulfillment_method === 'delivery';
  const deliveryMapsUrl = order.delivery_latitude != null && order.delivery_longitude != null
    ? `https://www.google.com/maps?q=${order.delivery_latitude},${order.delivery_longitude}`
    : '';
  const isPaymentConfirmed = paymentStatus === 'paid';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6 animate-fadeIn">
      {/* Success Badge & Headline */}
      <div className="text-center space-y-3">
        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto shadow-xs ${isPaymentConfirmed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {isPaymentConfirmed ? <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" /> : <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin" />}
        </div>

        <div>
            <span className={`text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full ${isPaymentConfirmed ? 'text-emerald-800 bg-emerald-50 border border-emerald-200' : 'text-amber-800 bg-amber-50 border border-amber-200'}`}>
              {isPaymentConfirmed ? 'Pagamento confermato' : 'Pagamento in verifica'}
          </span>
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-[#1C211E] mt-3">
            Grazie, {order.customer_name}!
          </h1>
          <p className="text-sm sm:text-base text-[#55645A] mt-1">
            Il tuo ordine <strong className="text-[#1B3B2B] font-mono text-base sm:text-lg">{order.order_number}</strong> {isPaymentConfirmed ? 'è stato pagato e registrato nei nostri sistemi.' : 'è stato ricevuto; stiamo verificando il pagamento.'}
          </p>
        </div>
      </div>

      {/* Main Order Receipt Card */}
      <div className="bg-white rounded-3xl border border-[#E8DFD1] shadow-md p-6 sm:p-8 space-y-6">
        {/* Pickup Time Banner */}
        <div className="bg-[#FAF7F2] p-4 sm:p-5 rounded-2xl border border-[#E8DFD1] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#1B3B2B] text-white flex items-center justify-center shrink-0">
              {isDelivery ? <Truck className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#7A8A7E] font-bold block">
                {isDelivery ? 'Orario di Consegna Previsto' : 'Orario di Ritiro Previsto'}
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
              {isPaymentConfirmed ? 'PAGAMENTO CONFERMATO' : 'IN ATTESA DI VERIFICA'}
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
            <span>{isPaymentConfirmed ? 'Totale pagato con Stripe' : 'Totale ordine'}</span>
            <span className="font-mono tabular-nums text-2xl text-[#1B3B2B]">
              €{order.total.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <p className="text-xs text-[#7A8A7E]">
            Modalità: <strong className="inline-flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Pagamento online con Stripe</strong>
          </p>
        </div>

        {/* Location & Contact Notice */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
          {isDelivery ? <Truck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" /> : <Store className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />}
          <div>
            <p className="font-bold">{isDelivery ? 'Dove consegneremo il tuo ordine:' : 'Dove ritirare il tuo ordine:'}</p>
            <p className="mt-0.5">
              {isDelivery
                ? (order.delivery_address || 'Posizione condivisa tramite GPS')
                : `Rosticceria 'Mpastamm — ${settings.address}, ${settings.city}`}
            </p>
            {isDelivery && deliveryMapsUrl && (
              <a
                href={deliveryMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1 font-semibold text-emerald-800 hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Apri posizione sulla mappa
              </a>
            )}
            <p className="text-emerald-800 mt-1">
              {isDelivery ? 'Tieni a portata di mano questo numero ordine: ' : 'Mostra questo numero ordine al banco caldo: '}
              <strong>{order.order_number}</strong>
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
