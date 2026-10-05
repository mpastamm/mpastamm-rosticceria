-- Chat guidata nel checkout: l'amministratore propone alternative e il cliente
-- comunica la propria scelta prima della conferma finale dell'ordine.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS alternative_product_ids JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_selected_alternative_product_ids JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_customer_response_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_customer_response_check
  CHECK (customer_response IN ('pending', 'accepted', 'declined', 'alternative_selected'));
