import React, { useState, useMemo } from 'react';
import { ArrowLeft, Clock, Calendar, Phone, User, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import { CartItem, Order, BusinessSettings, OpeningHourDay } from '../types';
import { StorageService } from '../services/storage';
import { sendOrderNotificationToBackend } from '../services/whatsapp';

interface CheckoutPageProps {
  items: CartItem[];
  settings: BusinessSettings;
  openingHours: OpeningHourDay[];
  onOrderCompleted: (order: Order) => void;
  onNavigate: (path: string) => void;
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(value: number): string {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  items,
  settings,
  openingHours,
  onOrderCompleted,
  onNavigate,
}) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupDate, setPickupDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [pickupTime, setPickupTime] = useState('19:30');
  const [generalNotes, setGeneralNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const total = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const selectedOpeningDay = useMemo(() => {
    const selected = new Date(`${pickupDate}T12:00:00`);
    return openingHours.find((day) => day.day_of_week === selected.getDay());
  }, [openingHours, pickupDate]);

  // Generate pickup slots from the opening hours configured by the admin.
  const availableSlots = useMemo(() => {
    const slots: string[] = [];
    const interval = settings.slot_interval_minutes || 15;
    if (!selectedOpeningDay?.is_open) return slots;

    const ranges = [
      [selectedOpeningDay.morning_open, selectedOpeningDay.morning_close],
      [selectedOpeningDay.evening_open, selectedOpeningDay.evening_close],
    ].filter(([start, end]) => start && end) as [string, string][];

    for (const [start, end] of ranges) {
      for (let minutes = timeToMinutes(start); minutes <= timeToMinutes(end); minutes += interval) {
        slots.push(minutesToTime(minutes));
      }
    }
    return [...new Set(slots)];
  }, [selectedOpeningDay, settings.slot_interval_minutes]);

  // Today and next days min/max dates
  const minDate = formatLocalDate(new Date());
  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + (settings.next_day_orders_allowed ? 7 : 0));
    return formatLocalDate(d);
  }, [settings.next_day_orders_allowed]);

  React.useEffect(() => {
    if (availableSlots.length > 0 && !availableSlots.includes(pickupTime)) {
      setPickupTime(availableSlots[0]);
    }
  }, [availableSlots, pickupTime]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: { name?: string; phone?: string } = {};
    if (!name.trim()) newErrors.name = 'Il nome è obbligatorio per il ritiro';
    if (!phone.trim()) newErrors.phone = 'Il numero di telefono è obbligatorio';
    else if (phone.replace(/[^0-9]/g, '').length < 8) {
      newErrors.phone = 'Inserisci un recapito telefonico valido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!settings.orders_enabled) {
      alert(settings.orders_disabled_message);
      return;
    }

    if (!selectedOpeningDay?.is_open || availableSlots.length === 0) {
      alert('Il locale è chiuso nella data selezionata. Scegli un altro giorno.');
      return;
    }

    setIsSubmitting(true);

    try {
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
        pickup_date: pickupDate,
        pickup_time: pickupTime,
        notes: generalNotes.trim() || undefined,
        subtotal: total,
        total: total,
        status: 'NUOVO',
        items: orderItems,
      });

      // Notify owner backend via WhatsApp Cloud API
      await sendOrderNotificationToBackend(createdOrder);

      // Trigger callback
      onOrderCompleted(createdOrder);
      onNavigate(`/ordine-confermato/${createdOrder.order_number}`);
    } catch (err: any) {
      console.error('Error creating order:', err);
      alert('Si è verificato un errore durante la registrazione dell\'ordine. Riprova.');
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
            Completa la Prenotazione
          </h1>
          <p className="text-xs sm:text-sm text-[#55645A]">
            Nessuna registrazione necessaria. Pagherai al momento del ritiro al banco.
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
              <span>Dati per il Ritiro</span>
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

          {/* Pickup Date & Slot Section */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DFD1] shadow-xs space-y-4">
            <h2 className="font-display text-lg font-bold text-[#1C211E] flex items-center gap-2 border-b border-[#F0EBE1] pb-3">
              <Clock className="w-5 h-5 text-[#1B3B2B]" />
              <span>Quando vuoi ritirare?</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pickup Date */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#556B2F]" />
                  <span>Data Ritiro *</span>
                </label>
                <input
                  type="date"
                  required
                  min={minDate}
                  max={maxDate}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8C3A5] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3B2B] bg-[#FAF7F2]"
                />
              </div>

              {/* Pickup Time Slot */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#556B2F]" />
                  <span>Ora Ritiro *</span>
                </label>
                <select
                  required
                  disabled={availableSlots.length === 0}
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8C3A5] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3B2B] bg-[#FAF7F2]"
                >
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      Ore {slot}
                    </option>
                  ))}
                </select>
                {availableSlots.length === 0 && (
                  <p className="text-[11px] text-amber-700 font-medium">
                    Il locale è chiuso nella data selezionata.
                  </p>
                )}
              </div>
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
                <span>Totale Da Saldare</span>
                <span className="font-mono tabular-nums text-xl text-[#1B3B2B]">
                  €{total.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {/* Payment at Pickup Trust Badge (Section 10) */}
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8DFD1] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1B3B2B] uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pagamento al Ritiro</span>
              </div>
              <p className="text-xs text-[#55645A] leading-relaxed">
                Nessun pagamento anticipato con carta. Pagherai comodamente in rosticceria (Contanti, Bancomat o Carte).
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#1B3B2B] hover:bg-[#28553E] disabled:opacity-50 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-h-[50px]"
            >
              {isSubmitting ? (
                <span>Registrazione in corso...</span>
              ) : (
                <span>CONFERMA PRENOTAZIONE</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
