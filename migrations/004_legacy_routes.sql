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

CREATE INDEX IF NOT EXISTS idx_legacy_routes_path
  ON legacy_routes (path);

