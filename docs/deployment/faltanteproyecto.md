# Faltantes del Proyecto OptimaCX

## 📊 Estado General del Proyecto

**Progreso Actual:** 60% completado  
**Backend/DB:** 98% completo ✅  
**Frontend:** 20% completo ⚠️  
**Integración N8N:** 10% completo ❌  
**Integración Chatwoot:** 0% completo ❌ (NUEVO COMPONENTE CRÍTICO)  

---

## 🚨 PRIORIDAD CRÍTICA (Debe completarse PRIMERO)

### ~~1. Row Level Security (RLS) Policies - BACKEND~~ ✅ COMPLETADO
**Estado:** ✅ **COMPLETAMENTE IMPLEMENTADO** (Actualizado: Julio 2025)  
**Impacto:** Seguridad multitenant completa para todos los módulos

**✅ Completado - TODOS los módulos:**
- ✅ users (con roles y concesionario_id)
- ✅ concesionarios (entidades principales)  
- ✅ sucursales (ubicaciones por concesionario)
- ✅ clientes (vinculados a concesionarios)
- ✅ vehiculos (con datos técnicos completos)
- ✅ citas (programación de servicios)
- ✅ servicios (órdenes de trabajo)
- ✅ items_servicio (detalles de mano de obra y repuestos)
- ✅ **leads** (gestión de prospectos por concesionario)
- ✅ **cotizaciones** (cotizaciones por concesionario y asesor)
- ✅ **ventas** (registro de ventas por concesionario)
- ✅ **encuestas** (encuestas por concesionario)
- ✅ **reclamos** (reclamos por concesionario)
- ✅ **productos** (catálogo por concesionario)

**✅ Funciones de apoyo implementadas:**
- ✅ `auth.get_user_concesionario_id()` - Obtener concesionario del usuario autenticado
- ✅ `auth.get_user_role()` - Obtener rol del usuario
- ✅ `auth.can_user_access_lead()` - Verificar acceso por asesor
- ✅ `auth.is_super_admin()` - Verificar permisos de super admin
- ✅ `auth.is_system_user()` - Verificar acceso de service_role (N8N)

**✅ Políticas implementadas por tabla:**
- **SELECT**: Acceso por concesionario_id con control de roles
- **INSERT**: Creación restringida al concesionario del usuario
- **UPDATE**: Control granular por rol (asesor solo sus records, admin/gerente todos)
- **Service Role**: Acceso completo para integraciones N8N

**Archivos de implementación:**
- `database/migrations/02_rls_policies_complete.sql` - Implementación completa
- `database/policies/01_core_rls.sql` - Políticas centralizadas

### 2. Sistema de Autenticación/Autorización - FRONTEND
**Estado:** ❌ Faltante crítico  
**Impacto:** Sin control de acceso por roles

**Qué hacer:**
- Crear middleware de autorización por página
- Implementar guards de componentes por rol
- Sistema de redirección según permisos
- Hook `useRole()` para control granular
- Componente `<RoleGuard>` para proteger UI

### 3. Integración Chatwoot para WhatsApp - INFRAESTRUCTURA
**Estado:** ❌ Completamente faltante  
**Impacto:** Sin gestión conversacional de WhatsApp, leads y reclamos

**Qué implementar:**
- **Deployment de Chatwoot en Cloud Run #3**
- **Configuración Redis (Cloud Memorystore)** para sessions
- **PostgreSQL para historiales** de conversación
- **Integración WhatsApp Business API** con Chatwoot
- **Configuración multitenant** - Accounts por concesionario
- **Webhooks bidireccionales** Chatwoot ↔ N8N ↔ OptimaCX
- **Interface de agentes** para soporte humano
- **WhatsApp Flows** para formularios interactivos

**Configuración requerida en tenant_config:**
```sql
-- Agregar campos para Chatwoot
chatwoot_account_id INTEGER,
chatwoot_inbox_id INTEGER,
chatwoot_access_token TEXT,
chatwoot_subdomain TEXT, -- ej: concesionario-a
chatwoot_agent_config JSONB DEFAULT '{}',
chatwoot_webhook_url TEXT
```

### 4. Dashboard Principal de cada Módulo - FRONTEND
**Estado:** ❌ Completamente faltante  
**Impacto:** No hay interfaces funcionales

**Páginas críticas a crear:**
- `/dashboard/ventas/leads` - Lista de leads asignados (✅ DB + RLS listos)
- `/dashboard/ventas/cotizaciones` - Gestión de cotizaciones (✅ DB + RLS listos)
- `/dashboard/ventas/ventas` - Registro de ventas (✅ DB + RLS listos)
- `/dashboard/encuestas` - Dashboard de encuestas y resultados (✅ DB + RLS listos)
- `/dashboard/reclamos` - Lista de reclamos pendientes (✅ DB + RLS listos)
- `/dashboard/servicio/citas` - Agenda de citas programadas (✅ DB + RLS listos)
- `/dashboard/servicio/ordenes` - Órdenes de trabajo en proceso (✅ DB + RLS listos)
- `/dashboard/clientes` - Gestión de clientes y vehículos (✅ DB + RLS listos)
- `/dashboard/productos` - Catálogo de productos (✅ DB + RLS listos)
- `/dashboard/admin` - Configuración de concesionario
- `/dashboard/chatwoot` - Interface de gestión de conversaciones

---

## 🔥 PRIORIDAD ALTA (Segunda semana)

### 5. Formularios CRUD Básicos - FRONTEND
**Estado:** ❌ Faltante  
**Impacto:** No se pueden crear/editar entidades

**Formularios a crear:**
- **LeadForm.tsx** - Crear/editar leads manualmente (✅ DB + RLS listos)
- **CotizacionForm.tsx** - Crear/editar cotizaciones (✅ DB + RLS listos)
- **VentaForm.tsx** - Registrar ventas (✅ DB + RLS listos)
- **ReclamoForm.tsx** - Crear/editar reclamos (✅ DB + RLS listos)
- **EncuestaForm.tsx** - Formulario de encuesta manual (✅ DB + RLS listos)
- **ProductoForm.tsx** - Gestión de catálogo de productos (✅ DB + RLS listos)
- **ClienteForm.tsx** - Crear/editar clientes (✅ DB + RLS listos)
- **VehiculoForm.tsx** - Registrar/editar vehículos (✅ DB + RLS listos)
- **CitaForm.tsx** - Programar/editar citas de servicio (✅ DB + RLS listos)
- **ServicioForm.tsx** - Crear órdenes de trabajo (✅ DB + RLS listos)
- **UsuarioForm.tsx** - Gestión de usuarios por concesionario
- **ChatwootConfigForm.tsx** - Configuración de cuenta Chatwoot por concesionario

### 6. Edge Functions Críticas - BACKEND
**Estado:** ❌ Faltante  
**Impacto:** No hay automatización IA

**Edge Functions a crear:**
```typescript
/supabase/functions/
├── analizar-lead-ia/        // Análisis IA de intención de lead
├── clasificar-reclamo-ia/   // Clasificación automática de reclamos  
├── generar-qr-encuesta/     // Generación de QR dinámicos por concesionario
├── enviar-notificacion/     // Notificaciones email/SMS
├── webhook-n8n/            // Endpoints para integración N8N
├── webhook-chatwoot/       // Webhooks desde/hacia Chatwoot
└── crear-account-chatwoot/ // Provisión automática de cuentas Chatwoot
```

### 7. Configuración de Tenant - FRONTEND
**Estado:** ❌ Faltante  
**Impacto:** No se pueden configurar concesionarios

**Qué crear:**
- Página de configuración general del concesionario
- Gestión de sucursales
- Configuración de integración WhatsApp/Email
- **Configuración de cuenta Chatwoot** (NUEVO)
- **Gestión de agentes Chatwoot** por concesionario
- Gestión de usuarios y roles
- Configuración de prompts de IA personalizados

---

## ⚡ PRIORIDAD MEDIA (Tercera semana)

### 8. Componentes de Negocio Especializados - FRONTEND
**Estado:** ❌ Faltante  
**Impacto:** Experiencia de usuario básica

**Componentes a crear:**
```typescript
// Módulo Ventas
- LeadCard.tsx           // Tarjeta visual de lead con score
- CotizacionGenerator.tsx // Generador de cotizaciones
- ProductSelector.tsx    // Selector de productos con filtros
- VentasMetrics.tsx      // Métricas y gráficos de ventas

// Módulo Encuestas  
- QRGenerator.tsx        // Generador de códigos QR
- ResultadosChart.tsx    // Gráficos de NPS y satisfacción
- NPSMeter.tsx          // Medidor visual de NPS

// Módulo Reclamos
- ReclamoCard.tsx       // Tarjeta de reclamo con estado
- ClasificacionIA.tsx   // Mostrar clasificación automática
- DocumentUploader.tsx  // Subida de documentos para RAG

// Módulo Chatwoot (NUEVO)
- ChatwootEmbed.tsx     // Iframe embebido de Chatwoot
- ConversationList.tsx  // Lista de conversaciones activas
- AgentStatus.tsx       // Estado de agentes online/offline
- ChatMetrics.tsx       // Métricas de conversaciones
```

### 8. Sistema de Notificaciones - FRONTEND/BACKEND
**Estado:** ❌ Faltante  
**Impacto:** No hay feedback en tiempo real

**Qué implementar:**
- Centro de notificaciones en UI
- Notificaciones push en navegador
- Supabase Realtime para updates automáticos
- Sistema de badges/contadores de pendientes

### 9. Métricas y Analytics Básicos - FRONTEND
**Estado:** ❌ Faltante  
**Impacto:** No hay visibilidad de performance

**Dashboards a crear:**
- Dashboard ejecutivo con KPIs principales
- Métricas de conversión de leads por asesor
- Análisis de encuestas y NPS por sucursal
- Reporte de reclamos por categoría y tiempo de resolución

---

## 🎯 PRIORIDAD BAJA (Cuarta semana y posteriores)

### 11. Integraciones N8N + Chatwoot - BACKEND/INFRAESTRUCTURA
**Estado:** ⚠️ 10% completo  
**Impacto:** Sin automatización completa

**Qué completar:**
- Deployment de N8N en Cloud Run #2
- **Deployment de Chatwoot en Cloud Run #3** (NUEVO)
- Configuración multitenant de workflows
- **Configuración multitenant de Chatwoot accounts**
- Webhooks bidireccionales OptimaCX ↔ N8N ↔ Chatwoot
- Templates de workflows por concesionario
- **Provisión automática de cuentas Chatwoot** para nuevos tenants
- **Integración WhatsApp Business API con Chatwoot**

### 11. Sistema RAG para Reclamos - BACKEND
**Estado:** ⚠️ 40% completo (schema listo)  
**Impacto:** Sin clasificación inteligente de reclamos

**Qué implementar:**
- Pipeline de procesamiento de documentos
- Generación de embeddings con Gemini
- Configuración de Vertex AI Vector Search
- API de búsqueda semántica
- Interface de gestión de conocimiento

### 12. Generación de PDFs y Reportes - BACKEND
**Estado:** ❌ Faltante  
**Impacto:** Sin documentos automáticos

**Qué crear:**
- Generación de cotizaciones PDF
- Reportes de encuestas exportables
- Reportes de reclamos para auditoría
- Generación de códigos QR personalizados

### 13. Optimizaciones de Performance - FRONTEND/BACKEND
**Estado:** ❌ Faltante  
**Impacto:** Experiencia lenta con muchos datos

**Qué optimizar:**
- Paginación en listas largas
- Lazy loading de componentes pesados
- Cache de consultas frecuentes
- Optimización de queries complejas
- Implementación de virtualization en tablas

### 14. Testing y QA - DESARROLLO
**Estado:** ❌ Faltante  
**Impacto:** Sin garantía de calidad

**Qué implementar:**
- Tests unitarios para Edge Functions
- Tests de integración para workflows
- Tests E2E para flujos críticos
- Tests de carga para multitenant
- Configuración de CI/CD con testing

---

## 📝 DATOS Y CONFIGURACIÓN INICIAL

### 15. Datos de Seed/Demo - BACKEND
**Estado:** ❌ Faltante  
**Impacto:** Sin datos para testing

**Qué crear:**
- Concesionarios de ejemplo
- Usuarios con diferentes roles
- Catálogo de productos automotrices
- Leads de prueba con diferentes estados
- Configuraciones base por concesionario

### 16. Documentación Técnica - GENERAL
**Estado:** ⚠️ Parcial  
**Impacao:** Dificulta mantenimiento

**Qué documentar:**
- API documentation completa
- Guía de deployment paso a paso
- Manual de configuración de concesionarios
- Guía de desarrollo para nuevas funcionalidades
- Troubleshooting guide

---

## 🎮 FUNCIONALIDADES AVANZADAS (Futuro)

### 17. Integraciones Externas Avanzadas
- Integración con WhatsApp Business API
- Sincronización con CRM existentes
- Integración con sistemas de facturación
- Conectores con dealers automotrices

### 18. IA y Machine Learning Avanzado
- Predicción de probabilidad de compra
- Análisis de sentimientos en reclamos
- Recomendación automática de productos
- Detección de patrones en encuestas

### 19. Mobile App
- App móvil para asesores
- Notificaciones push nativas
- Acceso offline limitado
- Geolocalización para visitas

---

## 📊 RESUMEN POR PRIORIDAD

### 🚨 **CRÍTICO (Semana 1):** 
- ~~RLS Policies completas~~ ✅ **COMPLETADO**
- Sistema de autenticación/roles  
- **Integración Chatwoot + WhatsApp** (NUEVO CRÍTICO)
- Dashboards básicos de cada módulo

### 🔥 **ALTO (Semana 2):**
- Formularios CRUD + Chatwoot config
- Edge Functions de IA + webhooks Chatwoot
- Configuración de tenants + accounts Chatwoot

### ⚡ **MEDIO (Semana 3):**
- Componentes especializados + UI Chatwoot
- Sistema de notificaciones
- Métricas básicas + chat metrics

### 🎯 **BAJO (Semana 4+):**
- Integraciones N8N + Chatwoot completas
- Sistema RAG completo
- Performance y testing

**Total estimado para MVP funcional: 8-10 semanas de desarrollo intenso**  
**(Incremento de 2 semanas por integración Chatwoot)**

---

## 🏗️ **NUEVA ARQUITECTURA DE 3 SERVICIOS CLOUD RUN**

1. **optima-cx-frontend** (Next.js + Supabase) ✅ 90% completo
2. **n8n-automation-hub** (Workflows + IA) ⚠️ 10% completo  
3. **chatwoot-conversations** (WhatsApp + Chat) ❌ 0% completo - **NUEVO**

**Infraestructura adicional requerida:**
- **Cloud Memorystore Redis** para Chatwoot sessions
- **PostgreSQL adicional** para chat history
- **WhatsApp Business API** integration
- **Subdominios multitenant** para Chatwoot accounts