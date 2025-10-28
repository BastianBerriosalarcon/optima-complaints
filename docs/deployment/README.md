# Optima-Complaints - Arquitectura y Despliegue

Este documento describe la arquitectura y el despliegue del proyecto Optima-Complaints, una plataforma SaaS para la gestión inteligente de reclamos en el sector automotriz.

## Estado del Proyecto

**ACTIVO y EN DESARROLLO**
- **Frontend URL:** Desplegado en Vercel/Cloudflare Pages (según configuración).
- **N8N URL:** Desplegado en Railway/GCP (según configuración).
- **Base de Datos:** Supabase Cloud.

## Descripción del Proyecto

Optima-Complaints es una plataforma multitenant que utiliza N8N como motor de automatización para la **Gestión de Reclamos con IA**, incluyendo:

- Procesamiento automatizado con RAG (Retrieval Augmented Generation).
- Aislamiento completo por concesionario (multitenant).
- Workflows de notificación y asignación inteligentes.

## Arquitectura Actual

La plataforma se compone de tres servicios principales que operan de forma desacoplada:

```
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│     Frontend     │      │   Automatización │      │      Backend     │
│ (Next.js/Vercel) ├──────►│   (N8N/Railway)  ├──────►│(Supabase/PostgreSQL)│
└──────────────────┘      └──────────────────┘      └──────────────────┘
         ▲                       │                       ▲
         │                       ▼                       │
         └──────────────┬────────────────────────┘
                        │
               ┌────────────────┐
               │ Servicios de IA  │
               │ (Gemini / Cohere)│
               └────────────────┘
```

## Estructura del Proyecto (Monorepo)

```
Optima-Complaints/
├── applications/       # Workflows y nodos de N8N
├── database/           # Migraciones y schema de Supabase
├── frontend/           # Aplicación Next.js
├── shared/             # Código compartido (tipos, etc.)
├── scripts/            # Scripts de utilidad y despliegue
└── docs/               # Documentación del proyecto
```

## Sistema RAG para Reclamos

El núcleo de la inteligencia de la plataforma reside en su sistema RAG para procesar y entender los reclamos en el contexto de cada concesionario.

### Componentes Técnicos
- **Embeddings:** Gemini (text-embedding-004 o similar).
- **Vector DB:** Supabase con la extensión `pgvector`.
- **LLM:** Gemini 2.5 Pro para análisis y clasificación.
- **Procesamiento:** Orquestado a través de workflows en N8N.

### Flujo RAG
```
Reclamo Recibido → Generación de Embedding → Búsqueda Vectorial (en BD del tenant) → Re-ranking con Cohere → Construcción de Contexto → Análisis con Gemini → Respuesta Estructurada
```

## Configuración y Variables de Entorno

Cada servicio (`frontend`, `n8n`) tiene su propio archivo de variables de entorno (`.env.local` o similar) donde se configuran las credenciales y URLs necesarias.

### Frontend (`frontend/.env.local`)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase_anon_key>

# URL de la App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### N8N (Variables de entorno en Railway/GCP)
```env
# Base de datos
DATABASE_URL=postgresql://...

# Conexión a Supabase
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_KEY=<supabase_service_key>

# APIs de IA
GEMINI_API_KEY=<your_gemini_api_key>
COHERE_API_KEY=<your_cohere_api_key>
```

## Despliegue

- **Frontend**: Se despliega automáticamente en Vercel o Cloudflare Pages al hacer push a la rama principal.
- **N8N**: Se gestiona a través de Railway o se despliega como un contenedor en Google Cloud Run.
- **Base de Datos**: Alojada y gestionada en la nube de Supabase. Las migraciones se aplican con el CLI de Supabase.

## Seguridad

- **Multitenant**: Aislamiento de datos garantizado por políticas de Row Level Security (RLS) en Supabase, usando el `concesionario_id` del JWT del usuario.
- **Credenciales**: Todas las claves y secretos se gestionan a través de los servicios de entorno de cada plataforma (Vercel, Railway, Supabase) y no se almacenan en el código.
- **Backup**: Supabase gestiona los backups automáticos de la base de datos.