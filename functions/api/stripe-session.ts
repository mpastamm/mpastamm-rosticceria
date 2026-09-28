import { PagesContext, json, requiredEnv, stripeRequest } from '../_shared';

export async function onRequestGet(context: PagesContext): Promise<Response> {
  const sessionId = new URL(context.request.url).searchParams.get('session_id') || '';
  if (!/^cs_[a-zA-Z0-9_]+$/.test(sessionId)) return json({ error: 'Sessione Stripe non valida' }, 400);

  try {
    const session = await stripeRequest(context.env, `checkout/sessions/${encodeURIComponent(sessionId)}`, { method: 'GET' });
    return json({
      sessionId: session.id,
      paymentStatus: session.payment_status,
      paymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      orderNumber: session.metadata?.order_number || null,
    });
  } catch (error: any) {
    console.error('Stripe session lookup error:', error);
    const status = String(error?.message || '').startsWith('Configurazione server mancante') ? 503 : 400;
    return json({ error: error?.message || 'Impossibile verificare il pagamento' }, status);
  }
}
