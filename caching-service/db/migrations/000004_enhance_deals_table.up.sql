-- caching-service/db/migrations/000004_enhance_deals_table.up.sql
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS token_address VARCHAR(42),
ADD COLUMN IF NOT EXISTS work_status INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS project_description TEXT,
ADD COLUMN IF NOT EXISTS work_submission TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing records
UPDATE deals SET updated_at = created_at WHERE updated_at IS NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_deals_client ON deals(client_address);
CREATE INDEX IF NOT EXISTS idx_deals_freelancer ON deals(freelancer_address);
CREATE INDEX IF NOT EXISTS idx_deals_arbiter ON deals(arbiter_address);
CREATE INDEX IF NOT EXISTS idx_deals_token ON deals(token_address);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_work_status ON deals(work_status);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at);
