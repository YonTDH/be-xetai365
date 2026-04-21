CREATE TABLE IF NOT EXISTS vehicle_categories (
  id BIGINT PRIMARY KEY,
  slug VARCHAR(160) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(80) NOT NULL DEFAULT 'product-list',
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id BIGINT PRIMARY KEY,
  category_id BIGINT NOT NULL REFERENCES vehicle_categories (id),
  slug VARCHAR(220) NOT NULL UNIQUE,
  legacy_path VARCHAR(255) NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  sku VARCHAR(120) NOT NULL DEFAULT '',
  brand VARCHAR(120) NOT NULL DEFAULT '',
  vehicle_type VARCHAR(80) NOT NULL DEFAULT '',
  condition VARCHAR(40) NOT NULL DEFAULT '',
  year INTEGER NOT NULL DEFAULT 0,
  mileage_km INTEGER NOT NULL DEFAULT 0,
  fuel_type VARCHAR(40) NOT NULL DEFAULT '',
  transmission VARCHAR(40) NOT NULL DEFAULT '',
  price_vnd BIGINT NOT NULL DEFAULT 0,
  status VARCHAR(40) NOT NULL DEFAULT 'available',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  location VARCHAR(255) NOT NULL DEFAULT '',
  short_description TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_categories_slug
  ON vehicle_categories (slug);

CREATE INDEX IF NOT EXISTS idx_vehicles_category_id
  ON vehicles (category_id);

CREATE INDEX IF NOT EXISTS idx_vehicles_status
  ON vehicles (status);

CREATE INDEX IF NOT EXISTS idx_vehicles_featured
  ON vehicles (is_featured);

CREATE INDEX IF NOT EXISTS idx_vehicles_brand
  ON vehicles (brand);
