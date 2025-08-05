# 📱 WhatsApp Business API - Guía Completa de Configuración
## OptimaCX Chatwoot Multitenant - Chile

---

## 🎯 **Resumen Ejecutivo**

Esta guía te ayudará a configurar WhatsApp Business API para cada concesionario en el sistema Chatwoot multitenant, optimizado para Chile con integración a N8N y respuestas automáticas con IA.

### **📊 Configuración por Tenant:**
- **Concesionario 001**: Santiago Centro
- **Concesionario 002**: Las Condes  
- **Concesionario 003**: Maipú

---

## 📋 **Requisitos Previos**

### **1. Meta Business Manager**
- [ ] Cuenta Meta Business verificada
- [ ] Números de teléfono WhatsApp Business verificados
- [ ] App de Facebook creada con permisos WhatsApp Business

### **2. Infraestructura (Ya desplegada)**
- [ ] Chatwoot multitenant funcionando
- [ ] Subdominios SSL configurados
- [ ] N8N integration activa

### **3. Credenciales Necesarias por Tenant**
```json
{
  "phone_number_id": "OBTENER_DE_META",
  "access_token": "OBTENER_DE_META", 
  "business_account_id": "OBTENER_DE_META",
  "webhook_verify_token": "GENERAR_RANDOM_32_CHARS"
}
```

---

## 🔧 **PASO 1: Configuración Meta Business Manager**

### **1.1 Crear App de Facebook**

1. Ve a [Facebook Developers](https://developers.facebook.com)
2. Crear nueva App → **Business** type
3. Agregar producto **WhatsApp Business API**

### **1.2 Obtener Credenciales por Concesionario**

#### **Concesionario 001 - Santiago Centro**
```bash
# Meta Business Manager → WhatsApp → API Setup
PHONE_NUMBER_ID_001="123456789012345"     # Phone Number ID
ACCESS_TOKEN_001="EAAxxxxxxxxxxxxx"       # Permanent Access Token  
BUSINESS_ACCOUNT_ID_001="987654321"       # Business Account ID
VERIFY_TOKEN_001="santiago_centro_2025"   # Custom verify token
```

#### **Concesionario 002 - Las Condes**
```bash
PHONE_NUMBER_ID_002="123456789012346"
ACCESS_TOKEN_002="EAAxxxxxxxxxxxxy"
BUSINESS_ACCOUNT_ID_002="987654322"
VERIFY_TOKEN_002="las_condes_2025"
```

#### **Concesionario 003 - Maipú**
```bash
PHONE_NUMBER_ID_003="123456789012347"
ACCESS_TOKEN_003="EAAxxxxxxxxxxxyz"
BUSINESS_ACCOUNT_ID_003="987654323"
VERIFY_TOKEN_003="maipu_2025"
```

---

## 🌐 **PASO 2: Configuración Webhooks**

### **2.1 URLs de Webhook por Tenant**

```bash
# Endpoints configurados automáticamente en Chatwoot
WEBHOOK_001="https://concesionario1.chat.optimacx.net/webhooks/whatsapp"
WEBHOOK_002="https://concesionario2.chat.optimacx.net/webhooks/whatsapp"  
WEBHOOK_003="https://concesionario3.chat.optimacx.net/webhooks/whatsapp"
```

### **2.2 Configurar en Meta Business Manager**

Para cada número de teléfono:

1. **WhatsApp Manager** → Seleccionar número
2. **Configuration** → **Webhooks**
3. Configurar:
   ```
   Callback URL: https://concesionarioX.chat.optimacx.net/webhooks/whatsapp
   Verify Token: [TOKEN_GENERADO_ARRIBA]
   ```
4. **Subscribe to fields:**
   - [x] messages
   - [x] message_deliveries  
   - [x] message_reads
   - [x] messaging_postbacks

### **2.3 Verificar Webhook**

```bash
# Test webhook verification por tenant:
curl -X GET "https://concesionario1.chat.optimacx.net/webhooks/whatsapp?hub.mode=subscribe&hub.challenge=test&hub.verify_token=santiago_centro_2025"

# Expected response: "test" (echo del challenge)
```

---

## ⚙️ **PASO 3: Configuración en Chatwoot Admin**

### **3.1 Acceder al Admin Panel**

```bash
# URL del admin panel (una vez desplegado):
https://chatwoot-multitenant-dev-XXXXX.southamerica-west1.run.app/super_admin
```

### **3.2 Crear Cuentas por Concesionario**

#### **Account 1: Santiago Centro**
```yaml
Configuración:
  Name: "Concesionario Santiago Centro"
  Domain: "concesionario1.chat.optimacx.net"  
  Timezone: "America/Santiago"
  Language: "Español (Chile)"

Admin Users:
  - Email: admin@concesionario1.optimacx.net
    Name: "Admin Santiago Centro"
    Role: Administrator

Agents:
  - Email: ventas1@concesionario1.optimacx.net
    Name: "Carlos Mendoza - Asesor Senior"
    Role: Agent
  - Email: ventas2@concesionario1.optimacx.net
    Name: "María González - Asesor Junior"  
    Role: Agent
```

#### **Account 2: Las Condes**
```yaml
Configuración:
  Name: "Concesionario Las Condes"
  Domain: "concesionario2.chat.optimacx.net"
  Timezone: "America/Santiago"
  Language: "Español (Chile)"

Admin Users:
  - Email: admin@concesionario2.optimacx.net
    Name: "Admin Las Condes"
    Role: Administrator

Agents:
  - Email: ventas1@concesionario2.optimacx.net
    Name: "Roberto Silva - Asesor Senior"
    Role: Agent
  - Email: ventas2@concesionario2.optimacx.net
    Name: "Ana Rojas - Asesor Junior"
    Role: Agent
```

#### **Account 3: Maipú**
```yaml
Configuración:
  Name: "Concesionario Maipú"
  Domain: "concesionario3.chat.optimacx.net"
  Timezone: "America/Santiago"
  Language: "Español (Chile)"

Admin Users:
  - Email: admin@concesionario3.optimacx.net
    Name: "Admin Maipú"
    Role: Administrator

Agents:
  - Email: ventas1@concesionario3.optimacx.net
    Name: "Diego Morales - Asesor Senior"
    Role: Agent
  - Email: ventas2@concesionario3.optimacx.net
    Name: "Francisca Torres - Asesor Junior"
    Role: Agent
```

### **3.3 Configurar Canal WhatsApp por Tenant**

En cada cuenta de Chatwoot:

1. **Settings** → **Inboxes** → **Add Inbox**
2. Seleccionar **WhatsApp Business**
3. Configurar:

```json
{
  "phone_number_id": "PHONE_NUMBER_ID_DEL_TENANT",
  "access_token": "ACCESS_TOKEN_DEL_TENANT",
  "business_account_id": "BUSINESS_ACCOUNT_ID_DEL_TENANT",
  "webhook_verify_token": "VERIFY_TOKEN_DEL_TENANT"
}
```

---

## 🔄 **PASO 4: Integración N8N**

### **4.1 Webhooks Chatwoot → N8N**

Cada cuenta Chatwoot enviará eventos a N8N:

```json
{
  "n8n_endpoints": {
    "concesionario_001": "https://n8n-optimacx-supabase-dev-1008284849803.southamerica-west1.run.app/webhook/chatwoot-concesionario-001",
    "concesionario_002": "https://n8n-optimacx-supabase-dev-1008284849803.southamerica-west1.run.app/webhook/chatwoot-concesionario-002",
    "concesionario_003": "https://n8n-optimacx-supabase-dev-1008284849803.southamerica-west1.run.app/webhook/chatwoot-concesionario-003"
  }
}
```

### **4.2 Configurar Webhooks en Chatwoot**

Para cada cuenta:

1. **Settings** → **Integrations** → **Webhooks**
2. **Add Webhook**:
   ```
   URL: https://n8n-optimacx...run.app/webhook/chatwoot-concesionario-XXX
   Events: message_created, conversation_created, contact_created
   ```

### **4.3 Flujo N8N para Respuestas IA**

```yaml
Workflow N8N:
  1. Receive Webhook from Chatwoot
  2. Extract message content & customer info
  3. Call Gemini API for intelligent response
  4. Classify lead intent (venta, postventa, consulta)
  5. Create/Update lead in Supabase
  6. Send response back to Chatwoot
  7. Assign to appropriate agent if needed
```

---

## 🧪 **PASO 5: Testing y Validación**

### **5.1 Test WhatsApp → Chatwoot**

```bash
# Enviar mensaje de prueba a cada número WhatsApp Business:
# +56 9 XXXX XXXX (Concesionario 001)
# +56 9 YYYY YYYY (Concesionario 002)  
# +56 9 ZZZZ ZZZZ (Concesionario 003)

Mensaje de prueba: "Hola, necesito información sobre vehículos nuevos"
```

### **5.2 Verificar Flujo Completo**

1. **WhatsApp** → **Chatwoot**: ✅ Mensaje aparece en inbox
2. **Chatwoot** → **N8N**: ✅ Webhook disparado  
3. **N8N** → **Gemini**: ✅ IA genera respuesta
4. **N8N** → **Supabase**: ✅ Lead creado/actualizado
5. **N8N** → **Chatwoot**: ✅ Respuesta automática enviada
6. **Chatwoot** → **WhatsApp**: ✅ Cliente recibe respuesta

### **5.3 Test Commands por Terminal**

```bash
# Test webhook endpoints
curl -X POST "https://concesionario1.chat.optimacx.net/webhooks/whatsapp" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "BUSINESS_ACCOUNT_ID_001",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "messages": [{
            "from": "56912345678",
            "text": {"body": "Test message"},
            "timestamp": "1640995200"
          }]
        }
      }]
    }]
  }'

# Expected: 200 OK response
```

---

## 📊 **PASO 6: Configuración Avanzada**

### **6.1 Horarios de Atención por Concesionario**

```yaml
Concesionario Santiago Centro:
  Lunes-Viernes: 08:30 - 19:00 CLT
  Sábados: 09:00 - 14:00 CLT
  Domingos: Cerrado

Concesionario Las Condes:
  Lunes-Viernes: 09:00 - 19:30 CLT  
  Sábados: 09:00 - 15:00 CLT
  Domingos: Cerrado

Concesionario Maipú:
  Lunes-Viernes: 08:00 - 18:30 CLT
  Sábados: 08:30 - 13:00 CLT
  Domingos: Cerrado
```

### **6.2 Mensajes Automáticos por Tenant**

#### **Mensaje de Bienvenida**
```
¡Hola! 👋 Gracias por contactar {NOMBRE_CONCESIONARIO}.

Somos especialistas en vehículos nuevos y usados con la mejor atención de Santiago.

¿En qué podemos ayudarte hoy?
🚗 Vehículos nuevos
🔧 Postventa y servicio técnico  
💰 Financiamiento
📋 Cotizaciones

Un asesor te atenderá en breve.
```

#### **Mensaje Fuera de Horario**
```
Gracias por tu mensaje. Nuestro horario de atención es:
📅 Lunes a Viernes: {HORARIO_SEMANA}
📅 Sábados: {HORARIO_SABADO}

Te responderemos a la brevedad en nuestro próximo horario hábil.

Para urgencias, llama al: {TELEFONO_URGENCIAS}
```

### **6.3 Respuestas IA Personalizadas**

```yaml
Prompts Gemini por Concesionario:
  Context: "Eres un asesor de ventas especializado en {MARCA_VEHICULOS} para {NOMBRE_CONCESIONARIO} en {UBICACION}, Chile."
  
  Tone: "Profesional, amigable, enfocado en soluciones"
  
  Objetivos:
    - Clasificar intención del cliente
    - Proporcionar información precisa
    - Agendar citas o test drives
    - Derivar a asesor humano cuando necesario
    
  Restrictions:
    - No inventar precios o promociones
    - No comprometerse con disponibilidad sin confirmar
    - Siempre ofrecer contacto con asesor humano
```

---

## 🔍 **PASO 7: Monitoreo y Métricas**

### **7.1 KPIs por Concesionario**

```yaml
Métricas WhatsApp:
  - Mensajes recibidos/día
  - Tiempo respuesta promedio  
  - Tasa de conversión (lead → venta)
  - Satisfacción del cliente
  - Escalaciones a asesor humano

Métricas Técnicas:
  - Webhook delivery success rate
  - N8N workflow execution time
  - Gemini API response time
  - Chatwoot uptime por tenant
```

### **7.2 Dashboard Personalizado**

```bash
# URLs de monitoreo por tenant:
https://console.cloud.google.com/monitoring/dashboards/custom/{DASHBOARD_ID}?project=optima-cx-467616

# Métricas por concesionario:
- concesionario_001_messages_count
- concesionario_002_response_time  
- concesionario_003_lead_conversion
```

---

## 🚨 **PASO 8: Troubleshooting**

### **8.1 Problemas Comunes**

#### **Webhook no recibe mensajes**
```bash
# Verificar configuración:
1. URL webhook correcta en Meta Business Manager
2. Verify token coincide
3. SSL certificate válido  
4. Chatwoot service respondiendo

# Debug:
curl -I https://concesionarioX.chat.optimacx.net/webhooks/whatsapp
# Expected: 200 OK
```

#### **Respuestas IA no funcionan**
```bash
# Verificar N8N workflow:
1. Webhook N8N recibiendo datos de Chatwoot
2. Gemini API key configurada
3. Supabase connection activa
4. Response enviada de vuelta a Chatwoot

# Debug N8N:
Check workflow execution logs in N8N dashboard
```

#### **Mensajes no llegan a WhatsApp**
```bash
# Verificar Meta Business API:
1. Access token válido y no expirado
2. Phone Number ID correcto
3. Business Account activo
4. Rate limits no excedidos

# Test direct API call:
curl -X POST "https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages" \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -d '{"messaging_product":"whatsapp","to":"56912345678","text":{"body":"Test"}}'
```

### **8.2 Logs y Debugging**

```bash
# Chatwoot logs:
gcloud logs tail --service=chatwoot-multitenant-dev --project=optima-cx-467616

# N8N execution logs:
https://n8n-optimacx-supabase-dev-1008284849803.southamerica-west1.run.app/workflows

# Meta Business API debugging:
https://developers.facebook.com/tools/debug/accesstoken/
```

---

## 📋 **PASO 9: Checklist de Go-Live**

### **Pre-Launch Checklist**

- [ ] **Infraestructura**  
  - [ ] Chatwoot multitenant desplegado y estable
  - [ ] Subdominios SSL funcionando
  - [ ] N8N workflows importados y probados
  - [ ] Supabase database configurada

- [ ] **WhatsApp Business API**
  - [ ] 3 números WhatsApp Business verificados
  - [ ] Apps Facebook creadas con permisos
  - [ ] Access tokens obtenidos y configurados
  - [ ] Webhooks configurados y verificados

- [ ] **Configuración Chatwoot**
  - [ ] 3 cuentas tenant creadas
  - [ ] Usuarios admin y agents configurados
  - [ ] Canales WhatsApp conectados por tenant
  - [ ] Webhooks hacia N8N configurados

- [ ] **Testing End-to-End**
  - [ ] Mensajes WhatsApp → Chatwoot ✅
  - [ ] Chatwoot → N8N → IA → Respuesta ✅
  - [ ] Leads creados en Supabase ✅
  - [ ] Asignación automática de asesores ✅

- [ ] **Monitoreo y Alertas**
  - [ ] Dashboards configurados
  - [ ] Alertas críticas activas
  - [ ] Notificaciones por email/Slack
  - [ ] Runbooks de troubleshooting

### **Launch Day Tasks**

1. **09:00 CLT**: Activar webhooks en Meta Business Manager
2. **09:15 CLT**: Verificar flujo completo por los 3 concesionarios  
3. **09:30 CLT**: Monitorear dashboards por 30 minutos
4. **10:00 CLT**: Comunicar Go-Live a equipos de ventas
5. **Durante el día**: Monitoreo continuo y soporte

---

## 📞 **Contactos y Soporte**

### **Equipo Técnico**
- **Desarrollo**: desarrollo@optimacx.net
- **Infraestructura**: infraestructura@optimacx.net  
- **WhatsApp API**: whatsapp-support@optimacx.net

### **Escalación**
- **Nivel 1**: Issues menores → Slack #chatwoot-support
- **Nivel 2**: Issues críticos → Email + Slack #critical-alerts
- **Nivel 3**: Outage completo → Llamada directa + Email

---

## 🎯 **Próximos Pasos**

Una vez completada esta configuración:

1. **Optimización IA**: Mejorar prompts Gemini basado en interacciones reales
2. **Escalabilidad**: Agregar más concesionarios según demanda
3. **Integración CRM**: Conectar con sistema CRM existente del cliente
4. **Analytics Avanzados**: Dashboard ejecutivo con métricas de negocio
5. **Automatización Avanzada**: Workflows más complejos (seguimiento, remarketing)

---

**✅ Con esta configuración tendrás un sistema WhatsApp Business completamente funcional, optimizado para Chile, con respuestas automáticas de IA y gestión multitenant por concesionario.**
