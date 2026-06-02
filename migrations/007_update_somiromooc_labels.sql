BEGIN;

UPDATE category_level_1
SET
  name = 'Somiromooc',
  description = 'Danh muc Somiromooc',
  title_seo = 'Somiromooc',
  keywords = 'Somiromooc',
  updated_at = NOW()
WHERE slug = 'so-mi-ro-mooc';

UPDATE category_level_2
SET
  name = CASE slug
    WHEN 'so-mi-ro-mooc-ben' THEN 'Somiromooc ben'
    WHEN 'so-mi-ro-mooc-long' THEN 'Somiromooc long'
    WHEN 'so-mi-ro-mooc-phu-tung' THEN 'Phu tung Somiromooc'
    WHEN 'so-mi-ro-mooc-bon' THEN 'Somiromooc bon'
    WHEN 'so-mi-ro-mooc-xitec' THEN 'Somiromooc xitec'
    WHEN 'tong-hop-so-mi-ro-mooc' THEN 'Tong hop Somiromooc'
    ELSE name
  END,
  title_seo = CASE slug
    WHEN 'so-mi-ro-mooc-ben' THEN 'Somiromooc ben'
    WHEN 'so-mi-ro-mooc-long' THEN 'Somiromooc long'
    WHEN 'so-mi-ro-mooc-phu-tung' THEN 'Phu tung Somiromooc'
    WHEN 'so-mi-ro-mooc-bon' THEN 'Somiromooc bon'
    WHEN 'so-mi-ro-mooc-xitec' THEN 'Somiromooc xitec'
    WHEN 'tong-hop-so-mi-ro-mooc' THEN 'Tong hop Somiromooc'
    ELSE title_seo
  END,
  updated_at = NOW()
WHERE slug IN (
  'so-mi-ro-mooc-ben',
  'so-mi-ro-mooc-long',
  'so-mi-ro-mooc-phu-tung',
  'so-mi-ro-mooc-bon',
  'so-mi-ro-mooc-xitec',
  'tong-hop-so-mi-ro-mooc'
);

COMMIT;
