import React, { useState } from 'react';
import {
  ShoppingBag,
  Phone,
  Clock,
  Calendar,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Search,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { OrderStatusBadge } from '../../components/OrderStatusBadge';
import { generateDirectWhatsAppUrl } from '../../services/whatsapp';

interface AdminOrdersPageProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const ALL_STATUSES: OrderStatus[] = [
  'NUOVO',
  'ACCETTATO',
  'IN PREPARAZIONE',
  'PRONTO',
  'RITIRATO',
  'ANNULLATO',
];

export const AdminOrdersPage: React.FC<AdminOrdersPageProps> = ({
  orders,
  onUpdateOrderStatus,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'today' | 'all'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredOrders = orders.filter((order) => {
    // Date filter
    if (dateFilter === 'today' && order.pickup_date !== todayStr) return false;

    // Status filter
    if (selectedStatus !== 'all' && order.status !== selectedStatus) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNum = order.order_number.toLowerCase().includes(q);
      const matchName = `${order.customer_name} ${order.customer_surname}`.toLowerCase().includes(q);
      const matchPhone = order.customer_phone.includes(q);
      return matchNum || matchName || matchPhone;
    }

    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DFD1] pb-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1C211E]">
            Gestione Ordini
          </h2>
          <p className="text-xs sm:text-sm text-[#55645A]">
            Controlla le prenotazioni per il ritiro al banco caldo e aggiorna gli stati di preparazione.
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center bg-[#FAF7F2] p-1 rounded-xl border border-[#E8DFD1] self-start sm:self-auto">
          <button
            onClick={() => setDateFilter('today')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              dateFilter === 'today' ? 'bg-[#1B3B2B] text-white shadow-xs' : 'text-[#55645A]'
            }`}
          >
            Solo Oggi
          </button>
          <button
            onClick={() => setDateFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              dateFilter === 'all' ? 'bg-[#1B3B2B] text-white shadow-xs' : 'text-[#55645A]'
            }`}
          >
            Tutti gli Ordini ({orders.length})
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8DFD1] shadow-xs space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca per numero ordine (es. MP-0048), cliente o telefono..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#FAF7F2] rounded-xl border border-[#E8DFD1] focus:outline-none focus:ring-2 focus:ring-[#1B3B2B]"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              selectedStatus === 'all'
                ? 'bg-[#1B3B2B] text-white'
                : 'bg-[#FAF7F2] text-[#425046] hover:bg-[#E8DFD1]'
            }`}
          >
            Tutti gli Stati
          </button>

          {ALL_STATUSES.map((status) => {
            const count = orders.filter((o) => o.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 ${
                  selectedStatus === status
                    ? 'bg-[#1B3B2B] text-white'
                    : 'bg-[#FAF7F2] text-[#425046] hover:bg-[#E8DFD1]'
                }`}
              >
                <span>{status}</span>
                {count > 0 && (
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-[#E8DFD1] text-stone-400">
            Nessun ordine trovato con i criteri selezionati.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-[#E8DFD1] shadow-xs overflow-hidden transition-all"
              >
                {/* Order Summary Row */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD1] text-[#1B3B2B] font-mono font-bold text-sm shrink-0">
                      {order.order_number}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-bold text-base text-[#1C211E]">
                          {order.customer_name} {order.customer_surname}
                        </h4>
                        <OrderStatusBadge status={order.status} size="sm" />
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#55645A] mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#8A9A86]" /> {order.pickup_date}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-[#1C211E]">
                          <Clock className="w-3.5 h-3.5 text-[#1B3B2B]" /> Ore {order.pickup_time}
                        </span>
                        <span>·</span>
                        <span>{order.items.length} articoli</span>
                        <span>·</span>
                        <span className="font-mono font-bold text-[#1B3B2B]">
                          €{order.total.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions right */}
                  <div className="flex items-center gap-2 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={`tel:${order.customer_phone}`}
                      className="p-2 text-[#1B3B2B] bg-[#FAF7F2] hover:bg-[#E8DFD1] rounded-xl border border-[#D8C3A5] min-h-[38px] min-w-[38px] flex items-center justify-center"
                      title="Chiama al telefono"
                    >
                      <Phone className="w-4 h-4" />
                    </a>

                    <a
                      href={generateDirectWhatsAppUrl(
                        order.customer_phone,
                        `Ciao ${order.customer_name}, ti contattiamo da 'Mpastamm per il tuo ordine ${order.order_number} previsto per le ore ${order.pickup_time}.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 min-h-[38px] min-w-[38px] flex items-center justify-center"
                      title="Scrivi su WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="p-2 text-stone-400 hover:text-stone-700 rounded-lg min-h-[38px] flex items-center justify-center"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-[#FAF7F2] border-t border-[#E8DFD1] space-y-4 animate-fadeIn">
                    {/* Item list */}
                    <div className="bg-white p-4 rounded-xl border border-[#E8DFD1] space-y-2">
                      <h5 className="text-xs uppercase font-bold tracking-wider text-[#1B3B2B] border-b border-[#F0EBE1] pb-2">
                        Dettaglio Articoli Ordinati
                      </h5>
                      <div className="divide-y divide-[#F5F2EB]">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="py-2 flex justify-between text-xs sm:text-sm">
                            <div>
                              <span className="font-bold text-[#1C211E]">
                                {item.quantity}x {item.product_name_snapshot}
                              </span>
                              {item.notes && (
                                <p className="text-[11px] text-[#8C765C] italic mt-0.5">
                                  Nota: {item.notes}
                                </p>
                              )}
                            </div>
                            <span className="font-mono font-semibold text-[#1B3B2B]">
                              €{item.subtotal.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <div className="pt-2 mt-2 border-t border-[#F0EBE1] text-xs text-[#55645A]">
                          <strong>Note cliente:</strong> {order.notes}
                        </div>
                      )}
                    </div>

                    {/* Change Status Fast Buttons (Section 15: One touch) */}
                    <div>
                      <span className="text-xs font-bold text-[#1C211E] uppercase tracking-wider block mb-2">
                        Cambia Stato Ordine in un tocco:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {ALL_STATUSES.map((status) => {
                          const isCurrent = order.status === status;
                          return (
                            <button
                              key={status}
                              onClick={() => onUpdateOrderStatus(order.id, status)}
                              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all min-h-[38px] flex items-center gap-1.5 ${
                                isCurrent
                                  ? 'bg-[#1B3B2B] text-white shadow-sm ring-2 ring-[#28553E]'
                                  : 'bg-white border border-[#D8C3A5] text-[#2E3B32] hover:bg-[#EAE4D7]'
                              }`}
                            >
                              {isCurrent && <Check className="w-3.5 h-3.5" />}
                              <span>{status}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
