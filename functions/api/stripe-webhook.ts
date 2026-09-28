import {
  PagesContext,
  hmacSha256Hex,
  json,
  safeEqual,
  sendWhatsAppNotification,
  stripeRequest,
  supabaseRequest,
} from '../_shared';

async function verifyStripeSignature(rawBody: string, signature: string, secret: string): Promise<boolean> {
  const values = signature.split(',').reduce<Record<string, string[]>>((result, part) => {
    const [key, value] = part.split('=', 2);
    if (key && value) (result[key] ||= []).push(value);
    return result;
  }, {});
  const timestamp = Number(values.t?.[0]);
  if (!Number.isFinite(timestamp) || Math.abs(Date.now() / 1000 - timestamp) > 300) return false;
  const expected = await hmacSha256Hex(secret, `${timestamp}.${rawBody}`);
  return (values.v1 || []).some((candidate) => safeEqual(candidate, expected));
}

async function findOrder(context: PagesContext, orderId: string) {
  const rows = await supabaseRequest(context.env, `orders?id=eq.${encodeURIComponent(orderId)}&select=*`, { method: 'GET' });
  return rows?.[0] || null;
}

async function findItems(context: PagesContext, orderId: string) {
  return await supabaseRequest(context.env, `order_items?order_id=eq.${encodeURIComponent(orderId)}&select=*`, { method: 'GET' }) || [];
}

async function markPaid(context: PagesContext, session: any) {
  const orderId = session?.metadata?.order_id;
  if (!orderId) return { updated: false, reason: 'missing_order_id' };
  const order = await findOrder(context, orderId);
  if (!order) return { updated: false, reason: 'order_not_found' };
  if (order.payment_status === 'paid') return { updated: false, reason: 'already_paid' };

  const updated = await supabaseRequest(context.env, `orders?id=eq.${encodeURIComponent(orderId)}&payment_status=neq.paid`, {
    method: 'PATCH',
    body: JSON.stringify({
      payment_status: 'paid',
      stripe_checkout_session_id: session.id || order.stripe_checkout_session_id,
      stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
  });
  if (!Array.isArray(updated) || updated.length === 0) return { updated: false, reason: 'already_paid' };

  const items = await findItems(context, orderId);
  try {
    await sendWhatsAppNotification(context.env, { ...order, ...updated[0], payment_status: 'paid' }, items);
  } catch (error) {
    // The payment remains recorded even if WhatsApp is temporarily unavailable.
    console.error('WhatsApp notification after Stripe payment failed:', error);
  }
  return { updated: true };
}

async function markFailed(context: PagesContext, session: any) {
  const orderId = session?.metadata?.order_id;
  if (!orderId) return;
  await supabaseRequest(context.env, `orders?id=eq.${encodeURIComponent(orderId)}&payment_status=eq.pending`, {
    method: 'PATCH',
    body: JSON.stringify({
      payment_status: 'failed',
      stripe_checkout_session_id: session.id || null,
      updated_at: new Date().toISOString(),
    }),
  });
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const rawBody = await context.request.text();
  const signature = context.request.headers.get('stripe-signature') || '';
  const secret = context.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !(await verifyStripeSignature(rawBody, signature, secret))) {
    return json({ error: 'Firma webhook Stripe non valida' }, 400);
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return json({ error: 'Payload webhook non valido' }, 400);
  }

  try {
    const session = event.data?.object;
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      if (session?.payment_status === 'paid' || event.type.endsWith('succeeded')) await markPaid(context, session);
    } else if (event.type === 'checkout.session.async_payment_failed' || event.type === 'checkout.session.expired') {
      await markFailed(context, session);
    }
    return json({ received: true });
  } catch (error) {
    console.error('Stripe webhook processing error:', error);
    return json({ error: 'Errore nella registrazione del pagamento' }, 500);
  }
}
