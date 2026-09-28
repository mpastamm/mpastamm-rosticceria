-- Modalità di evasione ordine e posizione per le consegne.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS fulfillment_method TEXT NOT NULL DEFAULT 'pickup';

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_address TEXT;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_latitude NUMERIC(10, 7);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_longitude NUMERIC(10, 7);

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_fulfillment_method_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_fulfillment_method_check
  CHECK (fulfillment_method IN ('pickup', 'delivery'));
