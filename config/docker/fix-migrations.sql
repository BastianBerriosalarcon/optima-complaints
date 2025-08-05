-- Fix N8N migrations table issue
-- This script will clean up the problematic migrations state

-- First, let's see what's in the migrations table
SELECT * FROM migrations LIMIT 5;

-- Drop and recreate the migrations table to fix the issue
DROP TABLE IF EXISTS migrations CASCADE;

-- Recreate the migrations table with proper structure
CREATE TABLE migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a base migration entry to mark as initialized
INSERT INTO migrations (name) VALUES ('init-base-migration');

-- Show final state
SELECT * FROM migrations;
