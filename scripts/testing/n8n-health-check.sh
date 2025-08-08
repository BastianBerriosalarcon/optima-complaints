#!/bin/bash

# N8N Health Check and Monitoring Script
# Use this script to monitor N8N service health and diagnose issues

PROJECT_ID="optima-cx-467616"
REGION="southamerica-west1" 
SERVICE_NAME="n8n-optimacx-supabase-dev"

echo "🏥 N8N Health Check Dashboard"
echo "================================"

# Service Status
echo "🔍 1. Cloud Run Service Status:"
gcloud run services describe $SERVICE_NAME --region=$REGION --format="table(metadata.name,status.url,status.conditions[0].type,status.conditions[0].status)"

echo ""
echo "📊 2. Current Resource Usage:"
gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(spec.template.spec.containers[0].resources.limits.memory,spec.template.spec.containers[0].resources.limits.cpu)"

echo ""
echo "📈 3. Scaling Configuration:"
gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(spec.template.metadata.annotations)"

echo ""
echo "🔄 4. Latest Revision Status:"
LATEST_REVISION=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.latestReadyRevisionName)")
echo "Latest Revision: $LATEST_REVISION"

gcloud run revisions describe $LATEST_REVISION --region=$REGION --format="table(metadata.name,status.conditions[0].type,status.conditions[0].status,status.conditions[0].message)"

echo ""
echo "📋 5. Recent Logs (Last 10 entries):"
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME" --limit=10 --format="table(timestamp,severity,textPayload)" 

echo ""
echo "⚠️  6. Error Analysis (Last 5 errors):"
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME AND severity>=ERROR" --limit=5 --format="table(timestamp,textPayload)" --freshness=1h

echo ""
echo "🌐 7. Service URL Test:"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
echo "Service URL: $SERVICE_URL"

# Test if service responds
if curl -s --head --request GET "$SERVICE_URL" | grep "200 OK" > /dev/null; then
    echo "✅ Service is responding"
else
    echo "❌ Service is not responding properly"
fi

echo ""
echo "🗃️  8. Database Connection Test:"
echo "Check if migration errors persist:"
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME AND textPayload:migration" --limit=3 --format="value(textPayload)" --freshness=30m

echo ""
echo "==============================================="
echo "Health Check Complete - $(date)"
