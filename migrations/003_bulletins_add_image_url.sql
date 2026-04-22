ALTER TABLE bulletins
ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT '';

UPDATE bulletins
SET image_url = COALESCE(
  NULLIF(TRIM(image_url), ''),
  NULLIF(TRIM(seo->>'imageUrl'), ''),
  NULLIF(TRIM(seo->>'image'), ''),
  NULLIF(TRIM(seo->>'thumbnail'), ''),
  NULLIF(TRIM(seo->>'thumbnailUrl'), ''),
  NULLIF(TRIM(seo->>'coverImage'), ''),
  NULLIF(TRIM(seo->>'cover_image'), ''),
  NULLIF(TRIM(seo->>'ogImage'), ''),
  NULLIF(TRIM((seo->'openGraph')->>'image'), ''),
  ''
);
