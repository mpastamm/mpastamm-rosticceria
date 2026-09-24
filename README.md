# 'Mpastamm — Rosticceria Contemporanea

Web app responsive per la vetrina digitale, le prenotazioni d'asporto e la gestione operativa della rosticceria.

## Funzionalità

- vetrina pubblica con categorie, ricerca e disponibilità;
- scheda prodotto, carrello e prenotazione con pagamento al ritiro;
- conferma ordine e notifica WhatsApp opzionale;
- area admin per prodotti, categorie, ordini, scorte, orari e impostazioni;
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

## Supabase

1. Creare un progetto Supabase.
2. Eseguire `supabase/schema.sql` nell'SQL Editor.
3. Creare il primo utente admin in Supabase Auth.
4. Inserire una riga corrispondente nella tabella `admins`.
5. Configurare `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

Le chiavi private e i token WhatsApp devono rimanere esclusivamente nelle variabili d'ambiente server e non devono essere committati.

## Script

```bash
npm run lint
npm run build
npm run start
```

## Stato del progetto

La UI e i flussi locali sono pronti per test e demo. Prima del deploy pubblico vanno completati il collegamento persistente a Supabase, l'autenticazione admin server-side, le policy RLS definitive e la validazione server-side degli ordini.
