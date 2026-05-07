BEGIN;

ALTER TABLE contact_requests
  ADD COLUMN IF NOT EXISTS is_viewed BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE contact_requests
SET is_viewed = TRUE
WHERE is_viewed IS DISTINCT FROM TRUE;

CREATE INDEX IF NOT EXISTS idx_contact_requests_is_viewed
  ON contact_requests (is_viewed, created_at DESC);

COMMIT;
