BEGIN;

ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS zalo TEXT NOT NULL DEFAULT '';

UPDATE settings
SET zalo = COALESCE(NULLIF(zalo, ''), yahoo, '')
WHERE COALESCE(zalo, '') = '';

ALTER TABLE settings
  DROP COLUMN IF EXISTS yahoo;

COMMIT;
