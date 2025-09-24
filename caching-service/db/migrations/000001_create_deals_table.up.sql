-- caching-service/db/migrations/000001_create_deals_table.up.sql
CREATE TABLE deals (
    id SERIAL PRIMARY KEY,
    contract_address VARCHAR(42) NOT NULL UNIQUE,
    client_address VARCHAR(42) NOT NULL,
    freelancer_address VARCHAR(42) NOT NULL,
    arbiter_address VARCHAR(42) NOT NULL,
    total_amount TEXT NOT NULL,
    status INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);