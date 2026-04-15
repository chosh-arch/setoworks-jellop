ALTER TABLE influencers DROP CONSTRAINT IF EXISTS influencers_status_check;
ALTER TABLE influencers ADD CONSTRAINT influencers_status_check CHECK (status IN ('active','review','archived','rejected','no_collab'));
