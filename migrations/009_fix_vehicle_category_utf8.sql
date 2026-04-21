UPDATE vehicle_categories
SET
  name = 'Xe tải thùng',
  description = 'Dòng xe tải thùng kín, thùng bạt và thùng lửng.',
  updated_at = NOW()
WHERE slug = 'xe-tai-thung';
