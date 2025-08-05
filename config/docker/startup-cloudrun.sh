#!/bin/sh

# Set N8N_PORT to the value of PORT, which is provided by Cloud Run.
export N8N_PORT=${PORT:-5678}

echo "--- Starting n8n on port $N8N_PORT ---"
echo "--- Environment Variables Debug ---"
echo "N8N_SKIP_MIGRATIONS: ${N8N_SKIP_MIGRATIONS}"
echo "DB_TYPE: ${DB_TYPE}"
echo "NODE_ENV: ${NODE_ENV:-production}"

# Ensure these migration skip flags are set consistently
export N8N_SKIP_MIGRATIONS=${N8N_SKIP_MIGRATIONS:-true}
export N8N_SKIP_MIGRATIONS_LOCK_CHECK=true
export N8N_SKIP_DATABASE_MIGRATION=true

# Set production mode
export NODE_ENV=production

# Health check endpoint
export N8N_METRICS=true

echo "--- Final Migration Settings ---"
echo "N8N_SKIP_MIGRATIONS: $N8N_SKIP_MIGRATIONS"
echo "N8N_SKIP_MIGRATIONS_LOCK_CHECK: $N8N_SKIP_MIGRATIONS_LOCK_CHECK"
echo "N8N_SKIP_DATABASE_MIGRATION: $N8N_SKIP_DATABASE_MIGRATION"

echo "--- Starting n8n server ---"

# Start n8n server with explicit no-migration flags
exec n8n server --tunnel