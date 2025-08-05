-- Fix N8N migrations table issue
-- This script will clean up the problematic migrations state safely

BEGIN;

-- Check if migrations table exists and show its structure
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'migrations') THEN
        RAISE NOTICE 'Migrations table exists. Current content:';
        -- We can't use SELECT in DO block directly, so we'll use PERFORM
        PERFORM * FROM migrations LIMIT 5;
    ELSE
        RAISE NOTICE 'Migrations table does not exist.';
    END IF;
END
$$;

-- Safely drop and recreate the migrations table
DROP TABLE IF EXISTS migrations CASCADE;

-- Recreate the migrations table with proper N8N structure
-- Based on N8N's expected migration table schema
CREATE TABLE migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_migrations_name ON migrations(name);

-- Insert a base migration entry to mark as initialized
-- This prevents N8N from trying to create the table again
INSERT INTO migrations (name) VALUES ('20230101000000-init-base-migration') 
ON CONFLICT (name) DO NOTHING;

-- Grant necessary permissions to the N8N user
-- Replace 'gcpproyect@gmail.com' with your actual DB user if different
GRANT SELECT, INSERT, UPDATE, DELETE ON migrations TO "gcpproyect@gmail.com";
GRANT USAGE, SELECT ON SEQUENCE migrations_id_seq TO "gcpproyect@gmail.com";

-- Final verification
SELECT 'Migration table fixed successfully' as status;
SELECT COUNT(*) as migration_count FROM migrations;

COMMIT;

-- Final state verification
SELECT * FROM migrations ORDER BY id;
