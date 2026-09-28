import {
  FunctionEnv,
  PagesContext,
  formEncode,
  json,
  readJson,
  requiredEnv,
  stripeRequest,
  supabaseRequest,
} from '../_shared';

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
  for (const field of ['id', 'order_number', 'customer_name', 'customer_phone', 'pickup_date', 'pickup_time']) {
    if (typeof order[field] !== 'string' || !order[field].trim()) throw new Error(`Campo ordine mancante: ${field}`);
  }
  if (!Array.isArray(order.items) || order.items.length === 0) throw new Error('Il carrello è vuoto');
  if (!['pickup', 'delivery'].includes(order.fulfillment_method)) throw new Error('Modalità di consegna non valida');
  if (order.fulfillment_method === 'delivery' && !String(order.delivery_address || '').trim() && order.delivery_latitude == null) {
    throw new Error('Per la consegna serve un indirizzo o una posizione GPS');
  }
}

async function persistPendingOrder(env: FunctionEnv, order: any, items: any[], total: number) {
  const orderRow = {
    ...order,
    subtotal: total,
    total,
    payment_status: 'pending',
    stripe_checkout_session_id: null,
    stripe_payment_intent_id: null,
    paid_at: null,
  };
  delete orderRow.items;
  await supabaseRequest(env, 'orders', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(orderRow),
  });

  await supabaseRequest(env, 'order_items', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(items.map((item) => ({ ...item, order_id: order.id }))),
  });
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
      `products?select=id,name,description,price,visible&id=in.(${productIds.join(',')})&visible=eq.true`,
      { method: 'GET' },
    );
    const productsById = new Map<string, any>((products || []).map((product: any) => [product.id, product] as [string, any]));
    if (productsById.size !== productIds.length) throw new Error('Uno o più prodotti non sono più disponibili');

    const authoritativeItems = order.items.map((item: any) => {
      const product: any = productsById.get(item.product_id);
      const price = asMoney(product.price);
      return {
        id: String(item.id),
        order_id: order.id,
        product_id: product.id,
        product_name_snapshot: product.name,
        product_price_snapshot: price,
        quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
        notes: item.notes ? String(item.notes).slice(0, 500) : null,
        subtotal: Math.round(price * Math.max(1, Math.floor(Number(item.quantity) || 1)) * 100) / 100,
        image_url_snapshot: item.image_url_snapshot || null,
      };
    });
    const total = Math.round(authoritativeItems.reduce((sum: number, item: any) => sum + item.subtotal, 0) * 100) / 100;
    const serverOrder = { ...order, subtotal: total, total, payment_status: 'pending', items: authoritativeItems };

    await persistPendingOrder(context.env, serverOrder, authoritativeItems, total);

    const appUrl = (context.env.APP_URL || 'https://mpastamm.it').replace(/\/$/, '');
    const params: Record<string, string | number | boolean> = {
      mode: 'payment',
      client_reference_id: order.id,
      success_url: `${appUrl}/ordine-confermato/${encodeURIComponent(order.order_number)}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout?payment=cancelled&order=${encodeURIComponent(order.order_number)}`,
      'phone_number_collection[enabled]': true,
      'metadata[order_id]': order.id,
      'metadata[order_number]': order.order_number,
      'metadata[fulfillment_method]': order.fulfillment_method,
    };
    authoritativeItems.forEach((item: any, index: number) => {
      const product = productsById.get(item.product_id);
      params[`line_items[${index}][price_data][currency]`] = 'eur';
      params[`line_items[${index}][price_data][product_data][name]`] = item.product_name_snapshot;
      if (product?.description) params[`line_items[${index}][price_data][product_data][description]`] = String(product.description).slice(0, 500);
      params[`line_items[${index}][price_data][unit_amount]`] = Math.round(item.product_price_snapshot * 100);
      params[`line_items[${index}][quantity]`] = item.quantity;
    });

    const session = await stripeRequest(context.env, 'checkout/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formEncode(params),
    });

    await supabaseRequest(context.env, `orders?id=eq.${encodeURIComponent(order.id)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        stripe_checkout_session_id: session.id,
        updated_at: new Date().toISOString(),
      }),
    });

    return json({ checkoutUrl: session.url, sessionId: session.id, orderNumber: order.order_number });
  } catch (error: any) {
    console.error('Stripe checkout session error:', error);
    const message = error?.message || 'Impossibile avviare il pagamento Stripe';
    const status = message.startsWith('Configurazione server mancante') ? 503 : 400;
    return json({ error: message }, status);
  }
}
