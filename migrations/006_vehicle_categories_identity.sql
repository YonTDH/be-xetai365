CREATE SEQUENCE IF NOT EXISTS vehicle_categories_id_seq;

SELECT setval(
  'vehicle_categories_id_seq',
  COALESCE((SELECT MAX(id) FROM vehicle_categories), 0) + 1,
  false
);

ALTER TABLE vehicle_categories
  ALTER COLUMN id SET DEFAULT nextval('vehicle_categories_id_seq');
