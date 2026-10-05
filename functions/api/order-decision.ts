import { PagesContext, json, readJson, supabaseRequest } from '../_shared';

function clean(value: unknown): string {
  return String(value || '').trim();
}

function safeId(value: unknown): string {
  const id = clean(value);
  return /^[a-zA-Z0-9_-]+$/.test(id) ? id : '';
}

async function loadOrder(context: PagesContext, orderId: string, token: string) {
  const orders = await supabaseRequest(
    context.env,
    `orders?select=*&id=eq.${encodeURIComponent(orderId)}&customer_token=eq.${encodeURIComponent(token)}&limit=1`,
    { method: 'GET' },
  );
  const order = Array.isArray(orders) ? orders[0] : null;
  if (!order) throw new Error('Ordine non trovato');
  const items = await supabaseRequest(
    context.env,
    `order_items?select=*&order_id=eq.${encodeURIComponent(order.id)}&order=id`,
    { method: 'GET' },
  );
  return { order, items: Array.isArray(items) ? items : [] };
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  try {
    const body = await readJson(context.request);
    const orderId = clean(body.order_id);
    const token = clean(body.token);
    const decision = clean(body.decision);
    if (!orderId || !token || !['accept', 'decline', 'alternative'].includes(decision)) {
      return json({ error: 'Risposta ordine non valida' }, 400);
    }

    const { order, items } = await loadOrder(context, orderId, token);
    if (order.status !== 'IN ATTESA CLIENTE') {
      throw new Error('Questo ordine non richiede una risposta del cliente');
    }

    if (decision === 'alternative') {
      const allowedAlternativeIds = new Set(
        (Array.isArray(order.alternative_product_ids) ? order.alternative_product_ids : [])
          .map(safeId)
          .filter(Boolean),
      );
      const selectedAlternativeIds = [...new Set(
        (Array.isArray(body.alternative_product_ids) ? body.alternative_product_ids : [])
          .map(safeId)
          .filter((id: string) => id && allowedAlternativeIds.has(id)),
      )].slice(0, 10);

      if (selectedAlternativeIds.length === 0) {
        throw new Error('Seleziona almeno un’alternativa disponibile');
      }

      await supabaseRequest(context.env, `orders?id=eq.${encodeURIComponent(order.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          customer_response: 'alternative_selected',
          customer_selected_alternative_product_ids: selectedAlternativeIds,
          updated_at: new Date().toISOString(),
        }),
      });
    } else if (decision === 'decline') {
      await supabaseRequest(context.env, `orders?id=eq.${encodeURIComponent(order.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'ANNULLATO',
          customer_response: 'declined',
          customer_selected_alternative_product_ids: [],
          updated_at: new Date().toISOString(),
        }),
      });
    } else {
      const missingIds = new Set(
        (Array.isArray(order.missing_product_ids) ? order.missing_product_ids : [])
          .map(safeId)
          .filter(Boolean),
      );
      const missingItems = items.filter((item: any) => missingIds.has(safeId(item.product_id)));
      const remainingItems = items.filter((item: any) => !missingIds.has(safeId(item.product_id)));

      if (remainingItems.length === 0) {
        await supabaseRequest(context.env, `orders?id=eq.${encodeURIComponent(order.id)}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'ANNULLATO',
            customer_response: 'declined',
            admin_message: 'Tutti i prodotti richiesti risultano momentaneamente non disponibili.',
            alternative_product_ids: [],
            customer_selected_alternative_product_ids: [],
            updated_at: new Date().toISOString(),
          }),
        });
      } else {
        for (const item of missingItems) {
          const itemId = safeId(item.id);
          if (!itemId) continue;
          await supabaseRequest(
            context.env,
            `order_items?id=eq.${encodeURIComponent(itemId)}&order_id=eq.${encodeURIComponent(order.id)}`,
            { method: 'DELETE' },
          );
        }
        const total = Math.round(remainingItems.reduce((sum: number, item: any) => sum + Number(item.subtotal || 0), 0) * 100) / 100;
        await supabaseRequest(context.env, `orders?id=eq.${encodeURIComponent(order.id)}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'ACCETTATO',
            customer_response: 'accepted',
            subtotal: total,
            total,
            missing_product_ids: [],
            alternative_product_ids: [],
            customer_selected_alternative_product_ids: [],
            admin_message: null,
            updated_at: new Date().toISOString(),
          }),
        });
      }
    }

    const latest = await loadOrder(context, orderId, token);
    return json({ order: { ...latest.order, items: latest.items } });
  } catch (error: any) {
    console.error('Order decision error:', error);
    return json({ error: error?.message || 'Impossibile aggiornare la risposta all’ordine' }, 400);
  }
}
