-- Migrate existing DBs from (reformer/tapis/chaise × pratique/observation)
-- to (reformer/sol × pratique/enseignement/observation).
-- Safe to re-run for the data steps; enum ADD VALUE is idempotent on PG 9.1+
-- only when the value is absent (errors if already present — ignore then).

-- 1. New enum values
alter type session_type add value if not exists 'enseignement';
alter type equipment add value if not exists 'sol';

-- 2. Map old equipment to new
update sessions set equipment = 'sol' where equipment in ('tapis', 'chaise');
