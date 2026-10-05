import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Phone, User, FileText, MapPin, Store, Truck, Navigation, CreditCard, Timer, AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { CartItem, Order, BusinessSettings, FulfillmentMethod, Product } from '../types';
import { StorageService } from '../services/storage';

interface CheckoutPageProps {
  items: CartItem[];
  products: Product[];
  settings: BusinessSettings;
  onOrderCompleted: (order: Order) => void;
  onNavigate: (path: string) => void;
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatLocalTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

const PENDING_ORDER_STORAGE_KEY = 'mpastamm_pending_customer_order_v1';

function loadPendingOrder(): Order | null {
  const orderId = window.localStorage.getItem(PENDING_ORDER_STORAGE_KEY);
  return orderId ? StorageService.getOrderById(orderId) || null : null;
}

interface PendingOrderPanelProps {
  order: Order;
  products: Product[];
  countdown: number;
  isChecking: boolean;
  isStartingPayment: boolean;
  onDecision: (decision: 'accept' | 'decline' | 'alternative', alternativeProductIds?: string[]) => void;
  onPay: () => void;
  onReset: () => void;
}

const PendingOrderPanel: React.FC<PendingOrderPanelProps> = ({
  order,
  products,
  countdown,
  isChecking,
  isStartingPayment,
  onDecision,
  onPay,
  onReset,
}) => {
  const isMissingReview = order.status === 'IN ATTESA CLIENTE';
  const isAccepted = order.status === 'ACCETTATO';
  const isCancelled = order.status === 'ANNULLATO';
  const hasSubmittedAlternative = order.customer_response === 'alternative_selected';
  const canPay = isAccepted && countdown === 0;
  const missingNames = (order.missing_product_ids || [])
    .map((id) => order.items.find((item) => item.product_id === id)?.product_name_snapshot)
    .filter(Boolean);
  const alternativeProducts = products.filter((product) =>
    (order.alternative_product_ids || []).includes(product.id),
  );
  const [selectedAlternativeIds, setSelectedAlternativeIds] = useState<string[]>(
    order.customer_selected_alternative_product_ids || [],
  );

  useEffect(() => {
    setSelectedAlternativeIds(order.customer_selected_alternative_product_ids || []);
  }, [order.id, (order.customer_selected_alternative_product_ids || []).join(',')]);
  const createdAt = new Date(order.created_at).toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-10 sm:px-6 sm:py-14">
      <div className="text-center">
        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800">
          Ordine {order.order_number}
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold text-[#1C211E] sm:text-3xl">
          {isCancelled ? 'Ordine annullato' : isMissingReview ? 'Serve una tua conferma' : isAccepted ? 'Ordine accettato' : 'Ordine ricevuto'}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#55645A]">
          {isCancelled
            ? 'La richiesta è stata annullata. Puoi tornare alla vetrina e creare un nuovo ordine.'
            : isMissingReview
              ? hasSubmittedAlternative
                ? 'La tua scelta è stata inviata. Attendi la conferma finale della rosticceria.'
                : 'La rosticceria ha segnalato alcuni prodotti non disponibili. Scegli una risposta qui sotto.'
              : 'Attendi che il tuo ordine venga accettato prima di procedere al pagamento.'}
        </p>
      </div>

      <div className="space-y-5 rounded-3xl border border-[#E8DFD1] bg-white p-5 shadow-md sm:p-8">
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-[#E8DFD1] bg-[#FAF7F2] p-4 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#7A8A7E]">Richiesta inviata alle</p>
            <p className="font-display text-xl font-bold text-[#1C211E]">{createdAt}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[#E1EAD8] px-4 py-2 text-sm font-bold text-[#1B3B2B]">
            <Timer className="h-4 w-4" />
            {isAccepted ? 'Pronto al pagamento' : countdown > 0 ? `${countdown}s` : 'In verifica'}
          </div>
        </div>

        {order.status === 'NUOVO' && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin" />
            <div>
              <strong>Stiamo aspettando la conferma della rosticceria.</strong>
              <p className="mt-1 text-xs leading-5">Il pagamento resterà bloccato fino all’accettazione dell’ordine. Non chiudere questa pagina.</p>
            </div>
          </div>
        )}

        {isMissingReview && (
          <div className="space-y-4 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-orange-950">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-700" />
              <div>
                <div className="flex items-center gap-2">
                  <strong>Assistente ordine</strong>
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-800">Mpastamm</span>
                </div>
                <p className="mt-1 font-semibold">{order.admin_message || 'Alcuni prodotti non sono disponibili.'}</p>
                <p className="mt-2 text-xs font-semibold">Prodotti segnalati: {missingNames.join(', ') || 'verifica richiesta dalla rosticceria'}</p>
              </div>
            </div>

            {alternativeProducts.length > 0 && (
              <div className="rounded-xl border border-emerald-200 bg-white/80 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-900">Scegli un’alternativa disponibile</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {alternativeProducts.map((product) => {
                    const selected = selectedAlternativeIds.includes(product.id);
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => setSelectedAlternativeIds((current) => selected
                          ? current.filter((id) => id !== product.id)
                          : [...current, product.id])}
                        className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-xs font-bold transition-colors ${selected
                          ? 'border-[#1B3B2B] bg-[#E1EAD8] text-[#1B3B2B]'
                          : 'border-[#D8C3A5] bg-white text-[#425046] hover:border-[#1B3B2B]'}`}
                      >
                        <span>{product.name}</span>
                        <span>€{product.price.toFixed(2).replace('.', ',')}</span>
                      </button>
                    );
                  })}
                </div>
                {hasSubmittedAlternative && (
                  <p className="mt-2 text-xs font-semibold text-emerald-800">Scelta inviata. La rosticceria deve confermarla prima del pagamento.</p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {alternativeProducts.length > 0 && (
                <button
                  onClick={() => onDecision('alternative', selectedAlternativeIds)}
                  disabled={isChecking || selectedAlternativeIds.length === 0}
                  className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#1B3B2B] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" /> Invia la mia scelta
                </button>
              )}
              <button
                onClick={() => onDecision('accept')}
                disabled={isChecking}
                className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl border border-[#1B3B2B] bg-white px-4 py-3 text-sm font-bold text-[#1B3B2B] disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" /> Continua senza sostituzioni
              </button>
              <button
                onClick={() => onDecision('decline')}
                disabled={isChecking}
                className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-700 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" /> Annulla ordine
              </button>
            </div>
          </div>
        )}

        {isAccepted && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
              <div>
                <strong>La rosticceria ha accettato il tuo ordine.</strong>
                <p className="mt-1 text-xs leading-5">
                  {countdown > 0
                    ? `Il pagamento sarà disponibile tra ${countdown} secondi.`
                    : 'Ora puoi procedere al pagamento sicuro con Stripe.'}
                </p>
              </div>
            </div>
            <button
              onClick={onPay}
              disabled={!canPay || isStartingPayment}
              className="mt-4 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#1B3B2B] px-4 py-3 text-base font-bold text-white shadow-lg transition-all hover:bg-[#28553E] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isStartingPayment ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
              {isStartingPayment ? 'Apertura pagamento…' : 'Procedi al pagamento'}
            </button>
          </div>
        )}

        {isCancelled && (
          <button
            onClick={onReset}
            className="w-full rounded-xl bg-[#1B3B2B] px-4 py-3 text-sm font-bold text-white"
          >
            Torna alla vetrina
          </button>
        )}

        {!isCancelled && (
          <div className="border-t border-[#F0EBE1] pt-4 text-center text-xs text-[#7A8A7E]">
            Totale attuale: <strong className="font-mono text-[#1B3B2B]">€{order.total.toFixed(2).replace('.', ',')}</strong>
            {isChecking && <span className="ml-2">Aggiornamento in corso…</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  items,
  products,
  settings,
  onOrderCompleted,
  onNavigate,
}) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCoordinates, setDeliveryCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; deliveryAddress?: string }>({});
  const [pendingOrder, setPendingOrder] = useState<Order | null>(loadPendingOrder);
  const [countdown, setCountdown] = useState(0);
  const [isCheckingOrder, setIsCheckingOrder] = useState(false);
  const [isStartingPayment, setIsStartingPayment] = useState(false);

  const total = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  useEffect(() => {
    if (!pendingOrder) {
      setCountdown(0);
      return;
    }
    if (pendingOrder.status === 'ACCETTATO' || pendingOrder.status === 'ANNULLATO') {
      setCountdown(0);
      return;
    }
    const updateCountdown = () => {
      const elapsed = Math.floor((Date.now() - new Date(pendingOrder.created_at).getTime()) / 1000);
      setCountdown(Math.max(0, 60 - elapsed));
    };
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [pendingOrder?.id, pendingOrder?.created_at, pendingOrder?.status]);

  useEffect(() => {
    if (!pendingOrder?.customer_token || pendingOrder.status === 'ACCETTATO' || pendingOrder.status === 'ANNULLATO') return;
    let active = true;
    const refreshOrder = async () => {
      try {
        const response = await fetch(`/api/order-status?order_id=${encodeURIComponent(pendingOrder.id)}&token=${encodeURIComponent(pendingOrder.customer_token || '')}`);
        if (!response.ok) return;
        const data = await response.json();
        if (!active || !data.order) return;
        const nextOrder = data.order as Order;
        StorageService.cacheOrder(nextOrder);
        setPendingOrder(nextOrder);
      } catch (error) {
        console.warn('Stato ordine ancora in attesa:', error);
      }
    };
    void refreshOrder();
    const poller = window.setInterval(refreshOrder, 3500);
    return () => {
      active = false;
      window.clearInterval(poller);
    };
  }, [pendingOrder?.id, pendingOrder?.customer_token, pendingOrder?.status]);

  // Keep the checkout panel in sync immediately when the admin updates the
  // order in another tab/device. Realtime/local-storage updates are faster
  // than the polling fallback and make the acceptance message visible at once.
  useEffect(() => {
    if (!pendingOrder?.id) return;
    const orderId = pendingOrder.id;
    const unsubscribe = StorageService.subscribeToStore(() => {
      const localOrder = StorageService.getOrderById(orderId);
      if (!localOrder) return;

      setPendingOrder((currentOrder) => {
        if (!currentOrder || currentOrder.id !== orderId) return currentOrder;
        const hasChanged =
          localOrder.status !== currentOrder.status ||
          localOrder.updated_at !== currentOrder.updated_at ||
          localOrder.admin_message !== currentOrder.admin_message ||
          localOrder.total !== currentOrder.total ||
          (localOrder.customer_selected_alternative_product_ids || []).join(',') !==
            (currentOrder.customer_selected_alternative_product_ids || []).join(',');
        return hasChanged ? { ...currentOrder, ...localOrder } : currentOrder;
      });
    });

    return () => unsubscribe();
  }, [pendingOrder?.id]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('La geolocalizzazione non è supportata da questo dispositivo. Inserisci l’indirizzo manualmente.');
      return;
    }

    setIsLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDeliveryCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLocating(false);
      },
      () => {
        setLocationError('Non è stato possibile ottenere la posizione. Consenti l’accesso oppure inserisci l’indirizzo manualmente.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: { name?: string; phone?: string; deliveryAddress?: string } = {};
    if (!name.trim()) newErrors.name = 'Il nome è obbligatorio per l’ordine';
    if (!phone.trim()) newErrors.phone = 'Il numero di telefono è obbligatorio';
    else if (phone.replace(/[^0-9]/g, '').length < 8) {
      newErrors.phone = 'Inserisci un recapito telefonico valido';
    }
    if (fulfillmentMethod === 'delivery' && !deliveryAddress.trim() && !deliveryCoordinates) {
      newErrors.deliveryAddress = 'Inserisci l’indirizzo oppure usa il pulsante per condividere la posizione.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!settings.orders_enabled) {
      alert(settings.orders_disabled_message);
      return;
    }

    setIsSubmitting(true);

    try {
      // The shop accepts orders for the current day only. The time is kept
      // internally for database compatibility, but is not exposed to customers.
      const orderDate = formatLocalDate(new Date());
      const orderTime = formatLocalTime(new Date());

      // Map cart items into OrderItem structure with snapshot
      const orderItems = items.map((ci) => ({
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        product_id: ci.product.id,
        product_name_snapshot: ci.product.name,
        product_price_snapshot: ci.product.price,
        quantity: ci.quantity,
        notes: ci.notes,
        subtotal: ci.product.price * ci.quantity,
        image_url_snapshot: ci.product.image_url,
      }));

      // Create and persist order in database
      const customerToken = window.crypto?.randomUUID?.() || `tok_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const createdOrder = StorageService.createOrder({
        customer_name: name.trim(),
        customer_surname: surname.trim(),
        customer_phone: phone.trim(),
        fulfillment_method: fulfillmentMethod,
        delivery_address: deliveryAddress.trim() || undefined,
        delivery_latitude: deliveryCoordinates?.latitude,
        delivery_longitude: deliveryCoordinates?.longitude,
        pickup_date: orderDate,
        pickup_time: orderTime,
        notes: generalNotes.trim() || undefined,
        subtotal: total,
        total: total,
        status: 'NUOVO',
        payment_status: 'pending',
        customer_token: customerToken,
        customer_response: 'pending',
        items: orderItems,
      });
      const orderResponse = await fetch('/api/create-order-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: createdOrder }),
      });
      const orderData = await orderResponse.json().catch(() => ({}));
      if (!orderResponse.ok || !orderData.order) {
        throw new Error(orderData.error || 'Impossibile inviare la richiesta alla rosticceria');
      }
      const persistedOrder = orderData.order as Order;
      StorageService.cacheOrder(persistedOrder);
      window.localStorage.setItem(PENDING_ORDER_STORAGE_KEY, persistedOrder.id);
      setPendingOrder(persistedOrder);
    } catch (err: any) {
      console.error('Error creating order request:', err);
      alert(err?.message || 'Si è verificato un errore durante l’invio dell’ordine. Riprova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 px-4">
        <h2 className="font-display text-2xl font-bold text-[#1C211E]">Nessun prodotto da prenotare</h2>
        <p className="text-xs sm:text-sm text-[#55645A]">
          Il tuo carrello è vuoto. Aggiungi prima le tue specialità preferite.
        </p>
        <button
          onClick={() => onNavigate('/vetrina')}
          className="px-5 py-2.5 bg-[#1B3B2B] text-white text-xs font-semibold rounded-xl"
        >
          Vai alla Vetrina
        </button>
      </div>
    );
  }

  const handleOrderDecision = async (
    decision: 'accept' | 'decline' | 'alternative',
    alternativeProductIds: string[] = [],
  ) => {
    if (!pendingOrder?.customer_token) return;
    setIsCheckingOrder(true);
    try {
      const response = await fetch('/api/order-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: pendingOrder.id,
          token: pendingOrder.customer_token,
          decision,
          alternative_product_ids: alternativeProductIds,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.order) throw new Error(data.error || 'Impossibile aggiornare l’ordine');
      StorageService.cacheOrder(data.order as Order);
      setPendingOrder(data.order as Order);
    } catch (error: any) {
      alert(error?.message || 'Impossibile inviare la risposta alla rosticceria.');
    } finally {
      setIsCheckingOrder(false);
    }
  };

  const handleStartPayment = async () => {
    if (!pendingOrder?.customer_token || pendingOrder.status !== 'ACCETTATO' || countdown > 0) return;
    setIsStartingPayment(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: pendingOrder }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.checkoutUrl) throw new Error(data.error || 'Pagamento Stripe non disponibile');
      const nextOrder = { ...pendingOrder, stripe_checkout_session_id: data.sessionId };
      StorageService.cacheOrder(nextOrder);
      onOrderCompleted(nextOrder);
      window.location.assign(data.checkoutUrl);
    } catch (error: any) {
      alert(error?.message || 'Si è verificato un errore durante l’avvio del pagamento. Riprova.');
    } finally {
      setIsStartingPayment(false);
    }
  };

  const resetPendingOrder = () => {
    window.localStorage.removeItem(PENDING_ORDER_STORAGE_KEY);
    setPendingOrder(null);
  };

  if (pendingOrder) {
    return (
      <PendingOrderPanel
        order={pendingOrder}
        products={products}
        countdown={countdown}
        isChecking={isCheckingOrder}
        isStartingPayment={isStartingPayment}
        onDecision={handleOrderDecision}
        onPay={handleStartPayment}
        onReset={resetPendingOrder}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('/carrello')}
          className="p-2 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100"
          aria-label="Torna al carrello"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1C211E]">
            Completa il tuo ordine
          </h1>
          <p className="text-xs sm:text-sm text-[#55645A]">
            Nessuna registrazione necessaria. Il pagamento avviene online in modo sicuro con Stripe.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Customer and Pickup Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Details Section */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DFD1] shadow-xs space-y-4">
            <h2 className="font-display text-lg font-bold text-[#1C211E] flex items-center gap-2 border-b border-[#F0EBE1] pb-3">
              <User className="w-5 h-5 text-[#1B3B2B]" />
              <span>Dati del Cliente</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider">
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  placeholder="Mario"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3B2B] bg-[#FAF7F2] ${
                    errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-[#D8C3A5]'
                  }`}
                />
                {errors.name && <p className="text-[11px] text-red-600 font-medium">{errors.name}</p>}
              </div>

              {/* Surname */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider">
                  Cognome
                </label>
                <input
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Rossi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8C3A5] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3B2B] bg-[#FAF7F2]"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#556B2F]" />
                <span>Numero di Telefono *</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors({ ...errors, phone: undefined });
                }}
                placeholder="333 1234567"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3B2B] bg-[#FAF7F2] ${
                  errors.phone ? 'border-red-500 ring-1 ring-red-500' : 'border-[#D8C3A5]'
                }`}
              />
              <p className="text-[11px] text-[#7A8A7E]">
                Ti contatteremo solo in caso di necessità relative al tuo ordine.
              </p>
              {errors.phone && <p className="text-[11px] text-red-600 font-medium">{errors.phone}</p>}
            </div>
          </div>

          {/* Fulfillment Method Section */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DFD1] shadow-xs space-y-4">
            <h2 className="font-display text-lg font-bold text-[#1C211E] flex items-center gap-2 border-b border-[#F0EBE1] pb-3">
              {fulfillmentMethod === 'pickup' ? (
                <Store className="w-5 h-5 text-[#1B3B2B]" />
              ) : (
                <Truck className="w-5 h-5 text-[#1B3B2B]" />
              )}
              <span>Come vuoi ricevere l’ordine?</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFulfillmentMethod('pickup')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  fulfillmentMethod === 'pickup'
                    ? 'border-[#1B3B2B] bg-[#EEF4EA] ring-2 ring-[#1B3B2B]/15'
                    : 'border-[#D8C3A5] bg-[#FAF7F2] hover:border-[#1B3B2B]'
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-bold text-[#1C211E]"><Store className="w-4 h-4 text-[#1B3B2B]" /> Ritiro in negozio</span>
                <span className="block text-xs text-[#7A8A7E] mt-1">Prenota, paga online e passa a ritirare.</span>
              </button>
              <button
                type="button"
                onClick={() => setFulfillmentMethod('delivery')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  fulfillmentMethod === 'delivery'
                    ? 'border-[#1B3B2B] bg-[#EEF4EA] ring-2 ring-[#1B3B2B]/15'
                    : 'border-[#D8C3A5] bg-[#FAF7F2] hover:border-[#1B3B2B]'
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-bold text-[#1C211E]"><Truck className="w-4 h-4 text-[#1B3B2B]" /> Consegna a domicilio</span>
                <span className="block text-xs text-[#7A8A7E] mt-1">Indica dove vuoi ricevere l’ordine e paga online.</span>
              </button>
            </div>

            {fulfillmentMethod === 'delivery' && (
              <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 animate-fadeIn">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#556B2F]" />
                    Indirizzo di consegna oppure posizione attuale
                  </label>
                  <textarea
                    rows={2}
                    value={deliveryAddress}
                    onChange={(event) => {
                      setDeliveryAddress(event.target.value);
                      if (errors.deliveryAddress) setErrors({ ...errors, deliveryAddress: undefined });
                    }}
                    placeholder="Via, numero civico, scala/interno, citofono"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3B2B] ${
                      errors.deliveryAddress ? 'border-red-500 ring-1 ring-red-500' : 'border-[#D8C3A5]'
                    }`}
                  />
                  {errors.deliveryAddress && <p className="text-[11px] text-red-600 font-medium">{errors.deliveryAddress}</p>}
                </div>

                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#1B3B2B] hover:bg-[#28553E] disabled:opacity-60 text-white text-xs font-bold transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  {isLocating ? 'Rilevamento posizione…' : 'Usa la mia posizione attuale'}
                </button>

                {deliveryCoordinates && (
                  <p className="text-xs text-emerald-800 font-medium">
                    Posizione rilevata e allegata all’ordine: {deliveryCoordinates.latitude.toFixed(6)}, {deliveryCoordinates.longitude.toFixed(6)}
                  </p>
                )}
                {locationError && <p className="text-[11px] text-amber-800 font-medium">{locationError}</p>}
                <p className="text-[11px] text-[#55705D]">
                  La posizione viene usata solo per comunicare il punto di consegna alla rosticceria tramite l’ordine.
                </p>
              </div>
            )}
          </div>

          {/* Same-day order information */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DFD1] shadow-xs space-y-4">
            <h2 className="font-display text-lg font-bold text-[#1C211E] flex items-center gap-2 border-b border-[#F0EBE1] pb-3">
              <Calendar className="w-5 h-5 text-[#1B3B2B]" />
              <span>Ordine per oggi</span>
            </h2>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-1">
              <p className="text-sm font-bold text-[#1B3B2B]">Prepariamo il tuo ordine nella giornata di oggi.</p>
              <p className="text-xs text-[#55705D]">
                Scegli se ritirarlo in negozio oppure riceverlo a domicilio. Ti contatteremo al numero indicato se avremo bisogno di conferme.
              </p>
            </div>

            {/* General Notes */}
            <div className="space-y-1 pt-2">
              <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#556B2F]" />
                <span>Note generali per la rosticceria (opzionale)</span>
              </label>
              <textarea
                rows={2}
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="Es. Orario flessibile di 10 minuti, richiesta buste separate..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#D8C3A5] focus:outline-none focus:ring-2 focus:ring-[#1B3B2B] bg-[#FAF7F2]"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Confirmation Box */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DFD1] shadow-xs space-y-4">
            <h2 className="font-display text-lg font-bold text-[#1C211E] border-b border-[#F0EBE1] pb-3">
              Riepilogo Ordine
            </h2>

            <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 divide-y divide-[#F5F2EB]">
              {items.map((item, idx) => (
                <div key={idx} className="pt-2 first:pt-0 flex justify-between items-start text-xs sm:text-sm">
                  <div>
                    <span className="font-bold text-[#1C211E]">
                      {item.quantity}x {item.product.name}
                    </span>
                    {item.notes && (
                      <p className="text-[11px] text-[#8C765C] italic mt-0.5">
                        Nota: {item.notes}
                      </p>
                    )}
                  </div>
                  <span className="font-mono font-semibold text-[#1B3B2B] shrink-0">
                    €{(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E8DFD1] space-y-2 text-sm">
              <div className="flex justify-between font-bold text-base text-[#1C211E]">
                <span>Totale da pagare</span>
                <span className="font-mono tabular-nums text-xl text-[#1B3B2B]">
                  €{total.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {/* Stripe Payment Trust Badge */}
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8DFD1]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1B3B2B] uppercase tracking-wider">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Pagamento sicuro</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#1B3B2B] hover:bg-[#28553E] disabled:opacity-50 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-h-[50px]"
            >
              {isSubmitting ? (
                <span>Invio richiesta alla rosticceria…</span>
              ) : (
                <span>Invia richiesta ordine</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
