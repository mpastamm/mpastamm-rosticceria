-- =====================================================================
-- 'MPASTAMM - SCHEMA DATABASE SUPABASE (POSTGRESQL)
-- =====================================================================
-- Questo script crea tutte le tabelle, i vincoli, le policy di sicurezza RLS
-- e carica il catalogo iniziale per la rosticceria 'Mpastamm.
-- =====================================================================

-- 1. TABELLA CATEGORIE
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABELLA PRODOTTI
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  ingredients TEXT,
  price NUMERIC(10, 2) NOT NULL,
  image_url TEXT,
  availability_status TEXT NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'low_stock', 'sold_out', 'hidden')),
  stock_management_enabled BOOLEAN DEFAULT false,
  stock_quantity INT DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  badge TEXT DEFAULT 'none',
  visible BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABELLA ORDINI
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_surname TEXT,
  customer_phone TEXT NOT NULL,
  pickup_date DATE NOT NULL,
  pickup_time TIME NOT NULL,
  notes TEXT,
  subtotal NUMERIC(10, 2) NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'NUOVO' CHECK (status IN ('NUOVO', 'ACCETTATO', 'IN PREPARAZIONE', 'PRONTO', 'RITIRATO', 'ANNULLATO')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TABELLA VOCI ORDINE (SNAPSHOT PRODOTTO)
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT,
  product_name_snapshot TEXT NOT NULL,
  product_price_snapshot NUMERIC(10, 2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  notes TEXT,
  subtotal NUMERIC(10, 2) NOT NULL,
  image_url_snapshot TEXT
);

-- 5. TABELLA IMPOSTAZIONI ROSTICCERIA
CREATE TABLE IF NOT EXISTS business_settings (
  id TEXT PRIMARY KEY DEFAULT 'settings_main',
  store_name TEXT NOT NULL DEFAULT '''Mpastamm',
  tagline TEXT DEFAULT 'Rosticceria & Forno Contemporaneo',
  hero_title TEXT DEFAULT 'La Vetrina',
  hero_description TEXT DEFAULT 'I nostri lievitati, la tradizione e il gusto di sempre, ogni giorno per te.',
  hero_image_url TEXT,
  hero_image_alt TEXT DEFAULT 'Mpastamm Rosticceria Interno e Vetrina',
  footer_claim TEXT DEFAULT 'Nun c''è fame, è voglia e sfizio.',
  address TEXT DEFAULT 'Via Roma, 42',
  city TEXT DEFAULT 'Napoli (NA)',
  phone TEXT DEFAULT '081 123 4567',
  whatsapp_notification_phone TEXT DEFAULT '393331234567',
  instagram_handle TEXT DEFAULT '@mpastamm.rosticceria',
  orders_enabled BOOLEAN DEFAULT true,
  orders_disabled_message TEXT DEFAULT 'Le prenotazioni per oggi sono terminate. Puoi già prenotare per domani.',
  next_day_orders_allowed BOOLEAN DEFAULT true,
  slot_interval_minutes INT DEFAULT 15,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Migrazione sicura per i progetti creati con una versione precedente dello schema.
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS hero_title TEXT DEFAULT 'La Vetrina';
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS hero_description TEXT DEFAULT 'I nostri lievitati, la tradizione e il gusto di sempre, ogni giorno per te.';
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS hero_image_alt TEXT DEFAULT 'Mpastamm Rosticceria Interno e Vetrina';
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS footer_claim TEXT DEFAULT 'Nun c''è fame, è voglia e sfizio.';

-- 6. TABELLA ORARI DI APERTURA
CREATE TABLE IF NOT EXISTS opening_hours (
  day_of_week INT PRIMARY KEY, -- 0 = Domenica, 1 = Lunedi, ..., 6 = Sabato
  day_name TEXT NOT NULL,
  is_open BOOLEAN DEFAULT true,
  morning_open TIME,
  morning_close TIME,
  evening_open TIME,
  evening_close TIME
);

-- 7. TABELLA AMMINISTRATORI
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------
-- ABILITAZIONE ROW LEVEL SECURITY (RLS)
-- ---------------------------------------------------------------------
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE opening_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policy di Lettura Pubblica per i clienti
DROP POLICY IF EXISTS "Public Read Categories" ON categories;
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Read Visible Products" ON products;
CREATE POLICY "Public Read Visible Products" ON products FOR SELECT USING (visible = true);
DROP POLICY IF EXISTS "Public Read Settings" ON business_settings;
CREATE POLICY "Public Read Settings" ON business_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Read Hours" ON opening_hours;
CREATE POLICY "Public Read Hours" ON opening_hours FOR SELECT USING (true);

-- Policy Inserimento Ordini per i clienti
DROP POLICY IF EXISTS "Public Create Orders" ON orders;
CREATE POLICY "Public Create Orders" ON orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Create Order Items" ON order_items;
CREATE POLICY "Public Create Order Items" ON order_items FOR INSERT WITH CHECK (true);

-- Policy Admin: Accesso Completo agli utenti autenticati come Admin
DROP POLICY IF EXISTS "Admins can read own profile" ON admins;
CREATE POLICY "Admins can read own profile" ON admins FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "Admin Full Access Categories" ON categories;
CREATE POLICY "Admin Full Access Categories" ON categories FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));
DROP POLICY IF EXISTS "Admin Full Access Products" ON products;
CREATE POLICY "Admin Full Access Products" ON products FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));
DROP POLICY IF EXISTS "Admin Full Access Orders" ON orders;
CREATE POLICY "Admin Full Access Orders" ON orders FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));
DROP POLICY IF EXISTS "Admin Full Access Order Items" ON order_items;
CREATE POLICY "Admin Full Access Order Items" ON order_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));
DROP POLICY IF EXISTS "Admin Full Access Settings" ON business_settings;
CREATE POLICY "Admin Full Access Settings" ON business_settings FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));
DROP POLICY IF EXISTS "Admin Full Access Hours" ON opening_hours;
CREATE POLICY "Admin Full Access Hours" ON opening_hours FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid()));

-- Storage pubblico per la lettura delle foto e protetto per upload/modifica.
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read Product Images" ON storage.objects;
CREATE POLICY "Public Read Product Images" ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');
DROP POLICY IF EXISTS "Admin Upload Product Images" ON storage.objects;
CREATE POLICY "Admin Upload Product Images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid())
  );
DROP POLICY IF EXISTS "Admin Update Product Images" ON storage.objects;
CREATE POLICY "Admin Update Product Images" ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'product-images' AND
    EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid())
  );
DROP POLICY IF EXISTS "Admin Delete Product Images" ON storage.objects;
CREATE POLICY "Admin Delete Product Images" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'product-images' AND
    EXISTS (SELECT 1 FROM admins WHERE auth_user_id = auth.uid())
  );

-- ---------------------------------------------------------------------
-- SUPABASE REALTIME ENABLEMENT
-- ---------------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE business_settings;
