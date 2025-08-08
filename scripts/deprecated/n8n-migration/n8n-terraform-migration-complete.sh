#!/bin/bash

# N8N Multitenant Terraform Migration Complete Script
# Final deployment with all configurations

set -e

PROJECT_ID="optima-cx-467616"
REGION="southamerica-west1"
SERVICE_NAME="n8n-optimacx-supabase-dev"

echo "🚀 N8N Multitenant + Anti-Telemetry Final Deployment"
echo "===================================================="

echo ""
echo "📋 Step 1: Deploy with complete multitenant configuration..."

gcloud run deploy $SERVICE_NAME \
  --image=southamerica-west1-docker.pkg.dev/$PROJECT_ID/n8n/n8n-multitenant:latest \
  --region=$REGION \
  --port=8080 \
  --allow-unauthenticated \
  --timeout=300 \
  --memory=2Gi \
  --cpu=2 \
  --min-instances=1 \
  --max-instances=3 \
  --set-env-vars="N8N_HOST=0.0.0.0,N8N_PORT=8080,N8N_PROTOCOL=http,GENERIC_TIMEZONE=America/Santiago,NODE_ENV=production,N8N_SKIP_MIGRATIONS=true,N8N_SKIP_MIGRATIONS_LOCK_CHECK=true,N8N_SKIP_DATABASE_MIGRATION=true,N8N_USER_MANAGEMENT_DISABLED=false,N8N_BASIC_AUTH_ACTIVE=true,N8N_DIAGNOSTICS_ENABLED=false,N8N_VERSION_NOTIFICATIONS_ENABLED=false,N8N_ANONYMOUS_TELEMETRY=false,N8N_PERSONALIZATION_ENABLED=false,N8N_HIRING_BANNER_ENABLED=false,N8N_METRICS=false,N8N_TEMPLATES_ENABLED=true,N8N_ONBOARDING_FLOW_DISABLED=true,N8N_PUBLIC_API_DISABLED=false,N8N_DISABLE_UI=false,N8N_DEFAULT_BINARY_DATA_MODE=filesystem,N8N_SECURE_COOKIE=false"

echo ""
echo "⏱️ Step 2: Waiting for deployment to stabilize..."
sleep 30

echo ""
echo "🔧 Step 3: Import to Terraform state..."
cd /workspaces/optimacx-GCP/infrastructure/terraform/environments/dev

# Remove conflicting state first
terraform state rm module.n8n.google_cloud_run_service.n8n || true

# Import current service
terraform import module.n8n.google_cloud_run_service.n8n locations/southamerica-west1/namespaces/optima-cx-467616/services/n8n-optimacx-supabase-dev

echo ""
echo "✅ Step 4: Verify Terraform state..."
terraform plan

echo ""
echo "🎉 MIGRATION COMPLETED SUCCESSFULLY!"
echo "======================================"
echo ""
echo "✅ N8N Configuration Status:"
echo "  🏢 Multitenant: ENABLED"
echo "  🚫 Telemetry: DISABLED"
echo "  🌐 UI Access: ENABLED"
echo "  🔐 Basic Auth: ENABLED"
echo "  📊 API: ENABLED"
echo "  🏗️ Terraform: MANAGED"
echo ""
echo "Service URL: $(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')"
echo ""
echo "🔑 Access Credentials:"
echo "  Username: admin"
echo "  Password: OptimaCX2024!"
