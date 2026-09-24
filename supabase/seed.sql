-- Seed iniziale 'Mpastamm.
-- Eseguire dopo schema.sql. Le foto locali restano disponibili come fallback;
-- le nuove foto caricate dall'admin vengono salvate nel bucket product-images.

INSERT INTO categories (id, name, slug, description, image_url, display_order, visible)
VALUES
  ('cat_saltimbocca', 'Saltimbocca', 'saltimbocca', 'L''arte del gusto in un morso.', '', 1, true),
  ('cat_bun', 'Bun (100g)', 'bun', 'Soffice, fragrante, ineguagliabile.', '', 2, true),
  ('cat_rutiello', 'Rutiello 2.0', 'rutiello-2-0', 'La tradizione si rinnova.', '', 3, true),
  ('cat_padellino', 'Padellino', 'padellino', 'Tutta la bontà della rosticceria.', '', 4, true),
  ('cat_friggitoria', 'Friggitoria', 'friggitoria', 'Croccante fuori, irresistibile dentro.', '', 5, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug,
  description = EXCLUDED.description, display_order = EXCLUDED.display_order,
  visible = EXCLUDED.visible, updated_at = now();

INSERT INTO products
  (id, category_id, name, slug, description, ingredients, price, image_url,
   availability_status, stock_management_enabled, stock_quantity, featured, badge, visible, display_order)
VALUES
  ('prod_sal_classico', 'cat_saltimbocca', 'Classico', 'saltimbocca-classico',
   'Il grande classico della tradizione campana.', 'Pancetta, provola e funghi champignon.', 8.00, '', 'available', false, 25, false, 'none', true, 1),
  ('prod_sal_sfizioso', 'cat_saltimbocca', 'Sfizioso', 'saltimbocca-sfizioso',
   'Gusto rustico e avvolgente.', 'Patate arrosto, salsiccia e provola.', 8.00, '', 'available', true, 18, true, 'Consigliato', true, 2),
  ('prod_sal_abatese', 'cat_saltimbocca', 'Abatese', 'saltimbocca-abatese',
   'Profumo di porchetta artigianale.', 'Porchetta, patate arrosto e provola.', 9.00, '', 'available', false, 15, false, 'none', true, 3),
  ('prod_sal_parma', 'cat_saltimbocca', 'Parma', 'saltimbocca-parma',
   'Equilibrio tra dolcezza e freschezza.', 'Crudo di Parma, provola e melanzane grigliate.', 10.00, '', 'available', false, 12, false, 'none', true, 4),

  ('prod_bun_crunchy', 'cat_bun', 'Crunchy', 'bun-crunchy',
   'Croccantezza straordinaria e pan brioche soffice.', 'Cotoletta crunchy, insalata e maionese homemade.', 10.00, '', 'available', true, 20, true, 'Più richiesto', true, 1),
  ('prod_bun_fresco', 'cat_bun', 'Fresco', 'bun-fresco',
   'Carne succosa e stracciata fresca.', 'Hamburger, pomodori, insalata, bacon, stracciata e pesto.', 12.00, '', 'available', false, 15, false, 'none', true, 2),
  ('prod_bun_burger', 'cat_bun', 'Burger', 'bun-burger',
   'Doppio hamburger per i palati decisi.', 'Doppio hamburger, chips, bacon croccante e provola.', 11.00, '', 'available', true, 14, false, 'none', true, 3),

  ('prod_rut_margherita', 'cat_rutiello', 'Margherita', 'rutiello-margherita',
   'Bordo alto, soffice e croccante.', 'Pomodoro, mozzarella e basilico.', 7.50, '', 'available', false, 30, false, 'none', true, 1),
  ('prod_rut_marinara', 'cat_rutiello', 'Marinara', 'rutiello-marinara',
   'Semplicità napoletana profumata.', 'Pomodoro, origano, aglio e olive.', 6.00, '', 'available', false, 20, false, 'none', true, 2),
  ('prod_rut_mpastamm', 'cat_rutiello', '''Mpastamm', 'rutiello-mpastamm',
   'La nostra firma d''autore.', 'Patate schiacciate, prosciutto cotto, panna homemade, pepe e mozzarella.', 9.50, '', 'available', true, 16, true, 'Speciale del giorno', true, 3),
  ('prod_rut_ortolana', 'cat_rutiello', 'Ortolana', 'rutiello-ortolana',
   'Verdure fresche saltate al momento.', 'Verdure di stagione e mozzarella.', 8.00, '', 'available', false, 15, false, 'none', true, 4),

  ('prod_pad_pistacchioso', 'cat_padellino', 'Pistacchioso', 'padellino-pistacchioso',
   'Un connubio goloso e tostato.', 'Mortadella, stracciata e pesto di pistacchio.', 12.00, '', 'available', true, 10, true, 'Novità', true, 1),
  ('prod_pad_modena', 'cat_padellino', 'Modena', 'padellino-modena',
   'Raffinato contrasto di sapori.', 'Rucola, prosciutto crudo, parmigiano e balsamico.', 13.00, '', 'available', false, 12, false, 'none', true, 2),
  ('prod_pad_sorrento', 'cat_padellino', 'Sorrento', 'padellino-sorrento',
   'I profumi della penisola sorrentina.', 'Mozzarella, pomodoro sorrentino e pesto di basilico.', 10.00, '', 'available', false, 15, false, 'none', true, 3),

  ('prod_frig_arancino_bianco', 'cat_friggitoria', 'Arancino bianco', 'arancino-bianco',
   'Riso mantecato e cuore filante.', 'Mozzarella, cotto e besciamella.', 2.00, '', 'available', true, 24, false, 'none', true, 1),
  ('prod_frig_arancino_ragu', 'cat_friggitoria', 'Arancino ragù', 'arancino-ragu',
   'Ragù napoletano e mozzarella filante.', 'Ragù e mozzarella.', 2.00, '', 'available', true, 28, true, 'Consigliato', true, 2),
  ('prod_frig_frittatina_classica', 'cat_friggitoria', 'Frittatina classica', 'frittatina-classica',
   'L''icona dello street food campano.', 'Cotto, mozzarella e pepe.', 2.50, '', 'available', true, 20, false, 'none', true, 3),
  ('prod_frig_frittatina_pasta_patate', 'cat_friggitoria', 'Frittatina pasta e patate', 'frittatina-pasta-patate',
   'Un omaggio al piatto di casa.', 'Patate, pancetta, provola, pepe e parmigiano.', 2.50, '', 'available', true, 15, true, 'Speciale del giorno', true, 4),
  ('prod_frig_crocche', 'cat_friggitoria', 'Crocchè', 'crocche',
   'Purea di patate, prezzemolo e pepe.', 'Patate, pepe e prezzemolo.', 1.50, '', 'available', true, 35, false, 'none', true, 5),
  ('prod_frig_chips', 'cat_friggitoria', 'Porzione di chips', 'chips-homemade',
   'Prezzo da configurare dall''amministratore.', 'Homemade patate fresche.', 0.00, '', 'hidden', false, 0, false, 'none', false, 6)
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id, name = EXCLUDED.name, slug = EXCLUDED.slug,
  description = EXCLUDED.description, ingredients = EXCLUDED.ingredients,
  price = EXCLUDED.price, availability_status = EXCLUDED.availability_status,
  stock_management_enabled = EXCLUDED.stock_management_enabled, stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured, badge = EXCLUDED.badge, visible = EXCLUDED.visible,
  display_order = EXCLUDED.display_order, updated_at = now();

INSERT INTO business_settings
  (id, store_name, tagline, hero_title, hero_description, hero_image_url, hero_image_alt, footer_claim,
   address, city, phone, whatsapp_notification_phone,
   instagram_handle, orders_enabled, orders_disabled_message, next_day_orders_allowed, slot_interval_minutes)
VALUES
  ('settings_main', '''Mpastamm', 'Rosticceria & Forno Contemporaneo', 'La Vetrina',
   'I nostri lievitati, la tradizione e il gusto di sempre, ogni giorno per te.', '',
   'Mpastamm Rosticceria Interno e Vetrina', 'Nun c''è fame, è voglia e sfizio.', 'Via Roma, 42',
   'Napoli (NA)', '081 123 4567', '', '@mpastamm.rosticceria', true,
   'Le prenotazioni per oggi sono terminate. Puoi già prenotare per domani.', true, 15)
ON CONFLICT (id) DO UPDATE SET
  store_name = EXCLUDED.store_name, tagline = EXCLUDED.tagline, hero_title = EXCLUDED.hero_title,
  hero_description = EXCLUDED.hero_description, hero_image_url = EXCLUDED.hero_image_url,
  hero_image_alt = EXCLUDED.hero_image_alt, footer_claim = EXCLUDED.footer_claim,
  address = EXCLUDED.address,
  city = EXCLUDED.city, phone = EXCLUDED.phone, instagram_handle = EXCLUDED.instagram_handle,
  orders_enabled = EXCLUDED.orders_enabled, orders_disabled_message = EXCLUDED.orders_disabled_message,
  next_day_orders_allowed = EXCLUDED.next_day_orders_allowed, slot_interval_minutes = EXCLUDED.slot_interval_minutes,
  updated_at = now();

INSERT INTO opening_hours
  (day_of_week, day_name, is_open, morning_open, morning_close, evening_open, evening_close)
VALUES
  (0, 'Domenica', false, '11:30', '14:30', '18:30', '23:00'),
  (1, 'Lunedì', false, '11:30', '14:30', '18:30', '23:00'),
  (2, 'Martedì', true, '11:30', '14:30', '18:30', '23:00'),
  (3, 'Mercoledì', true, '11:30', '14:30', '18:30', '23:00'),
  (4, 'Giovedì', true, '11:30', '14:30', '18:30', '23:00'),
  (5, 'Venerdì', true, '11:30', '14:30', '18:30', '23:30'),
  (6, 'Sabato', true, '11:30', '14:30', '18:30', '23:30')
ON CONFLICT (day_of_week) DO UPDATE SET
  day_name = EXCLUDED.day_name, is_open = EXCLUDED.is_open,
  morning_open = EXCLUDED.morning_open, morning_close = EXCLUDED.morning_close,
  evening_open = EXCLUDED.evening_open, evening_close = EXCLUDED.evening_close;
