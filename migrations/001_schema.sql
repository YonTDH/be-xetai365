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

CREATE TABLE IF NOT EXISTS vehicle_categories (
  id BIGINT PRIMARY KEY,
  slug VARCHAR(160) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(80) NOT NULL DEFAULT 'product-list',
  description TEXT NOT NULL DEFAULT '',
  parent_id BIGINT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE vehicle_categories
  ADD COLUMN IF NOT EXISTS parent_id BIGINT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_vehicle_categories_parent'
  ) THEN
    ALTER TABLE vehicle_categories
      ADD CONSTRAINT fk_vehicle_categories_parent
      FOREIGN KEY (parent_id) REFERENCES vehicle_categories (id)
      ON DELETE SET NULL;
  END IF;
END $$;

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

CREATE TABLE IF NOT EXISTS contact_requests (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(200) NOT NULL DEFAULT '',
  phone VARCHAR(40) NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  vehicle_id BIGINT NULL REFERENCES vehicles (id) ON DELETE SET NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'new',
  contacted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

CREATE INDEX IF NOT EXISTS idx_vehicle_categories_slug
  ON vehicle_categories (slug);

CREATE INDEX IF NOT EXISTS idx_vehicle_categories_parent_id
  ON vehicle_categories (parent_id);

CREATE INDEX IF NOT EXISTS idx_vehicles_category_id
  ON vehicles (category_id);

CREATE INDEX IF NOT EXISTS idx_vehicles_status
  ON vehicles (status);

CREATE INDEX IF NOT EXISTS idx_vehicles_featured
  ON vehicles (is_featured);

CREATE INDEX IF NOT EXISTS idx_vehicles_brand
  ON vehicles (brand);

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

CREATE SEQUENCE IF NOT EXISTS vehicle_categories_id_seq;

SELECT setval(
  'vehicle_categories_id_seq',
  COALESCE((SELECT MAX(id) FROM vehicle_categories), 0) + 1,
  false
);

ALTER TABLE vehicle_categories
  ALTER COLUMN id SET DEFAULT nextval('vehicle_categories_id_seq');

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS users;

UPDATE vehicle_categories
SET
  name = CASE
    WHEN slug = 'xe-tai-thung' THEN 'Xe tải thùng'
    WHEN slug = 'xe-dau-keo' THEN 'Xe đầu kéo'
    WHEN slug = 'xe-tai' THEN 'Xe tải'
    WHEN slug = 'xe-chuyen-dung' THEN 'Xe chuyên dụng'
    WHEN slug = 'so-mi-ro-mooc' THEN 'Sơ mi rơ moóc'
    WHEN slug = 'dau-keo-my' THEN 'Đầu kéo Mỹ'
    ELSE name
  END,
  description = CASE
    WHEN slug = 'xe-tai-thung' THEN 'Dòng xe tải thùng kín, thùng bạt và thùng lửng.'
    WHEN slug = 'xe-dau-keo' THEN 'Nhóm xe đầu kéo'
    WHEN slug = 'xe-tai' THEN 'Xe tải thùng, xe tải nhẹ, xe tải trung và nặng.'
    WHEN slug = 'xe-chuyen-dung' THEN 'Xe ben, xe bồn, xe cẩu và các dòng xe chuyên dụng.'
    WHEN slug = 'so-mi-ro-mooc' THEN 'Các dòng sơ mi rơ moóc phục vụ vận tải hàng hóa.'
    WHEN slug = 'dau-keo-my' THEN 'Đầu kéo Mỹ'
    ELSE description
  END,
  updated_at = NOW()
WHERE slug IN (
  'xe-tai-thung',
  'xe-dau-keo',
  'xe-tai',
  'xe-chuyen-dung',
  'so-mi-ro-mooc',
  'dau-keo-my'
);

UPDATE vehicles
SET
  title = 'Dongfeng B180 thùng bạt 2023',
  short_description = 'Xe tải thùng bạt máy Cummins, phù hợp vận tải liên tỉnh.',
  content = 'Dongfeng B180 đời 2023, thùng bạt dài 6m2, máy mạnh, nội thất còn đẹp và đã có hồ sơ sang tên nhanh.',
  seo = jsonb_build_object(
    'title', 'Dongfeng B180 thùng bạt 2023 | XeTải365',
    'description', 'Thông tin chi tiết Dongfeng B180 thùng bạt 2023 tại XeTải365.'
  ),
  updated_at = NOW()
WHERE slug = 'dongfeng-b180-thung-bat-2023';

UPDATE vehicles
SET
  title = 'Hyundai HD72 thùng kín 2022',
  short_description = 'Xe tải thùng kín phục vụ giao nhận nội thành và liên tỉnh.',
  content = 'Hyundai HD72 đăng ký 2022, máy zin, thùng kín 5m1, phù hợp vận chuyển hàng gia dụng và thực phẩm khô.',
  seo = jsonb_build_object(
    'title', 'Hyundai HD72 thùng kín 2022 | XeTải365',
    'description', 'Giá bán và tình trạng Hyundai HD72 thùng kín 2022.'
  ),
  updated_at = NOW()
WHERE slug = 'hyundai-hd72-thung-kin-2022';

UPDATE vehicles
SET
  title = 'Isuzu FRR 90N 2024',
  short_description = 'Dòng xe tải trung mới, tải trọng linh hoạt cho doanh nghiệp vận tải.',
  content = 'Isuzu FRR 90N đời 2024, máy Euro 5, thiết kế cabin rộng, tiết kiệm nhiên liệu và phù hợp chạy đường dài.',
  seo = jsonb_build_object(
    'title', 'Isuzu FRR 90N 2024 | XeTải365',
    'description', 'Thông tin sản phẩm Isuzu FRR 90N 2024 và giá dự kiến.'
  ),
  updated_at = NOW()
WHERE slug = 'isuzu-frr-90n-2024';

UPDATE vehicles
SET
  title = 'Howo A7 đầu kéo 2021',
  short_description = 'Xe đầu kéo đã qua sử dụng, phù hợp khai thác container.',
  content = 'Howo A7 2021, cầu láp đẹp, nội thất nguyên bản, đã từng chạy tuyến Nam Bắc và bảo dưỡng định kỳ.',
  seo = jsonb_build_object(
    'title', 'Howo A7 đầu kéo 2021 | XeTải365',
    'description', 'Thông tin Howo A7 đầu kéo 2021 đã qua sử dụng.'
  ),
  updated_at = NOW()
WHERE slug = 'howo-a7-dau-keo-2021';

UPDATE vehicles
SET
  title = 'Hino FG8JJSB xe ben 2024',
  short_description = 'Xe ben 3 chân phục vụ công trình và khai thác vật liệu.',
  content = 'Hino FG8JJSB 2024, thùng ben đóng cơ, khung gầm chắc chắn, phù hợp công trình và vận tải vật liệu xây dựng.',
  seo = jsonb_build_object(
    'title', 'Hino FG8JJSB xe ben 2024 | XeTải365',
    'description', 'Xe ben Hino FG8JJSB 2024, thông số và giá bán tham khảo.'
  ),
  updated_at = NOW()
WHERE slug = 'hino-fg8jjsb-xe-ben-2024';

UPDATE settings
SET
  title = 'Xe tải - Xe đầu kéo - Xe chuyên dụng',
  keywords = 'dongfeng, howo, hyundai, xe tải',
  description = 'Thông tin cấu hình website và liên hệ cho XeTải365',
  ten = 'XE TẢI 365 GROUP',
  diachi = 'Số 16, Đường Dẫn Cầu Phú Long, Bình Dương',
  updated_at = NOW()
WHERE id = 1;
