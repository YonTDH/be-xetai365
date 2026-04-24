BEGIN;

-- Consolidated schema (single source of truth)
-- This migration is idempotent and can initialize a fresh database.

-- Drop old constraints that may reference legacy catalog tables
ALTER TABLE IF EXISTS contact_requests
  DROP CONSTRAINT IF EXISTS contact_requests_vehicle_id_fkey;

ALTER TABLE IF EXISTS bulletins
  DROP CONSTRAINT IF EXISTS bulletins_category_id_fkey;

-- Drop legacy triggers/functions/tables from old catalog models
DROP TRIGGER IF EXISTS trg_enforce_vehicle_leaf_category ON vehicles;
DROP TRIGGER IF EXISTS trg_enforce_vehicle_category_model ON vehicle_categories;
DROP FUNCTION IF EXISTS enforce_vehicle_leaf_category();
DROP FUNCTION IF EXISTS enforce_vehicle_category_model();

DROP TABLE IF EXISTS san_pham CASCADE;
DROP TABLE IF EXISTS danh_muc_cap_2 CASCADE;
DROP TABLE IF EXISTS danh_muc_cap_1 CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS vehicle_categories CASCADE;
DROP TYPE IF EXISTS trang_thai_san_pham;

-- Core settings
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  keywords TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  giupdochiase INTEGER NOT NULL DEFAULT 0,
  ten TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  dienthoai TEXT NOT NULL DEFAULT '',
  diachi TEXT NOT NULL DEFAULT '',
  fax TEXT NOT NULL DEFAULT '',
  tennv TEXT NOT NULL DEFAULT '',
  hotline TEXT NOT NULL DEFAULT '',
  tennv1 TEXT NOT NULL DEFAULT '',
  hotline1 TEXT NOT NULL DEFAULT '',
  tennv2 TEXT NOT NULL DEFAULT '',
  hotline2 TEXT NOT NULL DEFAULT '',
  toado TEXT NOT NULL DEFAULT '',
  facebook TEXT NOT NULL DEFAULT '',
  youtube TEXT NOT NULL DEFAULT '',
  yahoo TEXT NOT NULL DEFAULT '',
  skype TEXT NOT NULL DEFAULT '',
  twitter TEXT NOT NULL DEFAULT '',
  zing TEXT NOT NULL DEFAULT '',
  google TEXT NOT NULL DEFAULT '',
  tip TEXT NOT NULL DEFAULT '',
  linktip TEXT NOT NULL DEFAULT '',
  analytics TEXT NOT NULL DEFAULT '',
  dangky TEXT NOT NULL DEFAULT '',
  tietkiem TEXT NOT NULL DEFAULT '',
  hailong TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Route mapping
CREATE TABLE IF NOT EXISTS legacy_routes (
  id BIGSERIAL PRIMARY KEY,
  path VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(80) NOT NULL,
  target VARCHAR(255) NOT NULL,
  resource_type VARCHAR(80) NOT NULL,
  resource_slug VARCHAR(220) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin users
CREATE TABLE IF NOT EXISTS admin_users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(120) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(180) NOT NULL DEFAULT '',
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Catalog: level 1
CREATE TABLE IF NOT EXISTS category_level_1 (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(160) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  title_seo TEXT NOT NULL DEFAULT '',
  keywords TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 1,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  admin_note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Catalog: level 2
CREATE TABLE IF NOT EXISTS category_level_2 (
  id BIGSERIAL PRIMARY KEY,
  category_level_1_id BIGINT NOT NULL REFERENCES category_level_1(id) ON DELETE CASCADE,
  slug VARCHAR(160) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  title_seo TEXT NOT NULL DEFAULT '',
  keywords TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 1,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  admin_note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_category_level_2_name_in_level_1 UNIQUE (category_level_1_id, name)
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  category_level_2_id BIGINT NOT NULL REFERENCES category_level_2(id) ON DELETE CASCADE,
  product_code VARCHAR(120) NOT NULL DEFAULT '',
  slug VARCHAR(220) NOT NULL UNIQUE,
  legacy_path VARCHAR(255) NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  short_description TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  technical_specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  price_vnd NUMERIC(18,2) NOT NULL DEFAULT 0,
  unit VARCHAR(20) NOT NULL DEFAULT 'unit',
  status VARCHAR(40) NOT NULL DEFAULT 'available',
  brand VARCHAR(120) NOT NULL DEFAULT '',
  vehicle_type VARCHAR(80) NOT NULL DEFAULT '',
  condition VARCHAR(40) NOT NULL DEFAULT '',
  year INTEGER NOT NULL DEFAULT 0,
  mileage_km INTEGER NOT NULL DEFAULT 0,
  fuel_type VARCHAR(40) NOT NULL DEFAULT '',
  transmission VARCHAR(40) NOT NULL DEFAULT '',
  location VARCHAR(255) NOT NULL DEFAULT '',
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  title_seo TEXT NOT NULL DEFAULT '',
  keywords TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contact requests
CREATE TABLE IF NOT EXISTS contact_requests (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(200) NOT NULL DEFAULT '',
  phone VARCHAR(40) NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  vehicle_id BIGINT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'new',
  contacted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bulletins (news / events / promotions)
CREATE TABLE IF NOT EXISTS bulletins (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(220) NOT NULL UNIQUE,
  bulletin_type VARCHAR(40) NOT NULL CHECK (bulletin_type IN ('news_event', 'promotion', 'recruitment')),
  category_id BIGINT NULL,
  title TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  description_short TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  status VARCHAR(40) NOT NULL DEFAULT 'published',
  image_url TEXT NOT NULL DEFAULT '',
  title_seo TEXT NOT NULL DEFAULT '',
  keywords TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 1,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Site pages
CREATE TABLE IF NOT EXISTS site_pages (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(220) NOT NULL UNIQUE,
  page_type VARCHAR(60) NOT NULL DEFAULT 'company',
  title TEXT NOT NULL,
  greeting TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  keywords TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 1,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backfill missing columns for older installations
ALTER TABLE bulletins
  ADD COLUMN IF NOT EXISTS category_id BIGINT NULL,
  ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS description_short TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS title_seo TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS keywords TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS meta_description TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT '';

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS product_code VARCHAR(120) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS title_seo TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS keywords TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS meta_description TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE products
SET images = CASE
  WHEN images IS NULL THEN '[]'::jsonb
  WHEN jsonb_typeof(images) = 'array' THEN images
  WHEN jsonb_typeof(images) = 'string' THEN jsonb_build_array(images)
  WHEN jsonb_typeof(images) = 'object' AND COALESCE(images->>'url', '') <> '' THEN jsonb_build_array(images)
  WHEN jsonb_typeof(images) = 'object' AND COALESCE(images->>'src', '') <> '' THEN jsonb_build_array(images)
  ELSE '[]'::jsonb
END
WHERE images IS NULL OR jsonb_typeof(images) <> 'array';

-- Normalize constraints for bulletin type and featured/visible behavior
ALTER TABLE bulletins
  DROP CONSTRAINT IF EXISTS bulletins_bulletin_type_check,
  DROP CONSTRAINT IF EXISTS ck_bulletins_type,
  DROP CONSTRAINT IF EXISTS ck_bulletins_featured_visible;

ALTER TABLE bulletins
  ADD CONSTRAINT ck_bulletins_type
    CHECK (bulletin_type IN ('news_event', 'promotion', 'recruitment')),
  ADD CONSTRAINT ck_bulletins_featured_visible
    CHECK (is_visible OR NOT is_featured);

ALTER TABLE products
  DROP CONSTRAINT IF EXISTS ck_products_images_is_array,
  DROP CONSTRAINT IF EXISTS ck_products_featured_visible;

ALTER TABLE products
  ADD CONSTRAINT ck_products_images_is_array
    CHECK (jsonb_typeof(images) = 'array'),
  ADD CONSTRAINT ck_products_featured_visible
    CHECK (is_visible OR NOT is_featured);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS uq_products_code_not_empty
  ON products (product_code)
  WHERE product_code <> '';

CREATE INDEX IF NOT EXISTS idx_products_title_search
  ON products USING GIN (to_tsvector('simple', title));

CREATE INDEX IF NOT EXISTS idx_category_level_1_sort_visible
  ON category_level_1 (is_visible, sort_order, id);

CREATE INDEX IF NOT EXISTS idx_category_level_2_parent_sort_visible
  ON category_level_2 (category_level_1_id, is_visible, sort_order, id);

CREATE INDEX IF NOT EXISTS idx_products_category_sort_visible
  ON products (category_level_2_id, is_visible, sort_order, id);

CREATE INDEX IF NOT EXISTS idx_products_featured
  ON products (is_featured);

CREATE INDEX IF NOT EXISTS idx_products_brand
  ON products (brand);

CREATE INDEX IF NOT EXISTS idx_contact_requests_status
  ON contact_requests (status);

CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at
  ON contact_requests (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_legacy_routes_path
  ON legacy_routes (path);

CREATE INDEX IF NOT EXISTS idx_admin_users_username
  ON admin_users (username);

CREATE INDEX IF NOT EXISTS idx_admin_users_status
  ON admin_users (status);

CREATE INDEX IF NOT EXISTS idx_bulletins_type_status
  ON bulletins (bulletin_type, status);

CREATE INDEX IF NOT EXISTS idx_bulletins_published_at
  ON bulletins (published_at DESC);

CREATE INDEX IF NOT EXISTS idx_bulletins_category_visible
  ON bulletins (bulletin_type, category_id, is_visible, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_site_pages_type_visible
  ON site_pages (page_type, is_visible, sort_order, id);

-- Foreign keys (added conditionally to avoid duplicate-constraint errors)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contact_requests_vehicle_id_fkey'
  ) THEN
    ALTER TABLE contact_requests
      ADD CONSTRAINT contact_requests_vehicle_id_fkey
      FOREIGN KEY (vehicle_id) REFERENCES products(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bulletins_category_id_fkey'
  ) THEN
    ALTER TABLE bulletins
      ADD CONSTRAINT bulletins_category_id_fkey
      FOREIGN KEY (category_id) REFERENCES category_level_2(id) ON DELETE SET NULL;
  END IF;
END $$;

COMMIT;
