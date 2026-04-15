DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='del_contents' AND tablename='contents') THEN
    EXECUTE 'CREATE POLICY del_contents ON contents FOR DELETE USING (true)';
  END IF;
END $$;
