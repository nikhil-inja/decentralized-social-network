-- caching-service/db/migrations/000003_create_user_profiles_table.up.sql
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    address VARCHAR(42) NOT NULL UNIQUE,
    name VARCHAR(255),
    bio TEXT,
    avatar_hash TEXT,
    skills TEXT, -- Comma-separated list
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_address ON user_profiles(address);
CREATE INDEX idx_user_profiles_rating ON user_profiles(rating);
