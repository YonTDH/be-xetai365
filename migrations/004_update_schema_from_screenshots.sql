BEGIN;

-- =========================================================
-- Update schema to match the legacy admin forms in screenshots
-- =========================================================

-- 1) Product categories (supports cấp 1 / cấp 2 in same table)
ALTER TABLE vehicle_categories
  ADD COLUMN IF NOT EXISTS title_seo TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS keywords TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS admin_level SMALLINT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS admin_note TEXT NOT NULL DEFAULT '';

UPDATE vehicle_categories
SET admin_level = CASE WHEN parent_id IS NULL THEN 1 ELSE 2 END
WHERE admin_level IS DISTINCT FROM CASE WHEN parent_id IS NULL THEN 1 ELSE 2 END;

CREATE INDEX IF NOT EXISTS idx_vehicle_categories_level_parent
  ON vehicle_categories (admin_level, parent_id, sort_order, id);

-- 2) Products / vehicles: add legacy admin fields shown in the form
ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS title_seo TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS keywords TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS meta_description TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS msp VARCHAR(120) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_vehicles_sort_visible
  ON vehicles (category_id, is_visible, sort_order, id);

-- Ensure vehicles.id can auto-increment for legacy-style inserts without explicit id
CREATE SEQUENCE IF NOT EXISTS vehicles_id_seq;

SELECT setval(
  'vehicles_id_seq',
  COALESCE((SELECT MAX(id) FROM vehicles), 0) + 1,
  false
);

ALTER TABLE vehicles
  ALTER COLUMN id SET DEFAULT nextval('vehicles_id_seq');

-- Keep SEO data in sync with the simple legacy text columns.
UPDATE vehicles
SET
  title_seo = COALESCE(NULLIF(TRIM(title_seo), ''), NULLIF(TRIM(seo->>'title'), ''), title),
  meta_description = COALESCE(NULLIF(TRIM(meta_description), ''), NULLIF(TRIM(seo->>'description'), ''), short_description),
  keywords = COALESCE(NULLIF(TRIM(keywords), ''), NULLIF(TRIM(seo->>'keywords'), ''), ''),
  image_url = COALESCE(
    NULLIF(TRIM(image_url), ''),
    NULLIF(TRIM((images->0->>'url')), ''),
    NULLIF(TRIM((images->0->>'src')), ''),
    NULLIF(TRIM((images->0)::text), ''),
    ''
  );

-- 3) News / promotions: enrich the existing bulletins table
ALTER TABLE bulletins
  ADD COLUMN IF NOT EXISTS category_id BIGINT NULL REFERENCES vehicle_categories (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS description_short TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS title_seo TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS keywords TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS meta_description TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_bulletins_category_visible
  ON bulletins (bulletin_type, category_id, is_visible, published_at DESC);

UPDATE bulletins
SET
  name = COALESCE(NULLIF(TRIM(name), ''), title),
  description_short = COALESCE(NULLIF(TRIM(description_short), ''), excerpt),
  title_seo = COALESCE(NULLIF(TRIM(title_seo), ''), NULLIF(TRIM(seo->>'title'), ''), title),
  keywords = COALESCE(NULLIF(TRIM(keywords), ''), NULLIF(TRIM(seo->>'keywords'), ''), ''),
  meta_description = COALESCE(NULLIF(TRIM(meta_description), ''), NULLIF(TRIM(seo->>'description'), ''), excerpt);

-- 4) Company introduction / static pages (matches "Về chúng tôi")
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

CREATE INDEX IF NOT EXISTS idx_site_pages_type_visible
  ON site_pages (page_type, is_visible, sort_order, id);

-- =========================================================
-- Seed data based on the screenshots
-- =========================================================

-- Level 1 categories
INSERT INTO vehicle_categories (
  slug, name, type, description, parent_id,
  title_seo, keywords, image_url, sort_order, is_visible, admin_level, updated_at
)
VALUES
  (
    'xe-tai',
    'XE TẢI',
    'product-list',
    'Danh mục xe tải các loại.',
    NULL,
    'XE TẢI, XE TẢI NHẸ, XE TẢI TRUNG, XE TẢI NẶNG',
    'xe tải, xe tải nhẹ, xe tải trung, xe tải nặng',
    '',
    1,
    TRUE,
    1,
    NOW()
  ),
  (
    'xe-chuyen-dung',
    'XE CHUYÊN DỤNG',
    'product-list',
    E'Điện Thoại : 0986.424.879 - 0902.778.220\nEmail : tanthong342@gmail.com\nWebsite : xetai365.vn\nCông ty chúng tôi chuyên phân phối chính thức các dòng xe tải nhập khẩu đã có mặt trên thị trường gần 40 năm có thương hiệu nổi tiếng như : KAMAZ - DONGFENG HOÀNG HUY - ĐẦU KÉO MỸ INTERNATIONAL - HOWO SINOTRUK - MAZ - ...',
    NULL,
    'XE CHUYÊN DỤNG, XE CHUYÊN DỤNG DONGFENG, XE CHUYÊN DỤNG CHỞ Ô TÔ, XE CHUYÊN DỤNG ISUZU, XE CHUYÊN DỤNG NHẬP KHẨU, XE CHUYÊN DỤNG CŨ, XE CHUYÊN DỤNG HINO, XE CHUYÊN DỤNG HYUNDAI',
    'XE CHUYEN DUNG, XE CHUYEN DUNG DONGFENG, XE CHUYEN DUNG CHO O TO, XE CHUYEN DUNG ISUZU, XE CHUYEN DUNG NHAP KHAU, XE CHUYEN DUNG CU, XE CHUYEN DUNG HINO, XE CHUYEN DUNG HYUNDAI, XE CUYEN DUNG TRUNG QUOC, XE CHUYEN DUNG CAI TAO, XE CHUYEN DUNG HOA HIEP, XECHUYEN DUNG SAMCO, XE CHUYEN DUNG HUT BE PHOT, XE CHUYEN DUNG CHO TOT.',
    '/uploads/categories/xe-chuyen-dung.jpg',
    1,
    TRUE,
    1,
    NOW()
  )
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  title_seo = EXCLUDED.title_seo,
  keywords = EXCLUDED.keywords,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order,
  is_visible = EXCLUDED.is_visible,
  admin_level = EXCLUDED.admin_level,
  updated_at = NOW();

-- Level 2 categories
INSERT INTO vehicle_categories (
  slug, name, type, description, parent_id,
  title_seo, keywords, image_url, sort_order, is_visible, admin_level, updated_at
)
SELECT
  'chenglong',
  'CHENGLONG',
  'product-list',
  '',
  vc.id,
  '',
  '',
  '/uploads/categories/chenglong.png',
  1,
  TRUE,
  2,
  NOW()
FROM vehicle_categories vc
WHERE vc.slug = 'xe-tai'
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  parent_id = EXCLUDED.parent_id,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order,
  is_visible = EXCLUDED.is_visible,
  admin_level = EXCLUDED.admin_level,
  updated_at = NOW();

INSERT INTO vehicle_categories (
  slug, name, type, description, parent_id,
  title_seo, keywords, image_url, sort_order, is_visible, admin_level, updated_at
)
SELECT
  'teraco',
  'TERACO',
  'product-list',
  '',
  vc.id,
  '',
  '',
  '/uploads/categories/teraco.png',
  1,
  TRUE,
  2,
  NOW()
FROM vehicle_categories vc
WHERE vc.slug = 'xe-tai'
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  parent_id = EXCLUDED.parent_id,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order,
  is_visible = EXCLUDED.is_visible,
  admin_level = EXCLUDED.admin_level,
  updated_at = NOW();

-- Sample product from screenshot
INSERT INTO vehicles (
  category_id, slug, legacy_path, title, sku, msp, brand, vehicle_type,
  short_description, content, images, seo,
  title_seo, keywords, meta_description, image_url,
  sort_order, is_visible, updated_at
)
SELECT
  vc.id,
  'tera245sl-2-tan-4',
  '/xe-tai/teraco/tera245sl-2-tan-4',
  'TERA245SL 2 TẤN 4, tiết kiệm nhiên liệu, máy khỏe. Hộp số nhẹ, sang số êm.',
  '',
  '',
  'TERACO',
  'truck',
  'Động cơ: ISUZU JE493ZLQ4, dung tích 2.771 cc, công suất 106 mã lực tại 3.400 vòng/phút, mô-men xoắn cực đại 257 Nm tại 2.000 vòng/phút.',
  E'Nếu bạn đang cần tìm một chiếc xe tải nhỏ gọn, dễ chạy trong phố nhưng vẫn chở được nhiều hàng, thì Tera 245SL chắc chắn là cái tên nên cân nhắc.\n\nVới tải trọng 2.4 tấn, thùng dài, mẫu xe này được nhiều anh em chạy hàng nhẹ, hàng công kênh lựa chọn.',
  '[{"url":"/uploads/products/tera245sl-banner.jpg"}]'::jsonb,
  jsonb_build_object(
    'title', 'Đánh Giá Xe Tải Tera 245SL Mới Nhất – Có Nên Mua Không?',
    'keywords', 'TERA245SL THÙNG BẠT, TERA245SL THÙNG KÍN, TERA245SL THÙNG LỬNG, xe tải Tera 245SL, Tera 245SL 2.4 tấn, xe tải Daehan Tera 245SL, giá xe Tera 245SL mới nhất, xe tải Tera 2t4 thùng dài, mua xe Tera 245SL ở đâu, xe Tera 245SL có tốt không, so sánh Tera 245SL và các dòng cùng phân khúc, tư vấn xe tải dưới 3 tấn, xe tải mới 2025 giá tốt',
    'description', 'Động cơ: ISUZU JE493ZLQ4, dung tích 2.771 cc, công suất 106 mã lực tại 3.400 vòng/phút, mô-men xoắn cực đại 257 Nm tại 2.000 vòng/phút.',
    'imageUrl', '/uploads/products/tera245sl-banner.jpg'
  ),
  'Đánh Giá Xe Tải Tera 245SL Mới Nhất – Có Nên Mua Không?',
  'TERA245SL THÙNG BẠT, TERA245SL THÙNG KÍN, TERA245SL THÙNG LỬNG, xe tải Tera 245SL, Tera 245SL 2.4 tấn, xe tải Daehan Tera 245SL, giá xe Tera 245SL mới nhất, xe tải Tera 2t4 thùng dài, mua xe Tera 245SL ở đâu, xe Tera 245SL có tốt không, so sánh Tera 245SL và các dòng cùng phân khúc, tư vấn xe tải dưới 3 tấn, xe tải mới 2025 giá tốt',
  'Động cơ: ISUZU JE493ZLQ4, dung tích 2.771 cc, công suất 106 mã lực tại 3.400 vòng/phút, mô-men xoắn cực đại 257 Nm tại 2.000 vòng/phút.',
  '/uploads/products/tera245sl-banner.jpg',
  1,
  TRUE,
  NOW()
FROM vehicle_categories vc
WHERE vc.slug = 'teraco'
ON CONFLICT (slug) DO UPDATE
SET
  category_id = EXCLUDED.category_id,
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  content = EXCLUDED.content,
  images = EXCLUDED.images,
  seo = EXCLUDED.seo,
  title_seo = EXCLUDED.title_seo,
  keywords = EXCLUDED.keywords,
  meta_description = EXCLUDED.meta_description,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order,
  is_visible = EXCLUDED.is_visible,
  updated_at = NOW();

-- Static page / company introduction from screenshot
INSERT INTO site_pages (
  slug, page_type, title, greeting, content, image_url, keywords, meta_description,
  sort_order, is_visible, updated_at
)
VALUES (
  'ho-so-phap-ly-ho-so-nang-luc',
  'company',
  'XE TẢI 365/ HỒ SƠ PHÁP LÝ / HỒ SƠ NĂNG LỰC.',
  E'XETAI365 ( HOPNHATGROUP) được bổ nhiệm là đại lý chính thức từ các thương hiệu nổi tiếng như : TERACO, HYUNDA, HINO, ISUZU, JAC, FOTON THẠNH CÔNG, DONGFENG ,HOWO, CHENGLONG, CMC, DOOSUNG, THACO. Xin trân trọng kính chào Quý khách. Cám ơn Quý khách đã quan tâm đến sản phẩm của chúng tôi. Công ty chúng tôi xin gửi tới Quý khách Những sản phẩm tốt nhất của Công ty với mong muốn tạo điều kiện cho Quý khách tham khảo và lựa chọn cho mình sản phẩm có chất lượng tốt nhất với giá cả phù hợp nhất thị trường hiện nay.',
  '<p><img src="/uploads/pages/nam-viet-binh-phuoc.jpg" alt="Nam Việt Bình Phước"></p>',
  '/uploads/pages/nam-viet-binh-phuoc.jpg',
  'XE TẢI 365 GROUP được bổ nhiệm là đại lý chính thức của thương hiệu HYUNDAI, MAN, HINO, ISUZU, MITSUBISHI, SUZUKI, FAW, INTERNATIONAL, HOÀNG HUY, DONGFENG, HOWO, CHENGLONG, CMC, DOOSUNG, THACO...',
  'XE TẢI 365 GROUP được bổ nhiệm là đại lý chính thức của thương hiệu HYUNDAI, MAN, HINO, ISUZU, MITSUBISHI, SUZUKI, FAW, INTERNATIONAL, HOÀNG HUY, DONGFENG, HOWO, CHENGLONG, CMC, DOOSUNG, THACO...',
  1,
  TRUE,
  NOW()
)
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  greeting = EXCLUDED.greeting,
  content = EXCLUDED.content,
  image_url = EXCLUDED.image_url,
  keywords = EXCLUDED.keywords,
  meta_description = EXCLUDED.meta_description,
  sort_order = EXCLUDED.sort_order,
  is_visible = EXCLUDED.is_visible,
  updated_at = NOW();

-- Promotion from screenshot
INSERT INTO bulletins (
  slug, bulletin_type, category_id, title, name, excerpt, description_short, content,
  status, image_url, title_seo, keywords, meta_description,
  sort_order, is_visible, published_at, seo, updated_at
)
SELECT
  'sieu-uu-dai-chao-he-tang-100-le-phi-truoc-ba-khi-mua-tera190sl-tera345sl',
  'promotion',
  NULL,
  'SIÊU ƯU ĐÃI CHÀO HÈ – TẶNG 100% LỆ PHÍ TRƯỚC BẠ KHI MUA TERA190SL & TERA345SL',
  'SIÊU ƯU ĐÃI CHÀO HÈ – TẶNG 100% LỆ PHÍ TRƯỚC BẠ KHI MUA TERA190SL & TERA345SL',
  'Từ ngày 18/5 – 18/6/2023, khách hàng sẽ nhận được mức hỗ trợ 100% lệ phí trước bạ (Quy đổi 10.000.000 đồng tiền mặt) khi mua 2 mẫu xe tải nhẹ thùng dài TERA190SL & TERA345SL tại hệ thống Đại lý ủy quyền chính thức của Daehan Motors trên toàn quốc.',
  'Từ ngày 18/5 – 18/6/2023, khách hàng sẽ nhận được mức hỗ trợ 100% lệ phí trước bạ (Quy đổi 10.000.000 đồng tiền mặt) khi mua 2 mẫu xe tải nhẹ thùng dài TERA190SL & TERA345SL tại hệ thống Đại lý ủy quyền chính thức của Daehan Motors trên toàn quốc.',
  E'<h1>SIÊU ƯU ĐÃI CHÀO HÈ – TẶNG 100% LỆ PHÍ TRƯỚC BẠ KHI MUA TERA190SL &amp; TERA345SL</h1>\n<p>Khởi đầu mùa hè sôi động, Daehan Motors triển khai chương trình “SIÊU ƯU ĐÃI CHÀO HÈ”, nhằm hỗ trợ và mang đến cơ hội sở hữu xe tải nhẹ TERACO một cách dễ dàng hơn cho khách hàng trên toàn quốc.</p>\n<p><img src="/uploads/promotions/tera190sl-tera345sl-uu-dai.jpg" alt="Khuyến mại TERA190SL và TERA345SL"></p>',
  'published',
  '/uploads/promotions/tera190sl-tera345sl-uu-dai.jpg',
  'SIÊU ƯU ĐÃI CHÀO HÈ – TẶNG 100% LỆ PHÍ TRƯỚC BẠ KHI MUA TERA190SL & TERA345SL',
  'Xe tải Teraco 190 SL, Xe tải Toyota Teraco 190 SL, Xe tải Teraco 190 SL 1.9 tấn, Xe tải Teraco 190 SL thùng mui bạt, Xe tải Teraco 190 SL thùng kín, Xe tải Teraco 190 SL động cơ diesel, Xe tải Teraco 190 SL giá rẻ, Xe tải Teraco 190 SL đời mới, Xe tải Teraco 190 SL nhập khẩu, Xe tải Teraco 190 SL cabin đơn, Xe tải Teraco 190 SL cabin kép, Xe tải Teraco 190 SL có thùng lửng, Xe tải Teraco 190 SL có thùng đông lạnh',
  'Từ ngày 18/5 – 18/6/2023, khách hàng sẽ nhận được mức hỗ trợ 100% lệ phí trước bạ (Quy đổi 10.000.000 đồng tiền mặt) khi mua 2 mẫu xe tải nhẹ thùng dài TERA190SL & TERA345SL tại hệ thống Đại lý ủy quyền chính thức của Daehan Motors trên toàn quốc.',
  1,
  TRUE,
  TIMESTAMPTZ '2023-05-18 00:00:00+07',
  jsonb_build_object(
    'title', 'SIÊU ƯU ĐÃI CHÀO HÈ – TẶNG 100% LỆ PHÍ TRƯỚC BẠ KHI MUA TERA190SL & TERA345SL',
    'keywords', 'Xe tải Teraco 190 SL, Xe tải Toyota Teraco 190 SL, Xe tải Teraco 190 SL 1.9 tấn, Xe tải Teraco 190 SL thùng mui bạt, Xe tải Teraco 190 SL thùng kín',
    'description', 'Từ ngày 18/5 – 18/6/2023, khách hàng sẽ nhận được mức hỗ trợ 100% lệ phí trước bạ khi mua TERA190SL & TERA345SL.',
    'imageUrl', '/uploads/promotions/tera190sl-tera345sl-uu-dai.jpg'
  ),
  NOW()
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  name = EXCLUDED.name,
  excerpt = EXCLUDED.excerpt,
  description_short = EXCLUDED.description_short,
  content = EXCLUDED.content,
  image_url = EXCLUDED.image_url,
  title_seo = EXCLUDED.title_seo,
  keywords = EXCLUDED.keywords,
  meta_description = EXCLUDED.meta_description,
  sort_order = EXCLUDED.sort_order,
  is_visible = EXCLUDED.is_visible,
  published_at = EXCLUDED.published_at,
  seo = EXCLUDED.seo,
  updated_at = NOW();

COMMIT;
