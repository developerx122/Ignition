-- ═══════════════════════════════════════════════════════════════════
-- ⚡ IGNITION - Database Initialization
-- ═══════════════════════════════════════════════════════════════════
-- This script runs automatically when the PostgreSQL container starts
-- for the first time (via docker-entrypoint-initdb.d).

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant permissions (if using a specific role)
-- GRANT ALL PRIVILEGES ON DATABASE ignition TO ignition;

-- Note: The actual schema is managed by Prisma migrations.
-- This file is for any additional database setup that needs
-- to happen before Prisma migrations run.

-- You can add custom functions, triggers, or initial data here.

-- Example: Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
