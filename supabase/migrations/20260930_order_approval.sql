-- Conferma disponibilita ordine prima del pagamento Stripe.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_token TEXT;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS admin_message TEXT;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS missing_product_ids JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_response TEXT NOT NULL DEFAULT 'pending';

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('NUOVO', 'IN ATTESA CLIENTE', 'ACCETTATO', 'IN PREPARAZIONE', 'PRONTO', 'RITIRATO', 'ANNULLATO'));

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_customer_response_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_customer_response_check
  CHECK (customer_response IN ('pending', 'accepted', 'declined'));

CREATE INDEX IF NOT EXISTS orders_customer_token_idx
  ON orders (customer_token);
