import React from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  PackageCheck,
  TrendingUp,
  ArrowRight,
  Zap,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { OrderStatusBadge } from '../../components/OrderStatusBadge';

interface AdminDashboardPageProps {
  orders: Order[];
  onNavigate: (path: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  orders,
  onNavigate,
  onUpdateOrderStatus,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Orders today
  const todayOrders = orders.filter((o) => o.pickup_date === todayStr);

  // Counters as requested in Section 14
  const countToday = todayOrders.length;
  const countToPrepare = todayOrders.filter(
    (o) => o.status === 'NUOVO' || o.status === 'ACCETTATO' || o.status === 'IN PREPARAZIONE'
  ).length;
  const countReady = todayOrders.filter((o) => o.status === 'PRONTO').length;
  const countPickedUp = todayOrders.filter((o) => o.status === 'RITIRATO').length;
  const expectedRevenue = todayOrders
    .filter((o) => o.status !== 'ANNULLATO')
    .reduce((acc, o) => acc + o.total, 0);

  // Recent 6 orders
  const recentOrders = orders.slice(0, 8);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Top Banner with Fast Vetrina shortcut */}
      <div className="bg-gradient-to-r from-[#182E22] to-[#28553E] text-white p-5 sm:p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-[#9CAF88] font-bold">
            Pannello di Controllo
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mt-0.5">
            Panoramica del Servizio
          </h2>
          <p className="text-xs sm:text-sm text-[#E8DFD1] mt-0.5">
            Gestisci in un tocco gli ordini del giorno e la disponibilità della vetrina al banco.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/admin/vetrina')}
          className="px-5 py-2.5 bg-[#FAF7F2] hover:bg-white text-[#1B3B2B] font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 active:scale-95 transition-transform"
        >
          <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
          <span>Vetrina Rapida Sold Out</span>
        </button>
      </div>

      {/* METRIC COUNTERS (SECTION 14: ORDINI OGGI, DA PREPARARE, PRONTI, RITIRATI, INCASSO PREVISTO) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* 1. ORDINI OGGI */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8DFD1] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#7A8A7E] font-bold uppercase tracking-wider">
            <span>Ordini Oggi</span>
            <ShoppingBag className="w-4 h-4 text-[#1B3B2B]" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-[#1C211E]">
            {countToday}
          </div>
          <span className="text-[11px] text-[#8A9A86] mt-0.5 block">Registrati a sistema</span>
        </div>

        {/* 2. DA PREPARARE */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-900 font-bold uppercase tracking-wider">
            <span>Da Preparare</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-amber-900">
            {countToPrepare}
          </div>
          <span className="text-[11px] text-amber-700/80 mt-0.5 block">In coda cucina</span>
        </div>

        {/* 3. PRONTI */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between text-xs text-emerald-900 font-bold uppercase tracking-wider">
            <span>Pronti</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-emerald-900">
            {countReady}
          </div>
          <span className="text-[11px] text-emerald-700/80 mt-0.5 block">Al banco caldo</span>
        </div>

        {/* 4. RITIRATI */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8DFD1] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#7A8A7E] font-bold uppercase tracking-wider">
            <span>Ritirati</span>
            <PackageCheck className="w-4 h-4 text-stone-600" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-[#1C211E]">
            {countPickedUp}
          </div>
          <span className="text-[11px] text-stone-500 mt-0.5 block">Consegnati ai clienti</span>
        </div>

        {/* 5. INCASSO PREVISTO */}
        <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-2xl border border-[#1B3B2B]/20 bg-[#FAF7F2] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#1B3B2B] font-bold uppercase tracking-wider">
            <span>Incasso Previsto</span>
            <TrendingUp className="w-4 h-4 text-[#1B3B2B]" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-[#1B3B2B]">
            €{expectedRevenue.toFixed(2).replace('.', ',')}
          </div>
          <span className="text-[11px] text-[#556B2F] mt-0.5 block">Totale incasso oggi</span>
        </div>
      </div>

      {/* ORDINI RECENTI (SECTION 14) */}
      <div className="bg-white rounded-3xl border border-[#E8DFD1] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-3">
          <div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-[#1C211E]">
              Ordini recenti
            </h3>
            <p className="text-xs text-[#7A8A7E]">
              Tocca lo stato per avanzare rapidamente l'ordine.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/admin/ordini')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B3B2B] hover:underline"
          >
            <span>Tutti gli ordini</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-10 text-stone-400 text-sm">
            Nessun ordine presente al momento.
          </div>
        ) : (
          <div className="divide-y divide-[#F5F2EB]">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Order header information */}
                <div className="flex items-start gap-3">
                  <span className="font-mono font-bold text-sm bg-[#FAF7F2] text-[#1B3B2B] px-2.5 py-1 rounded-lg border border-[#E8DFD1] shrink-0">
                    {order.order_number}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#1C211E]">
                        {order.customer_name} {order.customer_surname}
                      </span>
                      <a
                        href={`tel:${order.customer_phone}`}
                        className="text-[#7A8A7E] hover:text-[#1B3B2B]"
                        title="Chiama cliente"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="text-xs text-[#55645A] flex flex-wrap items-center gap-2 mt-0.5">
                      <span>Ritiro: <strong>Ore {order.pickup_time}</strong></span>
                      <span>·</span>
                      <span>{order.items.length} articoli</span>
                      <span>·</span>
                      <span className="font-mono font-bold text-[#1B3B2B]">
                        €{order.total.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    {order.notes && (
                      <p className="text-[11px] text-[#8C765C] italic mt-1 max-w-md">
                        Nota: {order.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <OrderStatusBadge status={order.status} />

                  {/* Fast advance buttons */}
                  {order.status === 'NUOVO' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'ACCETTATO')}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg shadow-xs"
                    >
                      Accetta
                    </button>
                  )}
                  {order.status === 'ACCETTATO' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'IN PREPARAZIONE')}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg shadow-xs"
                    >
                      Inforna
                    </button>
                  )}
                  {order.status === 'IN PREPARAZIONE' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'PRONTO')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-xs"
                    >
                      Pronto!
                    </button>
                  )}
                  {order.status === 'PRONTO' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'RITIRATO')}
                      className="px-2.5 py-1 bg-stone-700 hover:bg-stone-800 text-white text-[11px] font-bold rounded-lg shadow-xs"
                    >
                      Consegnato
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
