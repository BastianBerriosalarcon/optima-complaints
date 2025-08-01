#!/bin/sh

# Set N8N_PORT to the value of PORT, which is provided by Cloud Run.
# If PORT is not set, default to 5678 for local compatibility.
export N8N_PORT=${PORT:-5678}

# Print the port for debugging purposes
echo "--- Starting n8n on port $N8N_PORT ---"

# Execute n8n directly, bypassing the original entrypoint script
exec n8n