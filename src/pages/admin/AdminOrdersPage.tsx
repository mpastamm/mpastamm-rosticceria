import React, { useState } from 'react';
import {
  ShoppingBag,
  Phone,
  Calendar,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Search,
  MapPin,
  Store,
  Truck,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { Category, Order, OrderStatus, Product } from '../../types';
import { OrderStatusBadge } from '../../components/OrderStatusBadge';
import { generateDirectWhatsAppUrl } from '../../services/whatsapp';

interface AdminOrdersPageProps {
  orders: Order[];
  products: Product[];
  categories: Category[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
}

const ALL_STATUSES: OrderStatus[] = [
  'NUOVO',
  'IN ATTESA CLIENTE',
  'ACCETTATO',
  'IN PREPARAZIONE',
  'PRONTO',
  'RITIRATO',
  'ANNULLATO',
];

export const AdminOrdersPage: React.FC<AdminOrdersPageProps> = ({
  orders,
  products,
  categories,
  onUpdateOrderStatus,
  onUpdateOrder,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'today' | 'all'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [missingEditorOrderId, setMissingEditorOrderId] = useState<string | null>(null);
  const [missingProductIds, setMissingProductIds] = useState<string[]>([]);
  const [alternativeProductIds, setAlternativeProductIds] = useState<string[]>([]);
  const [missingMessage, setMissingMessage] = useState('');

  const getAlternativeCandidates = (order: Order) => {
    const activeMissingIds = missingEditorOrderId === order.id
      ? missingProductIds
      : (order.missing_product_ids || []);
    const missingCategoryIds = new Set(
      order.items
        .filter((item) => activeMissingIds.includes(item.product_id))
        .map((item) => products.find((product) => product.id === item.product_id)?.category_id)
        .filter((categoryId): categoryId is string => Boolean(categoryId)),
    );

    return products.filter((product) =>
      product.visible &&
      product.availability_status !== 'sold_out' &&
      product.availability_status !== 'hidden' &&
      missingCategoryIds.has(product.category_id) &&
      !order.items.some((item) => item.product_id === product.id),
    );
  };

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

  const openMissingEditor = (order: Order) => {
    setMissingEditorOrderId(order.id);
    setMissingProductIds(order.missing_product_ids || []);
    setAlternativeProductIds(order.alternative_product_ids || []);
    setMissingMessage(order.admin_message || '');
  };

  const submitMissingProducts = (order: Order) => {
    if (missingProductIds.length === 0) return;
    const allowedAlternativeIds = new Set(getAlternativeCandidates(order).map((product) => product.id));
    const validAlternativeProductIds = alternativeProductIds.filter((id) => allowedAlternativeIds.has(id));
    onUpdateOrder(order.id, {
      status: 'IN ATTESA CLIENTE',
      missing_product_ids: missingProductIds,
      alternative_product_ids: validAlternativeProductIds,
      customer_selected_alternative_product_ids: [],
      admin_message: missingMessage.trim() || (validAlternativeProductIds.length > 0
        ? 'Alcuni prodotti non sono disponibili. Scegli una delle alternative proposte oppure prosegui senza sostituzioni.'
        : 'Alcuni prodotti non sono disponibili. Vuoi proseguire con il resto dell’ordine?'),
      customer_response: 'pending',
    });
    setMissingEditorOrderId(null);
  };

  const confirmCustomerAlternatives = (order: Order) => {
    const selectedIds = order.customer_selected_alternative_product_ids || [];
    const missingIds = new Set(order.missing_product_ids || []);
    const selectedProducts = products.filter((product) => selectedIds.includes(product.id));
    const remainingItems = order.items.filter((item) => !missingIds.has(item.product_id));
    const replacementItems = selectedProducts.map((product, index) => ({
      id: `item_alt_${order.id}_${product.id}_${index}`,
      order_id: order.id,
      product_id: product.id,
      product_name_snapshot: product.name,
      product_price_snapshot: product.price,
      quantity: 1,
      subtotal: product.price,
      image_url_snapshot: product.image_url,
    }));
    const nextItems = [...remainingItems, ...replacementItems];
    const nextTotal = Math.round(nextItems.reduce((sum, item) => sum + item.subtotal, 0) * 100) / 100;

    onUpdateOrder(order.id, {
      status: 'ACCETTATO',
      items: nextItems,
      subtotal: nextTotal,
      total: nextTotal,
      admin_message: undefined,
      missing_product_ids: [],
      alternative_product_ids: [],
      customer_selected_alternative_product_ids: [],
      customer_response: 'accepted',
    });
  };

  const confirmOrderWithoutAlternatives = (order: Order) => {
    const missingIds = new Set(order.missing_product_ids || []);
    const nextItems = order.items.filter((item) => !missingIds.has(item.product_id));
    const nextTotal = Math.round(nextItems.reduce((sum, item) => sum + item.subtotal, 0) * 100) / 100;
    onUpdateOrder(order.id, {
      status: 'ACCETTATO',
      items: nextItems,
      subtotal: nextTotal,
      total: nextTotal,
      admin_message: undefined,
      missing_product_ids: [],
      alternative_product_ids: [],
      customer_selected_alternative_product_ids: [],
      customer_response: 'accepted',
    });
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
            Controlla i ritiri e le consegne a domicilio, poi aggiorna gli stati di preparazione.
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
            const alternativeCandidates = getAlternativeCandidates(order);
            const alternativeGroups = categories
              .map((category) => ({
                category,
                products: alternativeCandidates.filter((product) => product.category_id === category.id),
              }))
              .filter((group) => group.products.length > 0);
            const selectedAlternativeProducts = products.filter((product) =>
              (order.customer_selected_alternative_product_ids || []).includes(product.id),
            );

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
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                          order.payment_status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.payment_status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.payment_status === 'paid' ? 'Stripe pagato' : order.payment_status === 'failed' ? 'Pagamento fallito' : 'Stripe in attesa'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#55645A] mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#8A9A86]" /> Oggi
                        </span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-[#1B3B2B]">
                          {order.fulfillment_method === 'delivery' ? <Truck className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
                          {order.fulfillment_method === 'delivery' ? 'Consegna' : 'Ritiro'}
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
                        `Ciao ${order.customer_name}, ti contattiamo da 'Mpastamm per il tuo ordine ${order.order_number} previsto per oggi.`
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

                    {order.fulfillment_method === 'delivery' && (
                      <div className="bg-white p-4 rounded-xl border border-emerald-200 space-y-2">
                        <h5 className="text-xs uppercase font-bold tracking-wider text-emerald-800 flex items-center gap-1.5">
                          <Truck className="w-4 h-4" /> Dati consegna
                        </h5>
                        <p className="text-sm text-[#1C211E] flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                          <span>{order.delivery_address || 'Indirizzo non inserito; usare la posizione GPS.'}</span>
                        </p>
                        {order.delivery_latitude != null && order.delivery_longitude != null && (
                          <a
                            href={`https://www.google.com/maps?q=${order.delivery_latitude},${order.delivery_longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Apri posizione GPS su Google Maps
                          </a>
                        )}
                      </div>
                    )}

                    <div className="bg-white p-4 rounded-xl border border-[#E8DFD1] flex items-center justify-between gap-3 text-sm">
                      <span className="font-bold text-[#1C211E]">Pagamento</span>
                      <span className={`font-bold ${order.payment_status === 'paid' ? 'text-emerald-700' : order.payment_status === 'failed' ? 'text-red-700' : 'text-amber-700'}`}>
                        {order.payment_status === 'paid' ? 'Confermato con Stripe' : order.payment_status === 'failed' ? 'Non completato' : 'In attesa di Stripe'}
                      </span>
                    </div>

                    {order.status === 'NUOVO' && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-3">
                        <div>
                          <h5 className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                            <Check className="w-4 h-4" /> Verifica disponibilità prima del pagamento
                          </h5>
                          <p className="mt-1 text-xs leading-relaxed text-emerald-800">
                            Accetta l’ordine per sbloccare Stripe oppure segnala subito i prodotti mancanti al cliente.
                          </p>
                        </div>

                        {missingEditorOrderId === order.id ? (
                          <div className="space-y-3 rounded-xl border border-orange-200 bg-white p-3">
                            <p className="text-xs font-bold text-orange-900">Seleziona i prodotti non disponibili</p>
                            <div className="space-y-2">
                              {order.items.map((item) => (
                                <label key={item.id} className="flex items-center gap-2 text-sm text-[#1C211E]">
                                  <input
                                    type="checkbox"
                                    checked={missingProductIds.includes(item.product_id)}
                                    onChange={(event) => {
                                      setMissingProductIds((current) => event.target.checked
                                        ? [...current, item.product_id]
                                        : current.filter((id) => id !== item.product_id));
                                    }}
                                    className="h-4 w-4 accent-[#1B3B2B]"
                                  />
                                  <span>{item.quantity}x {item.product_name_snapshot}</span>
                                </label>
                              ))}
                            </div>
                            {alternativeCandidates.length > 0 && (
                              <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                                <p className="text-xs font-bold text-emerald-900">Alternative disponibili nella stessa categoria</p>
                                <div className="space-y-3">
                                  {alternativeGroups.map((group) => (
                                    <div key={group.category.id}>
                                      <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-emerald-800">{group.category.name}</p>
                                      <div className="space-y-1">
                                        {group.products.slice(0, 12).map((product) => (
                                          <label key={product.id} className="flex items-center gap-2 text-sm text-emerald-950">
                                            <input
                                              type="checkbox"
                                              checked={alternativeProductIds.includes(product.id)}
                                              onChange={(event) => {
                                                setAlternativeProductIds((current) => event.target.checked
                                                  ? [...current, product.id]
                                                  : current.filter((id) => id !== product.id));
                                              }}
                                              className="h-4 w-4 accent-[#1B3B2B]"
                                            />
                                            <span>{product.name} · €{product.price.toFixed(2).replace('.', ',')}</span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <textarea
                              rows={2}
                              value={missingMessage}
                              onChange={(event) => setMissingMessage(event.target.value)}
                              placeholder="Messaggio per il cliente (opzionale)"
                              className="w-full rounded-lg border border-[#D8C3A5] bg-[#FAF7F2] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3B2B]"
                            />
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => setMissingEditorOrderId(null)}
                                className="rounded-lg border border-[#D8C3A5] bg-white px-3 py-2 text-xs font-bold text-[#425046]"
                              >
                                Annulla
                              </button>
                              <button
                                onClick={() => submitMissingProducts(order)}
                                disabled={missingProductIds.length === 0}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                              >
                                <AlertTriangle className="h-3.5 w-3.5" /> Segnala al cliente
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => onUpdateOrder(order.id, {
                                status: 'ACCETTATO',
                                admin_message: undefined,
                                missing_product_ids: [],
                                alternative_product_ids: [],
                                customer_selected_alternative_product_ids: [],
                                customer_response: 'accepted',
                              })}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1B3B2B] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#28553E]"
                            >
                              <Check className="h-4 w-4" /> Accetta ordine
                            </button>
                            <button
                              onClick={() => openMissingEditor(order)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-orange-300 bg-orange-50 px-4 py-2.5 text-xs font-bold text-orange-800 hover:bg-orange-100"
                            >
                              <AlertTriangle className="h-4 w-4" /> Segnala prodotti mancanti
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {order.status === 'IN ATTESA CLIENTE' && (
                      <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                          <div>
                            <strong>
                              {order.customer_response === 'alternative_selected'
                                ? 'Il cliente ha scelto una possibile alternativa'
                                : 'In attesa della risposta del cliente'}
                            </strong>
                            <p className="mt-1 text-xs leading-relaxed">{order.admin_message}</p>
                            <p className="mt-2 text-xs font-semibold">
                              Prodotti segnalati: {(order.missing_product_ids || []).map((id) => order.items.find((item) => item.product_id === id)?.product_name_snapshot || id).join(', ')}
                            </p>
                            {selectedAlternativeProducts.length > 0 && (
                              <p className="mt-2 text-xs font-semibold text-emerald-900">
                                Alternative scelte: {selectedAlternativeProducts.map((product) => product.name).join(', ')}
                              </p>
                            )}
                            {order.customer_response === 'alternative_selected' && selectedAlternativeProducts.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  onClick={() => confirmCustomerAlternatives(order)}
                                  className="rounded-lg bg-[#1B3B2B] px-3 py-2 text-xs font-bold text-white"
                                >
                                  Conferma alternative e accetta
                                </button>
                                <button
                                  onClick={() => confirmOrderWithoutAlternatives(order)}
                                  className="rounded-lg border border-[#D8C3A5] bg-white px-3 py-2 text-xs font-bold text-[#425046]"
                                >
                                  Accetta senza alternative
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

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
