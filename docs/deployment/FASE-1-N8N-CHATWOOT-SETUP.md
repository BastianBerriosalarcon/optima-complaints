# 🚀 Fase 1: Configuración Chatwoot ↔ N8N - Guía Paso a Paso

## 📋 **Estado Actual**

✅ **Servicios Verificados:**
- **Chatwoot**: `https://chatwoot-multitenant-dev-wfzra4ruxq-tl.a.run.app`
- **N8N**: `https://n8n-optimacx-supabase-dev-wfzra4ruxq-tl.a.run.app`

⚠️ **Pendiente:**
- Importar workflows en N8N
- Configurar webhooks en Chatwoot Admin
- Probar comunicación bidireccional

---

## 🎯 **PASO 1: Importar Workflows en N8N**

### **1.1 Acceder a N8N**
```
URL: https://n8n-optimacx-supabase-dev-wfzra4ruxq-tl.a.run.app
```

### **1.2 Importar Workflow de Test (Prioridad)**
1. **Archivo**: `/applications/n8n-workflows/templates/chatwoot-test-minimal.json`
2. **Función**: Verificar conectividad básica Chatwoot → N8N
3. **Webhook URL**: `/webhook/chatwoot/test`

**Pasos en N8N:**
- Ir a "Workflows" → "Import from file"
- Subir `chatwoot-test-minimal.json`
- **ACTIVAR** el workflow (toggle arriba derecha)
- Verificar que el webhook endpoint esté disponible

### **1.3 Importar Workflow Principal (Producción)**
1. **Archivo**: `/applications/n8n-workflows/templates/chatwoot-multitenant-webhook-updated.json`
2. **Función**: Handler principal para todos los mensajes multitenant
3. **Webhook URLs**: 
   - `/webhook/chatwoot/concesionario_001`
   - `/webhook/chatwoot/concesionario_002`
   - `/webhook/chatwoot/concesionario_003`

---

## 🎯 **PASO 2: Configurar Webhooks en Chatwoot**

### **2.1 Acceder a Chatwoot Admin**
```
URL: https://chatwoot-multitenant-dev-wfzra4ruxq-tl.a.run.app/super_admin
Usuario: Super Admin (configurar si no existe)
```

### **2.2 Configurar Cuentas Multitenant**

**Por cada concesionario crear:**

#### **Concesionario 001:**
- **Account Name**: "Concesionario Uno"
- **Domain**: concesionario1.chat.optimacx.net
- **Webhook URL**: `https://n8n-optimacx-supabase-dev-wfzra4ruxq-tl.a.run.app/webhook/chatwoot/concesionario_001`
- **Events**: 
  - ✅ message_created
  - ✅ conversation_created
  - ✅ contact_created

#### **Concesionario 002:**
- **Account Name**: "Concesionario Dos"  
- **Domain**: concesionario2.chat.optimacx.net
- **Webhook URL**: `https://n8n-optimacx-supabase-dev-wfzra4ruxq-tl.a.run.app/webhook/chatwoot/concesionario_002`
- **Events**: message_created, conversation_created, contact_created

#### **Concesionario 003:**
- **Account Name**: "Concesionario Tres"
- **Domain**: concesionario3.chat.optimacx.net  
- **Webhook URL**: `https://n8n-optimacx-supabase-dev-wfzra4ruxq-tl.a.run.app/webhook/chatwoot/concesionario_003`
- **Events**: message_created, conversation_created, contact_created

---

## 🎯 **PASO 3: Verificar Conectividad**

### **3.1 Test de Workflow Básico**
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{
    "account": {"id": 1},
    "event": "message_created", 
    "content": "Test message from setup",
    "conversation": {
      "id": 999,
      "meta": {
        "sender": {"phone_number": "+56912345999"}
      }
    }
  }' \
  'https://n8n-optimacx-supabase-dev-wfzra4ruxq-tl.a.run.app/webhook/chatwoot/test'
```

**Respuesta esperada:**
```json
{
  "status": "TEST_SUCCESS",
  "message": "Chatwoot → N8N comunicación exitosa",
  "processed_at": "2025-01-XX...",
  "account_id": 1,
  "event_type": "message_created"
}
```

### **3.2 Test por Tenant**
```bash
# Test Concesionario 001
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{"account":{"id":1},"event":"test","content":"Test concesionario 001"}' \
  'https://n8n-optimacx-supabase-dev-wfzra4ruxq-tl.a.run.app/webhook/chatwoot/concesionario_001'

# Test Concesionario 002  
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{"account":{"id":2},"event":"test","content":"Test concesionario 002"}' \
  'https://n8n-optimacx-supabase-dev-wfzra4ruxq-tl.a.run.app/webhook/chatwoot/concesionario_002'
```

---

## 🎯 **PASO 4: Validación End-to-End**

### **4.1 Verificar en N8N**
- Ir a "Executions" en N8N
- Verificar que aparezcan las ejecuciones de test
- Revisar logs para errores

### **4.2 Verificar en Chatwoot**
- Crear conversación de prueba en Chatwoot
- Enviar mensaje
- Verificar que webhook se dispare en N8N

### **4.3 Logs y Debugging**
```bash
# Ver logs de N8N
kubectl logs -f deployment/n8n-optimacx-supabase-dev

# Ver logs de Chatwoot  
kubectl logs -f deployment/chatwoot-multitenant-dev
```

---

## ✅ **Criterios de Éxito Fase 1**

### **BÁSICO (Mínimo viable):**
- ✅ Workflow test responde 200 OK
- ✅ Chatwoot puede enviar webhooks a N8N
- ✅ N8N recibe y procesa payloads de Chatwoot

### **COMPLETO (Producción ready):**
- ✅ Cada tenant tiene webhook configurado
- ✅ Identificación de tenant funciona correctamente
- ✅ Logs muestran procesamiento exitoso
- ✅ Respuestas de webhook son consistentes

---

## 🚨 **Troubleshooting Común**

### **Error 404 en webhook:**
- Verificar que el workflow esté **ACTIVADO** en N8N
- Revisar que la URL del webhook sea exacta
- Confirmar que el path coincida con el configurado

### **Error 500 en procesamiento:**
- Revisar logs de N8N para errores JavaScript
- Verificar estructura del payload de Chatwoot
- Confirmar que las credenciales estén configuradas

### **Webhook no se dispara:**
- Verificar configuración en Chatwoot Admin
- Confirmar que los eventos estén seleccionados
- Probar con curl manual primero

---

## 📌 **Próximos Pasos (Fase 2)**

Una vez completada la Fase 1:

1. **Configurar procesador de leads** (analisis-ia-leads.json)
2. **Setup Gemini API** para análisis IA
3. **Configurar asignación de asesores**
4. **Probar flujo completo** WhatsApp → Chatwoot → N8N → Supabase

---

## 🎯 **Estado Actual de Implementación**

**FASE 1**: 🔄 **EN PROGRESO**
- [x] Servicios desplegados y verificados
- [x] Workflows creados y preparados
- [ ] Workflows importados en N8N
- [ ] Webhooks configurados en Chatwoot
- [ ] Tests de conectividad exitosos

**FASE 2**: ⏳ **PENDIENTE**
**FASE 3**: ⏳ **PENDIENTE**
**FASE 4**: ⏳ **PENDIENTE**
