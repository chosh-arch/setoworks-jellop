-- ============================================
-- Setoworks Supabase DB Schema
-- 실행: Supabase Dashboard > SQL Editor
-- ============================================

-- 1. 인플루언서 테이블
CREATE TABLE IF NOT EXISTS influencers (
  id BIGINT PRIMARY KEY,
  platform TEXT NOT NULL DEFAULT 'YouTube',
  platform_id TEXT,
  username TEXT,
  display_name TEXT NOT NULL,
  bio TEXT,
  profile_url TEXT,
  profile_image_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  followers BIGINT DEFAULT 0,
  following BIGINT DEFAULT 0,
  total_posts BIGINT DEFAULT 0,
  category TEXT,
  tier TEXT,
  country TEXT,
  language TEXT,
  pure_score REAL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  first_discovered_at TEXT,
  last_collected_at TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  grade TEXT,
  contact_email TEXT,
  note TEXT,
  content_count BIGINT DEFAULT 0,
  avg_views REAL DEFAULT 0,
  avg_likes REAL DEFAULT 0,
  avg_comments REAL DEFAULT 0,
  total_views BIGINT DEFAULT 0
);

-- 2. 콘텐츠 테이블
CREATE TABLE IF NOT EXISTS contents (
  id BIGSERIAL PRIMARY KEY,
  influencer_id BIGINT REFERENCES influencers(id) ON DELETE CASCADE,
  title TEXT,
  content_url TEXT,
  views BIGINT DEFAULT 0,
  likes BIGINT DEFAULT 0,
  comments BIGINT DEFAULT 0,
  published_at TEXT,
  content_type TEXT
);

-- 3. 크롤링 제품 테이블
CREATE TABLE IF NOT EXISTS crawled_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  platform TEXT,
  funding_goal BIGINT DEFAULT 0,
  current_amount BIGINT DEFAULT 0,
  percentage REAL DEFAULT 0,
  backer_count BIGINT DEFAULT 0,
  days_left INT DEFAULT 0,
  tags JSONB DEFAULT '[]',
  category TEXT,
  url TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. 카테고리 테이블
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name_ko TEXT,
  name_en TEXT,
  icon TEXT,
  influencer_count INT DEFAULT 0
);

-- 5. 수집 로그 테이블
CREATE TABLE IF NOT EXISTS collect_logs (
  id BIGSERIAL PRIMARY KEY,
  log_type TEXT,
  message TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS (Row Level Security) 활성화 + 읽기 허용
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawled_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collect_logs ENABLE ROW LEVEL SECURITY;

-- anon 사용자 읽기 허용 정책
CREATE POLICY "Allow public read" ON influencers FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON contents FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON crawled_products FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON collect_logs FOR SELECT USING (true);

-- anon 사용자 쓰기 허용 (데이터 마이그레이션용)
CREATE POLICY "Allow public insert" ON influencers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON contents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON crawled_products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON collect_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON influencers FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON contents FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON crawled_products FOR UPDATE USING (true);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_influencers_category ON influencers(category);
CREATE INDEX IF NOT EXISTS idx_influencers_tier ON influencers(tier);
CREATE INDEX IF NOT EXISTS idx_influencers_country ON influencers(country);
CREATE INDEX IF NOT EXISTS idx_influencers_grade ON influencers(grade);
CREATE INDEX IF NOT EXISTS idx_contents_influencer ON contents(influencer_id);
CREATE INDEX IF NOT EXISTS idx_products_platform ON crawled_products(platform);
CREATE INDEX IF NOT EXISTS idx_products_category ON crawled_products(category);
