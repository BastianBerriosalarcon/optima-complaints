#!/bin/bash

# Script para configurar variables de entorno en Cloud Run N8N
# Las variables se configuran directamente en el servicio de Cloud Run

echo "🚀 Configurando variables de entorno en Cloud Run para N8N..."

# Configurar variables principales para workflows
gcloud run services update n8n-optimacx-supabase-dev \
  --region=southamerica-west1 \
  --set-env-vars="SUPABASE_URL=https://your-project.supabase.co" \
  --set-env-vars="SUPABASE_ANON_KEY=your-anon-key" \
  --set-env-vars="N8N_WEBHOOK_URL=https://n8n-optimacx-supabase-dev-1039900134024.southamerica-west1.run.app" \
  --set-env-vars="ENVIRONMENT=development" \
  --set-env-vars="TENANT_DEFAULT_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  --set-env-vars="CHATWOOT_URL=https://chatwoot-optimacx-supabase-dev-1039900134024.southamerica-west1.run.app" \
  --max-instances=10 \
  --min-instances=1

echo "✅ Variables básicas configuradas!"

echo ""
echo "⚠️  VARIABLES QUE REQUIEREN CONFIGURACIÓN MANUAL:"
echo ""
echo "1. SUPABASE_SERVICE_KEY (sensible - usar secret):"
echo "   gcloud secrets create supabase-service-key --data-file=- <<< 'your-service-key'"
echo "   gcloud run services update n8n-optimacx-supabase-dev --region=southamerica-west1 \\"
echo "     --set-env-vars='SUPABASE_SERVICE_KEY=\$(gcloud secrets versions access latest --secret=supabase-service-key)'"
echo ""
echo "2. GEMINI_API_KEY (sensible - usar secret):"
echo "   gcloud secrets create gemini-api-key --data-file=- <<< 'your-gemini-key'"
echo "   gcloud run services update n8n-optimacx-supabase-dev --region=southamerica-west1 \\"
echo "     --set-env-vars='GEMINI_API_KEY=\$(gcloud secrets versions access latest --secret=gemini-api-key)'"
echo ""
echo "3. WHATSAPP_ACCESS_TOKEN (sensible - usar secret):"
echo "   gcloud secrets create whatsapp-access-token --data-file=- <<< 'your-whatsapp-token'"
echo "   gcloud run services update n8n-optimacx-supabase-dev --region=southamerica-west1 \\"
echo "     --set-env-vars='WHATSAPP_ACCESS_TOKEN=\$(gcloud secrets versions access latest --secret=whatsapp-access-token)'"

echo ""
echo "🔍 Para verificar las variables configuradas:"
echo "gcloud run services describe n8n-optimacx-supabase-dev --region=southamerica-west1 --format='yaml' | grep -A 30 'env:'"

echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "1. Configura las 3 variables sensibles usando secrets"
echo "2. Ejecuta el SQL de setup-tenant-prueba.sql en Supabase"
echo "3. Importa los workflows principales en N8N"
echo "4. Prueba el flujo end-to-end"
