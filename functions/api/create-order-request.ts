import { PagesContext, json, readJson, supabaseRequest } from '../_shared';

function cleanProductId(value: unknown): string {
  const id = String(value || '');
  return /^[a-zA-Z0-9_-]+$/.test(id) ? id : '';
}

function asMoney(value: unknown): number {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) / 100 : 0;
}

function validateOrder(order: any) {
  if (!order || typeof order !== 'object') throw new Error('Ordine mancante');
  for (const field of ['id', 'order_number', 'customer_name', 'customer_phone', 'pickup_date', 'pickup_time', 'customer_token']) {
    if (typeof order[field] !== 'string' || !order[field].trim()) throw new Error(`Campo ordine mancante: ${field}`);
  }
  if (!Array.isArray(order.items) || order.items.length === 0) throw new Error('Il carrello è vuoto');
  if (!['pickup', 'delivery'].includes(order.fulfillment_method)) throw new Error('Modalità di consegna non valida');
  if (order.fulfillment_method === 'delivery' && !String(order.delivery_address || '').trim() && order.delivery_latitude == null) {
    throw new Error('Per la consegna serve un indirizzo o una posizione GPS');
  }
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  try {
    const body = await readJson(context.request);
    const order = body.order;
    validateOrder(order);

    const productIds = [...new Set(order.items.map((item: any) => cleanProductId(item.product_id)).filter(Boolean))];
    if (productIds.length !== order.items.length) throw new Error('Prodotto non valido nel carrello');
    const products = await supabaseRequest(
      context.env,
      `products?select=id,name,price,visible,image_url&id=in.(${productIds.join(',')})&visible=eq.true`,
      { method: 'GET' },
    );
    const productsById = new Map<string, any>((products || []).map((product: any) => [product.id, product] as [string, any]));
    if (productsById.size !== productIds.length) throw new Error('Uno o più prodotti non sono più disponibili');

    const authoritativeItems = order.items.map((item: any) => {
      const product = productsById.get(item.product_id);
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const price = asMoney(product.price);
      return {
        id: String(item.id),
        order_id: order.id,
        product_id: product.id,
        product_name_snapshot: product.name,
        product_price_snapshot: price,
        quantity,
        notes: item.notes ? String(item.notes).slice(0, 500) : null,
        subtotal: Math.round(price * quantity * 100) / 100,
        image_url_snapshot: item.image_url_snapshot || product.image_url || null,
      };
    });
    const total = Math.round(authoritativeItems.reduce((sum: number, item: any) => sum + item.subtotal, 0) * 100) / 100;
    const serverOrder = {
      ...order,
      subtotal: total,
      total,
      status: 'NUOVO',
      payment_status: 'pending',
      customer_response: 'pending',
      admin_message: null,
      missing_product_ids: [],
      alternative_product_ids: [],
      customer_selected_alternative_product_ids: [],
      stripe_checkout_session_id: null,
      stripe_payment_intent_id: null,
      paid_at: null,
    };
    delete serverOrder.items;

    const savedOrders = await supabaseRequest(context.env, 'orders', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(serverOrder),
    });
    const savedOrder = Array.isArray(savedOrders) ? savedOrders[0] : serverOrder;

    await supabaseRequest(context.env, 'order_items', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(authoritativeItems),
    });

    return json({ order: { ...savedOrder, items: authoritativeItems } });
  } catch (error: any) {
    console.error('Order request error:', error);
    return json({ error: error?.message || 'Impossibile inviare la richiesta ordine' }, 400);
  }
}
