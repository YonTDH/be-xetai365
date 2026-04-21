CREATE TABLE IF NOT EXISTS bulletins (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(220) NOT NULL UNIQUE,
  bulletin_type VARCHAR(40) NOT NULL CHECK (bulletin_type IN ('news_event', 'promotion')),
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  status VARCHAR(40) NOT NULL DEFAULT 'published',
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bulletins_type_status
  ON bulletins (bulletin_type, status);

CREATE INDEX IF NOT EXISTS idx_bulletins_published_at
  ON bulletins (published_at DESC);
