#!/bin/bash

# N8N Quick Fix Deployment
# Execute this after running the SQL migration fix

set -e

PROJECT_ID="optima-cx-467616"
REGION="southamerica-west1"
SERVICE_NAME="n8n-optimacx-supabase-dev"

echo "🚀 Quick Fix Deployment for N8N"
echo "================================="

echo "📋 Step 1: Deploying with corrected environment variables..."

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
  --set-env-vars="N8N_SKIP_MIGRATIONS=true,N8N_SKIP_MIGRATIONS_LOCK_CHECK=true,N8N_SKIP_DATABASE_MIGRATION=true,NODE_ENV=production,N8N_HOST=0.0.0.0,N8N_PORT=8080,GENERIC_TIMEZONE=America/Santiago"

echo ""
echo "⏱️ Step 2: Waiting for deployment to stabilize..."
sleep 30

echo ""  
echo "✅ Step 3: Checking deployment status..."
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
echo "Service URL: $SERVICE_URL"

echo ""
echo "🏥 Step 4: Quick health check..."
if curl -s --head --request GET "$SERVICE_URL" | grep -E "(200|302)" > /dev/null; then
    echo "✅ SUCCESS: Service is responding!"
else
    echo "⚠️  Service may still be starting up. Check logs if issue persists."
fi

echo ""
echo "📋 Step 5: Recent logs (last 5 entries)..."
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME" --limit=5 --format="table(timestamp,severity,textPayload)" --freshness=2m

echo ""
echo "🎉 Quick fix deployment completed!"
echo "Service URL: $SERVICE_URL"
echo ""
echo "If issues persist, run: ./scripts/n8n-health-check.sh"
