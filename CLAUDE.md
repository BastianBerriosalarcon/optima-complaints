# Guía para Claude Code - Proyecto Optima-Complaints

## 1. Contexto General del Proyecto

**Nombre del Proyecto:** Optima-Complaints

**Descripción:** Optima-Complaints es una plataforma SaaS multitenant especializada en la **gestión inteligente de reclamos** para el sector automotriz. El sistema automatiza la recepción, clasificación, asignación y seguimiento de reclamos utilizando Inteligencia Artificial (Gemini 2.5 Pro) y RAG (Retrieval Augmented Generation) para proporcionar análisis contextualizados basados en la base de conocimiento de cada concesionario.

### 1.1. Alcance del Proyecto

**MÓDULO ÚNICO: Gestión de Reclamos**

Este proyecto está enfocado **exclusivamente** en reclamos. NO incluye:
- Gestión de Leads o Ventas
- Encuestas de Ventas o Post-Venta
- WhatsApp Business API
- Chatwoot para conversaciones
- Campañas de Marketing

**Roles de Usuario:**
- **Super Usuario:** Administra el sistema completo y puede ver todos los concesionarios
- **Admin Concesionario:** Administra su concesionario específico
- **Jefe de Servicio:** Supervisa reclamos de su sucursal/concesionario
- **Asesor de Servicio:** Gestiona reclamos asignados
- **Encargado de Calidad:** Analiza métricas y tendencias de reclamos
- **Contact Center:** Ingresa reclamos manualmente por teléfono/presencial

### 1.2. Stack Tecnológico

**Frontend:**
- Next.js 14 con App Router + TypeScript
- Tailwind CSS + Radix UI para componentes
- React Hook Form + Zod para validación
- Supabase Auth para autenticación
- TanStack Query para data fetching
- TanStack Table para tablas avanzadas

**Backend:**
- Supabase PostgreSQL con Row Level Security (RLS)
- Supabase Realtime para actualizaciones en tiempo real
- Supabase Edge Functions para lógica serverless
- N8N workflows para automatización de procesos

**Infraestructura:**
- Google Cloud Platform (GCP) o Railway para N8N
- Vercel o Cloudflare Pages para frontend
- Supabase Cloud para base de datos
- Cloud Storage para documentos y adjuntos

**Inteligencia Artificial:**
- **Gemini 2.5 Pro** - Análisis y clasificación de reclamos
- **Gemini Embedding 001** - Vectorización de documentos (768 dimensiones)
- **Cohere Rerank** - Re-clasificación de documentos recuperados para mayor precisión
- **Supabase pgvector** - Base de datos vectorial para RAG

**Notificaciones:**
- SMTP (Gmail, SendGrid, etc.) para emails
- Sin WhatsApp ni SMS en esta versión

---

## 2. Principios y Prioridades Clave

### 2.1. Aislamiento Multitenant con RLS

**Máxima prioridad:** Segregación total de datos entre concesionarios mediante Row Level Security (RLS) en Supabase. Cada consulta se filtra automáticamente por `concesionario_id`.

```sql
-- Ejemplo de policy RLS
CREATE POLICY "Reclamos are tenant isolated"
ON public.reclamos
FOR ALL
USING (concesionario_id = (auth.jwt() ->> 'concesionario_id')::UUID);
```

### 2.2. Automatización Inteligente con IA

- **Clasificación automática** de reclamos usando Gemini
- **Extracción de datos** clave (cliente, vehículo, sucursal)
- **Análisis de sentimiento** para priorización
- **Sugerencias de resolución** basadas en RAG
- **Asignación automática** a asesores disponibles

### 2.3. Sistema RAG (Retrieval Augmented Generation)

El sistema RAG permite que la IA acceda a la base de conocimiento específica del concesionario:

```
Reclamo → Embedding → Búsqueda Vectorial → Rerank Cohere → Contexto Enriquecido → Gemini → Respuesta
```

**Tipos de documentos soportados:**
- Políticas de garantía
- Manuales de procedimientos
- FAQ específicos del concesionario
- Casos resueltos anteriormente
- Normativas legales

### 2.4. Arquitectura Serverless-First

- Supabase (base de datos serverless)
- Edge Functions para lógica backend
- N8N en Cloud Run o Railway
- Frontend en Vercel/Cloudflare Pages
- Sin servidores que mantener

---

## 3. Gestión de Reclamos (Módulo Principal)

### 3.1. Canales de Ingreso de Reclamos

#### **A) Ingreso Manual por Contact Center** (Principal)

**Flujo:**
```
Cliente llama/visita → Contact Center ingresa en Dashboard
  ↓
Formulario "Nuevo Reclamo" con campos validados
  ↓
Frontend envía a API: POST /api/reclamos/crear
  ↓
Backend valida y dispara webhook N8N
  ↓
N8N workflow: complaint-orchestrator
```

**Campos del formulario:**
- Cliente: nombre, RUT, teléfono, email
- Vehículo: patente, VIN, marca, modelo
- Sucursal: selector de sucursal del concesionario
- Descripción del reclamo (texto libre)
- Categoría preliminar (opcional)
- Adjuntos (fotos, documentos)
- Black Alert: checkbox SI/NO

**Validaciones:**
- Cliente existente o crear nuevo
- Vehículo existente o crear nuevo
- Descripción mínima 20 caracteres
- Teléfono formato válido
- Email formato válido (opcional)

#### **B) Formulario Web Público**

**URL:** `https://concesionario.com/reclamos/nuevo`

**Flujo:**
```
Cliente accede a URL pública
  ↓
Formulario web simplificado
  ↓
reCAPTCHA anti-spam
  ↓
POST directo a N8N webhook
  ↓
N8N valida y procesa
```

**Campos públicos:**
- Nombre completo
- Teléfono (obligatorio)
- Email
- Patente del vehículo
- Descripción del problema
- Adjuntar foto (opcional)

**Características:**
- Sin login requerido
- Confirmación por email con número de reclamo
- URL de seguimiento público generada
- Captcha para prevenir spam

#### **C) Email Automático**

**Casilla:** `reclamos@concesionario.com`

**Flujo:**
```
Cliente envía email
  ↓
N8N Email Trigger (IMAP)
  ↓
Parsea: asunto, cuerpo, remitente, adjuntos
  ↓
Extrae datos con IA (Gemini)
  ↓
Crea reclamo automáticamente
```

**Configuración N8N:**
```javascript
{
  "trigger": "Email Trigger (IMAP)",
  "host": "imap.gmail.com",
  "user": "reclamos@concesionario.com",
  "folder": "INBOX",
  "pollInterval": 60000, // 1 minuto
  "filters": {
    "subject": "Reclamo|Queja|Problema"
  }
}
```

**Extracción automática con IA:**
- Nombre del cliente (del email)
- Teléfono (si está en firma o cuerpo)
- Descripción (cuerpo del email)
- Patente (regex: `[A-Z]{2,4}[0-9]{2,4}`)

#### **D) API REST Externa**

**Endpoint:** `POST https://n8n-url/webhook/complaint/orchestrator`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token_tenant>"
}
```

**Body:**
```json
{
  "concesionario_id": "uuid-del-concesionario",
  "canal_origen": "api_externa",
  "cliente": {
    "nombre": "Juan Pérez",
    "rut": "12345678-9",
    "telefono": "+56912345678",
    "email": "juan@email.com"
  },
  "vehiculo": {
    "patente": "AB1234",
    "vin": "1HGBH41JXMN109186",
    "marca": "Toyota",
    "modelo": "Corolla"
  },
  "descripcion": "El motor hace un ruido extraño al encender",
  "sucursal_id": "uuid-sucursal",
  "adjuntos": [
    "https://storage.com/foto1.jpg"
  ]
}
```

**Uso:**
- Integración con CRM externo (Salesforce, HubSpot)
- ERP del concesionario
- Sistema de garantías externo
- Aplicaciones móviles de terceros

---

### 3.2. Flujo Completo de Procesamiento de Reclamos

```
┌──────────────────────────────────────────────────┐
│  PASO 1: RECEPCIÓN DEL RECLAMO                   │
│  Canales: Contact Center | Web | Email | API     │
└──────────────┬───────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────┐
│  PASO 2: WEBHOOK N8N - complaint-orchestrator    │
│  POST /webhook/complaint/orchestrator            │
│  • Valida formato básico                         │
│  • Extrae concesionario_id                       │
│  • Dispara procesador RAG (async)                │
│  • Retorna confirmación inmediata                │
└──────────────┬───────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────┐
│  PASO 3: PROCESADOR RAG                          │
│  Workflow: procesador-rag-reclamos               │
│                                                  │
│  3.1. Generación de Embedding                    │
│       Gemini Embedding 001 → vector (768 dims)   │
│                                                  │
│  3.2. Búsqueda Vectorial                         │
│       Query pgvector → TOP 20-50 docs relevantes │
│       Filtros: concesionario_id, activo=true     │
│                                                  │
│  3.3. Rerank con Cohere                          │
│       Cohere Rerank → TOP 3-5 más relevantes     │
│                                                  │
│  3.4. Construcción de Prompt Enriquecido         │
│       Context: documentos relevantes             │
│       Query: reclamo original                    │
│       Instructions: extraer datos clave          │
│                                                  │
│  3.5. Inferencia con Gemini 2.5 Pro              │
│       Analiza y extrae:                          │
│       • Tipo de reclamo (garantía, servicio)     │
│       • Urgencia (baja/media/alta)               │
│       • Datos estructurados (cliente, vehículo)  │
│       • Análisis de sentimiento                  │
│       • Sugerencias de resolución                │
│       • Referencias a políticas aplicables       │
└──────────────┬───────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────┐
│  PASO 4: GUARDAR EN BASE DE DATOS                │
│  INSERT INTO reclamos (                          │
│    numero_reclamo,    ← Auto: REC-2025-001       │
│    concesionario_id,                             │
│    sucursal_id,                                  │
│    cliente_id,                                   │
│    vehiculo_id,                                  │
│    titulo,           ← Generado por IA           │
│    descripcion,                                  │
│    estado,           ← 'nuevo'                   │
│    prioridad,        ← Por IA                    │
│    urgencia,         ← Por IA                    │
│    canal_ingreso,    ← 'contact_center', etc     │
│    clasificacion_ia, ← JSON completo             │
│    sentimiento_analisis,                         │
│    es_black_alert                                │
│  )                                               │
└──────────────┬───────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────┐
│  PASO 5: ASIGNACIÓN AUTOMÁTICA                   │
│  Workflow: asignacion-automatica-reclamos        │
│                                                  │
│  5.1. Buscar personal disponible                 │
│       Query usuarios:                            │
│       - concesionario_id = X                     │
│       - rol IN ('asesor_servicio', 'jefe')       │
│       - activo = true                            │
│       - sucursal_id = Y (si aplica)              │
│                                                  │
│  5.2. Algoritmo de Asignación                    │
│       Score basado en:                           │
│       • Sucursal coincidente (+50 pts)           │
│       • Especialización (+30 pts)                │
│       • Carga trabajo baja (+20 pts)             │
│       • Disponibilidad horaria (+10 pts)         │
│                                                  │
│  5.3. Asignar asesor ganador                     │
│       UPDATE reclamos SET                        │
│         asignado_a_user_id = 'uuid',             │
│         estado = 'asignado',                     │
│         fecha_asignacion = NOW()                 │
└──────────────┬───────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────┐
│  PASO 6: NOTIFICACIONES POR EMAIL                │
│  Workflow: notificaciones-reclamos               │
│                                                  │
│  Envía emails personalizados a:                  │
│                                                  │
│  6.1. ASESOR DE SERVICIO                         │
│       Subject: Nuevo reclamo asignado: REC-XXX   │
│       Body:                                      │
│       • Datos completos del reclamo              │
│       • Historial del cliente                    │
│       • Sugerencias de resolución (IA)           │
│       • Link al dashboard                        │
│                                                  │
│  6.2. JEFE DE SERVICIO                           │
│       Subject: Supervisión: Nuevo reclamo        │
│       Body:                                      │
│       • Resumen ejecutivo                        │
│       • Asesor asignado                          │
│       • Clasificación y urgencia                 │
│       • Link a métricas                          │
│                                                  │
│  6.3. ENCARGADO DE CALIDAD                       │
│       Subject: Análisis: Nuevo reclamo           │
│       Body:                                      │
│       • Clasificación IA                         │
│       • Análisis de sentimiento                  │
│       • Tipo y categoría                         │
│       • Link a reportes                          │
│                                                  │
│  6.4. CLIENTE (confirmación)                     │
│       Subject: Confirmación reclamo REC-XXX      │
│       Body:                                      │
│       • Número de reclamo                        │
│       • Asesor asignado                          │
│       • Tiempo estimado de resolución            │
│       • URL de seguimiento público               │
└──────────────┬───────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────┐
│  PASO 7: ACTUALIZACIÓN EN DASHBOARD              │
│  • Supabase Realtime notifica al frontend        │
│  • Dashboard muestra nuevo reclamo               │
│  • Notificación en tiempo real para usuarios     │
│  • Métricas actualizadas automáticamente         │
└──────────────────────────────────────────────────┘
```

---

### 3.3. Campos de la Tabla Reclamos

```sql
CREATE TABLE public.reclamos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Multitenant
    concesionario_id UUID NOT NULL REFERENCES concesionarios(id),
    sucursal_id UUID REFERENCES sucursales(id),

    -- Identificación
    numero_reclamo VARCHAR(50) NOT NULL UNIQUE, -- REC-2025-001
    categoria_id UUID REFERENCES categorias_reclamo(id),

    -- Relaciones
    cliente_id UUID REFERENCES clientes(id),
    vehiculo_id UUID REFERENCES vehiculos(id),
    venta_id UUID REFERENCES ventas(id),
    servicio_id UUID REFERENCES servicios(id),

    -- Snapshot cliente (al momento del reclamo)
    cliente_nombre VARCHAR(255) NOT NULL,
    cliente_email VARCHAR(255),
    cliente_telefono VARCHAR(20) NOT NULL,
    cliente_rut VARCHAR(20),

    -- Contenido
    titulo VARCHAR(500) NOT NULL,
    descripcion TEXT NOT NULL,
    estado VARCHAR(20) DEFAULT 'nuevo'
        CHECK (estado IN ('nuevo', 'asignado', 'en_proceso', 'resuelto', 'cerrado')),
    prioridad VARCHAR(10) DEFAULT 'media'
        CHECK (prioridad IN ('baja', 'media', 'alta', 'critica')),
    urgencia VARCHAR(10) DEFAULT 'normal'
        CHECK (urgencia IN ('baja', 'normal', 'alta')),

    -- Canal y origen
    canal_ingreso VARCHAR(30) NOT NULL
        CHECK (canal_ingreso IN ('contact_center', 'email', 'web', 'api')),

    -- Asignación
    asignado_a_user_id UUID REFERENCES usuarios(id),

    -- Fechas de seguimiento
    fecha_limite_resolucion TIMESTAMP WITH TIME ZONE,
    fecha_primera_respuesta TIMESTAMP WITH TIME ZONE,
    fecha_resolucion TIMESTAMP WITH TIME ZONE,
    tiempo_resolucion_horas INTEGER,

    -- Satisfacción
    satisfaccion_cliente INTEGER CHECK (satisfaccion_cliente BETWEEN 1 AND 10),
    comentario_satisfaccion TEXT,

    -- Resolución
    es_fundado BOOLEAN,
    motivo_no_fundado TEXT,
    compensacion_ofrecida TEXT,
    valor_compensacion DECIMAL(10,2),

    -- Black Alert (ley del consumidor)
    es_black_alert BOOLEAN DEFAULT false,

    -- Seguimiento público
    es_publico BOOLEAN DEFAULT false,
    url_seguimiento TEXT,

    -- Clasificación IA
    clasificacion_ia JSONB DEFAULT '{}',
    sentimiento_analisis JSONB DEFAULT '{}',

    -- Metadatos
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    attachments TEXT[] DEFAULT '{}',

    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(concesionario_id, numero_reclamo)
);
```

**Estructura de `clasificacion_ia` (JSONB):**
```json
{
  "tipo_reclamo": "garantia|servicio|financiero|atencion",
  "categoria": "motor|frenos|electricidad|atencion_cliente",
  "urgencia_detectada": "baja|media|alta",
  "confianza": 0.95,
  "datos_extraidos": {
    "sucursal_mencionada": "Sucursal Centro",
    "fecha_compra": "2024-06-15",
    "kilometraje": "15000"
  },
  "sugerencias_resolucion": [
    "Revisar política de garantía sección 3.2",
    "Inspección técnica del motor",
    "Contactar al proveedor de repuestos"
  ],
  "referencias_politicas": [
    {
      "documento": "Manual de Garantías 2024",
      "seccion": "3.2",
      "relevancia": 0.92
    }
  ],
  "palabras_clave": ["motor", "ruido", "garantía", "falla"]
}
```

**Estructura de `sentimiento_analisis` (JSONB):**
```json
{
  "sentimiento": "negativo|neutral|positivo",
  "score": -0.65,
  "emociones": ["frustración", "decepción"],
  "tono": "formal|informal|agresivo|cordial",
  "urgencia_emocional": "alta",
  "analisis": "Cliente muestra alta frustración por múltiples visitas sin solución"
}
```

---

### 3.4. Black Alert (Alerta Crítica)

**Definición:** Reclamo de un cliente que compró un vehículo y le falla dentro de los 6 meses, pudiendo acogerse a la ley del consumidor.

**Detección:**
- Manual: checkbox en formulario de ingreso
- Automática: IA detecta mediante análisis de fechas
  ```
  IF fecha_compra_vehiculo + 6 meses > fecha_actual
     AND tipo_falla IN ['motor', 'transmision', 'frenos', 'dirección']
  THEN es_black_alert = TRUE
  ```

**Acciones automáticas cuando es_black_alert = TRUE:**

```
┌────────────────────────────────────────────┐
│  Workflow: alerta-black-alert              │
├────────────────────────────────────────────┤
│  1. Marcar reclamo con flag BLACK_ALERT    │
│  2. Asignar máxima prioridad               │
│  3. Reducir SLA a 24 horas                 │
│  4. Envío masivo de emails a:              │
│     • Encargado de Calidad                 │
│     • Jefe de Servicio                     │
│     • Asesor de Servicio                   │
│     • Gerente General                      │
│     • Equipo Legal (si configurado)        │
│  5. Mostrar alerta roja en dashboard       │
│  6. Registrar en log de auditoría          │
│  7. Notificar a cliente vía email          │
└────────────────────────────────────────────┘
```

**Template de email Black Alert:**
```
Subject: ALERTA: BLACK ALERT - Reclamo REC-2025-XXX - Acción Inmediata Requerida

Estimado/a [Nombre],

Se ha registrado un BLACK ALERT que requiere atención inmediata según la ley del consumidor.

DATOS DEL RECLAMO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Número: REC-2025-XXX
• Cliente: Juan Pérez - +56912345678
• Vehículo: Toyota Corolla - AB1234
• Fecha Compra: 15/08/2024 (Hace 4 meses)
• Problema: Motor falla al encender
• Sentimiento: Alto nivel de frustración

ACCIONES REQUERIDAS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Contactar al cliente en menos de 4 horas
- Revisar política de garantía aplicable
- Coordinar inspección técnica urgente
- Preparar solución o compensación

SLA: 24 HORAS PARA RESOLUCIÓN

Ver detalles: [Link al dashboard]

Generado automáticamente por Optima-Complaints
```

---

### 3.5. Estados del Ciclo de Vida

```
nuevo
  ↓ (asignación automática)
asignado
  ↓ (asesor inicia gestión)
en_proceso
  ↓ (asesor marca como resuelto)
resuelto
  ↓ (cliente confirma o auto-cierre en 7 días)
cerrado
```

**Triggers automáticos:**
- `nuevo` → `asignado`: Inmediato (workflow N8N)
- `asignado` → `en_proceso`: Manual (asesor actualiza)
- `en_proceso` → `resuelto`: Manual (asesor finaliza)
- `resuelto` → `cerrado`: Auto después de 7 días o manual por cliente

**Registro de auditoría:**
Cada cambio de estado crea entrada en `seguimientos_reclamo`:
```sql
INSERT INTO seguimientos_reclamo (
    reclamo_id,
    user_id,
    tipo_seguimiento,
    descripcion,
    estado_anterior,
    estado_nuevo,
    created_at
)
```

---

## 4. Workflows N8N (13 Workflows Principales)

### 4.1. Orquestación

#### **complaint-orchestrator.json**
**Función:** Punto de entrada para todos los reclamos

**Nodos:**
1. **Webhook Trigger** - Recibe POST requests
2. **Validate Input** - Valida formato JSON
3. **Extract Tenant** - Obtiene concesionario_id
4. **Trigger RAG Processor** - Dispara procesamiento (async)
5. **Success Response** - HTTP 200 con confirmación

**Webhook URL:**
```
POST https://n8n-url/webhook/complaint/orchestrator

Body:
{
  "concesionario_id": "uuid",
  "canal_origen": "contact_center",
  "cliente": {...},
  "descripcion": "...",
  "vehiculo": {...}
}
```

---

### 4.2. Procesamiento RAG

#### **procesador-rag-reclamos.json**
**Función:** Pipeline completo de RAG (Retrieval Augmented Generation)

**Nodos principales:**
1. **Webhook Input** - Recibe del orchestrator
2. **Load Tenant Config** - Carga configuración del concesionario
3. **Generate Embedding** - Llama Gemini Embedding 001
4. **Vector Search** - Query a Supabase pgvector
5. **Cohere Rerank** - Re-clasifica resultados
6. **Build Enhanced Prompt** - Construye prompt con contexto
7. **Gemini Analysis** - Llama Gemini 2.5 Pro
8. **Parse JSON Response** - Extrae clasificación
9. **Save to Supabase** - INSERT en tabla reclamos
10. **Trigger Notifications** - Dispara workflow de notificaciones

**Ejemplo de prompt enriquecido:**
```
SISTEMA: Eres un especialista en atención al cliente del concesionario [NOMBRE].

CONTEXTO RECUPERADO:
[DOCUMENTO 1] Manual de Garantías 2024 - Sección 3.2
"Los vehículos nuevos tienen garantía de motor por 3 años o 100,000 km..."

[DOCUMENTO 2] Procedimiento de Reclamos
"Para fallas de motor, seguir el siguiente protocolo..."

RECLAMO DEL CLIENTE:
Cliente: Juan Pérez
Vehículo: Toyota Corolla - AB1234
Descripción: "El motor hace un ruido extraño al encender en las mañanas. Compré el auto hace 4 meses y esto no debería pasar."

INSTRUCCIONES:
1. Clasifica el reclamo según las políticas del concesionario
2. Extrae datos estructurados
3. Determina urgencia
4. Sugiere pasos de resolución basados en el contexto
5. Identifica si es Black Alert (falla <6 meses)

FORMATO DE RESPUESTA (JSON):
{
  "tipo_reclamo": "garantia|servicio|financiero|atencion",
  "categoria": "motor|frenos|...",
  "urgencia": "baja|media|alta",
  "es_black_alert": true|false,
  "datos_extraidos": {...},
  "sugerencias_resolucion": [...],
  "referencias_politicas": [...],
  "analisis_sentimiento": {...}
}
```

---

#### **generador-embeddings.json**
**Función:** Genera embeddings para búsqueda vectorial

**Flujo:**
1. Recibe texto a vectorizar
2. Valida longitud (max 8192 tokens)
3. Llama API Gemini Embedding 001
4. Valida dimensiones (768)
5. Cache en Redis (TTL: 24h)
6. Retorna vector

**Configuración Gemini:**
```javascript
{
  "model": "models/embedding-001",
  "content": {
    "parts": [{
      "text": "{{$json.text}}"
    }]
  }
}
```

---

#### **rerank-cohere-documentos.json**
**Función:** Re-clasifica documentos para mayor precisión

**Entrada:**
- Query original
- Array de documentos (TOP 20-50)

**Proceso:**
1. Envía a Cohere Rerank API
2. Obtiene relevance_score para cada doc
3. Ordena por score descendente
4. Retorna TOP 3-5

**API Call:**
```javascript
{
  "model": "rerank-english-v2.0",
  "query": "{{$json.query}}",
  "documents": "{{$json.documents}}",
  "top_n": 5
}
```

---

### 4.3. Gestión de Conocimiento

#### **ingesta-conocimiento.json**
**Función:** Valida e ingesta documentos nuevos

**Pasos:**
1. Validar formato (PDF, DOCX, TXT, MD)
2. Validar tamaño (max 10MB)
3. Escaneo de malware
4. Extraer texto
5. Disparar fragmentación

#### **fragmentacion-conocimiento.json**
**Función:** Divide documentos en chunks

**Estrategia:**
- Chunk size: 512 tokens
- Overlap: 50 tokens
- Preserva estructura (párrafos, secciones)
- Genera metadata por fragmento

#### **almacenamiento-conocimiento.json**
**Función:** Persiste fragmentos en BD

**Operaciones:**
1. Genera embedding por fragmento
2. INSERT en knowledge_base
3. INSERT en knowledge_fragments
4. Actualiza índices vectoriales
5. Marca como activo

---

### 4.4. Asignación y Notificaciones

#### **asignacion-automatica-reclamos.json**
**Función:** Asigna reclamos a asesores disponibles

**Algoritmo de scoring:**
```javascript
function calculateScore(asesor, reclamo) {
  let score = 0;

  // Sucursal coincidente
  if (asesor.sucursal_id === reclamo.sucursal_id) {
    score += 50;
  }

  // Especialización
  if (asesor.especializacion.includes(reclamo.tipo)) {
    score += 30;
  }

  // Carga de trabajo (menos es mejor)
  const cargaActual = asesor.reclamos_activos || 0;
  score += Math.max(0, 20 - cargaActual);

  // Disponibilidad horaria
  if (asesor.disponible && isWithinBusinessHours()) {
    score += 10;
  }

  return score;
}
```

#### **notificaciones-reclamos.json**
**Función:** Envía emails personalizados por rol

**Templates:**
- `asesor-asignacion.html`
- `jefe-supervision.html`
- `encargado-calidad.html`
- `cliente-confirmacion.html`

**SMTP Configuration:**
```javascript
{
  "host": "smtp.gmail.com",
  "port": 587,
  "secure": false,
  "auth": {
    "user": "{{$env.SMTP_USER}}",
    "pass": "{{$env.SMTP_PASSWORD}}"
  }
}
```

---

### 4.5. Black Alerts y Auditoría

#### **alerta-black-alert.json**
**Función:** Notificación masiva para casos críticos

**Trigger:** `es_black_alert = true`

**Acciones:**
1. Obtener lista de destinatarios críticos
2. Preparar email con máxima urgencia
3. Enviar en paralelo a múltiples roles
4. Registrar en audit log
5. Actualizar dashboards

#### **auditor-modificaciones.json**
**Función:** Registra todas las modificaciones

**Datos capturados:**
- Usuario que hizo el cambio
- Timestamp
- Estado anterior y nuevo
- Campos modificados
- Valores antes/después
- Identificador de sesión

---

### 4.6. Métricas y Optimización

#### **agregador-metricas-reclamos.json**
**Función:** Compila métricas diarias/semanales

**KPIs generados:**
- Total reclamos por estado
- Promedio de resolución (horas)
- Distribución por urgencia
- Black Alerts detectados
- Satisfacción promedio
- Performance por asesor
- Documentos RAG más usados

#### **escaner-malware-documentos.json**
**Función:** Análisis de seguridad de documentos

**Proceso:**
1. Intercepta documento antes de procesar
2. Valida firma de archivo
3. Escaneo con servicio anti-malware
4. Verifica tamaño y tipo
5. Rechaza si hay amenaza
6. Registra intento sospechoso

---

## 5. Base de Datos - Esquema Completo

### 5.1. Tablas Principales

#### **categorias_reclamo**
```sql
CREATE TABLE public.categorias_reclamo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concesionario_id UUID NOT NULL REFERENCES concesionarios(id),

    -- Información básica
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
    icono VARCHAR(50),

    -- Configuración
    es_activa BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 1,
    tiempo_resolucion_estimado INTEGER, -- horas
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
```

#### **reclamos**
(Ver sección 3.3 para definición completa)

#### **seguimientos_reclamo**
```sql
CREATE TABLE public.seguimientos_reclamo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reclamo_id UUID NOT NULL REFERENCES reclamos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES usuarios(id),

    -- Tipo
    tipo_seguimiento VARCHAR(30) NOT NULL CHECK (tipo_seguimiento IN (
        'comentario', 'cambio_estado', 'asignacion', 'resolucion',
        'comunicacion_cliente', 'escalamiento', 'documentacion'
    )),

    -- Contenido
    titulo VARCHAR(255),
    descripcion TEXT NOT NULL,

    -- Visibilidad
    es_publico BOOLEAN DEFAULT false,
    es_respuesta_automatica BOOLEAN DEFAULT false,

    -- Tracking de cambios
    estado_anterior VARCHAR(20),
    estado_nuevo VARCHAR(20),
    asignado_anterior VARCHAR(255),
    asignado_nuevo VARCHAR(255),

    -- Comunicación
    canal_comunicacion VARCHAR(30),
    tiempo_dedicado_minutos INTEGER DEFAULT 0,

    -- Adjuntos
    attachments TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',

    -- Notificaciones
    notificado_cliente BOOLEAN DEFAULT false,
    fecha_notificacion TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### 5.2. Sistema RAG

#### **knowledge_base**
```sql
CREATE TABLE public.knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concesionario_id UUID NOT NULL REFERENCES concesionarios(id),

    -- Contenido
    titulo VARCHAR(500) NOT NULL,
    contenido TEXT NOT NULL,
    resumen TEXT,

    -- Categorización
    categoria VARCHAR(100),
    subcategoria VARCHAR(100),
    tags TEXT[] DEFAULT '{}',

    -- Vectorización
    embedding VECTOR(768), -- Gemini Embedding 001
    embedding_model VARCHAR(50) DEFAULT 'gemini-embedding-001',
    embedding_generated_at TIMESTAMP WITH TIME ZONE,

    -- Metadatos
    fuente_original VARCHAR(500),
    tipo_documento VARCHAR(50),
    version VARCHAR(20) DEFAULT '1.0',
    idioma VARCHAR(5) DEFAULT 'es',

    -- Configuración
    activo BOOLEAN DEFAULT true,
    publico BOOLEAN DEFAULT false,
    prioridad INTEGER DEFAULT 5,
    nivel_acceso VARCHAR(20) DEFAULT 'general',

    -- Métricas
    veces_usado INTEGER DEFAULT 0,
    ultima_utilizacion TIMESTAMP WITH TIME ZONE,
    efectividad_promedio DECIMAL(3,2),

    -- Auditoría
    created_by UUID REFERENCES usuarios(id),
    approved_by UUID REFERENCES usuarios(id),
    fecha_aprobacion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice vectorial IVFFlat
CREATE INDEX idx_knowledge_base_embedding
ON knowledge_base
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

#### **knowledge_fragments**
```sql
CREATE TABLE public.knowledge_fragments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    knowledge_base_id UUID NOT NULL REFERENCES knowledge_base(id) ON DELETE CASCADE,
    concesionario_id UUID NOT NULL REFERENCES concesionarios(id),

    -- Contenido del fragmento
    fragmento TEXT NOT NULL,
    orden_fragmento INTEGER NOT NULL,

    -- Vectorización
    embedding VECTOR(768),

    -- Contexto
    palabras_clave TEXT[] DEFAULT '{}',
    contexto_previo TEXT,
    contexto_posterior TEXT,

    -- Control
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice vectorial
CREATE INDEX idx_knowledge_fragments_embedding
ON knowledge_fragments
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

#### **rag_interactions**
```sql
CREATE TABLE public.rag_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Consulta
    query_original TEXT NOT NULL,
    query_embedding VECTOR(768),

    -- Contexto
    contexto_tipo VARCHAR(50), -- 'reclamo', 'consulta', etc.
    contexto_id UUID,
    canal_origen VARCHAR(30),
    concesionario_id UUID NOT NULL REFERENCES concesionarios(id),

    -- Resultados
    knowledge_docs_found JSONB DEFAULT '[]',
    knowledge_fragments_used JSONB DEFAULT '[]',
    respuesta_generada TEXT,
    prompt_utilizado TEXT,
    modelo_ia_usado VARCHAR(50),

    -- Métricas
    relevancia_score DECIMAL(3,2),
    tiempo_procesamiento_ms INTEGER,
    resolvio_consulta BOOLEAN,

    -- Feedback
    feedback_positivo BOOLEAN,
    comentario_feedback TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### 5.3. Configuración Multitenant

#### **tenant_configurations**
```sql
CREATE TABLE public.tenant_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concesionario_id UUID NOT NULL UNIQUE REFERENCES concesionarios(id),

    -- Email/SMTP
    email_config JSONB DEFAULT '{
        "smtp_host": "",
        "smtp_port": 587,
        "smtp_user": "",
        "smtp_password": "",
        "from_email": "",
        "from_name": ""
    }',

    -- IA/Gemini
    ai_config JSONB DEFAULT '{
        "provider": "google",
        "api_key": "",
        "model": "gemini-2.5-pro",
        "embedding_model": "gemini-embedding-001",
        "temperature": 0.7,
        "max_tokens": 2048
    }',

    -- RAG
    rag_config JSONB DEFAULT '{
        "search_k": 20,
        "similarity_threshold": 0.7,
        "rerank_top_n": 5,
        "use_cohere": true
    }',

    -- Workflows N8N
    workflow_variables JSONB DEFAULT '{
        "brand_colors": {
            "primary": "#3B82F6",
            "secondary": "#10B981"
        },
        "business_hours": {
            "start": "09:00",
            "end": "18:00",
            "timezone": "America/Santiago"
        },
        "sla_hours": {
            "normal": 48,
            "urgent": 24,
            "black_alert": 4
        }
    }',

    -- URLs
    n8n_webhook_base_url VARCHAR(500),
    frontend_base_url VARCHAR(500),

    -- Estado
    activo BOOLEAN DEFAULT true,
    configuracion_completa BOOLEAN DEFAULT false,

    -- Auditoría
    created_by UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### 5.4. Row Level Security (RLS)

**Políticas de aislamiento multitenant:**

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE public.reclamos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seguimientos_reclamo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_reclamo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_fragments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_configurations ENABLE ROW LEVEL SECURITY;

-- Policy para reclamos
CREATE POLICY "Reclamos are tenant isolated"
ON public.reclamos
FOR ALL
USING (concesionario_id = (auth.jwt() ->> 'concesionario_id')::UUID);

-- Policy para seguimientos
CREATE POLICY "Seguimientos are tenant isolated"
ON public.seguimientos_reclamo
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.reclamos
        WHERE id = seguimientos_reclamo.reclamo_id
        AND concesionario_id = (auth.jwt() ->> 'concesionario_id')::UUID
    )
);

-- Policy para knowledge base
CREATE POLICY "Knowledge base is tenant isolated"
ON public.knowledge_base
FOR ALL
USING (concesionario_id = (auth.jwt() ->> 'concesionario_id')::UUID);

-- Policy para RAG interactions
CREATE POLICY "RAG interactions are tenant isolated"
ON public.rag_interactions
FOR ALL
USING (concesionario_id = (auth.jwt() ->> 'concesionario_id')::UUID);
```

---

## 6. Frontend - Estructura de Componentes

### 6.1. Páginas Principales

```
frontend/src/app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx              # Login con Supabase Auth
│   └── register/
│       └── page.tsx              # Registro de usuarios
├── dashboard/
│   ├── page.tsx                  # Dashboard principal
│   ├── reclamos/
│   │   ├── page.tsx              # Lista de reclamos
│   │   ├── [id]/
│   │   │   └── page.tsx          # Detalle de reclamo
│   │   └── nuevo/
│   │       └── page.tsx          # Formulario nuevo reclamo
│   ├── conocimiento/
│   │   ├── page.tsx              # Gestión de base de conocimiento
│   │   └── nuevo/
│   │       └── page.tsx          # Upload de documentos
│   ├── metricas/
│   │   └── page.tsx              # Dashboard de métricas
│   └── configuracion/
│       └── page.tsx              # Configuración del concesionario
└── seguimiento/
    └── [token]/
        └── page.tsx              # Portal público de seguimiento
```

### 6.2. Componentes Reutilizables

```
frontend/src/components/
├── reclamos/
│   ├── ComplaintsTable.tsx       # Tabla de reclamos con filtros
│   ├── ComplaintDetail.tsx       # Vista detallada
│   ├── ComplaintForm.tsx         # Formulario de creación
│   ├── ComplaintStatusBadge.tsx  # Badge de estado
│   ├── BlackAlertIndicator.tsx   # Indicador de Black Alert
│   └── AuditTimeline.tsx         # Timeline de auditoría
├── knowledge/
│   ├── DocumentUploader.tsx      # Upload con drag & drop
│   ├── DocumentList.tsx          # Lista de documentos
│   └── FragmentViewer.tsx        # Visualización de chunks
├── dashboard/
│   ├── StatsCards.tsx            # Cards de métricas
│   ├── RecentComplaints.tsx      # Reclamos recientes
│   ├── AlertsPanel.tsx           # Panel de alertas
│   └── PerformanceChart.tsx      # Gráficos de performance
└── ui/
    ├── Button.tsx                # Radix UI Button
    ├── Input.tsx                 # Input con validación
    ├── Select.tsx                # Select con search
    ├── Table.tsx                 # TanStack Table wrapper
    ├── Dialog.tsx                # Modal dialogs
    └── Toast.tsx                 # Notificaciones toast
```

### 6.3. Formulario de Nuevo Reclamo

**Componente:** `ComplaintForm.tsx`

**Campos:**
```typescript
interface ComplaintFormData {
  // Cliente
  cliente_nombre: string;          // required
  cliente_rut: string;             // optional
  cliente_telefono: string;        // required, formato: +56912345678
  cliente_email: string;           // optional, formato email

  // Vehículo
  vehiculo_patente: string;        // required, formato: AB1234
  vehiculo_vin?: string;           // optional
  vehiculo_marca?: string;         // optional
  vehiculo_modelo?: string;        // optional

  // Reclamo
  sucursal_id: string;             // required, select
  categoria_id?: string;           // optional, select
  titulo: string;                  // auto-generated or manual
  descripcion: string;             // required, min 20 chars
  es_black_alert: boolean;         // checkbox

  // Adjuntos
  attachments: File[];             // optional, max 5 files, 10MB total
}
```

**Validación con Zod:**
```typescript
import { z } from 'zod';

const complaintSchema = z.object({
  cliente_nombre: z.string().min(3, 'Mínimo 3 caracteres'),
  cliente_telefono: z.string().regex(/^\+56\d{9}$/, 'Formato: +56912345678'),
  cliente_email: z.string().email().optional().or(z.literal('')),
  vehiculo_patente: z.string().regex(/^[A-Z]{2,4}\d{2,4}$/, 'Formato: AB1234'),
  descripcion: z.string().min(20, 'Mínimo 20 caracteres'),
  sucursal_id: z.string().uuid('Seleccione una sucursal'),
  es_black_alert: z.boolean(),
});
```

**Flujo de submit:**
```typescript
async function handleSubmit(data: ComplaintFormData) {
  try {
    // 1. Validar formulario
    complaintSchema.parse(data);

    // 2. Upload adjuntos a Supabase Storage
    const attachmentUrls = await uploadAttachments(data.attachments);

    // 3. Llamar a API
    const response = await fetch('/api/reclamos/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        attachments: attachmentUrls,
        canal_origen: 'contact_center',
      }),
    });

    // 4. Mostrar confirmación
    const reclamo = await response.json();
    toast.success(`Reclamo ${reclamo.numero_reclamo} creado exitosamente`);

    // 5. Redirigir a detalle
    router.push(`/dashboard/reclamos/${reclamo.id}`);
  } catch (error) {
    toast.error('Error al crear reclamo');
  }
}
```

---

### 6.4. Tabla de Reclamos

**Componente:** `ComplaintsTable.tsx`

**Columnas:**
- Número de reclamo (REC-2025-001)
- Cliente
- Vehículo (patente)
- Estado (badge con color)
- Urgencia (badge)
- Black Alert ( indicador)
- Asignado a
- Fecha de creación
- Acciones (ver, editar)

**Filtros:**
- Estado (multiselect)
- Urgencia (multiselect)
- Black Alert (checkbox)
- Sucursal (select)
- Rango de fechas (date picker)
- Búsqueda (número, cliente, patente)

**Sorting:**
- Por cualquier columna
- Ascendente/descendente
- Multi-column sort

**Paginación:**
- Rows per page: 10, 25, 50, 100
- Navegación: primera, anterior, siguiente, última
- Total de registros

---

## 7. Despliegue e Infraestructura

### 7.1. Arquitectura de Despliegue

```
┌─────────────────────────────────────────────────┐
│              INTERNET                           │
└────────────┬────────────────────────────────────┘
             │
      ┌──────┴──────┐
      │             │
      ↓             ↓
┌──────────┐  ┌──────────┐
│ Frontend │  │   N8N    │
│  Vercel  │  │ Railway  │
│ Next.js  │  │ Workflows│
└────┬─────┘  └────┬─────┘
     │             │
     └──────┬──────┘
            ↓
    ┌───────────────┐
    │   Supabase    │
    │  PostgreSQL   │
    │  + pgvector   │
    │  + Auth       │
    │  + Realtime   │
    │  + Storage    │
    └───────────────┘
            │
    ┌───────┴────────┐
    │                │
    ↓                ↓
┌─────────┐    ┌─────────┐
│ Gemini  │    │ Cohere  │
│  2.5    │    │ Rerank  │
└─────────┘    └─────────┘
```

### 7.2. Costos Mensuales Estimados

```
Supabase Pro:        $25/mes
Railway (N8N):       $20/mes
Vercel Hobby:        $0/mes (o Pro $20/mes)
Gemini API:          ~$50/mes (según uso)
Cohere Rerank:       ~$20/mes (según uso)
────────────────────────────────
Total:              $115-135/mes
```

**Uso estimado de Gemini:**
- 1000 reclamos/mes
- Promedio 500 tokens por reclamo
- Embeddings + Análisis = ~$40-50/mes

### 7.3. Variables de Entorno

**Frontend (.env.local):**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# N8N
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://n8n.railway.app

# App
NEXT_PUBLIC_APP_URL=https://complaints.concesionario.com
```

**N8N:**
```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# Gemini
GEMINI_API_KEY=AIzaSy...

# Cohere
COHERE_API_KEY=3a...

# SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@concesionario.com
SMTP_PASSWORD=app_password

# Redis (opcional, para cache)
REDIS_URL=redis://...
```

---

## 8. Métricas y KPIs

### 8.1. Dashboard Principal

**KPIs principales:**
- Total de reclamos (período)
- Reclamos nuevos (últimas 24h)
- Reclamos en proceso
- Reclamos resueltos
- Black Alerts activos
- Tiempo promedio de resolución
- Satisfacción promedio (1-10)
- Tasa de resolución en SLA

**Gráficos:**
- Evolución de reclamos (línea temporal)
- Distribución por estado (pie chart)
- Distribución por urgencia (bar chart)
- Reclamos por sucursal (bar chart)
- Performance por asesor (table)
- Análisis de sentimiento (gauge)

### 8.2. Métricas RAG

**Efectividad del sistema:**
- Documentos recuperados por consulta (promedio)
- Relevancia promedio (similarity score)
- Documentos más utilizados (ranking)
- Tasa de éxito de clasificación IA
- Tiempo de procesamiento RAG (ms)
- Cache hit rate

---

## 9. Testing y Calidad

### 9.1. Testing del Frontend

```bash
# Unit tests (Jest + React Testing Library)
npm test

# E2E tests (Playwright)
npm run test:e2e

# Coverage
npm run test:coverage
```

### 9.2. Testing de Workflows N8N

**Test workflow:** `test-conectividad-supabase.json`
- Valida conexión a Supabase
- Valida permisos RLS
- Valida credenciales

**Test de integración:**
- Crear reclamo de prueba
- Validar procesamiento RAG
- Validar asignación automática
- Validar envío de emails

---

## 10. Roadmap Futuro

### Fase 1 (Q1 2025) - Completado 
- [x] Sistema de reclamos básico
- [x] Ingreso manual por Contact Center
- [x] Clasificación con IA
- [x] Asignación automática
- [x] Notificaciones por email

### Fase 2 (Q2 2025) - En Desarrollo
- [ ] Formulario web público
- [ ] Ingreso por email automático
- [ ] Portal de seguimiento público
- [ ] Dashboard de métricas avanzado
- [ ] Sistema RAG optimizado

### Fase 3 (Q3 2025) - Planeado
- [ ] API REST pública
- [ ] Mobile app (iOS + Android)
- [ ] Integración con CRM externos
- [ ] Predicción de churn con ML
- [ ] Chatbot conversacional

### Fase 4 (Q4 2025) - Futuro
- [ ] Multi-idioma (inglés, portugués)
- [ ] Integración con Zendesk/Salesforce
- [ ] Dashboard analítico con BI
- [ ] Automatización avanzada con n8n

---

## 11. Convenciones de Código

### 11.1. TypeScript

```typescript
//  Usar interfaces para objetos
interface Reclamo {
  id: string;
  numero_reclamo: string;
  estado: ReclamoEstado;
}

//  Usar types para unions y primitivos
type ReclamoEstado = 'nuevo' | 'asignado' | 'en_proceso' | 'resuelto' | 'cerrado';

//  Funciones con tipo de retorno explícito
async function crearReclamo(data: ComplaintFormData): Promise<Reclamo> {
  // ...
}
```

### 11.2. Naming Conventions

```typescript
// Componentes: PascalCase
export function ComplaintForm() {}

// Funciones: camelCase
function handleSubmit() {}

// Constantes: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Archivos: kebab-case
// complaint-form.tsx
// use-complaints.ts
```

### 11.3. Estructura de Archivos

```
Máximo 150 líneas por archivo
Máximo 30 líneas por función
Una responsabilidad por componente
Extraer lógica compleja a custom hooks
Separar tipos en archivos .types.ts
```

---

## 12. Comandos Útiles

### 12.1. Desarrollo

```bash
# Instalar dependencias
npm install

# Dev mode
npm run dev

# Build
npm run build

# Lint
npm run lint

# Format
npm run format
```

### 12.2. Base de Datos

```bash
# Aplicar migraciones
npx supabase db push

# Reset BD (cuidado!)
npx supabase db reset

# Generar tipos TypeScript
npx supabase gen types typescript --local > types/supabase.ts
```

### 12.3. N8N

```bash
# Exportar workflow
n8n export:workflow --id=123 --output=workflow.json

# Importar workflow
n8n import:workflow --input=workflow.json

# Ejecutar workflow
n8n execute --id=123
```

---

## 13. Soporte y Documentación

**Contacto:** bastian.berrios@ejemplo.com

**Documentación adicional:**
- `/docs/deployment/` - Guías de despliegue
- `/docs/api/` - API reference
- `README.md` - Quick start guide

**Issues y bugs:** https://github.com/BastianBerriosalarcon/optima-complaints/issues

---

*Última actualización: 27 de Octubre 2025*
*Versión: 2.0.0 - Optima-Complaints (sin WhatsApp/Chatwoot)*
