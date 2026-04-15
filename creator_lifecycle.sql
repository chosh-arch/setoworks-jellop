-- 크리에이터 라이프사이클 관리
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS prev_grade TEXT;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS grade_changed_at TIMESTAMPTZ;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS archive_reason TEXT;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS next_review_at TIMESTAMPTZ;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS last_updated_by TEXT DEFAULT 'auto';
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS update_count INTEGER DEFAULT 0;

-- 등급 변동 이력 테이블
CREATE TABLE IF NOT EXISTS grade_history (
  id BIGSERIAL PRIMARY KEY,
  influencer_id BIGINT REFERENCES influencers(id),
  prev_grade TEXT,
  new_grade TEXT,
  prev_score REAL,
  new_score REAL,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT
);
ALTER TABLE grade_history ENABLE ROW LEVEL SECURITY;

-- 자동 수집 스케줄 테이블
CREATE TABLE IF NOT EXISTS auto_schedules (
  id TEXT PRIMARY KEY,
  schedule_type TEXT NOT NULL,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE auto_schedules ENABLE ROW LEVEL SECURITY;

-- RLS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='rgh' AND tablename='grade_history') THEN
    CREATE POLICY rgh ON grade_history FOR SELECT USING (true);
    CREATE POLICY wgh ON grade_history FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='ras' AND tablename='auto_schedules') THEN
    CREATE POLICY ras ON auto_schedules FOR SELECT USING (true);
    CREATE POLICY was ON auto_schedules FOR INSERT WITH CHECK (true);
    CREATE POLICY uas ON auto_schedules FOR UPDATE USING (true);
  END IF;
END $$;

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_inf_status ON influencers(status);
CREATE INDEX IF NOT EXISTS idx_inf_grade ON influencers(grade);
CREATE INDEX IF NOT EXISTS idx_gh_inf ON grade_history(influencer_id);

-- 초기 스케줄 설정
INSERT INTO auto_schedules (id, schedule_type, config, is_active) VALUES
  ('daily_update', 'channel_update', '{"channels_per_run": 10, "time": "09:00"}', true),
  ('daily_discover', 'new_discovery', '{"channels_per_category": 3, "time": "09:30", "countries": ["JP","KR","TW","US","GB","CN","DE","FR"]}', true),
  ('monthly_c_review', 'c_grade_review', '{"interval_days": 30}', true),
  ('quarterly_archive_review', 'archive_review', '{"interval_days": 90}', true)
ON CONFLICT (id) DO NOTHING;
