#!/bin/bash

# N8N Terraform Migration Comparison Script
# Compare current deployment with Terraform configuration

set -e

PROJECT_ID="optima-cx-467616"
REGION="southamerica-west1"
SERVICE_NAME="n8n-optimacx-supabase-dev"

echo "🔍 N8N Terraform Migration Analysis"
echo "===================================="

echo ""
echo "📋 1. Current Cloud Run Service Configuration:"
gcloud run services describe $SERVICE_NAME --region=$REGION --format="yaml" > /tmp/current_config.yaml

echo "✅ Current configuration exported to /tmp/current_config.yaml"

echo ""
echo "📊 2. Current Environment Variables:"
echo "------------------------------------"
gcloud run services describe $SERVICE_NAME --region=$REGION \
  --format="table(spec.template.spec.containers[0].env[].name,spec.template.spec.containers[0].env[].value)" \
  | head -20

echo ""
echo "🎯 3. Multitenant Configuration Status:"
echo "---------------------------------------"
CURRENT_ENV=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(spec.template.spec.containers[0].env[].name)")

# Check multitenant variables
echo "N8N_USER_MANAGEMENT_DISABLED: $(echo "$CURRENT_ENV" | grep -q "N8N_USER_MANAGEMENT_DISABLED" && echo "✅ SET" || echo "❌ MISSING")"
echo "N8N_BASIC_AUTH_ACTIVE: $(echo "$CURRENT_ENV" | grep -q "N8N_BASIC_AUTH_ACTIVE" && echo "✅ SET" || echo "❌ MISSING")"
echo "N8N_BASIC_AUTH_USER: $(echo "$CURRENT_ENV" | grep -q "N8N_BASIC_AUTH_USER" && echo "✅ SET" || echo "❌ MISSING")"
echo "N8N_BASIC_AUTH_PASSWORD: $(echo "$CURRENT_ENV" | grep -q "N8N_BASIC_AUTH_PASSWORD" && echo "✅ SET" || echo "❌ MISSING")"

echo ""
echo "📊 4. Telemetry Configuration Status:" 
echo "------------------------------------"
echo "N8N_DIAGNOSTICS_ENABLED: $(echo "$CURRENT_ENV" | grep -q "N8N_DIAGNOSTICS_ENABLED" && echo "✅ SET" || echo "❌ MISSING")"
echo "N8N_VERSION_NOTIFICATIONS_ENABLED: $(echo "$CURRENT_ENV" | grep -q "N8N_VERSION_NOTIFICATIONS_ENABLED" && echo "✅ SET" || echo "❌ MISSING")"
echo "N8N_METRICS: $(echo "$CURRENT_ENV" | grep -q "N8N_METRICS" && echo "✅ SET" || echo "❌ MISSING")"

echo ""
echo "🏗️ 5. Terraform Resources Status:"
echo "----------------------------------"
cd /workspaces/optimacx-GCP/infrastructure/terraform/environments/dev
terraform state list | grep n8n | head -10

echo ""
echo "⚠️ 6. Required Actions for Complete Migration:"
echo "----------------------------------------------"

# Check if service is managed by terraform
if terraform state show module.n8n.google_cloud_run_service.n8n >/dev/null 2>&1; then
    echo "✅ N8N service is managed by Terraform"
    echo "🔄 Ready to apply configuration updates"
else
    echo "❌ N8N service NOT fully managed by Terraform"
    echo "📋 Need to import/update service configuration"
fi

echo ""
echo "🎯 Recommended Next Steps:"
echo "1. Run 'terraform plan' to see pending changes"
echo "2. Run 'terraform apply' to migrate to full Terraform management"
echo "3. Verify multitenant and telemetry settings post-deployment"

echo ""
echo "Migration analysis complete - $(date)"
