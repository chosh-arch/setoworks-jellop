ALTER TABLE crawl_jobs ADD COLUMN IF NOT EXISTS crawl_type TEXT DEFAULT 'product';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS crawl_type TEXT DEFAULT 'product';
ALTER TABLE crawl_jobs ADD COLUMN IF NOT EXISTS page_num INTEGER DEFAULT 1;
ALTER TABLE crawl_jobs ADD COLUMN IF NOT EXISTS total_pages INTEGER DEFAULT 1;

CREATE TABLE IF NOT EXISTS crawl_settings (
  id TEXT PRIMARY KEY,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE crawl_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO crawl_settings (id, setting_key, setting_value) VALUES
  ('min_score', 'influencer_min_pure_score', '0'),
  ('min_subs', 'influencer_min_subscribers', '1000'),
  ('crawl_mode', 'product_crawl_mode', '"full"'),
  ('items_per_cat', 'default_items_per_category', '50')
ON CONFLICT (id) DO NOTHING;
