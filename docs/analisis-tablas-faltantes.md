# 📊 Análisis COMPLETO de Base de Datos OptimaCX - Tablas Faltantes y Conexiones

## 🔍 Resumen del Análisis ACTUALIZADO

Basado en la revisión COMPLETA de:
- ✅ Documentación CLAUDE.md (requerimientos del negocio)
- ✅ Workflows existentes en N8N (25+ workflows analizados)
- ✅ Esquema ACTUAL de base de datos Supabase (VERIFICADO CON MCP)
- ✅ Migraciones implementadas hasta hoy
- ✅ **Análisis de conectividad N8N ↔ Supabase ↔ Cloud SQL**

## 🎯 **ARQUITECTURA ACTUAL CONFIRMADA**

### 🏗️ Bases de Datos en Uso:
1. **Supabase PostgreSQL** (Principal) - ✅ **ACTIVA Y VERIFICADA**
   - URL: `https://gdnlodwwmvbgayzzudiu.supabase.co`
   - Estado: ✅ Reactivada y funcionando
   - Uso: Frontend, API REST, tablas principales de negocio

2. **Cloud SQL para N8N** - Workflows y metadata
3. **Cloud SQL para Chatwoot** - Conversaciones y chat

## ✅ Tablas Existentes (VERIFICADAS CON MCP DE SUPABASE)

### **CORE MULTITENANT** ✅ COMPLETO
- ✅ `concesionarios` - Tenants principales
- ✅ `sucursales` - Sucursales por concesionario  
- ✅ `users` - Usuarios con roles específicos (user_id, role, concesionario_id)

### **MÓDULO CLIENTES** ✅ COMPLETO
- ✅ `clientes` - Datos de clientes (RUT, nombre, contacto)
- ✅ `vehiculos` - Vehículos por cliente (patente, VIN, marca, modelo)

### **MÓDULO DE VENTAS** ✅ COMPLETO
- ✅ `leads` - Gestión de leads/prospectos con scoring
- ✅ `productos` - Catálogo de vehículos y productos
- ✅ `cotizaciones` - Cotizaciones generadas
- ✅ `items_cotizacion` - Items específicos de cotizaciones
- ✅ `ventas` - Ventas cerradas
- ✅ `items_venta` - Items de ventas realizadas

### **MÓDULO SERVICIO TÉCNICO** ✅ COMPLETO
- ✅ `citas` - Agendamiento de servicios
- ✅ `servicios` - Órdenes de trabajo y servicios
- ✅ `items_servicio` - Repuestos y trabajos realizados

### **MÓDULO RECLAMOS** ✅ COMPLETO
- ✅ `reclamos` - Gestión de reclamos con IA
- ✅ `categorias_reclamo` - Categorización de reclamos
- ✅ `seguimientos_reclamo` - Historial de seguimientos

### **MÓDULO ENCUESTAS** ✅ COMPLETO
- ✅ `encuestas` - Definición de encuestas (ventas y post-venta)
- ✅ `preguntas` - Preguntas de las encuestas
- ✅ `respuestas_encuesta` - Respuestas completas
- ✅ `respuestas_pregunta` - Respuestas por pregunta específica

## ❌ **TABLAS FALTANTES CRÍTICAS IDENTIFICADAS**

### 🔴 **1. CONFIGURACIÓN MULTITENANT** - **PRIORIDAD CRÍTICA**
```sql
-- ❌ FALTANTE: Configuraciones específicas por concesionario
CREATE TABLE configuraciones_concesionario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concesionario_id UUID REFERENCES concesionarios(id) UNIQUE,
    configuracion JSONB NOT NULL DEFAULT '{}',
    webhook_n8n_base TEXT, -- https://n8n-optimacx-supabase-xxx.run.app/webhook/
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ❌ FALTANTE: Integraciones externas por concesionario
CREATE TABLE integraciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concesionario_id UUID REFERENCES concesionarios(id),
    tipo_integracion TEXT NOT NULL, -- 'whatsapp', 'n8n', 'chatwoot', 'email'
    nombre TEXT NOT NULL,
    configuracion JSONB NOT NULL, -- Credenciales y config específica
    estado TEXT DEFAULT 'activo',
    ultimo_sync TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```
**❗ Sin estas tablas, los workflows de N8N no pueden funcionar específicamente por concesionario.**

### 🔴 **2. SISTEMA DE NOTIFICACIONES** - **PRIORIDAD CRÍTICA**
```sql
-- ❌ FALTANTE: Gestión centralizada de comunicaciones
CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concesionario_id UUID REFERENCES concesionarios(id),
    usuario_id UUID REFERENCES users(user_id),
    cliente_id UUID REFERENCES clientes(id),
    tipo_notificacion TEXT NOT NULL, -- 'email', 'whatsapp', 'sms'
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    estado TEXT DEFAULT 'pendiente', -- 'enviado', 'entregado', 'fallido'
    canal_envio TEXT, -- 'n8n', 'chatwoot', 'manual'
    referencia_id UUID, -- ID del lead, venta, reclamo, etc.
    referencia_tipo TEXT, -- 'lead', 'venta', 'reclamo', 'encuesta'
    metadata JSONB,
    enviado_en TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ❌ FALTANTE: Templates de comunicación por concesionario
CREATE TABLE templates_comunicacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concesionario_id UUID REFERENCES concesionarios(id),
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL, -- 'email', 'whatsapp', 'sms'
    categoria TEXT NOT NULL, -- 'bienvenida', 'seguimiento', 'encuesta'
    asunto TEXT,
    contenido TEXT NOT NULL,
    variables JSONB, -- {nombre}, {vehiculo}, {fecha}, etc.
    es_activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```
**❗ Sin estas tablas, no se pueden enviar comunicaciones automáticas diferenciadas por concesionario.**

### 🔴 **3. AUDITORÍA Y LOGS** - **PRIORIDAD ALTA**
```sql
-- ❌ FALTANTE: Logs de automatizaciones
CREATE TABLE logs_automatizacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concesionario_id UUID REFERENCES concesionarios(id),
    tipo_workflow TEXT NOT NULL, -- 'lead_seguimiento', 'encuesta_envio'
    referencia_id UUID,
    referencia_tipo TEXT,
    estado TEXT NOT NULL, -- 'iniciado', 'completado', 'error'
    n8n_execution_id TEXT,
    datos_entrada JSONB,
    datos_salida JSONB,
    error_mensaje TEXT,
    tiempo_procesamiento INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ❌ FALTANTE: Auditoría de acciones críticas
CREATE TABLE auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concesionario_id UUID REFERENCES concesionarios(id),
    usuario_id UUID REFERENCES users(user_id),
    accion TEXT NOT NULL, -- 'crear', 'editar', 'eliminar'
    tabla_afectada TEXT NOT NULL,
    registro_id UUID,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 🟡 **4. MÉTRICAS Y DASHBOARD** - **PRIORIDAD MEDIA**
```sql
-- ❌ FALTANTE: Métricas consolidadas
CREATE TABLE metricas_dashboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concesionario_id UUID REFERENCES concesionarios(id),
    sucursal_id UUID REFERENCES sucursales(id),
    fecha DATE NOT NULL,
    tipo_metrica TEXT NOT NULL, -- 'ventas', 'leads', 'satisfaccion'
    metrica JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(concesionario_id, sucursal_id, fecha, tipo_metrica)
);

-- ❌ FALTANTE: Gestión de archivos
CREATE TABLE archivos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concesionario_id UUID REFERENCES concesionarios(id),
    uploaded_by UUID REFERENCES users(user_id),
    referencia_id UUID,
    referencia_tipo TEXT, -- 'reclamo', 'venta', 'servicio'
    nombre_archivo TEXT NOT NULL,
    tipo_mime TEXT NOT NULL,
    url_storage TEXT NOT NULL, -- Cloud Storage URL
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔗 **CONEXIONES FALTANTES CRÍTICAS**

### ❌ **1. VIN en Encuestas**
```sql
-- Los workflows mencionan VIN pero no está en las encuestas
ALTER TABLE respuestas_encuesta ADD COLUMN vin TEXT;
CREATE INDEX idx_respuestas_encuesta_vin ON respuestas_encuesta(vin);
```

### ❌ **2. Conexión N8N → Supabase**
**Variables de entorno faltantes en Cloud Run N8N:**
```env
SUPABASE_URL=https://gdnlodwwmvbgayzzudiu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
```

### ❌ **3. Políticas RLS Faltantes**
Muchas tablas no tienen Row Level Security configurado correctamente.

## 🚨 **PROBLEMAS CRÍTICOS DETECTADOS**

### 1. **Workflows de N8N sin acceso a Supabase**
- Los workflows hacen referencia a tablas de Supabase
- Pero N8N (Cloud Run) no tiene configuradas las credenciales
- **Resultado**: Los workflows fallan silenciosamente

### 2. **Configuración Multitenant Incompleta**
- No hay tabla para configuraciones específicas por concesionario
- WhatsApp, emails, y otras integraciones no pueden ser específicas
- **Resultado**: Todos los concesionarios comparten la misma configuración

### 3. **Sistema de Comunicaciones Incompleto**
- No hay gestión centralizada de notificaciones
- No hay templates diferenciados por concesionario
- **Resultado**: Comunicaciones genéricas sin personalización

## 🚀 **PLAN DE IMPLEMENTACIÓN INMEDIATA**

### **FASE 1: CRÍTICO (IMPLEMENTAR HOY)**
1. ✅ `configuraciones_concesionario` 
2. ✅ `integraciones`
3. ✅ Agregar VIN a encuestas
4. ⚠️ Configurar variables N8N → Supabase

### **FASE 2: ALTO (ESTA SEMANA)**
1. ✅ `notificaciones`
2. ✅ `templates_comunicacion`
3. ✅ `logs_automatizacion`

### **FASE 3: MEDIO (PRÓXIMA SEMANA)**
1. ✅ `auditoria`
2. ✅ `archivos`
3. ✅ `metricas_dashboard`

## 🔧 **SCRIPTS LISTOS PARA EJECUTAR**

¿Quieres que ejecute las migraciones de **FASE 1 (CRÍTICO)** ahora mismo en tu base de datos Supabase?

Tengo los scripts SQL preparados y el MCP de Supabase funcionando correctamente.

## ⚠️ **RECOMENDACIONES FINALES**

1. **BACKUP**: Hacer snapshot de Supabase antes de migraciones
2. **RLS**: Implementar políticas de seguridad en tablas nuevas  
3. **ÍNDICES**: Agregar índices en campos frecuentemente consultados
4. **MONITORING**: Implementar logs de automatización desde el inicio

**¿Procedo con la implementación de las tablas críticas?**
- ✅ `cotizaciones` - Cotizaciones de ventas
- ✅ `ventas` - Ventas concretadas

### **MÓDULO DE ENCUESTAS**
- ✅ `encuestas` - Encuestas post-venta (base)
- ✅ `encuestas_ventas` - Encuestas de satisfacción de ventas
- ✅ `casos_feedback_postventa` - Casos de feedback de baja satisfacción
- ✅ `casos_feedback_ventas` - Casos de feedback de ventas

### **MÓDULO DE SERVICIOS**
- ✅ `servicios` - Servicios post-venta
- ✅ `citas` - Citas de servicio
- ✅ `items_servicio` - Items/trabajos de servicio

### **SOPORTE GENERAL**
- ✅ `vehiculos` - Vehículos de clientes
- ✅ `clientes` - Base de clientes
- ✅ `items_cotizacion` - Items de cotizaciones
- ✅ `items_venta` - Items de ventas

---

## 🚨 Tablas CRÍTICAS Faltantes

### **1. CONFIGURACIÓN MULTITENANT** (ALTA PRIORIDAD)
```sql
-- TABLA FALTANTE: tenant_configurations
CREATE TABLE public.tenant_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concesionario_id UUID NOT NULL REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    
    -- Configuración Chatwoot
    chatwoot_account_id INTEGER UNIQUE NOT NULL,
    chatwoot_webhook_token TEXT NOT NULL,
    
    -- Configuración WhatsApp Business
    whatsapp_config JSONB NOT NULL DEFAULT '{}', -- {business_token, phone_number_id, verify_token}
    
    -- Configuración Email/SMTP
    email_config JSONB NOT NULL DEFAULT '{}', -- {smtp_host, smtp_user, smtp_pass, from_email}
    
    -- Configuración IA
    ai_config JSONB NOT NULL DEFAULT '{}', -- {provider, api_key, model, custom_prompts}
    
    -- Configuración RAG
    rag_config JSONB NOT NULL DEFAULT '{}', -- {vector_index_id, embedding_model, search_config}
    
    -- Variables de Workflow
    workflow_variables JSONB NOT NULL DEFAULT '{}', -- {brand_colors, business_hours, templates}
    
    -- Estado
    activo BOOLEAN DEFAULT true,
    configuracion_completa BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(concesionario_id)
);
```

### **2. MÓDULO DE RECLAMOS** (ALTA PRIORIDAD)
Basado en los workflows de reclamos, faltan varias tablas críticas:

```sql
-- TABLA FALTANTE: reclamos (tabla principal)
CREATE TABLE public.reclamos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concesionario_id UUID NOT NULL REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    sucursal_id UUID REFERENCES public.sucursales(id) ON DELETE SET NULL,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    vehiculo_id UUID REFERENCES public.vehiculos(id) ON DELETE SET NULL,
    venta_id UUID REFERENCES public.ventas(id) ON DELETE SET NULL,
    servicio_id UUID REFERENCES public.servicios(id) ON DELETE SET NULL,
    
    -- Identificación del reclamo
    numero_reclamo VARCHAR(50) UNIQUE NOT NULL, -- REC-2024-001
    categoria_id UUID REFERENCES public.categorias_reclamo(id),
    
    -- Datos del cliente (snapshot)
    cliente_nombre VARCHAR(255) NOT NULL,
    cliente_email VARCHAR(255),
    cliente_telefono VARCHAR(20) NOT NULL,
    cliente_rut VARCHAR(20),
    
    -- Contenido del reclamo
    titulo VARCHAR(500) NOT NULL,
    descripcion TEXT NOT NULL,
    canal_ingreso VARCHAR(30) NOT NULL, -- 'whatsapp', 'email', 'web', 'presencial'
    
    -- Clasificación automática por IA
    clasificacion_ia JSONB DEFAULT '{}', -- Resultado del análisis RAG
    sentimiento_analisis JSONB DEFAULT '{}', -- Análisis de sentimiento
    
    -- Estado y asignación
    estado VARCHAR(20) DEFAULT 'nuevo' CHECK (estado IN ('nuevo', 'asignado', 'en_proceso', 'resuelto', 'cerrado')),
    prioridad VARCHAR(10) DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'critica')),
    urgencia VARCHAR(10) DEFAULT 'normal' CHECK (urgencia IN ('baja', 'normal', 'alta')),
    
    -- Asignación
    asignado_a_user_id UUID REFERENCES public.usuarios(id),
    
    -- Black Alert (ley del consumidor)
    black_alert BOOLEAN DEFAULT false,
    
    -- Fechas de seguimiento
    fecha_limite_resolucion TIMESTAMP WITH TIME ZONE,
    fecha_primera_respuesta TIMESTAMP WITH TIME ZONE,
    fecha_resolucion TIMESTAMP WITH TIME ZONE,
    tiempo_resolucion_horas INTEGER,
    
    -- Satisfacción final
    satisfaccion_cliente INTEGER CHECK (satisfaccion_cliente >= 1 AND satisfaccion_cliente <= 10),
    comentario_satisfaccion TEXT,
    
    -- Compensación
    es_fundado BOOLEAN,
    motivo_no_fundado TEXT,
    compensacion_ofrecida TEXT,
    valor_compensacion DECIMAL(10,2),
    
    -- Seguimiento
    requiere_seguimiento BOOLEAN DEFAULT false,
    es_publico BOOLEAN DEFAULT false,
    url_seguimiento TEXT,
    
    -- Metadatos
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    attachments TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA FALTANTE: categorias_reclamo
CREATE TABLE public.categorias_reclamo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concesionario_id UUID NOT NULL REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    color VARCHAR(7) DEFAULT '#6B7280', -- Color hex para UI
    icono VARCHAR(50), -- Nombre del icono
    
    -- Configuración
    es_activa BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 1,
    tiempo_resolucion_estimado INTEGER, -- Horas
    requiere_escalamiento BOOLEAN DEFAULT false,
    nivel_prioridad VARCHAR(10) DEFAULT 'media',
    
    -- Automatización
    departamento_responsable VARCHAR(100),
    flujo_resolucion JSONB DEFAULT '{}',
    plantilla_respuesta TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(concesionario_id, nombre)
);

-- TABLA FALTANTE: seguimientos_reclamo (historial de modificaciones)
CREATE TABLE public.seguimientos_reclamo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reclamo_id UUID NOT NULL REFERENCES public.reclamos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.usuarios(id),
    
    tipo_seguimiento VARCHAR(30) NOT NULL, -- 'comentario', 'cambio_estado', 'asignacion', 'resolucion'
    titulo VARCHAR(255),
    descripcion TEXT,
    
    -- Visibilidad
    es_publico BOOLEAN DEFAULT false, -- Visible para el cliente
    es_respuesta_automatica BOOLEAN DEFAULT false,
    
    -- Cambios de estado
    estado_anterior VARCHAR(20),
    estado_nuevo VARCHAR(20),
    asignado_anterior VARCHAR(255),
    asignado_nuevo VARCHAR(255),
    
    -- Comunicación
    canal_comunicacion VARCHAR(30), -- 'whatsapp', 'email', 'llamada', 'presencial'
    tiempo_dedicado_minutos INTEGER DEFAULT 0,
    
    -- Adjuntos y metadatos
    attachments TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Notificaciones
    notificado_cliente BOOLEAN DEFAULT false,
    fecha_notificacion TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **3. SISTEMA RAG/CONOCIMIENTO** (ALTA PRIORIDAD)
Para el funcionamiento del RAG en reclamos:

```sql
-- TABLA FALTANTE: knowledge_base (base de conocimiento)
CREATE TABLE public.knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concesionario_id UUID NOT NULL REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    
    -- Documento
    titulo VARCHAR(500) NOT NULL,
    contenido TEXT NOT NULL,
    resumen TEXT,
    
    -- Categorización
    categoria VARCHAR(100), -- 'politicas', 'procedimientos', 'faq', 'manuales'
    subcategoria VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    
    -- Vectorización
    embedding vector(768), -- Gemini Embedding 001
    embedding_model VARCHAR(50) DEFAULT 'gemini-embedding-001',
    
    -- Metadatos
    fuente_original TEXT, -- URL, archivo, etc.
    version VARCHAR(20) DEFAULT '1.0',
    idioma VARCHAR(5) DEFAULT 'es',
    
    -- Estado
    activo BOOLEAN DEFAULT true,
    publico BOOLEAN DEFAULT false, -- Visible para clientes
    
    -- Auditoría
    created_by UUID REFERENCES public.usuarios(id),
    approved_by UUID REFERENCES public.usuarios(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsqueda vectorial
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding 
ON public.knowledge_base USING ivfflat (embedding vector_cosine_ops);
```

### **4. CAMPAÑAS DE MARKETING** (MEDIA PRIORIDAD)
Para los workflows de campañas:

```sql
-- TABLA FALTANTE: campañas
CREATE TABLE public.campañas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concesionario_id UUID NOT NULL REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    
    -- Información básica
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_campaña VARCHAR(50) NOT NULL, -- 'email', 'whatsapp', 'mixta'
    
    -- Segmentación
    audiencia_filtros JSONB DEFAULT '{}', -- Filtros de segmentación
    total_destinatarios INTEGER DEFAULT 0,
    
    -- Contenido
    mensaje_template TEXT,
    variables_personalizacion JSONB DEFAULT '{}',
    adjuntos TEXT[] DEFAULT '{}',
    
    -- Programación
    fecha_inicio TIMESTAMP WITH TIME ZONE,
    fecha_fin TIMESTAMP WITH TIME ZONE,
    programada BOOLEAN DEFAULT false,
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'programada', 'enviando', 'completada', 'pausada', 'cancelada')),
    
    -- Métricas
    total_enviados INTEGER DEFAULT 0,
    total_entregados INTEGER DEFAULT 0,
    total_abiertos INTEGER DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    total_respuestas INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA FALTANTE: campaña_envios (tracking individual)
CREATE TABLE public.campaña_envios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaña_id UUID NOT NULL REFERENCES public.campañas(id) ON DELETE CASCADE,
    destinatario_telefono VARCHAR(20),
    destinatario_email VARCHAR(255),
    destinatario_nombre VARCHAR(255),
    
    -- Estado del envío
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'enviado', 'entregado', 'error', 'rebotado')),
    canal_usado VARCHAR(20), -- 'whatsapp', 'email'
    
    -- Tracking
    fecha_envio TIMESTAMP WITH TIME ZONE,
    fecha_entrega TIMESTAMP WITH TIME ZONE,
    fecha_apertura TIMESTAMP WITH TIME ZONE,
    fecha_click TIMESTAMP WITH TIME ZONE,
    fecha_respuesta TIMESTAMP WITH TIME ZONE,
    
    -- Personalización
    mensaje_enviado TEXT,
    variables_aplicadas JSONB DEFAULT '{}',
    
    -- Errores
    error_detalle TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **5. MÉTRICAS Y DASHBOARDS** (MEDIA PRIORIDAD)

```sql
-- TABLA FALTANTE: dashboard_metrics (para caching de métricas)
CREATE TABLE public.dashboard_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concesionario_id UUID NOT NULL REFERENCES public.concesionarios(id) ON DELETE CASCADE,
    sucursal_id UUID REFERENCES public.sucursales(id),
    
    -- Identificación de la métrica
    metric_name VARCHAR(100) NOT NULL, -- 'nps_promedio', 'leads_convertidos', etc.
    metric_category VARCHAR(50) NOT NULL, -- 'ventas', 'encuestas', 'reclamos', 'general'
    
    -- Valor y metadatos
    metric_value DECIMAL(10,2),
    metric_count INTEGER,
    metric_data JSONB DEFAULT '{}', -- Datos adicionales/desglose
    
    -- Período
    period_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
    period_date DATE NOT NULL,
    
    -- Cache
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(concesionario_id, metric_name, period_type, period_date, sucursal_id)
);
```

---

## 🔗 Conexiones Críticas Faltantes

### **1. Conexión N8N ↔ Supabase**
Los workflows requieren estas configuraciones en `tenant_configurations`:

```javascript
// En cada workflow de N8N, necesitas:
const tenantConfig = await getTenantConfig(concesionario_id);
const supabaseConfig = {
  url: 'https://gdnlodwwmvbgayzzudiu.supabase.co',
  serviceKey: tenantConfig.supabase_service_key,
  anonKey: tenantConfig.supabase_anon_key
};
```

### **2. Conexión Chatwoot ↔ Tenant**
Cada mensaje de Chatwoot debe identificar el tenant:

```javascript
// En el webhook de Chatwoot
const chatbootAccountId = webhook.account.id;
const tenantConfig = await getTenantByChawootId(chatbootAccountId);
const concesionario_id = tenantConfig.concesionario_id;
```

### **3. RAG Pipeline**
Para el funcionamiento del RAG en reclamos:

```javascript
// Pipeline completo RAG
1. Recibir reclamo → extraer concesionario_id
2. Generar embedding del reclamo con Gemini
3. Buscar en knowledge_base del tenant específico
4. Construir prompt con contexto + reclamo original
5. Enviar a Gemini 2.5 Pro para análisis
6. Guardar resultado en reclamos.clasificacion_ia
```

---

## 🎯 Plan de Implementación Recomendado

### **FASE 1: CRÍTICO (Esta semana)**
1. ✅ Crear `tenant_configurations` - Base para todo el multitenant
2. ✅ Crear tablas de reclamos (`reclamos`, `categorias_reclamo`, `seguimientos_reclamo`)
3. ✅ Implementar RLS policies para todas las nuevas tablas

### **FASE 2: ALTA PRIORIDAD (Próxima semana)**
1. ✅ Crear `knowledge_base` para RAG
2. ✅ Configurar índices vectoriales
3. ✅ Migrar configuraciones existentes a `tenant_configurations`

### **FASE 3: MEJORAS (Siguientes 2 semanas)**
1. ✅ Implementar sistema de campañas
2. ✅ Optimizar dashboard_metrics
3. ✅ Agregar campos faltantes a tablas existentes

### **FASE 4: OPTIMIZACIÓN**
1. ✅ Indices de performance
2. ✅ Funciones stored procedures
3. ✅ Triggers de auditoría

---

## 🔧 Comandos de Verificación

```bash
# Verificar tablas existentes
curl -H "apikey: YOUR_ANON_KEY" \
"https://gdnlodwwmvbgayzzudiu.supabase.co/rest/v1/"

# Verificar configuración de tenant
curl -H "apikey: YOUR_ANON_KEY" \
"https://gdnlodwwmvbgayzzudiu.supabase.co/rest/v1/tenant_configurations?limit=1"

# Verificar reclamos
curl -H "apikey: YOUR_ANON_KEY" \
"https://gdnlodwwmvbgayzzudiu.supabase.co/rest/v1/reclamos?limit=1"
```

---

## 📋 Checklist de Funcionalidad

### **Leads y Ventas** ✅
- [x] Recepción WhatsApp → Análisis IA → Asignación → Notificación
- [x] Scoring automático de leads
- [x] Gestión de cotizaciones
- [x] Seguimiento de ventas

### **Encuestas Post-Venta** ✅  
- [x] 3 canales (QR → WhatsApp → Llamada)
- [x] Filtrado de duplicados
- [x] Alertas por baja satisfacción

### **Encuestas de Ventas** ✅
- [x] Disparadas por estado de lead
- [x] Diferentes canales según tipo
- [x] Tracking de satisfacción

### **Reclamos** ❌ (FALTA IMPLEMENTAR)
- [ ] Recepción multicanal
- [ ] Análisis RAG con IA
- [ ] Sistema de asignación automática
- [ ] Black Alert automation
- [ ] Historial de seguimiento

### **Campañas** ❌ (FALTA IMPLEMENTAR)
- [ ] Segmentación de audiencias
- [ ] Envío masivo WhatsApp/Email
- [ ] Tracking de métricas
- [ ] Automatización de secuencias

---

**🚨 ACCIÓN INMEDIATA REQUERIDA:**
1. Implementar `tenant_configurations` para habilitar multitenant completo
2. Crear sistema de reclamos completo
3. Configurar RAG pipeline para análisis inteligente
4. Establecer conexiones N8N ↔ Supabase con configuración por tenant
