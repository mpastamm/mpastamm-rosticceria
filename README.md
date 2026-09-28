# 'Mpastamm — Rosticceria Contemporanea

Web app responsive per la vetrina digitale, le prenotazioni d'asporto e la gestione operativa della rosticceria.

## Funzionalità

- vetrina pubblica con categorie, ricerca e disponibilità;
- scheda prodotto, carrello e prenotazione con pagamento online Stripe per ritiro o consegna;
- conferma ordine, verifica webhook Stripe e notifica WhatsApp opzionale dopo il pagamento;
- area admin per prodotti, categorie, ordini, scorte, orari, impostazioni e contenuti del sito;
- fallback locale per sviluppo e predisposizione Supabase per database, auth, storage e realtime.

## Avvio locale

Prerequisiti: Node.js 20+.

```bash
npm install
npm run dev
```

L'app è disponibile su `http://localhost:3000`.

Per la modalità demo locale, creare `.env.local` copiando `.env.example` e impostare:

```env
VITE_ALLOW_LOCAL_ADMIN=true
VITE_DEMO_ADMIN_EMAIL=admin@example.com
VITE_DEMO_ADMIN_PASSWORD=change-me-locally
```

La modalità demo non va usata in produzione.

## Stripe Checkout

Il checkout viene creato lato server dalle Pages Functions in `functions/api`. Il server ricalcola gli importi leggendo i prodotti da Supabase, quindi il browser non può modificare il prezzo dell'ordine. Per il deploy Cloudflare Pages configurare queste variabili in **Settings → Environment variables**:

```env
APP_URL=https://mpastamm.it
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://gwmvfdfoiybuwkkmaknf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` e `SUPABASE_SERVICE_ROLE_KEY` devono essere variabili **segrete**, mai inserite nel codice o nelle variabili `VITE_*`. In Stripe creare un webhook verso `https://mpastamm.it/api/stripe-webhook` per gli eventi `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` e `checkout.session.expired`. Prima del passaggio in produzione usare le chiavi `sk_test_...`; dopo il collaudo sostituirle con le chiavi live.

## Supabase

1. Creare un progetto Supabase.
2. Eseguire `supabase/schema.sql` nell'SQL Editor.
3. Eseguire anche la migrazione contenuti presente in `supabase/schema.sql` (campi hero, card e footer).
4. Creare il primo utente admin in Supabase Auth.
5. Inserire una riga corrispondente nella tabella `admins`.
5. Configurare `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

Le chiavi private e i token WhatsApp devono rimanere esclusivamente nelle variabili d'ambiente server e non devono essere committati.

## Script

```bash
npm run lint
npm run build
npm run start
```

## Stato del progetto

La UI, il checkout Stripe e la validazione server-side degli importi sono pronti. Restano da inserire solo le chiavi Stripe/Supabase/WhatsApp nelle variabili protette di Cloudflare e da fare un pagamento di test con la carta Stripe `4242 4242 4242 4242` in modalità Test.
