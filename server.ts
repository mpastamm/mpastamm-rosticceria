import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '100kb' }));

// API: Notify Order via WhatsApp Cloud API
app.post('/api/notify-order', async (req: Request, res: Response) => {
  const { order } = req.body;

  if (
    !order ||
    typeof order.order_number !== 'string' ||
    typeof order.customer_name !== 'string' ||
    typeof order.customer_phone !== 'string' ||
    !Array.isArray(order.items) ||
    order.items.length === 0
  ) {
    return res.status(400).json({ error: 'Dati ordine mancanti' });
  }

  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const targetPhone = process.env.RESTAURANT_WHATSAPP_NUMBER;

  // Build formatted text message
  const itemsText = (order.items || [])
    .map((item: any) => `${item.quantity}x ${item.product_name_snapshot}${item.notes ? ` (${item.notes})` : ''}`)
    .join('\n');

  let formattedDate = order.pickup_date;
  try {
    const d = new Date(order.pickup_date + 'T12:00:00');
    formattedDate = d.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  } catch {}

  const messageBody =
    `🔔 *NUOVO ORDINE*\n\n` +
    `*Ordine:* ${order.order_number}\n\n` +
    `*Cliente:*\n${order.customer_name} ${order.customer_surname}\n\n` +
    `*Telefono:*\n${order.customer_phone}\n\n` +
    `*PRODOTTI*\n${itemsText}\n\n` +
    `*Totale:* €${Number(order.total || 0).toFixed(2).replace('.', ',')}\n\n` +
    `*Ritiro:*\n${formattedDate}\nOre ${order.pickup_time}` +
    (order.notes ? `\n\n*Note:*\n${order.notes}` : '');

  if (process.env.NODE_ENV !== 'production') {
    console.log(`Notifica ordine ${order.order_number} preparata.`);
  }

  // If WhatsApp API credentials exist, send to Meta Cloud API
  if (token && phoneNumberId && targetPhone) {
    try {
      const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
      const metaResponse = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: { preview_url: false, body: messageBody },
        }),
      });

      const metaData = await metaResponse.json();
      if (!metaResponse.ok) {
        console.error('Meta WhatsApp Cloud API error:', metaData);
        return res.json({
          success: true,
          simulated: true,
          warning: 'WhatsApp API error, falling back to simulated dispatch',
          metaError: metaData,
        });
      }

      return res.json({ success: true, messageId: metaData?.messages?.[0]?.id });
    } catch (err: any) {
      console.error('Failed to call WhatsApp API:', err.message);
      return res.json({
        success: true,
        simulated: true,
        warning: 'WhatsApp network error, simulated dispatch applied',
      });
    }
  }

  // Not configured yet - return safe simulated response
  return res.json({
    success: true,
    simulated: true,
    message: 'Notifica WhatsApp simulata: credenziali non ancora configurate in .env',
  });
});

// API: Health status check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    store: "'Mpastamm",
    time: new Date().toISOString(),
    whatsappConfigured: Boolean(process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
  });
});

// Start dev or prod server
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`'Mpastamm server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
