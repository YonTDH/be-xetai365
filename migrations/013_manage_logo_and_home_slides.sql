BEGIN;

ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS logo_url TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS home_slides (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT '',
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 1,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_home_slides_visible_order
  ON home_slides (is_visible, sort_order, id);

COMMIT;
