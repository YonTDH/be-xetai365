BEGIN;

ALTER TABLE bulletins
  DROP CONSTRAINT IF EXISTS bulletins_bulletin_type_check,
  DROP CONSTRAINT IF EXISTS ck_bulletins_type;

ALTER TABLE bulletins
  ADD CONSTRAINT ck_bulletins_type
    CHECK (bulletin_type IN ('news_event', 'promotion', 'recruitment', 'services'));

COMMIT;
