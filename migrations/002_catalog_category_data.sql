BEGIN;

-- Catalog category data and product-to-level-2 mapping.
-- Idempotent: safe to run on fresh or already-populated databases.

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
  v.sort_order, TRUE, 'Managed by consolidated catalog migration', NOW(), NOW()
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
  updated_at = NOW();

UPDATE products AS p
SET
  category_level_2_id = c2.id,
  updated_at = NOW()
FROM (
  VALUES
    ('tera245sl-2-tan-4-tiet-kiem-nhien-lieu-may-khoe-hop-so-nhe-sang-so-em', 'xe-tai-teraco'),
    ('tram-bao-hanh-xe-tai-dongfeng-4-chan-cummins-isl315-tai-17-9-tan-mien-nam', 'xe-tai-dongfeng'),
    ('tera345sl-3t5', 'xe-tai-teraco'),
    ('tera-v8', 'xe-tai-teraco'),
    ('dongfeng-b190-9t150', 'xe-tai-dongfeng'),
    ('gia-xe-tai-dongfeng-hoang-huy-b180-thung-inox-9-tan-moi-nhat', 'xe-tai-dongfeng'),
    ('xe-tai-dongfeng-hoang-huy-b180-mau-thung-dai-9-7-met', 'xe-tai-dongfeng'),
    ('xe-tai-dongfeng-hoang-huy-b180-thung-inox-7-7m-mau-moi', 'xe-tai-dongfeng'),
    ('ra-mat-mau-xe-tai-dongfeng-hoang-huy-b180-thung-kin-9m7-tai-7-5-tan-tram-bao-hanh-dongfeng', 'xe-tai-dongfeng'),
    ('chi-tiet-xe-tai-dongfeng-b180-thung-pallet-dai-9m7-tai-8-tan-tong-kho-mien-nam', 'xe-tai-dongfeng'),
    ('xe-tai-thung-canh-doi-ban-hang-luu-dong-dongfeng-hoang-huy-b180', 'xe-tai-dongfeng'),
    ('xe-cho-heo-15-tan-dongfeng-hoang-huy-l315-cho-gia-suc-4-tang-co-bung-nang-dieu-hoa-voi-nuoc-camera', 'xe-tai-dongfeng'),
    ('xe-tai-teraco-100-thung-lung-990kg-may-mitsubishi-deahan-motor-viet-nam', 'xe-tai-teraco'),
    ('xe-tai-teraco-100-thung-mui-bat-990kg-dong-co-mitsubishi-tech-deahan-motor-tong-kho-mien-nam', 'xe-tai-teraco'),
    ('xe-tai-teraco-100-thung-kin-990kg-dong-co-mitsubishi-tech-deahan-motor-tong-kho-mien-nam', 'xe-tai-teraco'),
    ('xe-tai-teraco-990kg-ban-hang-luu-dong-may-mitsubishi-tech-deahan-motor-tong-kho-mien-nam', 'xe-tai-teraco'),
    ('xe-tai-hyundai-porter-h150-tai-1495-kg-tong-kho-hyundai-tc-motor', 'xe-tai-hyundai'),
    ('xe-tai-hyundai-new-mighty-110xl-thung-dai-6m3-tai-7-tan-tong-kho-hyundai-thanh-cong-by-tc-motor', 'xe-tai-hyundai'),
    ('xe-tai-dongfeng-b180-9-tan-thung-dai-9m7-dongfeng-tong-kho-mien-nam', 'xe-tai-dongfeng'),
    ('teraco-150-180', 'xe-tai-teraco'),
    ('gia-xe-tai-teraco-tera-190sl-tera-345sl-may-isuzu-tram-dich-vu-3s-doc-quyen-tai-binh-phuoc', 'xe-tai-teraco'),
    ('xe-tai-hyundai-new-mighty-n250sl-thung-dai-4m3-tai-3-tan-tong-kho-hyundai-thanh-cong-by-tc-motor', 'xe-tai-hyundai'),
    ('xe-ep-rac-14-khoi-nhap-khau-gia-re-tong-kho-co-mien-nam', 'xe-ep-rac'),
    ('xe-chua-chay-khu-cong-nghiep-3-chuc-nang-6-khoi-phu-hop-nd-79-2014-nd-cp', 'xe-chua-chay'),
    ('dongfeng-lap-cau-soosan-12t-moi-100', 'xe-cau'),
    ('dongfeng-lap-cau-atom-14-tan-5-khuc', 'xe-cau'),
    ('dongfeng-4-chan-bon-xitec-xang-dau-22-5-khoi-o-to-nhan-luc', 'xitec-xang-dau'),
    ('xe-bon-xang-dau', 'xitec-xang-dau'),
    ('hd-210-thung-dong-lanh', 'xe-dong-lanh'),
    ('dongfeng-thung-kin-thung-dai-9-5-met', 'thung-kin-chuyen-dung'),
    ('kamaz-bon-xang-dau', 'xitec-xang-dau'),
    ('xe-cho-xe-co-gioi-dongfeng-b170', 'xe-cho-xe-co-gioi'),
    ('xe-ben-maz-euro-4-model-6501b3-dai-ly-3s-maz-belarus', 'xe-ben'),
    ('xe-cuu-ho-giao-thong-3-chuc-nang-cho-xe-keo-xe-cau-gap-5-tan-chuyen-dung-nhap-khau', 'xe-cuu-ho-giao-thong'),
    ('cuu-ho-giao-thong-3-chuc-nang-cho-keo-cau-gap-3-2-tan-chuyen-dung-nhap-khau-mien-nam', 'xe-cuu-ho-giao-thong'),
    ('xe-cuu-ho-2-chuc-nang-san-truot-dongfeng-ho-bac-tong-dai-ly-chuyen-dung-mien-nam', 'xe-cuu-ho-giao-thong'),
    ('xe-tuoi-nuoc-9-khoi-dongfeng-tong-c-tv-chuyen-dung-mien-nam', 'xe-tuoi-nuoc'),
    ('xe-hut-chat-thai-faw-5-khoi-hut-ham-cau-hut-be-phot', 'xe-hut-chat-thai'),
    ('xe-cuu-ho-cang-gap-sx-2019-khong-nien-han-xe-chuyen-dung-nhap-khau-sai-gon', 'xe-cuu-ho-giao-thong'),
    ('xe-cuu-ho-cang-gap-howo-cau-nang-ha-30-tan-xe-chuyen-dung-nhap-khau-sai-gon', 'xe-cuu-ho-giao-thong'),
    ('xe-bon-tuoi-nuoc', 'xe-tuoi-nuoc'),
    ('noi-giuong-dau-keo-my-0-giuong-nhu-the-nao', 'dau-keo-my'),
    ('dau-keo-my-1-giuong-may-maxxforce-430-450-475-hp-dai-ly-3s-international', 'dau-keo-my'),
    ('so-sanh-dau-keo-my-dong-co-n13-so-voi-maxxforce-13-cho-thue-dau-keo', 'dau-keo-my'),
    ('ban-va-cho-thue-dau-keo-my-2-giuong-dai-ly-3s-international-vn', 'dau-keo-my'),
    ('dau-keo-maz-belarus-6430b7-san-xuat-2018-tong-kho-maz-asia-mien-nam', 'dau-keo-maz'),
    ('xe-dau-keo-dongfeng-mau-2019-euro-4-may-cummins-400hp-tram-bao-hanh-dongfeng', 'dau-keo-dongfeng'),
    ('xe-dau-keo-dongfeng-hoang-huy-2-cau-may-420-hp-mau-moi-tram-bao-hanh-dongfeng', 'dau-keo-dongfeng'),
    ('dk-howo-t5g', 'dau-keo-howo'),
    ('dk-howo-a7-may-375', 'dau-keo-howo'),
    ('dk-1-giuong-noc-thap', 'dau-keo-my'),
    ('dk-2-giuong-noc-thap', 'dau-keo-my'),
    ('dk-howo-a7-may-420', 'dau-keo-howo'),
    ('so-mi-ro-mooc-ben-doosung-3-truc-ty-ben-hyva-202-196-tong-c-ty-doosung-mien-nam', 'so-mi-ro-mooc-ben'),
    ('somiromooc-long-doosung-3-truc-40-feet-san-xuat-2018', 'so-mi-ro-mooc-long'),
    ('phu-tung-dongfeng', 'so-mi-ro-mooc-phu-tung'),
    ('phu-tung-dongfengh', 'so-mi-ro-mooc-phu-tung'),
    ('howo-sinotruck', 'so-mi-ro-mooc-phu-tung'),
    ('so-mi-ro-mooc-bon-cho-hoa-chat-39m3-inox-tong-kho-mien-nam', 'so-mi-ro-mooc-bon'),
    ('so-mi-ro-mooc-xitec-xang-dau-nhom-44-khoi-tong-kho-mien-nam', 'so-mi-ro-mooc-xitec'),
    ('so-mi-ro-mooc-long-sieu-dai-48-feet-dai-14m6-tai-29-600-kg-tong-kho-mooc-thaco-mn', 'so-mi-ro-mooc-long')
) AS m(product_slug, category_slug)
JOIN category_level_2 c2 ON c2.slug = m.category_slug
WHERE p.slug = m.product_slug
  AND p.category_level_2_id IS DISTINCT FROM c2.id;

COMMIT;
