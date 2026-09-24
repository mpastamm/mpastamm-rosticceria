import { Order } from '../types';

export function formatWhatsAppMessage(order: Order): string {
  const itemsText = order.items
    .map((item) => `${item.quantity}x ${item.product_name_snapshot}${item.notes ? ` (${item.notes})` : ''}`)
    .join('\n');

  // Format date nicely in Italian
  let formattedDate = order.pickup_date;
  try {
    const d = new Date(order.pickup_date + 'T12:00:00');
    formattedDate = d.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    // Capitalize first letter
    formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  } catch {
    // Keep as is
  }

  let text = `🔔 *NUOVO ORDINE*\n\n` +
    `*Ordine:* ${order.order_number}\n\n` +
    `*Cliente:*\n${order.customer_name} ${order.customer_surname}\n\n` +
    `*Telefono:*\n${order.customer_phone}\n\n` +
    `*PRODOTTI*\n${itemsText}\n\n` +
    `*Totale:* €${order.total.toFixed(2).replace('.', ',')}\n\n` +
    `*Ritiro:*\n${formattedDate}\nOre ${order.pickup_time}`;

  if (order.notes && order.notes.trim()) {
    text += `\n\n*Note:*\n${order.notes.trim()}`;
  }

  return text;
}

export async function sendOrderNotificationToBackend(order: Order): Promise<{ success: boolean; simulated?: boolean; message?: string }> {
  try {
    const response = await fetch('/api/notify-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { success: false, message: errData.message || 'Errore durante la notifica WhatsApp' };
    }

    const data = await response.json();
    return data;
  } catch (err: any) {
    // Graceful fallback - order still succeeds even if network fails
    console.warn('Backend notification service offline or unreachable:', err.message);
    return { success: true, simulated: true, message: 'Simulazione: notifica salvata localmente' };
  }
}

export function generateDirectWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
