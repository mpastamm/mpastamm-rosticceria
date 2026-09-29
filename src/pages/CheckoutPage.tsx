import React, { useState } from 'react';
import { ArrowLeft, Calendar, Phone, User, FileText, MapPin, Store, Truck, Navigation, CreditCard } from 'lucide-react';
import { CartItem, Order, BusinessSettings, FulfillmentMethod } from '../types';
import { StorageService } from '../services/storage';

interface CheckoutPageProps {
  items: CartItem[];
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

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  items,
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

  const total = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

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
        items: orderItems,
      });

      // Stripe Checkout is created server-side. The server recalculates the total
      // from the current product prices before creating the payment session.
      const checkoutResponse = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: createdOrder }),
      });
      const checkoutData = await checkoutResponse.json().catch(() => ({}));
      if (!checkoutResponse.ok || !checkoutData.checkoutUrl) {
        StorageService.updateOrder(createdOrder.id, { payment_status: 'failed' });
        throw new Error(checkoutData.error || 'Pagamento Stripe non disponibile');
      }

      StorageService.updateOrder(createdOrder.id, {
        payment_status: 'pending',
        stripe_checkout_session_id: checkoutData.sessionId,
      });

      // Trigger callback
      onOrderCompleted(createdOrder);
      window.location.assign(checkoutData.checkoutUrl);
    } catch (err: any) {
      console.error('Error creating Stripe order:', err);
      alert(err?.message || 'Si è verificato un errore durante l\'avvio del pagamento. Riprova.');
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
                <span>Avvio pagamento sicuro...</span>
              ) : (
                <span>Paga</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
