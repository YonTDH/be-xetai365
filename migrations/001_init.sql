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

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(120) NOT NULL UNIQUE,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  phone VARCHAR(32) NOT NULL DEFAULT '',
  role VARCHAR(40) NOT NULL DEFAULT 'customer',
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at DESC);

CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id BIGSERIAL PRIMARY KEY,
  cart_id UUID NOT NULL REFERENCES carts (id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_vnd BIGINT NOT NULL CHECK (unit_price_vnd >= 0),
  thumbnail TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cart_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items (cart_id);

CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(60) NOT NULL UNIQUE,
  status VARCHAR(40) NOT NULL DEFAULT 'pending',
  customer_full_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL DEFAULT '',
  customer_address TEXT NOT NULL,
  subtotal_vnd BIGINT NOT NULL CHECK (subtotal_vnd >= 0),
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_vnd BIGINT NOT NULL CHECK (unit_price_vnd >= 0),
  line_total_vnd BIGINT NOT NULL CHECK (line_total_vnd >= 0),
  thumbnail TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);
