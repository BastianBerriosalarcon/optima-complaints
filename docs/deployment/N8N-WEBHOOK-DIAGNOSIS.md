# 🚨 Diagnóstico N8N Webhook Issue - Fase 1

## ✅ **Estado de Servicios Verificado**

### **Chatwoot**: ✅ Funcionando Correctamente
- URL: `https://chatwoot-multitenant-dev-wfzra4ruxq-tl.a.run.app`
- Estado: Accesible y operacional

### **N8N**: ⚠️ Funcionando pero con Issue de Webhooks
- URL: `https://n8n-optimacx-supabase-dev-wfzra4ruxq-tl.a.run.app`
- Estado: Servicio está "Ready" según Cloud Run
- Problema: Webhooks no se registran correctamente

---

## 🔍 **Diagnóstico Técnico**

### **Logs de N8N muestran:**
```
Received request for unknown webhook: The requested webhook "POST simple-test" is not registered.
Received request for unknown webhook: "POST chatwoot-test" is not registered.
```

### **MCP Reports:**
- ✅ Workflows creados exitosamente
- ✅ Workflows activados exitosamente  
- ❌ Webhooks no registrados en runtime de N8N

### **Posibles Causas:**
1. **Configuración de N8N**: Webhooks requieren configuración adicional
2. **API vs UI**: MCP puede no activar webhooks igual que la UI
3. **Permisos**: API key puede necesitar permisos adicionales
4. **Cache**: N8N puede necesitar reinicio para registrar webhooks

---

## 🎯 **Soluciones Recomendadas**

### **OPCIÓN A: Configuración Manual (Recomendado)**
1. **Acceder a N8N UI directamente:**
   ```
   https://n8n-optimacx-supabase-dev-wfzra4ruxq-tl.a.run.app
   ```

2. **Importar workflows manualmente:**
   - Usar archivos JSON preparados
   - Activar workflows en la UI
   - Verificar que webhooks se registren

### **OPCIÓN B: Reiniciar Servicio N8N**
```bash
# Forzar reinicio del servicio
gcloud run services update n8n-optimacx-supabase-dev \
  --region=southamerica-west1 \
  --update-env-vars RESTART_TRIGGER=$(date +%s)
```

### **OPCIÓN C: Verificar Configuración N8N**
Verificar si N8N necesita:
- Variables de entorno específicas para webhooks
- Configuración de dominio/host
- Permisos adicionales de API

---

## 📋 **Archivos Preparados para Importación Manual**

### **1. Workflow de Test**
```json
Archivo: /applications/n8n-workflows/templates/chatwoot-test-minimal.json
Webhook: /webhook/chatwoot-test  
Función: Test básico de conectividad
```

### **2. Workflow Principal**
```json
Archivo: /applications/n8n-workflows/templates/chatwoot-multitenant-webhook-updated.json
Webhook: /webhook/chatwoot/{tenant_id}
Función: Handler principal multitenant
```

---

## 🚀 **Próximos Pasos Inmediatos**

### **PASO 1: Acceso Manual a N8N**
- Abrir N8N en navegador (ya hecho)
- Verificar si hay workflows existentes
- Importar workflows manualmente

### **PASO 2: Verificar Funcionalidad**
```bash
# Una vez importado, probar:
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{"test": "manual import"}' \
  'https://n8n-optimacx-supabase-dev-wfzra4ruxq-tl.a.run.app/webhook/chatwoot-test'
```

### **PASO 3: Continuar con Chatwoot Config**
Una vez que N8N webhooks funcionen:
- Configurar webhooks en Chatwoot Admin
- Probar integración end-to-end
- Continuar con Fase 2

---

## 💡 **Recomendación Inmediata**

**Continuar con configuración manual en N8N UI** mientras investigamos el issue del MCP. Los archivos JSON están listos para importación directa.

¿Procedemos con importación manual o prefieres que investiguemos más el issue del MCP?
