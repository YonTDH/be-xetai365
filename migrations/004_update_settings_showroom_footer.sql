BEGIN;

INSERT INTO settings (
  id,
  title,
  email,
  website,
  dienthoai,
  diachi,
  hotline,
  updated_at
)
VALUES (
  1,
  'Ô TÔ NAM VIỆT GROUP',
  'vanducbon99@gmail.com',
  E'https://xetai365.vn\nhttp://otonamvietgroup.com',
  '0899.966.254',
  E'Showroom 1 : Số 16, Đường Dẫn Cầu Phú long, KP. Hòa Long, TP. Thuận An, Tỉnh Bình Dương ( CŨ )\nTRẠM DỊCH VỤ : Số 16/1B, Đường Dẫn Cầu Phú long, KP. Hòa Long, TP. Thuận An, Tỉnh Bình Dương ( CŨ )\nXƯỞNG ĐÓNG THÙNG : 16/1A Đường dẫn cầu Phú Long, P. Lái Thiêu, Tp. Thuận An, Bình Dương',
  '0899.966.254',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = COALESCE(NULLIF(settings.title, ''), EXCLUDED.title),
  email = COALESCE(NULLIF(settings.email, ''), EXCLUDED.email),
  website = COALESCE(NULLIF(settings.website, ''), EXCLUDED.website),
  dienthoai = COALESCE(NULLIF(settings.dienthoai, ''), EXCLUDED.dienthoai),
  diachi = COALESCE(NULLIF(settings.diachi, ''), EXCLUDED.diachi),
  hotline = COALESCE(NULLIF(settings.hotline, ''), EXCLUDED.hotline),
  updated_at = NOW();

COMMIT;
