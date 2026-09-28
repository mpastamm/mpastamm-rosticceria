-- Contenuti modificabili delle pagine istituzionali e delle immagini del brand.
ALTER TABLE business_settings
  ADD COLUMN IF NOT EXISTS site_content JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN business_settings.site_content IS
  'Testi e immagini modificabili dal pannello Contenuti del sito';
