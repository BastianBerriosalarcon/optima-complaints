# 🔧 Guía de Configuración Chatwoot ↔ N8N

## ✅ Estado Actual - Webhooks Operativos

### URLs de Webhook N8N Activas:
- **Webhook Test**: `https://n8n-optimacx-supabase-dev-wfzra4ruxq-tl.a.run.app/webhook/webhook/chatwoot/test`
- **Webhook Multitenant**: `https://n8n-optimacx-supabase-dev-wfzra4ruxq-tl.a.run.app/webhook/webhook/chatwoot/{tenant_id}`

### Workflows N8N Activos:
1. **Chatwoot Test Webhook - Minimal** (ID: YrI3Ywxd0nbhyTqi) ✅
2. **Chatwoot Multitenant Webhook Handler - Updated** (ID: JaQ1XFS8ptZtdtYm) ✅
3. **Chatwoot Multi-Tenant Handler** (ID: lgd1tXRUR9TIfjfU) ✅

## 📋 Configuración Manual en Chatwoot

### Paso 1: Acceder al Panel de Administración
```
URL: https://chatwoot-multitenant-dev-wfzra4ruxq-tl.a.run.app/super_admin
```

### Paso 2: Crear/Verificar Cuentas Multitenant
1. Ir a **Accounts** en el panel super admin
2. Verificar que existen las cuentas:
   - Concesionario 001 (Account ID: 1)
   - Concesionario 002 (Account ID: 2) 
   - Concesionario 003 (Account ID: 3)

### Paso 3: Configurar Webhooks por Cuenta

Para cada cuenta individual:

1. **Ingresar a la cuenta específica**
   - Seleccionar cuenta en el dropdown
   - Ir a **Settings** → **Integrations** → **Webhooks**

2. **Crear nuevo webhook**
   - Click en **"Add Webhook"**
   - **Webhook URL**: `https://n8n-optimacx-supabase-dev-wfzra4ruxq-tl.a.run.app/webhook/webhook/chatwoot/{tenant_id}`
   
3. **URLs específicas por tenant**:
   ```
   Cuenta 1: https://n8n-optimacx-supabase-dev-wfzra4ruxq-tl.a.run.app/webhook/webhook/chatwoot/concesionario_001
   Cuenta 2: https://n8n-optimacx-supabase-dev-wfzra4ruxq-tl.a.run.app/webhook/webhook/chatwoot/concesionario_002  
   Cuenta 3: https://n8n-optimacx-supabase-dev-wfzra4ruxq-tl.a.run.app/webhook/webhook/chatwoot/concesionario_003
   ```

4. **Eventos a suscribir**:
   - ✅ `message_created`
   - ✅ `conversation_created` 
   - ✅ `contact_created`
   - ✅ `conversation_status_changed`

## 🧪 Comandos de Prueba

### Test Webhook General
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{
    "account": {"id": 1},
    "event": "message_created",
    "content": "Test de configuración Chatwoot"
  }' \
  'https://n8n-optimacx-supabase-dev-wfzra4ruxq-tl.a.run.app/webhook/webhook/chatwoot/test'
```

### Test Webhook Concesionario 001
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{
    "account": {"id": 1},
    "event": "message_created",
    "content": "¡Hola! Estoy interesado en comprar un auto",
    "message_type": "incoming",
    "conversation": {
      "id": 123,
      "status": "open",
      "meta": {
        "sender": {
          "phone_number": "+56912345678",
          "name": "Juan Pérez"
        }
      }
    }
  }' \
  'https://n8n-optimacx-supabase-dev-wfzra4ruxq-tl.a.run.app/webhook/webhook/chatwoot/concesionario_001'
```

### Test Webhook Concesionario 002
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{
    "account": {"id": 2},
    "event": "message_created", 
    "content": "Necesito información sobre garantías",
    "message_type": "incoming",
    "conversation": {
      "id": 456,
      "status": "open",
      "meta": {
        "sender": {
          "phone_number": "+56987654321",
          "name": "María González"
        }
      }
    }
  }' \
  'https://n8n-optimacx-supabase-dev-wfzra4ruxq-tl.a.run.app/webhook/webhook/chatwoot/concesionario_002'
```

## 🔑 API Keys (si se requiere configuración automática)

Para configuración automática, obtener API keys de cada cuenta:
1. En cada cuenta: **Settings** → **API Keys** → **Generate new API key**
2. Guardar las keys de forma segura

## 📊 Verificación de Funcionamiento

### 1. Verificar en N8N
- Acceder a: `https://n8n-optimacx-supabase-dev-wfzra4ruxq-tl.a.run.app`
- Ir a **Executions** para ver logs de webhooks
- Verificar que los workflows se ejecutan correctamente

### 2. Verificar en Chatwoot
- Enviar mensajes de prueba en cada account
- Verificar que los webhooks se disparan
- Revisar logs en Chatwoot Admin

## 🚀 Próximos Pasos

1. **Configurar webhooks manualmente** usando las URLs provistas
2. **Probar integración end-to-end** con mensajes reales
3. **Configurar respuestas automáticas** con IA
4. **Implementar logging en Supabase** para auditoría
5. **Configurar monitoreo** de webhooks

## 📞 Contactos y Accesos

- **N8N**: https://n8n-optimacx-supabase-dev-wfzra4ruxq-tl.a.run.app
- **Chatwoot**: https://chatwoot-multitenant-dev-wfzra4ruxq-tl.a.run.app
- **Supabase**: Configurado en N8N workflows

---
*Guía actualizada: 2025-08-07 - Webhooks operativos confirmados* ✅
