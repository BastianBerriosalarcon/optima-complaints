#!/bin/sh

# Set N8N_PORT to the value of PORT, which is provided by Cloud Run.
export N8N_PORT=${PORT:-5678}

echo "--- Starting n8n on port $N8N_PORT ---"
echo "--- Environment: SKIP_MIGRATIONS=true ---"

# Force environment variables to skip migrations entirely
export N8N_SKIP_MIGRATIONS=true
export N8N_SKIP_MIGRATIONS_LOCK_CHECK=true
export N8N_SKIP_DATABASE_MIGRATION=true

echo "--- Initializing n8n process with NO MIGRATIONS ---"

# Start n8n server directly without any migration or database checks
exec n8n server