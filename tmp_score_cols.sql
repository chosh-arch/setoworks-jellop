ALTER TABLE influencers ADD COLUMN IF NOT EXISTS youtube_score REAL;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS instagram_score REAL;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS tiktok_score REAL;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS total_score REAL;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS monthly_uploads REAL;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS threads_id TEXT;
