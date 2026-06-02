BEGIN;

-- Fill product brands inferred from product titles, slugs, and catalog groups.

UPDATE products AS p
SET
  brand = v.brand,
  updated_at = NOW()
FROM (
  VALUES
    ('tera245sl-2-tan-4-tiet-kiem-nhien-lieu-may-khoe-hop-so-nhe-sang-so-em', 'Teraco'),
    ('tram-bao-hanh-xe-tai-dongfeng-4-chan-cummins-isl315-tai-17-9-tan-mien-nam', 'Dongfeng'),
    ('tera345sl-3t5', 'Teraco'),
    ('tera-v8', 'Teraco'),
    ('dongfeng-b190-9t150', 'Dongfeng'),
    ('gia-xe-tai-dongfeng-hoang-huy-b180-thung-inox-9-tan-moi-nhat', 'Dongfeng'),
    ('xe-tai-dongfeng-hoang-huy-b180-mau-thung-dai-9-7-met', 'Dongfeng'),
    ('xe-tai-dongfeng-hoang-huy-b180-thung-inox-7-7m-mau-moi', 'Dongfeng'),
    ('ra-mat-mau-xe-tai-dongfeng-hoang-huy-b180-thung-kin-9m7-tai-7-5-tan-tram-bao-hanh-dongfeng', 'Dongfeng'),
    ('chi-tiet-xe-tai-dongfeng-b180-thung-pallet-dai-9m7-tai-8-tan-tong-kho-mien-nam', 'Dongfeng'),
    ('xe-tai-thung-canh-doi-ban-hang-luu-dong-dongfeng-hoang-huy-b180', 'Dongfeng'),
    ('xe-cho-heo-15-tan-dongfeng-hoang-huy-l315-cho-gia-suc-4-tang-co-bung-nang-dieu-hoa-voi-nuoc-camera', 'Dongfeng'),
    ('xe-tai-teraco-100-thung-lung-990kg-may-mitsubishi-deahan-motor-viet-nam', 'Teraco'),
    ('xe-tai-teraco-100-thung-mui-bat-990kg-dong-co-mitsubishi-tech-deahan-motor-tong-kho-mien-nam', 'Teraco'),
    ('xe-tai-teraco-100-thung-kin-990kg-dong-co-mitsubishi-tech-deahan-motor-tong-kho-mien-nam', 'Teraco'),
    ('xe-tai-teraco-990kg-ban-hang-luu-dong-may-mitsubishi-tech-deahan-motor-tong-kho-mien-nam', 'Teraco'),
    ('xe-tai-hyundai-porter-h150-tai-1495-kg-tong-kho-hyundai-tc-motor', 'Hyundai'),
    ('xe-tai-hyundai-new-mighty-110xl-thung-dai-6m3-tai-7-tan-tong-kho-hyundai-thanh-cong-by-tc-motor', 'Hyundai'),
    ('xe-tai-dongfeng-b180-9-tan-thung-dai-9m7-dongfeng-tong-kho-mien-nam', 'Dongfeng'),
    ('teraco-150-180', 'Teraco'),
    ('gia-xe-tai-teraco-tera-190sl-tera-345sl-may-isuzu-tram-dich-vu-3s-doc-quyen-tai-binh-phuoc', 'Teraco'),
    ('xe-tai-hyundai-new-mighty-n250sl-thung-dai-4m3-tai-3-tan-tong-kho-hyundai-thanh-cong-by-tc-motor', 'Hyundai'),
    ('xe-ep-rac-14-khoi-nhap-khau-gia-re-tong-kho-co-mien-nam', ''),
    ('xe-chua-chay-khu-cong-nghiep-3-chuc-nang-6-khoi-phu-hop-nd-79-2014-nd-cp', ''),
    ('dongfeng-lap-cau-soosan-12t-moi-100', 'Dongfeng'),
    ('dongfeng-lap-cau-atom-14-tan-5-khuc', 'Dongfeng'),
    ('dongfeng-4-chan-bon-xitec-xang-dau-22-5-khoi-o-to-nhan-luc', 'Dongfeng'),
    ('xe-bon-xang-dau', ''),
    ('hd-210-thung-dong-lanh', 'Hyundai'),
    ('dongfeng-thung-kin-thung-dai-9-5-met', 'Dongfeng'),
    ('kamaz-bon-xang-dau', 'Kamaz'),
    ('xe-cho-xe-co-gioi-dongfeng-b170', 'Dongfeng'),
    ('xe-ben-maz-euro-4-model-6501b3-dai-ly-3s-maz-belarus', 'Maz'),
    ('xe-cuu-ho-giao-thong-3-chuc-nang-cho-xe-keo-xe-cau-gap-5-tan-chuyen-dung-nhap-khau', ''),
    ('cuu-ho-giao-thong-3-chuc-nang-cho-keo-cau-gap-3-2-tan-chuyen-dung-nhap-khau-mien-nam', ''),
    ('xe-cuu-ho-2-chuc-nang-san-truot-dongfeng-ho-bac-tong-dai-ly-chuyen-dung-mien-nam', 'Dongfeng'),
    ('xe-tuoi-nuoc-9-khoi-dongfeng-tong-c-tv-chuyen-dung-mien-nam', 'Dongfeng'),
    ('xe-hut-chat-thai-faw-5-khoi-hut-ham-cau-hut-be-phot', 'FAW'),
    ('xe-cuu-ho-cang-gap-sx-2019-khong-nien-han-xe-chuyen-dung-nhap-khau-sai-gon', ''),
    ('xe-cuu-ho-cang-gap-howo-cau-nang-ha-30-tan-xe-chuyen-dung-nhap-khau-sai-gon', 'Howo'),
    ('xe-bon-tuoi-nuoc', ''),
    ('noi-giuong-dau-keo-my-0-giuong-nhu-the-nao', 'International'),
    ('dau-keo-my-1-giuong-may-maxxforce-430-450-475-hp-dai-ly-3s-international', 'International'),
    ('so-sanh-dau-keo-my-dong-co-n13-so-voi-maxxforce-13-cho-thue-dau-keo', 'International'),
    ('ban-va-cho-thue-dau-keo-my-2-giuong-dai-ly-3s-international-vn', 'International'),
    ('dau-keo-maz-belarus-6430b7-san-xuat-2018-tong-kho-maz-asia-mien-nam', 'Maz'),
    ('xe-dau-keo-dongfeng-mau-2019-euro-4-may-cummins-400hp-tram-bao-hanh-dongfeng', 'Dongfeng'),
    ('xe-dau-keo-dongfeng-hoang-huy-2-cau-may-420-hp-mau-moi-tram-bao-hanh-dongfeng', 'Dongfeng'),
    ('dk-howo-t5g', 'Howo'),
    ('dk-howo-a7-may-375', 'Howo'),
    ('dk-1-giuong-noc-thap', 'International'),
    ('dk-2-giuong-noc-thap', 'International'),
    ('dk-howo-a7-may-420', 'Howo'),
    ('so-mi-ro-mooc-ben-doosung-3-truc-ty-ben-hyva-202-196-tong-c-ty-doosung-mien-nam', 'Doosung'),
    ('somiromooc-long-doosung-3-truc-40-feet-san-xuat-2018', 'Doosung'),
    ('phu-tung-dongfeng', 'Dongfeng'),
    ('phu-tung-dongfengh', 'Dongfeng'),
    ('howo-sinotruck', 'Howo'),
    ('so-mi-ro-mooc-bon-cho-hoa-chat-39m3-inox-tong-kho-mien-nam', ''),
    ('so-mi-ro-mooc-xitec-xang-dau-nhom-44-khoi-tong-kho-mien-nam', ''),
    ('so-mi-ro-mooc-long-sieu-dai-48-feet-dai-14m6-tai-29-600-kg-tong-kho-mooc-thaco-mn', 'Thaco')
) AS v(slug, brand)
WHERE p.slug = v.slug
  AND p.brand IS DISTINCT FROM v.brand;

COMMIT;
