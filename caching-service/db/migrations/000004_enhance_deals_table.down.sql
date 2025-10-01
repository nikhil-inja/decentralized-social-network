-- caching-service/db/migrations/000004_enhance_deals_table.down.sql
ALTER TABLE deals 
DROP COLUMN IF EXISTS token_address,
DROP COLUMN IF EXISTS work_status,
DROP COLUMN IF EXISTS project_description,
DROP COLUMN IF EXISTS work_submission,
DROP COLUMN IF EXISTS updated_at;

-- Drop indexes
DROP INDEX IF EXISTS idx_deals_client;
DROP INDEX IF EXISTS idx_deals_freelancer;
DROP INDEX IF EXISTS idx_deals_arbiter;
DROP INDEX IF EXISTS idx_deals_token;
DROP INDEX IF EXISTS idx_deals_status;
DROP INDEX IF EXISTS idx_deals_work_status;
DROP INDEX IF EXISTS idx_deals_created_at;
