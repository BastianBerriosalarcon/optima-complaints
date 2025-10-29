# Guía para Claude Code - Proyecto Optima-Complaints

## 1. Contexto General del Proyecto

**Nombre:** Optima-Complaints

**Descripción:** SaaS multitenant para la **gestión inteligente de reclamos** en el sector automotriz. Automatiza la clasificación y seguimiento usando IA (Gemini 2.5 Pro) y RAG.

**Alcance Exclusivo:** Gestión de Reclamos. No incluye ventas, encuestas, WhatsApp, ni marketing.

**Stack Tecnológico Clave:**
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Radix UI, TanStack (Query/Table).
- **Backend:** Supabase (PostgreSQL, RLS, Realtime, Edge Functions), N8N para workflows.
- **IA:** Gemini 2.5 Pro, Gemini Embedding 001, Cohere Rerank, pgvector.
- **Infraestructura:** Vercel/Cloudflare, Railway/GCP, Supabase Cloud.

---

## 2. Principios y Prioridades

### 2.1. Aislamiento Multitenant con RLS
La segregación de datos entre concesionarios es **crítica**. Todas las consultas deben ser filtradas por `concesionario_id` usando Row Level Security (RLS) en Supabase.

### 2.2. Automatización con IA
- Clasificación y extracción de datos automática de reclamos.
- Análisis de sentimiento y priorización.
- Sugerencias de resolución basadas en la base de conocimiento (RAG).

### 2.3. Sistema RAG (Retrieval Augmented Generation)
El flujo es: `Reclamo → Embedding → Búsqueda Vectorial → Rerank Cohere → Contexto → Gemini → Respuesta`. Esto permite a la IA usar manuales, políticas y casos previos para dar respuestas contextualizadas.

---

## 3. Flujo Principal de Gestión de Reclamos

### 3.1. Canales de Ingreso
1.  **Manual (Contact Center):** Un operador ingresa el reclamo en el dashboard.
2.  **Formulario Web Público:** Clientes ingresan reclamos desde una URL pública.
3.  **Email Automático:** N8N monitorea una casilla de correo y crea reclamos a partir de los emails.
4.  **API REST Externa:** Para integración con sistemas de terceros (CRM, ERP).

### 3.2. Flujo de Procesamiento (Resumido)
1.  **Recepción:** Un reclamo llega por cualquier canal a un webhook de N8N (`complaint-orchestrator`).
2.  **Procesamiento RAG:**
    - Se genera un embedding del reclamo.
    - Se buscan documentos relevantes en la base de conocimiento vectorial (`pgvector`).
    - Cohere Rerank prioriza los documentos más relevantes.
    - Se construye un prompt enriquecido y se envía a Gemini 2.5 Pro.
3.  **Análisis IA:** Gemini extrae datos, clasifica, analiza sentimiento, sugiere resolución y detecta "Black Alerts".
4.  **Almacenamiento:** El reclamo y el análisis de la IA se guardan en la tabla `reclamos` de Supabase.
5.  **Asignación:** Un workflow (`asignacion-automatica-reclamos`) asigna el caso al asesor más adecuado según carga de trabajo y especialización.
6.  **Notificaciones:** Se envían emails al cliente, asesor, y supervisores relevantes.
7.  **Actualización UI:** El dashboard se actualiza en tiempo real usando Supabase Realtime.

### 3.3. Tabla `reclamos` (Campos Clave)
- `id`, `concesionario_id`, `sucursal_id`
- `numero_reclamo`, `titulo`, `descripcion`
- `cliente_id`, `vehiculo_id`
- `estado` (`nuevo`, `asignado`, `en_proceso`, `resuelto`, `cerrado`)
- `prioridad`, `urgencia`
- `asignado_a_user_id`
- `es_black_alert` (booleano para casos críticos de ley del consumidor)
- `clasificacion_ia` (JSONB con el output de Gemini)
- `sentimiento_analisis` (JSONB con análisis de sentimiento)
- `created_at`, `updated_at`

### 3.4. Black Alert (Alerta Crítica)
Se activa (manual o automáticamente) si un vehículo falla dentro de los 6 meses posteriores a la compra. Dispara un workflow de alta prioridad (`alerta-black-alert`) que notifica a la gerencia, reduce el SLA a 24h y marca el reclamo con máxima visibilidad.

---

## 4. Workflows N8N (Principales)

- **complaint-orchestrator:** Punto de entrada para todos los reclamos.
- **procesador-rag-reclamos:** Orquesta el pipeline de IA (embedding, search, rerank, analysis).
- **asignacion-automatica-reclamos:** Asigna el reclamo al mejor asesor disponible.
- **notificaciones-reclamos:** Envía emails transaccionales según el rol y el contexto.
- **alerta-black-alert:** Gestiona las notificaciones y escalamiento de casos críticos.
- **ingesta-conocimiento:** Procesa y vectoriza nuevos documentos para la base de conocimiento.
- **agregador-metricas-reclamos:** Genera KPIs para los dashboards.

---

## 5. Base de Datos (Esquema General)

- **Tablas de Negocio:** `reclamos`, `categorias_reclamo`, `seguimientos_reclamo`.
- **Sistema RAG:** `knowledge_base` (documentos), `knowledge_fragments` (chunks vectorizados), `rag_interactions` (log de consultas).
- **Configuración:** `tenant_configurations` (almacena configuraciones por concesionario, como API keys, SLAs, etc).
- **Seguridad:** **RLS habilitado en todas las tablas** para aislar la información por `concesionario_id`.

---

## 6. Frontend (Estructura)

- **Ubicación:** `frontend/src/`
- **Páginas:** `app/dashboard/` contiene las vistas principales (lista de reclamos, detalle, métricas). `app/(auth)/` para login.
- **Componentes:** `components/reclamos/` para lógica de negocio (tabla, formulario, etc.) y `components/ui/` para componentes genéricos (botones, inputs).
- **Formularios:** Usa React Hook Form con validación de esquemas Zod.
- **Estado:** Manejado con TanStack Query para el fetching de datos y estado del servidor.

---

## 7. Comandos Útiles

```bash
# Instalar dependencias (desde la raíz)
npm install

# Iniciar entorno de desarrollo (frontend)
cd frontend && npm run dev

# Aplicar migraciones de Supabase
npx supabase db push

# Generar tipos de TypeScript desde el esquema de la BD
npx supabase gen types typescript --local > frontend/src/types/supabase.ts
```

---
*Última actualización: 28 de Octubre 2025*