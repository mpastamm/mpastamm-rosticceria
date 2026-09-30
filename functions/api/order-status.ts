import { PagesContext, json, supabaseRequest } from '../_shared';

function clean(value: string | null): string {
  return String(value || '').trim();
}

export async function onRequestGet(context: PagesContext): Promise<Response> {
  try {
    const url = new URL(context.request.url);
    const orderId = clean(url.searchParams.get('order_id'));
    const token = clean(url.searchParams.get('token'));

    if (!orderId || !token) return json({ error: 'Riferimento ordine non valido' }, 400);

    const orders = await supabaseRequest(
      context.env,
      `orders?select=*&id=eq.${encodeURIComponent(orderId)}&customer_token=eq.${encodeURIComponent(token)}&limit=1`,
      { method: 'GET' },
    );
    const order = Array.isArray(orders) ? orders[0] : null;
    if (!order) return json({ error: 'Ordine non trovato' }, 404);

    const items = await supabaseRequest(
      context.env,
      `order_items?select=*&order_id=eq.${encodeURIComponent(order.id)}&order=id`,
      { method: 'GET' },
    );

    return json({ order: { ...order, items: Array.isArray(items) ? items : [] } });
  } catch (error: any) {
    console.error('Order status error:', error);
    return json({ error: error?.message || 'Impossibile leggere lo stato dell’ordine' }, 500);
  }
}
