ALTER TABLE vehicle_categories
  ADD COLUMN IF NOT EXISTS parent_id BIGINT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_vehicle_categories_parent'
  ) THEN
    ALTER TABLE vehicle_categories
      ADD CONSTRAINT fk_vehicle_categories_parent
      FOREIGN KEY (parent_id) REFERENCES vehicle_categories (id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_vehicle_categories_parent_id
  ON vehicle_categories (parent_id);
