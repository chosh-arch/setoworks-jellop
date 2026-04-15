DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='rs_settings' AND tablename='crawl_settings') THEN
    CREATE POLICY rs_settings ON crawl_settings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='ws_settings' AND tablename='crawl_settings') THEN
    CREATE POLICY ws_settings ON crawl_settings FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='us_settings' AND tablename='crawl_settings') THEN
    CREATE POLICY us_settings ON crawl_settings FOR UPDATE USING (true);
  END IF;
END $$;
