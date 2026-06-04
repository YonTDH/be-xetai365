BEGIN;

ALTER TABLE settings
  ALTER COLUMN facebook SET DEFAULT 'fb.com',
  ALTER COLUMN youtube SET DEFAULT 'youtube.com';

UPDATE settings
SET
  facebook = COALESCE(NULLIF(facebook, ''), 'fb.com'),
  youtube = COALESCE(NULLIF(youtube, ''), 'youtube.com'),
  updated_at = NOW()
WHERE id = 1
  AND (COALESCE(facebook, '') = '' OR COALESCE(youtube, '') = '');

COMMIT;
