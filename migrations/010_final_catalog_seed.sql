BEGIN;

-- Final consolidated catalog seed.
-- This normalizes category labels, removes legacy/demo catalog products,
-- and recreates the current catalog product list with empty images.

INSERT INTO category_level_1 (slug, name, description, title_seo, keywords, sort_order, is_visible, updated_at)
VALUES
  ('xe-tai', U&'Xe t\1EA3i', U&'Danh m\1EE5c xe t\1EA3i', U&'Xe t\1EA3i', U&'xe t\1EA3i', 1, TRUE, NOW()),
  ('xe-chuyen-dung', U&'Xe chuy\00EAn d\1EE5ng', U&'Danh m\1EE5c xe chuy\00EAn d\1EE5ng', U&'Xe chuy\00EAn d\1EE5ng', U&'xe chuy\00EAn d\1EE5ng', 2, TRUE, NOW()),
  ('so-mi-ro-mooc', 'Somiromooc', 'Danh muc Somiromooc', 'Somiromooc', 'Somiromooc', 3, TRUE, NOW()),
  ('xe-dau-keo', U&'Xe \0111\1EA7u k\00E9o', U&'Danh m\1EE5c xe \0111\1EA7u k\00E9o', U&'Xe \0111\1EA7u k\00E9o', U&'xe \0111\1EA7u k\00E9o', 4, TRUE, NOW())
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  title_seo = EXCLUDED.title_seo,
  keywords = EXCLUDED.keywords,
  sort_order = EXCLUDED.sort_order,
  is_visible = EXCLUDED.is_visible,
  updated_at = NOW();

INSERT INTO category_level_2 (
  category_level_1_id, slug, name, description, title_seo, keywords,
  sort_order, is_visible, admin_note, created_at, updated_at
)
SELECT
  c1.id, v.slug, v.name, '', v.name, '',
  v.sort_order, TRUE, 'Managed by final consolidated catalog seed', NOW(), NOW()
FROM (
  VALUES
    ('xe-cu', U&'Xe c\0169', 'xe-tai', 90),
    ('xe-tai-teraco', U&'Xe t\1EA3i Teraco', 'xe-tai', 101),
    ('xe-tai-dongfeng', U&'Xe t\1EA3i Dongfeng', 'xe-tai', 102),
    ('xe-tai-hyundai', U&'Xe t\1EA3i Hyundai', 'xe-tai', 103),
    ('tong-hop-xe-tai', U&'T\1ED5ng h\1EE3p xe t\1EA3i', 'xe-tai', 900),
    ('xe-ep-rac', U&'Xe \00E9p r\00E1c', 'xe-chuyen-dung', 201),
    ('xe-chua-chay', U&'Xe ch\1EEFa ch\00E1y', 'xe-chuyen-dung', 202),
    ('xe-cau', U&'Xe c\1EA9u', 'xe-chuyen-dung', 203),
    ('xitec-xang-dau', U&'Xi t\00E9c x\0103ng d\1EA7u', 'xe-chuyen-dung', 204),
    ('xe-dong-lanh', U&'Xe \0111\00F4ng l\1EA1nh', 'xe-chuyen-dung', 205),
    ('xe-cho-xe-co-gioi', U&'Xe ch\1EDF xe c\01A1 gi\1EDBi', 'xe-chuyen-dung', 206),
    ('xe-ben', U&'Xe ben', 'xe-chuyen-dung', 207),
    ('xe-cuu-ho-giao-thong', U&'Xe c\1EE9u h\1ED9 giao th\00F4ng', 'xe-chuyen-dung', 208),
    ('xe-tuoi-nuoc', U&'Xe t\01B0\1EDBi n\01B0\1EDBc', 'xe-chuyen-dung', 209),
    ('xe-hut-chat-thai', U&'Xe h\00FAt ch\1EA5t th\1EA3i', 'xe-chuyen-dung', 210),
    ('thung-kin-chuyen-dung', U&'Th\00F9ng k\00EDn chuy\00EAn d\1EE5ng', 'xe-chuyen-dung', 211),
    ('bon-xitec-chuyen-dung', U&'B\1ED3n xi t\00E9c chuy\00EAn d\1EE5ng', 'xe-chuyen-dung', 212),
    ('tan-thanh', U&'T\00E2n Th\00E0nh', 'xe-chuyen-dung', 213),
    ('tong-hop-xe-chuyen-dung', U&'T\1ED5ng h\1EE3p xe chuy\00EAn d\1EE5ng', 'xe-chuyen-dung', 901),
    ('dau-keo-my', U&'\0110\1EA7u k\00E9o M\1EF9', 'xe-dau-keo', 301),
    ('dau-keo-maz', U&'\0110\1EA7u k\00E9o Maz', 'xe-dau-keo', 302),
    ('dau-keo-dongfeng', U&'\0110\1EA7u k\00E9o Dongfeng', 'xe-dau-keo', 303),
    ('dau-keo-howo', U&'\0110\1EA7u k\00E9o Howo', 'xe-dau-keo', 304),
    ('tong-hop-xe-dau-keo', U&'T\1ED5ng h\1EE3p xe \0111\1EA7u k\00E9o', 'xe-dau-keo', 902),
    ('so-mi-ro-mooc-ben', 'Somiromooc ben', 'so-mi-ro-mooc', 401),
    ('so-mi-ro-mooc-long', 'Somiromooc long', 'so-mi-ro-mooc', 402),
    ('so-mi-ro-mooc-phu-tung', 'Phu tung Somiromooc', 'so-mi-ro-mooc', 403),
    ('so-mi-ro-mooc-bon', 'Somiromooc bon', 'so-mi-ro-mooc', 404),
    ('so-mi-ro-mooc-xitec', 'Somiromooc xitec', 'so-mi-ro-mooc', 405),
    ('tong-hop-so-mi-ro-mooc', 'Tong hop Somiromooc', 'so-mi-ro-mooc', 903)
) AS v(slug, name, parent_slug, sort_order)
JOIN category_level_1 c1 ON c1.slug = v.parent_slug
ON CONFLICT (slug) DO UPDATE
SET
  category_level_1_id = EXCLUDED.category_level_1_id,
  name = EXCLUDED.name,
  title_seo = EXCLUDED.title_seo,
  sort_order = EXCLUDED.sort_order,
  is_visible = TRUE,
  admin_note = EXCLUDED.admin_note,
  updated_at = NOW();

DELETE FROM products p
USING category_level_2 c2, category_level_1 c1
WHERE p.category_level_2_id = c2.id
  AND c2.category_level_1_id = c1.id
  AND c1.slug IN ('xe-tai', 'xe-chuyen-dung', 'xe-dau-keo', 'so-mi-ro-mooc');

WITH product_seed (
  category_slug,
  product_code,
  slug,
  legacy_path,
  title,
  short_description,
  content,
  technical_specs,
  price_vnd,
  unit,
  status,
  brand,
  vehicle_type,
  condition,
  year,
  mileage_km,
  fuel_type,
  transmission,
  location,
  images,
  seo,
  title_seo,
  keywords,
  meta_description,
  image_url,
  is_featured,
  is_visible,
  sort_order
) AS (
  VALUES
    ('xe-tai-teraco', '', 'tera245sl-2-tan-4-tiet-kiem-nhien-lieu-may-khoe-hop-so-nhe-sang-so-em', '/san-pham/tera245sl-2-tan-4-tiet-kiem-nhien-lieu-may-khoe-hop-so-nhe-sang-so-em', 'TERA245SL 2 TẦN 4 , tiết kiệm nhiên liệu, máy khỏe. Hộp số nhẹ, sang số êm.', 'TERA245SL 2 TẦN 4 , tiết kiệm nhiên liệu, máy khỏe. Hộp số nhẹ, sang số êm.', '', '{}', '0.00', 'unit', 'available', 'Teraco', '', '', '0', '0', '', '', '', '[]', '{}', 'TERA245SL 2 TẦN 4 , tiết kiệm nhiên liệu, máy khỏe. Hộp số nhẹ, sang số êm.', '', 'TERA245SL 2 TẦN 4 , tiết kiệm nhiên liệu, máy khỏe. Hộp số nhẹ, sang số êm.', '', 'false', 'true', '1'),
    ('xe-tai-dongfeng', '', 'tram-bao-hanh-xe-tai-dongfeng-4-chan-cummins-isl315-tai-17-9-tan-mien-nam', '/san-pham/tram-bao-hanh-xe-tai-dongfeng-4-chan-cummins-isl315-tai-17-9-tan-mien-nam', 'TRAM BẢO HÀNH XE TẢI DONGFENG 4 CHÂN Cummins ISL315 TẢI 17.9 TẦN MIỀN NAM', 'TRAM BẢO HÀNH XE TẢI DONGFENG 4 CHÂN Cummins ISL315 TẢI 17.9 TẦN MIỀN NAM', '', '{}', '0.00', 'unit', 'available', 'Dongfeng', '', '', '0', '0', '', '', '', '[]', '{}', 'TRAM BẢO HÀNH XE TẢI DONGFENG 4 CHÂN Cummins ISL315 TẢI 17.9 TẦN MIỀN NAM', '', 'TRAM BẢO HÀNH XE TẢI DONGFENG 4 CHÂN Cummins ISL315 TẢI 17.9 TẦN MIỀN NAM', '', 'false', 'true', '2'),
    ('xe-tai-teraco', '', 'tera345sl-3t5', '/san-pham/tera345sl-3t5', 'TERA345SL 3T5', 'TERA345SL 3T5', '', '{}', '0.00', 'unit', 'available', 'Teraco', '', '', '0', '0', '', '', '', '[]', '{}', 'TERA345SL 3T5', '', 'TERA345SL 3T5', '', 'false', 'true', '3'),
    ('xe-tai-teraco', '', 'tera-v8', '/san-pham/tera-v8', 'TERA V8', 'TERA V8', '', '{}', '0.00', 'unit', 'available', 'Teraco', '', '', '0', '0', '', '', '', '[]', '{}', 'TERA V8', '', 'TERA V8', '', 'false', 'true', '4'),
    ('xe-tai-dongfeng', '', 'dongfeng-b190-9t150', '/san-pham/dongfeng-b190-9t150', 'DONGFENG B190 9T150', 'DONGFENG B190 9T150', '', '{}', '0.00', 'unit', 'available', 'Dongfeng', '', '', '0', '0', '', '', '', '[]', '{}', 'DONGFENG B190 9T150', '', 'DONGFENG B190 9T150', '', 'false', 'true', '5'),
    ('xe-tai-dongfeng', '', 'gia-xe-tai-dongfeng-hoang-huy-b180-thung-inox-9-tan-moi-nhat', '/san-pham/gia-xe-tai-dongfeng-hoang-huy-b180-thung-inox-9-tan-moi-nhat', 'GIÁ XE TẢI DONGFENG HOÀNG HUY B180 THÙNG INOX 9.TẦN MỚI NHẤT', 'GIÁ XE TẢI DONGFENG HOÀNG HUY B180 THÙNG INOX 9.TẦN MỚI NHẤT', '', '{}', '0.00', 'unit', 'available', 'Dongfeng', '', '', '0', '0', '', '', '', '[]', '{}', 'GIÁ XE TẢI DONGFENG HOÀNG HUY B180 THÙNG INOX 9.TẦN MỚI NHẤT', '', 'GIÁ XE TẢI DONGFENG HOÀNG HUY B180 THÙNG INOX 9.TẦN MỚI NHẤT', '', 'false', 'true', '6'),
    ('xe-tai-dongfeng', '', 'xe-tai-dongfeng-hoang-huy-b180-mau-thung-dai-9-7-met', '/san-pham/xe-tai-dongfeng-hoang-huy-b180-mau-thung-dai-9-7-met', 'XE TẢI DONGFENG HOÀNG HUY B180 MẪU THÙNG DÀI 9.7 MÉT', 'XE TẢI DONGFENG HOÀNG HUY B180 MẪU THÙNG DÀI 9.7 MÉT', '', '{}', '0.00', 'unit', 'available', 'Dongfeng', '', '', '0', '0', '', '', '', '[]', '{}', 'XE TẢI DONGFENG HOÀNG HUY B180 MẪU THÙNG DÀI 9.7 MÉT', '', 'XE TẢI DONGFENG HOÀNG HUY B180 MẪU THÙNG DÀI 9.7 MÉT', '', 'false', 'true', '7'),
    ('xe-tai-dongfeng', '', 'xe-tai-dongfeng-hoang-huy-b180-thung-inox-7-7m-mau-moi', '/san-pham/xe-tai-dongfeng-hoang-huy-b180-thung-inox-7-7m-mau-moi', 'XE TẢI DONGFENG HOÀNG HUY B180 THÙNG INOX 7.7M MẪU MỚI', 'XE TẢI DONGFENG HOÀNG HUY B180 THÙNG INOX 7.7M MẪU MỚI', '', '{}', '0.00', 'unit', 'available', 'Dongfeng', '', '', '0', '0', '', '', '', '[]', '{}', 'XE TẢI DONGFENG HOÀNG HUY B180 THÙNG INOX 7.7M MẪU MỚI', '', 'XE TẢI DONGFENG HOÀNG HUY B180 THÙNG INOX 7.7M MẪU MỚI', '', 'false', 'true', '8'),
    ('xe-tai-dongfeng', '', 'ra-mat-mau-xe-tai-dongfeng-hoang-huy-b180-thung-kin-9m7-tai-7-5-tan-tram-bao-hanh-dongfeng', '/san-pham/ra-mat-mau-xe-tai-dongfeng-hoang-huy-b180-thung-kin-9m7-tai-7-5-tan-tram-bao-hanh-dongfeng', 'RA MẮT MẪU XE TẢI DONGFENG HOÀNG HUY B180 THÙNG KÍN 9M7 TẢI 7.5 TẦN/TRAM BẢO HÀNH DONGFENG', 'RA MẮT MẪU XE TẢI DONGFENG HOÀNG HUY B180 THÙNG KÍN 9M7 TẢI 7.5 TẦN/TRAM BẢO HÀNH DONGFENG', '', '{}', '0.00', 'unit', 'available', 'Dongfeng', '', '', '0', '0', '', '', '', '[]', '{}', 'RA MẮT MẪU XE TẢI DONGFENG HOÀNG HUY B180 THÙNG KÍN 9M7 TẢI 7.5 TẦN/TRAM BẢO HÀNH DONGFENG', '', 'RA MẮT MẪU XE TẢI DONGFENG HOÀNG HUY B180 THÙNG KÍN 9M7 TẢI 7.5 TẦN/TRAM BẢO HÀNH DONGFENG', '', 'false', 'true', '9'),
    ('xe-tai-dongfeng', '', 'chi-tiet-xe-tai-dongfeng-b180-thung-pallet-dai-9m7-tai-8-tan-tong-kho-mien-nam', '/san-pham/chi-tiet-xe-tai-dongfeng-b180-thung-pallet-dai-9m7-tai-8-tan-tong-kho-mien-nam', 'CHI TIẾT XE TẢI DONGFENG B180 THÙNG PALLET DÀI 9M7 TẢI 8 TẦN / TỔNG KHO MIỀN NAM', 'CHI TIẾT XE TẢI DONGFENG B180 THÙNG PALLET DÀI 9M7 TẢI 8 TẦN / TỔNG KHO MIỀN NAM', '', '{}', '0.00', 'unit', 'available', 'Dongfeng', '', '', '0', '0', '', '', '', '[]', '{}', 'CHI TIẾT XE TẢI DONGFENG B180 THÙNG PALLET DÀI 9M7 TẢI 8 TẦN / TỔNG KHO MIỀN NAM', '', 'CHI TIẾT XE TẢI DONGFENG B180 THÙNG PALLET DÀI 9M7 TẢI 8 TẦN / TỔNG KHO MIỀN NAM', '', 'false', 'true', '10'),
    ('xe-tai-dongfeng', '', 'xe-tai-thung-canh-doi-ban-hang-luu-dong-dongfeng-hoang-huy-b180', '/san-pham/xe-tai-thung-canh-doi-ban-hang-luu-dong-dongfeng-hoang-huy-b180', 'Xe Tải Thùng Cánh Dơi Bán Hàng Lưu Động/Dongfeng Hoang Huy B180', 'Xe Tải Thùng Cánh Dơi Bán Hàng Lưu Động/Dongfeng Hoang Huy B180', '', '{}', '0.00', 'unit', 'available', 'Dongfeng', '', '', '0', '0', '', '', '', '[]', '{}', 'Xe Tải Thùng Cánh Dơi Bán Hàng Lưu Động/Dongfeng Hoang Huy B180', '', 'Xe Tải Thùng Cánh Dơi Bán Hàng Lưu Động/Dongfeng Hoang Huy B180', '', 'false', 'true', '11'),
    ('xe-tai-dongfeng', '', 'xe-cho-heo-15-tan-dongfeng-hoang-huy-l315-cho-gia-suc-4-tang-co-bung-nang-dieu-hoa-voi-nuoc-camera', '/san-pham/xe-cho-heo-15-tan-dongfeng-hoang-huy-l315-cho-gia-suc-4-tang-co-bung-nang-dieu-hoa-voi-nuoc-camera', 'Xe chở heo 15 tấn dongfeng hoang huy L315 chở gia súc 4 tầng có bụng nắng điều hòa với nước camera', 'Xe chở heo 15 tấn dongfeng hoang huy L315 chở gia súc 4 tầng có bụng nắng điều hòa với nước camera', '', '{}', '0.00', 'unit', 'available', 'Dongfeng', '', '', '0', '0', '', '', '', '[]', '{}', 'Xe chở heo 15 tấn dongfeng hoang huy L315 chở gia súc 4 tầng có bụng nắng điều hòa với nước camera', '', 'Xe chở heo 15 tấn dongfeng hoang huy L315 chở gia súc 4 tầng có bụng nắng điều hòa với nước camera', '', 'false', 'true', '12'),
    ('xe-tai-teraco', '', 'xe-tai-teraco-100-thung-lung-990kg-may-mitsubishi-deahan-motor-viet-nam', '/san-pham/xe-tai-teraco-100-thung-lung-990kg-may-mitsubishi-deahan-motor-viet-nam', 'Xe Tải Teraco 100 thùng lửng 990kg máy Mitsubishi / Deahan Motor Việt Nam', 'Xe Tải Teraco 100 thùng lửng 990kg máy Mitsubishi / Deahan Motor Việt Nam', '', '{}', '0.00', 'unit', 'available', 'Teraco', '', '', '0', '0', '', '', '', '[]', '{}', 'Xe Tải Teraco 100 thùng lửng 990kg máy Mitsubishi / Deahan Motor Việt Nam', '', 'Xe Tải Teraco 100 thùng lửng 990kg máy Mitsubishi / Deahan Motor Việt Nam', '', 'false', 'true', '13'),
    ('xe-tai-teraco', '', 'xe-tai-teraco-100-thung-mui-bat-990kg-dong-co-mitsubishi-tech-deahan-motor-tong-kho-mien-nam', '/san-pham/xe-tai-teraco-100-thung-mui-bat-990kg-dong-co-mitsubishi-tech-deahan-motor-tong-kho-mien-nam', 'Xe Tải Teraco 100 thùng mui bạt 990kg động cơ Mitsubishi Tech/ Deahan Motor Tổng kho miền nam', 'Xe Tải Teraco 100 thùng mui bạt 990kg động cơ Mitsubishi Tech/ Deahan Motor Tổng kho miền nam', '', '{}', '0.00', 'unit', 'available', 'Teraco', '', '', '0', '0', '', '', '', '[]', '{}', 'Xe Tải Teraco 100 thùng mui bạt 990kg động cơ Mitsubishi Tech/ Deahan Motor Tổng kho miền nam', '', 'Xe Tải Teraco 100 thùng mui bạt 990kg động cơ Mitsubishi Tech/ Deahan Motor Tổng kho miền nam', '', 'false', 'true', '14'),
    ('xe-tai-teraco', '', 'xe-tai-teraco-100-thung-kin-990kg-dong-co-mitsubishi-tech-deahan-motor-tong-kho-mien-nam', '/san-pham/xe-tai-teraco-100-thung-kin-990kg-dong-co-mitsubishi-tech-deahan-motor-tong-kho-mien-nam', 'Xe Tải Teraco 100 thùng kín 990kg động cơ Mitsubishi Tech/ Deahan Motor Tổng kho miền nam', 'Xe Tải Teraco 100 thùng kín 990kg động cơ Mitsubishi Tech/ Deahan Motor Tổng kho miền nam', '', '{}', '0.00', 'unit', 'available', 'Teraco', '', '', '0', '0', '', '', '', '[]', '{}', 'Xe Tải Teraco 100 thùng kín 990kg động cơ Mitsubishi Tech/ Deahan Motor Tổng kho miền nam', '', 'Xe Tải Teraco 100 thùng kín 990kg động cơ Mitsubishi Tech/ Deahan Motor Tổng kho miền nam', '', 'false', 'true', '15'),
    ('xe-tai-teraco', '', 'xe-tai-teraco-990kg-ban-hang-luu-dong-may-mitsubishi-tech-deahan-motor-tong-kho-mien-nam', '/san-pham/xe-tai-teraco-990kg-ban-hang-luu-dong-may-mitsubishi-tech-deahan-motor-tong-kho-mien-nam', 'Xe Tải Teraco 990kg Bán Hàng Lưu Động máy Mitsubishi Tech/ Deahan Motor Tổng kho miền nam', 'Xe Tải Teraco 990kg Bán Hàng Lưu Động máy Mitsubishi Tech/ Deahan Motor Tổng kho miền nam', '', '{}', '0.00', 'unit', 'available', 'Teraco', '', '', '0', '0', '', '', '', '[]', '{}', 'Xe Tải Teraco 990kg Bán Hàng Lưu Động máy Mitsubishi Tech/ Deahan Motor Tổng kho miền nam', '', 'Xe Tải Teraco 990kg Bán Hàng Lưu Động máy Mitsubishi Tech/ Deahan Motor Tổng kho miền nam', '', 'false', 'true', '16'),
    ('xe-tai-hyundai', '', 'xe-tai-hyundai-porter-h150-tai-1495-kg-tong-kho-hyundai-tc-motor', '/san-pham/xe-tai-hyundai-porter-h150-tai-1495-kg-tong-kho-hyundai-tc-motor', 'Xe tải Hyundai Porter H150 Tải 1495 kg / Tổng Kho Hyundai TC Motor.', 'Xe tải Hyundai Porter H150 Tải 1495 kg / Tổng Kho Hyundai TC Motor.', '', '{}', '0.00', 'unit', 'available', 'Hyundai', '', '', '0', '0', '', '', '', '[]', '{}', 'Xe tải Hyundai Porter H150 Tải 1495 kg / Tổng Kho Hyundai TC Motor.', '', 'Xe tải Hyundai Porter H150 Tải 1495 kg / Tổng Kho Hyundai TC Motor.', '', 'false', 'true', '17'),
    ('xe-tai-hyundai', '', 'xe-tai-hyundai-new-mighty-110xl-thung-dai-6m3-tai-7-tan-tong-kho-hyundai-thanh-cong-by-tc-motor', '/san-pham/xe-tai-hyundai-new-mighty-110xl-thung-dai-6m3-tai-7-tan-tong-kho-hyundai-thanh-cong-by-tc-motor', 'Xe tải Hyundai New Mighty 110XL thùng dài 6m3 tải 7 tấn / Tổng Kho Hyundai Thành Công BY TC Motor.', 'Xe tải Hyundai New Mighty 110XL thùng dài 6m3 tải 7 tấn / Tổng Kho Hyundai Thành Công BY TC Motor.', '', '{}', '0.00', 'unit', 'available', 'Hyundai', '', '', '0', '0', '', '', '', '[]', '{}', 'Xe tải Hyundai New Mighty 110XL thùng dài 6m3 tải 7 tấn / Tổng Kho Hyundai Thành Công BY TC Motor.', '', 'Xe tải Hyundai New Mighty 110XL thùng dài 6m3 tải 7 tấn / Tổng Kho Hyundai Thành Công BY TC Motor.', '', 'false', 'true', '18'),
    ('xe-tai-dongfeng', '', 'xe-tai-dongfeng-b180-9-tan-thung-dai-9m7-dongfeng-tong-kho-mien-nam', '/san-pham/xe-tai-dongfeng-b180-9-tan-thung-dai-9m7-dongfeng-tong-kho-mien-nam', 'Xe Tải DongFeng B180 9 tấn,thùng dài 9m7 /DongFeng Tổng Kho Miền Nam', 'Xe Tải DongFeng B180 9 tấn,thùng dài 9m7 /DongFeng Tổng Kho Miền Nam', '', '{}', '0.00', 'unit', 'available', 'Dongfeng', '', '', '0', '0', '', '', '', '[]', '{}', 'Xe Tải DongFeng B180 9 tấn,thùng dài 9m7 /DongFeng Tổng Kho Miền Nam', '', 'Xe Tải DongFeng B180 9 tấn,thùng dài 9m7 /DongFeng Tổng Kho Miền Nam', '', 'false', 'true', '19'),
    ('xe-tai-teraco', '', 'teraco-150-180', '/san-pham/teraco-150-180', 'Teraco 150 & 180', 'Teraco 150 & 180', '', '{}', '0.00', 'unit', 'available', 'Teraco', '', '', '0', '0', '', '', '', '[]', '{}', 'Teraco 150 & 180', '', 'Teraco 150 & 180', '', 'false', 'true', '20'),
    ('xe-tai-teraco', '', 'gia-xe-tai-teraco-tera-190sl-tera-345sl-may-isuzu-tram-dich-vu-3s-doc-quyen-tai-binh-phuoc', '/san-pham/gia-xe-tai-teraco-tera-190sl-tera-345sl-may-isuzu-tram-dich-vu-3s-doc-quyen-tai-binh-phuoc', 'Giá Xe Tải Teraco Tera 190SL & Tera 345SL máy ISUZU/ Trạm dịch vụ 3s độc quyền tại Bình Phước.', 'Giá Xe Tải Teraco Tera 190SL & Tera 345SL máy ISUZU/ Trạm dịch vụ 3s độc quyền tại Bình Phước.', '', '{}', '0.00', 'unit', 'available', 'Teraco', '', '', '0', '0', '', '', '', '[]', '{}', 'Giá Xe Tải Teraco Tera 190SL & Tera 345SL máy ISUZU/ Trạm dịch vụ 3s độc quyền tại Bình Phước.', '', 'Giá Xe Tải Teraco Tera 190SL & Tera 345SL máy ISUZU/ Trạm dịch vụ 3s độc quyền tại Bình Phước.', '', 'false', 'true', '21'),
    ('xe-tai-hyundai', '', 'xe-tai-hyundai-new-mighty-n250sl-thung-dai-4m3-tai-3-tan-tong-kho-hyundai-thanh-cong-by-tc-motor', '/san-pham/xe-tai-hyundai-new-mighty-n250sl-thung-dai-4m3-tai-3-tan-tong-kho-hyundai-thanh-cong-by-tc-motor', 'Xe tải Hyundai New Mighty N250SL thùng dài 4m3 tải 3 tấn / Tổng Kho Hyundai Thành Công BY TC Motor.', 'Xe tải Hyundai New Mighty N250SL thùng dài 4m3 tải 3 tấn / Tổng Kho Hyundai Thành Công BY TC Motor.', '', '{}', '0.00', 'unit', 'available', 'Hyundai', '', '', '0', '0', '', '', '', '[]', '{}', 'Xe tải Hyundai New Mighty N250SL thùng dài 4m3 tải 3 tấn / Tổng Kho Hyundai Thành Công BY TC Motor.', '', 'Xe tải Hyundai New Mighty N250SL thùng dài 4m3 tải 3 tấn / Tổng Kho Hyundai Thành Công BY TC Motor.', '', 'false', 'true', '22'),
    ('xe-ep-rac', '', 'xe-ep-rac-14-khoi-nhap-khau-gia-re-tong-kho-co-mien-nam', '/san-pham/xe-ep-rac-14-khoi-nhap-khau-gia-re-tong-kho-co-mien-nam', 'XE ÉP RÁC 14 KHỐI NHẬP KHẨU GIÁ RÉ / TỔNG KHO CƠ MIỀN NAM', 'XE ÉP RÁC 14 KHỐI NHẬP KHẨU GIÁ RÉ / TỔNG KHO CƠ MIỀN NAM', '', '{}', '0.00', 'unit', 'available', '', '', '', '0', '0', '', '', '', '[]', '{}', 'XE ÉP RÁC 14 KHỐI NHẬP KHẨU GIÁ RÉ / TỔNG KHO CƠ MIỀN NAM', '', 'XE ÉP RÁC 14 KHỐI NHẬP KHẨU GIÁ RÉ / TỔNG KHO CƠ MIỀN NAM', '', 'false', 'true', '23'),
    ('xe-chua-chay', '', 'xe-chua-chay-khu-cong-nghiep-3-chuc-nang-6-khoi-phu-hop-nd-79-2014-nd-cp', '/san-pham/xe-chua-chay-khu-cong-nghiep-3-chuc-nang-6-khoi-phu-hop-nd-79-2014-nd-cp', 'XE CHỮA CHÁY KHU CÔNG NGHIỆP 3 CHỨC NĂNG 6 KHỐI / PHÙ HỢP NĐ 79/2014/NĐ-CP', 'XE CHỮA CHÁY KHU CÔNG NGHIỆP 3 CHỨC NĂNG 6 KHỐI / PHÙ HỢP NĐ 79/2014/NĐ-CP', '', '{}', '0.00', 'unit', 'available', '', '', '', '0', '0', '', '', '', '[]', '{}', 'XE CHỮA CHÁY KHU CÔNG NGHIỆP 3 CHỨC NĂNG 6 KHỐI / PHÙ HỢP NĐ 79/2014/NĐ-CP', '', 'XE CHỮA CHÁY KHU CÔNG NGHIỆP 3 CHỨC NĂNG 6 KHỐI / PHÙ HỢP NĐ 79/2014/NĐ-CP', '', 'false', 'true', '24'),
    ('xe-cau', '', 'dongfeng-lap-cau-soosan-12t-moi-100', '/san-pham/dongfeng-lap-cau-soosan-12t-moi-100', 'DONGFENG LẮP CẦU SOOSAN 12T MỚI 100%', 'DONGFENG LẮP CẦU SOOSAN 12T MỚI 100%', '', '{}', '0.00', 'unit', 'available', 'Dongfeng', '', '', '0', '0', '', '', '', '[]', '{}', 'DONGFENG LẮP CẦU SOOSAN 12T MỚI 100%', '', 'DONGFENG LẮP CẦU SOOSAN 12T MỚI 100%', '', 'false', 'true', '25'),
    ('xe-cau', '', 'dongfeng-lap-cau-atom-14-tan-5-khuc', '/san-pham/dongfeng-lap-cau-atom-14-tan-5-khuc', 'DONGFENG LẮP CẦU ATOM 14 TẤN 5 KHÚC', 'DONGFENG LẮP CẦU ATOM 14 TẤN 5 KHÚC', '', '{}', '0.00', 'unit', 'available', 'Dongfeng', '', '', '0', '0', '', '', '', '[]', '{}', 'DONGFENG LẮP CẦU ATOM 14 TẤN 5 KHÚC', '', 'DONGFENG LẮP CẦU ATOM 14 TẤN 5 KHÚC', '', 'false', 'true', '26'),
    ('xitec-xang-dau', '', 'dongfeng-4-chan-bon-xitec-xang-dau-22-5-khoi-o-to-nhan-luc', '/san-pham/dongfeng-4-chan-bon-xitec-xang-dau-22-5-khoi-o-to-nhan-luc', 'DONGFENG 4 CHÂN BÒN XITEC XĂNG DẦU 22.5 KHỐI - Ô TÔ NHÂN LỰC', 'DONGFENG 4 CHÂN BÒN XITEC XĂNG DẦU 22.5 KHỐI - Ô TÔ NHÂN LỰC', '', '{}', '0.00', 'unit', 'available', 'Dongfeng', '', '', '0', '0', '', '', '', '[]', '{}', 'DONGFENG 4 CHÂN BÒN XITEC XĂNG DẦU 22.5 KHỐI - Ô TÔ NHÂN LỰC', '', 'DONGFENG 4 CHÂN BÒN XITEC XĂNG DẦU 22.5 KHỐI - Ô TÔ NHÂN LỰC', '', 'false', 'true', '27'),
    ('xitec-xang-dau', '', 'xe-bon-xang-dau', '/san-pham/xe-bon-xang-dau', 'Xe Bồn Xăng Dầu', 'Xe Bồn Xăng Dầu', '', '{}', '0.00', 'unit', 'available', '', '', '', '0', '0', '', '', '', '[]', '{}', 'Xe Bồn Xăng Dầu', '', 'Xe Bồn Xăng Dầu', '', 'false', 'true', '28'),
    ('xe-dong-lanh', '', 'hd-210-thung-dong-lanh', '/san-pham/hd-210-thung-dong-lanh', 'HD 210 THÙNG ĐỒNG LANH', 'HD 210 THÙNG ĐỒNG LANH', '', '{}', '0.00', 'unit', 'available', 'Hyundai', '', '', '0', '0', '', '', '', '[]', '{}', 'HD 210 THÙNG ĐỒNG LANH', '', 'HD 210 THÙNG ĐỒNG LANH', '', 'false', 'true', '29'),
    ('thung-kin-chuyen-dung', '', 'dongfeng-thung-kin-thung-dai-9-5-met', '/san-pham/dongfeng-thung-kin-thung-dai-9-5-met', 'DONGFENG THÙNG KÍN THÙNG DÀI 9.5 MÉT', 'DONGFENG THÙNG KÍN THÙNG DÀI 9.5 MÉT', '', '{}', '0.00', 'unit', 'available', 'Dongfeng', '', '', '0', '0', '', '', '', '[]', '{}', 'DONGFENG THÙNG KÍN THÙNG DÀI 9.5 MÉT', '', 'DONGFENG THÙNG KÍN THÙNG DÀI 9.5 MÉT', '', 'false', 'true', '30'),
    ('xitec-xang-dau', '', 'kamaz-bon-xang-dau', '/san-pham/kamaz-bon-xang-dau', 'KAMAZ BỒN XĂNG DẦU', 'KAMAZ BỒN XĂNG DẦU', '', '{}', '0.00', 'unit', 'available', 'Kamaz', '', '', '0', '0', '', '', '', '[]', '{}', 'KAMAZ BỒN XĂNG DẦU', '', 'KAMAZ BỒN XĂNG DẦU', '', 'false', 'true', '31'),
    ('xe-cho-xe-co-gioi', '', 'xe-cho-xe-co-gioi-dongfeng-b170', '/san-pham/xe-cho-xe-co-gioi-dongfeng-b170', 'XE CHỞ XE CƠ GIỚI DONGFENG B170', 'XE CHỞ XE CƠ GIỚI DONGFENG B170', '', '{}', '0.00', 'unit', 'available', 'Dongfeng', '', '', '0', '0', '', '', '', '[]', '{}', 'XE CHỞ XE CƠ GIỚI DONGFENG B170', '', 'XE CHỞ XE CƠ GIỚI DONGFENG B170', '', 'false', 'true', '32'),
    ('xe-ben', '', 'xe-ben-maz-euro-4-model-6501b3-dai-ly-3s-maz-belarus', '/san-pham/xe-ben-maz-euro-4-model-6501b3-dai-ly-3s-maz-belarus', 'XE BEN MAZ EURO 4 MODEL 6501B3 / ĐẠI LÝ 3S MAZ BELARUS', 'XE BEN MAZ EURO 4 MODEL 6501B3 / ĐẠI LÝ 3S MAZ BELARUS', '', '{}', '0.00', 'unit', 'available', 'Maz', '', '', '0', '0', '', '', '', '[]', '{}', 'XE BEN MAZ EURO 4 MODEL 6501B3 / ĐẠI LÝ 3S MAZ BELARUS', '', 'XE BEN MAZ EURO 4 MODEL 6501B3 / ĐẠI LÝ 3S MAZ BELARUS', '', 'false', 'true', '33'),
    ('xe-cuu-ho-giao-thong', '', 'xe-cuu-ho-giao-thong-3-chuc-nang-cho-xe-keo-xe-cau-gap-5-tan-chuyen-dung-nhap-khau', '/san-pham/xe-cuu-ho-giao-thong-3-chuc-nang-cho-xe-keo-xe-cau-gap-5-tan-chuyen-dung-nhap-khau', 'xe cứu hộ giao thông 3 chức năng - chở xe - kéo xe - cẩu gập 5 tấn / chuyên dùng nhập khẩu', 'xe cứu hộ giao thông 3 chức năng - chở xe - kéo xe - cẩu gập 5 tấn / chuyên dùng nhập khẩu', '', '{}', '0.00', 'unit', 'available', '', '', '', '0', '0', '', '', '', '[]', '{}', 'xe cứu hộ giao thông 3 chức năng - chở xe - kéo xe - cẩu gập 5 tấn / chuyên dùng nhập khẩu', '', 'xe cứu hộ giao thông 3 chức năng - chở xe - kéo xe - cẩu gập 5 tấn / chuyên dùng nhập khẩu', '', 'false', 'true', '34'),
    ('xe-cuu-ho-giao-thong', '', 'cuu-ho-giao-thong-3-chuc-nang-cho-keo-cau-gap-3-2-tan-chuyen-dung-nhap-khau-mien-nam', '/san-pham/cuu-ho-giao-thong-3-chuc-nang-cho-keo-cau-gap-3-2-tan-chuyen-dung-nhap-khau-mien-nam', 'Cứu hộ giao thông 3 chức năng ,chở, kéo, cẩu gập 3.2 tấn / chuyên dùng nhập khẩu miền nam', 'Cứu hộ giao thông 3 chức năng ,chở, kéo, cẩu gập 3.2 tấn / chuyên dùng nhập khẩu miền nam', '', '{}', '0.00', 'unit', 'available', '', '', '', '0', '0', '', '', '', '[]', '{}', 'Cứu hộ giao thông 3 chức năng ,chở, kéo, cẩu gập 3.2 tấn / chuyên dùng nhập khẩu miền nam', '', 'Cứu hộ giao thông 3 chức năng ,chở, kéo, cẩu gập 3.2 tấn / chuyên dùng nhập khẩu miền nam', '', 'false', 'true', '35'),
    ('xe-cuu-ho-giao-thong', '', 'xe-cuu-ho-2-chuc-nang-san-truot-dongfeng-ho-bac-tong-dai-ly-chuyen-dung-mien-nam', '/san-pham/xe-cuu-ho-2-chuc-nang-san-truot-dongfeng-ho-bac-tong-dai-ly-chuyen-dung-mien-nam', 'xe cứu hộ 2 chức năng sàn trượt dongfeng hồ bắc / tổng đại lý chuyên dùng miền nam', 'xe cứu hộ 2 chức năng sàn trượt dongfeng hồ bắc / tổng đại lý chuyên dùng miền nam', '', '{}', '0.00', 'unit', 'available', 'Dongfeng', '', '', '0', '0', '', '', '', '[]', '{}', 'xe cứu hộ 2 chức năng sàn trượt dongfeng hồ bắc / tổng đại lý chuyên dùng miền nam', '', 'xe cứu hộ 2 chức năng sàn trượt dongfeng hồ bắc / tổng đại lý chuyên dùng miền nam', '', 'false', 'true', '36'),
    ('xe-tuoi-nuoc', '', 'xe-tuoi-nuoc-9-khoi-dongfeng-tong-c-tv-chuyen-dung-mien-nam', '/san-pham/xe-tuoi-nuoc-9-khoi-dongfeng-tong-c-tv-chuyen-dung-mien-nam', 'xe tưới nước 9 khối dongfeng / tổng c.tv chuyên dùng miền nam', 'xe tưới nước 9 khối dongfeng / tổng c.tv chuyên dùng miền nam', '', '{}', '0.00', 'unit', 'available', 'Dongfeng', '', '', '0', '0', '', '', '', '[]', '{}', 'xe tưới nước 9 khối dongfeng / tổng c.tv chuyên dùng miền nam', '', 'xe tưới nước 9 khối dongfeng / tổng c.tv chuyên dùng miền nam', '', 'false', 'true', '37'),
    ('xe-hut-chat-thai', '', 'xe-hut-chat-thai-faw-5-khoi-hut-ham-cau-hut-be-phot', '/san-pham/xe-hut-chat-thai-faw-5-khoi-hut-ham-cau-hut-be-phot', 'XE HÚT CHẤT THẢI FAW 5 KHỐI-HÚT HÂM CẦU-HÚT BÊ PHÓT', 'XE HÚT CHẤT THẢI FAW 5 KHỐI-HÚT HÂM CẦU-HÚT BÊ PHÓT', '', '{}', '0.00', 'unit', 'available', 'FAW', '', '', '0', '0', '', '', '', '[]', '{}', 'XE HÚT CHẤT THẢI FAW 5 KHỐI-HÚT HÂM CẦU-HÚT BÊ PHÓT', '', 'XE HÚT CHẤT THẢI FAW 5 KHỐI-HÚT HÂM CẦU-HÚT BÊ PHÓT', '', 'false', 'true', '38'),
    ('xe-cuu-ho-giao-thong', '', 'xe-cuu-ho-cang-gap-sx-2019-khong-nien-han-xe-chuyen-dung-nhap-khau-sai-gon', '/san-pham/xe-cuu-ho-cang-gap-sx-2019-khong-nien-han-xe-chuyen-dung-nhap-khau-sai-gon', 'Xe Cứu Hộ Càng Gấp SX 2019 Không Niên Hạn / Xe Chuyên Dùng Nhập Khẩu Sài Gòn', 'Xe Cứu Hộ Càng Gấp SX 2019 Không Niên Hạn / Xe Chuyên Dùng Nhập Khẩu Sài Gòn', '', '{}', '0.00', 'unit', 'available', '', '', '', '0', '0', '', '', '', '[]', '{}', 'Xe Cứu Hộ Càng Gấp SX 2019 Không Niên Hạn / Xe Chuyên Dùng Nhập Khẩu Sài Gòn', '', 'Xe Cứu Hộ Càng Gấp SX 2019 Không Niên Hạn / Xe Chuyên Dùng Nhập Khẩu Sài Gòn', '', 'false', 'true', '39'),
    ('xe-cuu-ho-giao-thong', '', 'xe-cuu-ho-cang-gap-howo-cau-nang-ha-30-tan-xe-chuyen-dung-nhap-khau-sai-gon', '/san-pham/xe-cuu-ho-cang-gap-howo-cau-nang-ha-30-tan-xe-chuyen-dung-nhap-khau-sai-gon', 'Xe Cứu Hộ Càng Gấp Howo Cẩu Nâng Hạ 30 Tấn / Xe Chuyên Dùng Nhập Khẩu Sài Gòn', 'Xe Cứu Hộ Càng Gấp Howo Cẩu Nâng Hạ 30 Tấn / Xe Chuyên Dùng Nhập Khẩu Sài Gòn', '', '{}', '0.00', 'unit', 'available', 'Howo', '', '', '0', '0', '', '', '', '[]', '{}', 'Xe Cứu Hộ Càng Gấp Howo Cẩu Nâng Hạ 30 Tấn / Xe Chuyên Dùng Nhập Khẩu Sài Gòn', '', 'Xe Cứu Hộ Càng Gấp Howo Cẩu Nâng Hạ 30 Tấn / Xe Chuyên Dùng Nhập Khẩu Sài Gòn', '', 'false', 'true', '40'),
    ('xe-tuoi-nuoc', '', 'xe-bon-tuoi-nuoc', '/san-pham/xe-bon-tuoi-nuoc', 'Xe Bồn Tưới Nước', 'Xe Bồn Tưới Nước', '', '{}', '0.00', 'unit', 'available', '', '', '', '0', '0', '', '', '', '[]', '{}', 'Xe Bồn Tưới Nước', '', 'Xe Bồn Tưới Nước', '', 'false', 'true', '41'),
    ('dau-keo-my', '', 'noi-giuong-dau-keo-my-0-giuong-nhu-the-nao', '/san-pham/noi-giuong-dau-keo-my-0-giuong-nhu-the-nao', 'NỘI GIƯỜNG ĐẦU KÉO MỸ 0 GIƯỜNG NHƯ THẾ NÀO?', 'NỘI GIƯỜNG ĐẦU KÉO MỸ 0 GIƯỜNG NHƯ THẾ NÀO?', '', '{}', '0.00', 'unit', 'available', 'International', '', '', '0', '0', '', '', '', '[]', '{}', 'NỘI GIƯỜNG ĐẦU KÉO MỸ 0 GIƯỜNG NHƯ THẾ NÀO?', '', 'NỘI GIƯỜNG ĐẦU KÉO MỸ 0 GIƯỜNG NHƯ THẾ NÀO?', '', 'false', 'true', '42'),
    ('dau-keo-my', '', 'dau-keo-my-1-giuong-may-maxxforce-430-450-475-hp-dai-ly-3s-international', '/san-pham/dau-keo-my-1-giuong-may-maxxforce-430-450-475-hp-dai-ly-3s-international', 'ĐẦU KÉO MỸ 1 GIƯỜNG MÁY MAXXFORCE 430-450-475 HP / ĐẠI LÝ 3S INTERNATIONAL', 'ĐẦU KÉO MỸ 1 GIƯỜNG MÁY MAXXFORCE 430-450-475 HP / ĐẠI LÝ 3S INTERNATIONAL', '', '{}', '0.00', 'unit', 'available', 'International', '', '', '0', '0', '', '', '', '[]', '{}', 'ĐẦU KÉO MỸ 1 GIƯỜNG MÁY MAXXFORCE 430-450-475 HP / ĐẠI LÝ 3S INTERNATIONAL', '', 'ĐẦU KÉO MỸ 1 GIƯỜNG MÁY MAXXFORCE 430-450-475 HP / ĐẠI LÝ 3S INTERNATIONAL', '', 'false', 'true', '43'),
    ('dau-keo-my', '', 'so-sanh-dau-keo-my-dong-co-n13-so-voi-maxxforce-13-cho-thue-dau-keo', '/san-pham/so-sanh-dau-keo-my-dong-co-n13-so-voi-maxxforce-13-cho-thue-dau-keo', 'So sánh đầu kéo mỹ động cơ N13 so với maxxforce 13 / cho thuê đầu kéo', 'So sánh đầu kéo mỹ động cơ N13 so với maxxforce 13 / cho thuê đầu kéo', '', '{}', '0.00', 'unit', 'available', 'International', '', '', '0', '0', '', '', '', '[]', '{}', 'So sánh đầu kéo mỹ động cơ N13 so với maxxforce 13 / cho thuê đầu kéo', '', 'So sánh đầu kéo mỹ động cơ N13 so với maxxforce 13 / cho thuê đầu kéo', '', 'false', 'true', '44'),
    ('dau-keo-my', '', 'ban-va-cho-thue-dau-keo-my-2-giuong-dai-ly-3s-international-vn', '/san-pham/ban-va-cho-thue-dau-keo-my-2-giuong-dai-ly-3s-international-vn', 'BÁN VÀ CHO THUÊ ĐẦU KÉO MỸ 2 GIƯỜNG / ĐẠI LÝ 3S INTERNATIONAL VN', 'BÁN VÀ CHO THUÊ ĐẦU KÉO MỸ 2 GIƯỜNG / ĐẠI LÝ 3S INTERNATIONAL VN', '', '{}', '0.00', 'unit', 'available', 'International', '', '', '0', '0', '', '', '', '[]', '{}', 'BÁN VÀ CHO THUÊ ĐẦU KÉO MỸ 2 GIƯỜNG / ĐẠI LÝ 3S INTERNATIONAL VN', '', 'BÁN VÀ CHO THUÊ ĐẦU KÉO MỸ 2 GIƯỜNG / ĐẠI LÝ 3S INTERNATIONAL VN', '', 'false', 'true', '45'),
    ('dau-keo-maz', '', 'dau-keo-maz-belarus-6430b7-san-xuat-2018-tong-kho-maz-asia-mien-nam', '/san-pham/dau-keo-maz-belarus-6430b7-san-xuat-2018-tong-kho-maz-asia-mien-nam', 'Đầu Kéo Maz Belarus 6430b7 Sản Xuất 2018 - Tổng Kho Maz Asia Miền Nam', 'Đầu Kéo Maz Belarus 6430b7 Sản Xuất 2018 - Tổng Kho Maz Asia Miền Nam', '', '{}', '0.00', 'unit', 'available', 'Maz', '', '', '0', '0', '', '', '', '[]', '{}', 'Đầu Kéo Maz Belarus 6430b7 Sản Xuất 2018 - Tổng Kho Maz Asia Miền Nam', '', 'Đầu Kéo Maz Belarus 6430b7 Sản Xuất 2018 - Tổng Kho Maz Asia Miền Nam', '', 'false', 'true', '46'),
    ('dau-keo-dongfeng', '', 'xe-dau-keo-dongfeng-mau-2019-euro-4-may-cummins-400hp-tram-bao-hanh-dongfeng', '/san-pham/xe-dau-keo-dongfeng-mau-2019-euro-4-may-cummins-400hp-tram-bao-hanh-dongfeng', 'XE ĐẦU KÉO DONGFENG MẪU 2019 EURO 4-MÁY CUMMINS 400HP/TRẠM BẢO HÀNH DONGFENG', 'XE ĐẦU KÉO DONGFENG MẪU 2019 EURO 4-MÁY CUMMINS 400HP/TRẠM BẢO HÀNH DONGFENG', '', '{}', '0.00', 'unit', 'available', 'Dongfeng', '', '', '0', '0', '', '', '', '[]', '{}', 'XE ĐẦU KÉO DONGFENG MẪU 2019 EURO 4-MÁY CUMMINS 400HP/TRẠM BẢO HÀNH DONGFENG', '', 'XE ĐẦU KÉO DONGFENG MẪU 2019 EURO 4-MÁY CUMMINS 400HP/TRẠM BẢO HÀNH DONGFENG', '', 'false', 'true', '47'),
    ('dau-keo-dongfeng', '', 'xe-dau-keo-dongfeng-hoang-huy-2-cau-may-420-hp-mau-moi-tram-bao-hanh-dongfeng', '/san-pham/xe-dau-keo-dongfeng-hoang-huy-2-cau-may-420-hp-mau-moi-tram-bao-hanh-dongfeng', 'Xe Đầu Kéo dongfeng Hoàng Huy 2 cầu Máy 420 HP Mẫu Mới/Trạm Bảo Hành dongfeng', 'Xe Đầu Kéo dongfeng Hoàng Huy 2 cầu Máy 420 HP Mẫu Mới/Trạm Bảo Hành dongfeng', '', '{}', '0.00', 'unit', 'available', 'Dongfeng', '', '', '0', '0', '', '', '', '[]', '{}', 'Xe Đầu Kéo dongfeng Hoàng Huy 2 cầu Máy 420 HP Mẫu Mới/Trạm Bảo Hành dongfeng', '', 'Xe Đầu Kéo dongfeng Hoàng Huy 2 cầu Máy 420 HP Mẫu Mới/Trạm Bảo Hành dongfeng', '', 'false', 'true', '48'),
    ('dau-keo-howo', '', 'dk-howo-t5g', '/san-pham/dk-howo-t5g', 'ĐK HOWO T5G', 'ĐK HOWO T5G', '', '{}', '0.00', 'unit', 'available', 'Howo', '', '', '0', '0', '', '', '', '[]', '{}', 'ĐK HOWO T5G', '', 'ĐK HOWO T5G', '', 'false', 'true', '49'),
    ('dau-keo-howo', '', 'dk-howo-a7-may-375', '/san-pham/dk-howo-a7-may-375', 'ĐK HOWO A7 MÁY 375', 'ĐK HOWO A7 MÁY 375', '', '{}', '0.00', 'unit', 'available', 'Howo', '', '', '0', '0', '', '', '', '[]', '{}', 'ĐK HOWO A7 MÁY 375', '', 'ĐK HOWO A7 MÁY 375', '', 'false', 'true', '50'),
    ('dau-keo-my', '', 'dk-1-giuong-noc-thap', '/san-pham/dk-1-giuong-noc-thap', 'ĐK 1 GIƯỜNG NÓC THẤP', 'ĐK 1 GIƯỜNG NÓC THẤP', '', '{}', '0.00', 'unit', 'available', 'International', '', '', '0', '0', '', '', '', '[]', '{}', 'ĐK 1 GIƯỜNG NÓC THẤP', '', 'ĐK 1 GIƯỜNG NÓC THẤP', '', 'false', 'true', '51'),
    ('dau-keo-my', '', 'dk-2-giuong-noc-thap', '/san-pham/dk-2-giuong-noc-thap', 'ĐK 2 GIƯỜNG NÓC THẤP', 'ĐK 2 GIƯỜNG NÓC THẤP', '', '{}', '0.00', 'unit', 'available', 'International', '', '', '0', '0', '', '', '', '[]', '{}', 'ĐK 2 GIƯỜNG NÓC THẤP', '', 'ĐK 2 GIƯỜNG NÓC THẤP', '', 'false', 'true', '52'),
    ('dau-keo-howo', '', 'dk-howo-a7-may-420', '/san-pham/dk-howo-a7-may-420', 'ĐK HOWO A7 MÁY 420', 'ĐK HOWO A7 MÁY 420', '', '{}', '0.00', 'unit', 'available', 'Howo', '', '', '0', '0', '', '', '', '[]', '{}', 'ĐK HOWO A7 MÁY 420', '', 'ĐK HOWO A7 MÁY 420', '', 'false', 'true', '53'),
    ('so-mi-ro-mooc-ben', '', 'so-mi-ro-mooc-ben-doosung-3-truc-ty-ben-hyva-202-196-tong-c-ty-doosung-mien-nam', '/san-pham/so-mi-ro-mooc-ben-doosung-3-truc-ty-ben-hyva-202-196-tong-c-ty-doosung-mien-nam', 'sơ mi rơ mooc ben doosung 3 truc ty ben hyva 202-196 / Tổng c.ty doosung miền nam', 'sơ mi rơ mooc ben doosung 3 truc ty ben hyva 202-196 / Tổng c.ty doosung miền nam', '', '{}', '0.00', 'unit', 'available', 'Doosung', '', '', '0', '0', '', '', '', '[]', '{}', 'sơ mi rơ mooc ben doosung 3 truc ty ben hyva 202-196 / Tổng c.ty doosung miền nam', '', 'sơ mi rơ mooc ben doosung 3 truc ty ben hyva 202-196 / Tổng c.ty doosung miền nam', '', 'false', 'true', '54'),
    ('so-mi-ro-mooc-long', '', 'somiromooc-long-doosung-3-truc-40-feet-san-xuat-2018', '/san-pham/somiromooc-long-doosung-3-truc-40-feet-san-xuat-2018', 'somiromooc lồng doosung 3 truc 40 feet sản xuất 2018', 'somiromooc lồng doosung 3 truc 40 feet sản xuất 2018', '', '{}', '0.00', 'unit', 'available', 'Doosung', '', '', '0', '0', '', '', '', '[]', '{}', 'somiromooc lồng doosung 3 truc 40 feet sản xuất 2018', '', 'somiromooc lồng doosung 3 truc 40 feet sản xuất 2018', '', 'false', 'true', '55'),
    ('so-mi-ro-mooc-phu-tung', '', 'phu-tung-dongfeng', '/san-pham/phu-tung-dongfeng', 'PHỤ TÙNG DONGFENG', 'PHỤ TÙNG DONGFENG', '', '{}', '0.00', 'unit', 'available', 'Dongfeng', '', '', '0', '0', '', '', '', '[]', '{}', 'PHỤ TÙNG DONGFENG', '', 'PHỤ TÙNG DONGFENG', '', 'false', 'true', '56'),
    ('so-mi-ro-mooc-phu-tung', '', 'phu-tung-dongfengh', '/san-pham/phu-tung-dongfengh', 'PHỤ TÙNG DONGFENGH', 'PHỤ TÙNG DONGFENGH', '', '{}', '0.00', 'unit', 'available', 'Dongfeng', '', '', '0', '0', '', '', '', '[]', '{}', 'PHỤ TÙNG DONGFENGH', '', 'PHỤ TÙNG DONGFENGH', '', 'false', 'true', '57'),
    ('so-mi-ro-mooc-phu-tung', '', 'howo-sinotruck', '/san-pham/howo-sinotruck', 'HOWO SINOTRUCK', 'HOWO SINOTRUCK', '', '{}', '0.00', 'unit', 'available', 'Howo', '', '', '0', '0', '', '', '', '[]', '{}', 'HOWO SINOTRUCK', '', 'HOWO SINOTRUCK', '', 'false', 'true', '58'),
    ('so-mi-ro-mooc-bon', '', 'so-mi-ro-mooc-bon-cho-hoa-chat-39m3-inox-tong-kho-mien-nam', '/san-pham/so-mi-ro-mooc-bon-cho-hoa-chat-39m3-inox-tong-kho-mien-nam', 'sơ mi rơ mooc Bồn chở Hóa Chất 39m3 inox/Tổng Kho Miền Nam', 'sơ mi rơ mooc Bồn chở Hóa Chất 39m3 inox/Tổng Kho Miền Nam', '', '{}', '0.00', 'unit', 'available', '', '', '', '0', '0', '', '', '', '[]', '{}', 'sơ mi rơ mooc Bồn chở Hóa Chất 39m3 inox/Tổng Kho Miền Nam', '', 'sơ mi rơ mooc Bồn chở Hóa Chất 39m3 inox/Tổng Kho Miền Nam', '', 'false', 'true', '59'),
    ('so-mi-ro-mooc-xitec', '', 'so-mi-ro-mooc-xitec-xang-dau-nhom-44-khoi-tong-kho-mien-nam', '/san-pham/so-mi-ro-mooc-xitec-xang-dau-nhom-44-khoi-tong-kho-mien-nam', 'Sơ Mi Rơ Mooc Xitec Xăng Dầu Nhôm 44 Khối / Tổng Kho Miền Nam', 'Sơ Mi Rơ Mooc Xitec Xăng Dầu Nhôm 44 Khối / Tổng Kho Miền Nam', '', '{}', '0.00', 'unit', 'available', '', '', '', '0', '0', '', '', '', '[]', '{}', 'Sơ Mi Rơ Mooc Xitec Xăng Dầu Nhôm 44 Khối / Tổng Kho Miền Nam', '', 'Sơ Mi Rơ Mooc Xitec Xăng Dầu Nhôm 44 Khối / Tổng Kho Miền Nam', '', 'false', 'true', '60'),
    ('so-mi-ro-mooc-long', '', 'so-mi-ro-mooc-long-sieu-dai-48-feet-dai-14m6-tai-29-600-kg-tong-kho-mooc-thaco-mn', '/san-pham/so-mi-ro-mooc-long-sieu-dai-48-feet-dai-14m6-tai-29-600-kg-tong-kho-mooc-thaco-mn', 'Sơ Mi Rơ Mooc Lồng Siêu Dài 48 Feet Dài 14m6 Tải 29.600 kg/ Tổng Kho Mooc Thaco MN', 'Sơ Mi Rơ Mooc Lồng Siêu Dài 48 Feet Dài 14m6 Tải 29.600 kg/ Tổng Kho Mooc Thaco MN', '', '{}', '0.00', 'unit', 'available', 'Thaco', '', '', '0', '0', '', '', '', '[]', '{}', 'Sơ Mi Rơ Mooc Lồng Siêu Dài 48 Feet Dài 14m6 Tải 29.600 kg/ Tổng Kho Mooc Thaco MN', '', 'Sơ Mi Rơ Mooc Lồng Siêu Dài 48 Feet Dài 14m6 Tải 29.600 kg/ Tổng Kho Mooc Thaco MN', '', 'false', 'true', '61')

)
INSERT INTO products (
  category_level_2_id,
  product_code,
  slug,
  legacy_path,
  title,
  short_description,
  content,
  technical_specs,
  price_vnd,
  unit,
  status,
  brand,
  vehicle_type,
  condition,
  year,
  mileage_km,
  fuel_type,
  transmission,
  location,
  images,
  seo,
  title_seo,
  keywords,
  meta_description,
  image_url,
  is_featured,
  is_visible,
  sort_order,
  created_at,
  updated_at
)
SELECT
  c2.id,
  product_seed.product_code,
  product_seed.slug,
  product_seed.legacy_path,
  product_seed.title,
  product_seed.short_description,
  product_seed.content,
  product_seed.technical_specs::jsonb,
  product_seed.price_vnd,
  product_seed.unit,
  product_seed.status,
  product_seed.brand,
  product_seed.vehicle_type,
  product_seed.condition,
  product_seed.year::integer,
  product_seed.mileage_km::integer,
  product_seed.fuel_type,
  product_seed.transmission,
  product_seed.location,
  product_seed.images::jsonb,
  product_seed.seo::jsonb,
  product_seed.title_seo,
  product_seed.keywords,
  product_seed.meta_description,
  product_seed.image_url,
  product_seed.is_featured::boolean,
  product_seed.is_visible::boolean,
  product_seed.sort_order::integer,
  NOW(),
  NOW()
FROM product_seed
JOIN category_level_2 c2 ON c2.slug = product_seed.category_slug;

COMMIT;
