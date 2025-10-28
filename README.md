# Optima-Complaints

Sistema inteligente de gestión de reclamos con IA para empresas.

## Descripción

Optima-Complaints es una plataforma especializada en la gestión inteligente de reclamos empresariales, utilizando Inteligencia Artificial para automatizar la clasificación, asignación y seguimiento de casos. El sistema implementa RAG (Retrieval Augmented Generation) para proporcionar sugerencias contextualizadas basadas en la base de conocimiento de la empresa.

## Características Principales

### 🧠 Inteligencia Artificial
- **Análisis automático** con Gemini 2.5 Pro
- **Clasificación inteligente** de tipo, urgencia y categoría
- **Extracción automática** de datos clave (vehículo, cliente, sucursal)
- **Análisis de sentimiento** para priorización

### 📊 Sistema RAG
- **Base de conocimiento** vectorial con pgvector
- **Búsqueda semántica** para encontrar casos similares
- **Sugerencias de resolución** basadas en políticas y procedimientos
- **Reranking** con Cohere para mayor precisión

### ⚡ Automatización
- **Asignación automática** a departamentos y responsables
- **Notificaciones por email** personalizadas por rol
- **Black Alerts** para casos críticos (ley del consumidor)
- **Flujos de trabajo** configurables con N8N

### 📈 Gestión y Seguimiento
- **Dashboard** con métricas en tiempo real
- **Estados de ciclo de vida**: Nuevo → Asignado → En Proceso → Resuelto → Cerrado
- **Historial completo** con auditoría de cambios
- **Portal público** para seguimiento del cliente
- **SLA y escalamiento** automático

## Stack Tecnológico

### Frontend
- Next.js 14 con App Router
- TypeScript para type safety
- Tailwind CSS + Radix UI
- React Hook Form para formularios

### Backend
- **Base de Datos**: Supabase PostgreSQL
- **Autenticación**: Supabase Auth con RLS
- **Automatización**: N8N workflows
- **Realtime**: Supabase Realtime

### Inteligencia Artificial
- **LLM**: Gemini 2.5 Pro (Google)
- **Embeddings**: Gemini Embedding 001
- **Reranking**: Cohere Rerank
- **Vector DB**: pgvector (Supabase)

### Infraestructura
- **Frontend**: Vercel / Cloudflare Pages
- **Workflows**: Railway / Elest.io (N8N)
- **Base de Datos**: Supabase Cloud
- **Storage**: Supabase Storage

## Arquitectura

```
Cliente → Formulario Web/Email → N8N → Gemini + RAG → Clasificación
                                    ↓
                            Supabase PostgreSQL
                                    ↓
                         Dashboard + Notificaciones
```

## Canales de Ingreso de Reclamos

1. **Formulario Web** - Clientes ingresan reclamos desde el sitio
2. **Email** - Integración directa con casilla de reclamos
3. **Portal Interno** - Staff ingresa reclamos telefónicos/presenciales
4. **API** - Integración con otros sistemas

## Módulos

### ✅ Gestión de Reclamos
- Ingreso multicanal
- Clasificación automática con IA
- Asignación inteligente
- Seguimiento completo
- Portal público

### ✅ Sistema RAG
- Ingesta de documentos (PDF, Word, Excel)
- Fragmentación y vectorización
- Búsqueda semántica
- Sugerencias contextualizadas

### ✅ Dashboard y Métricas
- KPIs en tiempo real
- Análisis por categoría, urgencia, estado
- Performance por responsable
- Tiempo de resolución

### ✅ Black Alerts
- Detección automática (fallas <6 meses)
- Notificaciones masivas a equipos
- Seguimiento prioritario
- Cumplimiento legal

## Estructura del Proyecto

```
Optima-Complaints/
├── applications/         # Workflows y extensiones de N8N
├── database/             # Migraciones, esquemas y políticas de BD
├── frontend/             # Aplicación Next.js para el dashboard
├── docs/                 # Documentación del proyecto
└── scripts/              # Scripts de despliegue y mantenimiento
```

## Instalación

### Prerrequisitos
- Node.js 18+
- Cuenta Supabase
- API Keys: Gemini, Cohere
- N8N instance (Railway/Elest.io)

### Configuración

1. **Clonar repositorio**
```bash
git clone https://github.com/BastianBerriosalarcon/optima-complaints.git
cd optima-complaints
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_key

# IA
GEMINI_API_KEY=tu_api_key
COHERE_API_KEY=tu_api_key

# N8N
N8N_WEBHOOK_URL=tu_url_n8n

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_USER=tu_email
SMTP_PASSWORD=tu_password
```

4. **Ejecutar migraciones**
```bash
# Aplicar en Supabase SQL Editor en orden:
# - 01_multitenant_base.sql
# - 02_rls_policies_complete.sql
# - 10_create_tenant_configurations_table.sql
# - 11_create_reclamos_system_tables.sql
# - 12_create_knowledge_base_rag_system.sql
```

5. **Desplegar workflows N8N**
```bash
# Importar workflows desde applications/workflows/business/reclamos/
```

6. **Ejecutar desarrollo**
```bash
npm run dev
```

## Deploy a Producción

Ver [docs/deployment.md](docs/deployment.md) para guía completa.

### Quick Deploy

**Frontend (Vercel):**
```bash
vercel deploy --prod
```

**N8N (Railway):**
```bash
railway up
```

**Base de Datos (Supabase):**
- Ya está en la nube
- Aplicar migraciones en dashboard

## Workflows N8N

Los workflows están en `applications/workflows/business/reclamos/`:

| Workflow | Función |
|----------|---------|
| `complaint-orchestrator` | Orquestador principal |
| `procesador-rag-reclamos` | Pipeline RAG completo |
| `generador-embeddings` | Vectorización con Gemini |
| `rerank-cohere-documentos` | Reranking de resultados |
| `ingesta-conocimiento` | Carga de documentos |
| `asignacion-automatica-reclamos` | Asignación inteligente |
| `notificaciones-reclamos` | Envío de emails |
| `alerta-black-alert` | Black Alerts críticos |
| `auditor-modificaciones` | Trazabilidad |

## Costos Estimados (Mensual)

```
Supabase Pro:        $25/mes
Railway N8N:         $20/mes
Vercel (opcional):   $0/mes (hobby) o $20/mes (pro)
Gemini API:          ~$50/mes (según uso)
Cohere Rerank:       ~$20/mes (según uso)
────────────────────────────────
Total:              ~$115-135/mes
```

## Roadmap

- [ ] WhatsApp integration (opcional)
- [ ] Mobile app
- [ ] Más integraciones (Zendesk, Salesforce)
- [ ] Dashboard analítico avanzado
- [ ] Multi-idioma
- [ ] API pública

## Soporte

Para soporte o consultas: bastian.berrios@ejemplo.com

## Licencia

Propietario

---

Basado en **Optima-CX** - Simplificado para gestión de reclamos empresariales.
