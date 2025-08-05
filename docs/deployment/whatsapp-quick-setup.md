# 🎯 WhatsApp Business API - Quick Setup Guide
## Configuración Rápida por Concesionario

---

## 📋 **Resumen de Credenciales Requeridas**

### **Concesionario 001 - Santiago Centro**
```bash
# Obtener desde Meta Business Manager:
PHONE_NUMBER_ID_001="COMPLETAR_AQUI"
ACCESS_TOKEN_001="COMPLETAR_AQUI"  
BUSINESS_ACCOUNT_ID_001="COMPLETAR_AQUI"
VERIFY_TOKEN_001="santiago_centro_$(openssl rand -hex 16)"

# URLs automáticas (ya configuradas):
WEBHOOK_URL_001="https://concesionario1.chat.optimacx.net/webhooks/whatsapp"
N8N_ENDPOINT_001="https://n8n-optimacx-supabase-dev-1008284849803.southamerica-west1.run.app/webhook/chatwoot-concesionario-001"
```

### **Concesionario 002 - Las Condes**
```bash
PHONE_NUMBER_ID_002="COMPLETAR_AQUI"
ACCESS_TOKEN_002="COMPLETAR_AQUI"
BUSINESS_ACCOUNT_ID_002="COMPLETAR_AQUI"  
VERIFY_TOKEN_002="las_condes_$(openssl rand -hex 16)"

WEBHOOK_URL_002="https://concesionario2.chat.optimacx.net/webhooks/whatsapp"
N8N_ENDPOINT_002="https://n8n-optimacx-supabase-dev-1008284849803.southamerica-west1.run.app/webhook/chatwoot-concesionario-002"
```

### **Concesionario 003 - Maipú**
```bash
PHONE_NUMBER_ID_003="COMPLETAR_AQUI"
ACCESS_TOKEN_003="COMPLETAR_AQUI"
BUSINESS_ACCOUNT_ID_003="COMPLETAR_AQUI"
VERIFY_TOKEN_003="maipu_$(openssl rand -hex 16)"

WEBHOOK_URL_003="https://concesionario3.chat.optimacx.net/webhooks/whatsapp"
N8N_ENDPOINT_003="https://n8n-optimacx-supabase-dev-1008284849803.southamerica-west1.run.app/webhook/chatwoot-concesionario-003"
```

---

## ⚡ **Pasos de Configuración Rápida**

### **PASO 1: Meta Business Manager (15 min)**
1. Ve a [Meta Business Manager](https://business.facebook.com)
2. WhatsApp Manager → API Setup
3. Copia las credenciales de arriba para cada número
4. Configura webhooks con las URLs listadas

### **PASO 2: Chatwoot Admin (10 min por tenant)**
1. Acceder: `https://chatwoot-multitenant-dev-XXXXX.southamerica-west1.run.app/super_admin`
2. Crear 3 cuentas con las configuraciones de arriba
3. Agregar canal WhatsApp a cada cuenta con sus credenciales

### **PASO 3: Test Rápido (5 min)**
```bash
# Enviar WhatsApp de prueba a cada número
# Verificar que aparece en Chatwoot
# Confirmar respuesta automática de IA
```

---

## 🧪 **Tests de Validación**

```bash
# Test webhooks:
curl -X POST "https://concesionario1.chat.optimacx.net/webhooks/whatsapp" \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook_verification"}'

# Expected: 200 OK

# Test N8N integration:
curl -X POST "https://n8n-optimacx-supabase-dev-1008284849803.southamerica-west1.run.app/webhook/chatwoot-concesionario-001" \
  -H "Content-Type: application/json" \
  -d '{"test": "n8n_integration"}'

# Expected: Workflow execution successful
```

---

## 🚨 **Troubleshooting Rápido**

| Problema | Solución |
|----------|----------|
| Webhook no funciona | Verificar URL y verify token en Meta Business |
| No llegan respuestas | Revisar N8N workflow execution logs |
| Mensajes duplicados | Verificar configuración de eventos en webhook |
| IA no responde | Verificar Gemini API key en N8N |

---

## 📞 **Soporte Rápido**

- **Slack**: #chatwoot-support  
- **Email**: whatsapp-support@optimacx.net
- **Logs**: `gcloud logs tail --service=chatwoot-multitenant-dev`

---

**⏱️ Tiempo total de configuración: ~45 minutos**
**✅ Una vez completado, tendrás WhatsApp Business funcionando con IA para los 3 concesionarios**
