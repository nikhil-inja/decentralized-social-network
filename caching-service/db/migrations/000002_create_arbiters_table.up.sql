-- caching-service/db/migrations/000002_create_arbiters_table.up.sql
CREATE TABLE arbiters (
    id SERIAL PRIMARY KEY,
    address VARCHAR(42) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    profile_hash TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_arbiters_address ON arbiters(address);
CREATE INDEX idx_arbiters_active ON arbiters(is_active);
