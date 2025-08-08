# 🔑 Guía para Obtener API Keys Necesarias

## 1. SUPABASE KEYS
### Obtener desde Supabase Dashboard:
1. Ve a tu proyecto Supabase: https://supabase.com/dashboard/projects
2. Settings → API
3. Copia:
   - `Project URL` → SUPABASE_URL
   - `anon public` → SUPABASE_ANON_KEY  
   - `service_role` → SUPABASE_SERVICE_KEY ⚠️ (sensible)

### Comandos para configurar:
```bash
# URL y ANON KEY (no sensibles)
gcloud run services update n8n-optimacx-supabase-dev \
  --region=southamerica-west1 \
  --set-env-vars="SUPABASE_URL=https://tu-proyecto.supabase.co,SUPABASE_ANON_KEY=tu-anon-key"

# SERVICE KEY (sensible - usar secret)
echo "tu-service-key" | gcloud secrets create supabase-service-key --data-file=-
gcloud run services update n8n-optimacx-supabase-dev \
  --region=southamerica-west1 \
  --update-secrets="SUPABASE_SERVICE_KEY=supabase-service-key:latest"
```

## 2. GEMINI API KEY
### Obtener desde Google AI Studio:
1. Ve a: https://aistudio.google.com/app/apikey
2. Crea nueva API key
3. Copia la key generada

### Comando para configurar:
```bash
echo "tu-gemini-api-key" | gcloud secrets create gemini-api-key --data-file=-
gcloud run services update n8n-optimacx-supabase-dev \
  --region=southamerica-west1 \
  --update-secrets="GEMINI_API_KEY=gemini-api-key:latest"
```

## 3. WHATSAPP ACCESS TOKEN
### Obtener desde Meta for Developers:
1. Ve a: https://developers.facebook.com/apps
2. Tu aplicación → WhatsApp → API Setup
3. Copia el "Temporary access token" o genera uno permanente

### Comando para configurar:
```bash
echo "tu-whatsapp-token" | gcloud secrets create whatsapp-access-token --data-file=-
gcloud run services update n8n-optimacx-supabase-dev \
  --region=southamerica-west1 \
  --update-secrets="WHATSAPP_ACCESS_TOKEN=whatsapp-access-token:latest"
```

## 🚀 SCRIPT COMPLETO DE CONFIGURACIÓN

Una vez que tengas todas las keys, ejecuta:

```bash
# 1. Configurar variables no sensibles
gcloud run services update n8n-optimacx-supabase-dev \
  --region=southamerica-west1 \
  --set-env-vars="SUPABASE_URL=TU_SUPABASE_URL,SUPABASE_ANON_KEY=TU_ANON_KEY"

# 2. Configurar secrets
echo "TU_SERVICE_KEY" | gcloud secrets create supabase-service-key --data-file=-
echo "TU_GEMINI_KEY" | gcloud secrets create gemini-api-key --data-file=-
echo "TU_WHATSAPP_TOKEN" | gcloud secrets create whatsapp-access-token --data-file=-

# 3. Aplicar secrets al servicio
gcloud run services update n8n-optimacx-supabase-dev \
  --region=southamerica-west1 \
  --update-secrets="SUPABASE_SERVICE_KEY=supabase-service-key:latest,GEMINI_API_KEY=gemini-api-key:latest,WHATSAPP_ACCESS_TOKEN=whatsapp-access-token:latest"
```

## ✅ VERIFICAR CONFIGURACIÓN
```bash
gcloud run services describe n8n-optimacx-supabase-dev --region=southamerica-west1 --format="yaml" | grep -A 20 "env:"
```

---
**NOTA**: Las variables ya se configuran automáticamente cuando se actualiza el servicio, no necesitas reiniciar manualmente.
