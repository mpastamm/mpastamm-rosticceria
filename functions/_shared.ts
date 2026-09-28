export type FunctionEnv = {
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  APP_URL?: string;
  WHATSAPP_API_TOKEN?: string;
  WHATSAPP_PHONE_NUMBER_ID?: string;
  RESTAURANT_WHATSAPP_NUMBER?: string;
};

export type PagesContext = {
  request: Request;
  env: FunctionEnv;
  waitUntil?: (promise: Promise<unknown>) => void;
};

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export async function readJson(request: Request): Promise<Record<string, any>> {
  try {
    const value = await request.json();
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
}

export function requiredEnv(env: FunctionEnv, key: keyof FunctionEnv): string {
  const value = env[key];
  if (!value) throw new Error(`Configurazione server mancante: ${key}`);
  return value;
}

export async function supabaseRequest(
  env: FunctionEnv,
  path: string,
  init: RequestInit = {},
): Promise<any> {
  const baseUrl = requiredEnv(env, 'SUPABASE_URL').replace(/\/$/, '');
  const serviceRoleKey = requiredEnv(env, 'SUPABASE_SERVICE_ROLE_KEY');
  const headers = new Headers(init.headers);
  headers.set('apikey', serviceRoleKey);
  headers.set('Authorization', `Bearer ${serviceRoleKey}`);
  headers.set('Content-Type', 'application/json');
  if (!headers.has('Prefer')) headers.set('Prefer', 'return=representation');

  const response = await fetch(`${baseUrl}/rest/v1/${path}`, { ...init, headers });
  const raw = await response.text();
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }
  if (!response.ok) {
    throw new Error(`Supabase ${response.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }
  return data;
}

export function stripeHeaders(env: FunctionEnv): Headers {
  const headers = new Headers();
  headers.set('Authorization', `Bearer ${requiredEnv(env, 'STRIPE_SECRET_KEY')}`);
  headers.set('Content-Type', 'application/x-www-form-urlencoded');
  return headers;
}

export async function stripeRequest(
  env: FunctionEnv,
  path: string,
  init: RequestInit = {},
): Promise<any> {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    ...init,
    headers: { ...Object.fromEntries(stripeHeaders(env).entries()), ...(init.headers || {}) },
  });
  const raw = await response.text();
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }
  if (!response.ok) {
    throw new Error(`Stripe ${response.status}: ${data?.error?.message || raw || 'errore sconosciuto'}`);
  }
  return data;
}

export async function hmacSha256Hex(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function safeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}

export function formEncode(fields: Record<string, string | number | boolean>): string {
  const params = new URLSearchParams();
  Object.entries(fields).forEach(([key, value]) => params.set(key, String(value)));
  return params.toString();
}

export function normalizePhone(value: unknown): string {
  return String(value || '').replace(/[^0-9]/g, '');
}

export function formatOrderMessage(order: any, items: any[]): string {
  const itemsText = items
    .map((item) => `${item.quantity}x ${item.product_name_snapshot}${item.notes ? ` (${item.notes})` : ''}`)
    .join('\n');
  let formattedDate = String(order.pickup_date || '');
  try {
    const date = new Date(`${order.pickup_date}T12:00:00`);
    formattedDate = date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
    formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  } catch {}

  const isDelivery = order.fulfillment_method === 'delivery';
  const mapsUrl = order.delivery_latitude != null && order.delivery_longitude != null
    ? `https://www.google.com/maps?q=${order.delivery_latitude},${order.delivery_longitude}`
    : '';
  let message =
    `🔔 *NUOVO ORDINE PAGATO CON STRIPE*\n\n` +
    `*Ordine:* ${order.order_number}\n\n` +
    `*Cliente:*\n${order.customer_name} ${order.customer_surname || ''}\n\n` +
    `*Telefono:*\n${order.customer_phone}\n\n` +
    `*PRODOTTI*\n${itemsText}\n\n` +
    `*Totale pagato:* €${Number(order.total || 0).toFixed(2).replace('.', ',')}\n\n` +
    `*Modalità:*\n${isDelivery ? 'Consegna a domicilio' : 'Ritiro in negozio'}\n` +
    `${isDelivery ? '*Consegna:*' : '*Ritiro:*'}\n${formattedDate}\nOre ${order.pickup_time}`;
  if (isDelivery) {
    message += `\n\n*Indirizzo consegna:*\n${order.delivery_address || 'Non indicato'}`;
    if (mapsUrl) message += `\n*Posizione GPS:*\n${mapsUrl}`;
  }
  if (order.notes) message += `\n\n*Note:*\n${order.notes}`;
  return message;
}

export async function sendWhatsAppNotification(env: FunctionEnv, order: any, items: any[]) {
  const token = env.WHATSAPP_API_TOKEN;
  const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID;
  const targetPhone = env.RESTAURANT_WHATSAPP_NUMBER;
  if (!token || !phoneNumberId || !targetPhone) {
    return { configured: false };
  }

  const response = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: normalizePhone(targetPhone),
      type: 'text',
      text: { preview_url: false, body: formatOrderMessage(order, items) },
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`WhatsApp ${response.status}: ${JSON.stringify(data)}`);
  return { configured: true, messageId: data?.messages?.[0]?.id };
}
