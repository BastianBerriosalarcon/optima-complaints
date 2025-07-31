#!/bin/sh

# Start Cloud SQL Proxy in background
/cloud_sql_proxy -instances=optima-cx-467616:southamerica-west1:n8n-postgres-instance=tcp:5432 &

# Wait for proxy to be ready
sleep 10

# Set database host to localhost since proxy handles the connection
export DB_POSTGRESDB_HOST=localhost

# Print environment variables for debugging
echo "Database settings:"
echo "DB_TYPE: $DB_TYPE"
echo "DB_POSTGRESDB_HOST: $DB_POSTGRESDB_HOST"
echo "DB_POSTGRESDB_PORT: $DB_POSTGRESDB_PORT"

# Start n8n
exec /docker-entrypoint.sh