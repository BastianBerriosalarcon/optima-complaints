#!/bin/bash

# Deploy N8N with Migration Fix
# This script will fix the migration issues and deploy the corrected N8N instance

set -e

PROJECT_ID="optima-cx-467616"
REGION="southamerica-west1"
SERVICE_NAME="n8n-optimacx-supabase-dev"

echo "🔧 Starting N8N deployment fix..."

# Step 1: Fix the database migrations directly
echo "📊 Step 1: Fixing database migrations..."

# Connect to Supabase and run the fix script
# Note: You'll need to run this manually in your Supabase SQL editor
echo "Please run the following SQL in your Supabase SQL editor:"
echo "----------------------------------------"
cat /workspaces/optimacx-GCP/config/docker/fix-migrations.sql
echo "----------------------------------------"

read -p "Press Enter after you've run the SQL fix in Supabase..."

# Step 2: Build and push the corrected Docker image
echo "🐳 Step 2: Building corrected Docker image..."

cd /workspaces/optimacx-GCP

# Build the image with the corrected startup script
docker build -f config/docker/Dockerfile.cloudrun -t $REGION-docker.pkg.dev/$PROJECT_ID/n8n/n8n-multitenant:fixed .

# Push to Artifact Registry
echo "📤 Pushing image to Artifact Registry..."
docker push $REGION-docker.pkg.dev/$PROJECT_ID/n8n/n8n-multitenant:fixed

# Step 3: Update Terraform configuration
echo "🏗️ Step 3: Applying Terraform changes..."

cd infrastructure/terraform/environments/dev

# Plan the changes
terraform plan -var="container_image=$REGION-docker.pkg.dev/$PROJECT_ID/n8n/n8n-multitenant:fixed"

# Apply the changes
terraform apply -var="container_image=$REGION-docker.pkg.dev/$PROJECT_ID/n8n/n8n-multitenant:fixed" -auto-approve

# Step 4: Verify deployment
echo "✅ Step 4: Verifying deployment..."

# Wait for deployment to stabilize
sleep 30

# Check service status
gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)"

# Check logs for any remaining errors
echo "📋 Checking recent logs..."
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME" --limit=10 --format="table(timestamp,severity,textPayload)" --freshness=5m

echo "🎉 N8N deployment fix completed!"
echo "Service URL: $(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')"
