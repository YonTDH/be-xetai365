UPDATE vehicle_categories
SET
  name = CASE
    WHEN slug = 'xe-dau-keo' THEN 'Xe đầu kéo'
    WHEN slug = 'xe-tai' THEN 'Xe tải'
    WHEN slug = 'xe-chuyen-dung' THEN 'Xe chuyên dụng'
    WHEN slug = 'so-mi-ro-mooc' THEN 'Sơ mi rơ moóc'
    WHEN slug = 'dau-keo-my' THEN 'Đầu kéo Mỹ'
    ELSE name
  END,
  description = CASE
    WHEN slug = 'xe-dau-keo' THEN 'Nhóm xe đầu kéo'
    WHEN slug = 'xe-tai' THEN 'Xe tải thùng, xe tải nhẹ, xe tải trung và nặng.'
    WHEN slug = 'xe-chuyen-dung' THEN 'Xe ben, xe bồn, xe cẩu và các dòng xe chuyên dụng.'
    WHEN slug = 'so-mi-ro-mooc' THEN 'Các dòng sơ mi rơ moóc phục vụ vận tải hàng hóa.'
    WHEN slug = 'dau-keo-my' THEN 'Đầu kéo Mỹ'
    ELSE description
  END,
  updated_at = NOW()
WHERE slug IN (
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
