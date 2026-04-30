BEGIN;

ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS zalo TEXT NOT NULL DEFAULT '';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'settings'
      AND column_name = 'yahoo'
  ) THEN
    EXECUTE $sql$
      UPDATE settings
      SET zalo = COALESCE(NULLIF(zalo, ''), yahoo, '')
      WHERE COALESCE(zalo, '') = ''
    $sql$;
  END IF;
END $$;

ALTER TABLE settings
  DROP COLUMN IF EXISTS yahoo;

COMMIT;
