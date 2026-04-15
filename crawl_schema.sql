CREATE TABLE IF NOT EXISTS platforms (
  id TEXT PRIMARY KEY, display_name TEXT NOT NULL, country TEXT NOT NULL,
  base_url TEXT NOT NULL, category_count INTEGER DEFAULT 0,
  requires_proxy BOOLEAN DEFAULT FALSE, is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS crawl_categories (
  id SERIAL PRIMARY KEY, platform_id TEXT REFERENCES platforms(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL, name TEXT NOT NULL, name_en TEXT,
  UNIQUE(platform_id, external_id)
);
CREATE TABLE IF NOT EXISTS crawl_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_id TEXT REFERENCES platforms(id),
  category_id INTEGER REFERENCES crawl_categories(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','running','completed','failed','rate_limited')),
  triggered_by TEXT DEFAULT 'manual', batch_id UUID, items_per_category INTEGER DEFAULT 10,
  started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ, error_message TEXT,
  project_count INTEGER DEFAULT 0, retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY, platform_id TEXT REFERENCES platforms(id),
  category_id INTEGER REFERENCES crawl_categories(id),
  external_id TEXT, name TEXT NOT NULL, description TEXT, creator TEXT,
  goal NUMERIC, pledged NUMERIC, currency TEXT, percent_funded NUMERIC,
  backers_count INTEGER, url TEXT, photo_url TEXT, photo_storage_path TEXT,
  extra_data JSONB DEFAULT '{}', crawl_job_id UUID REFERENCES crawl_jobs(id),
  crawled_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(platform_id, external_id)
);
CREATE INDEX IF NOT EXISTS idx_prj_platform ON projects(platform_id);
CREATE INDEX IF NOT EXISTS idx_prj_crawled ON projects(crawled_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_st ON crawl_jobs(status);

ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_jobs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='rp' AND tablename='platforms') THEN
    CREATE POLICY rp ON platforms FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='rc' AND tablename='crawl_categories') THEN
    CREATE POLICY rc ON crawl_categories FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='rpj' AND tablename='projects') THEN
    CREATE POLICY rpj ON projects FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='rj' AND tablename='crawl_jobs') THEN
    CREATE POLICY rj ON crawl_jobs FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='wp' AND tablename='platforms') THEN
    CREATE POLICY wp ON platforms FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='wc' AND tablename='crawl_categories') THEN
    CREATE POLICY wc ON crawl_categories FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='wpj' AND tablename='projects') THEN
    CREATE POLICY wpj ON projects FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='wj' AND tablename='crawl_jobs') THEN
    CREATE POLICY wj ON crawl_jobs FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='upj' AND tablename='projects') THEN
    CREATE POLICY upj ON projects FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='uj' AND tablename='crawl_jobs') THEN
    CREATE POLICY uj ON crawl_jobs FOR UPDATE USING (true);
  END IF;
END $$;
