# OptimaCX Platform - GCP Multi-Service Infrastructure

Plataforma multitenant de experiencia al cliente que combina N8N, Chatwoot y un frontend personalizado, desplegada en Google Cloud Platform usando infraestructura como código (Terraform).

## 🚀 Estado del Proyecto

### Infraestructura Actual (Terraform)
**🔄 EN DESARROLLO** - Infraestructura base completada
- **N8N Dev:** https://n8n-dev-1008284849803.southamerica-west1.run.app ❌
- **Chatwoot Dev:** https://chatwoot-dev-1008284849803.southamerica-west1.run.app ❌
- **Frontend Dev:** https://optimacx-frontend-dev-1008284849803.southamerica-west1.run.app ❌
- **Base de Datos:** Supabase PostgreSQL (Brasil) ✅
- **Redis:** Cloud Memorystore (10.129.0.4:6379) ✅
- **Región:** southamerica-west1
- **Último Deploy:** 2025-07-15

### Infraestructura Legacy (Funcionando)
**✅ ACTIVO y FUNCIONANDO**
- **n8n URL:** https://n8n-optimacx-supabase-1008284849803.southamerica-west1.run.app/
- **Base de Datos:** Supabase PostgreSQL (Schema: n8n_prod)
- **Región:** southamerica-west1
- **Último Deploy:** 2025-07-17

## 📋 Descripción del Proyecto

OptimaCx es una plataforma multitenant de experiencia al cliente para el sector automotriz que utiliza n8n como motor de automatización para:

- ✅ **Sistema de Encuestas Multi-canal:** QR, WhatsApp, Contact Center
- ✅ **Gestión de Reclamos con IA:** Procesamiento automatizado con RAG
- ✅ **Multitenant:** Aislamiento completo por concesionario
- ✅ **Automatización Inteligente:** Workflows personalizados

## 🏗️ Arquitectura Nueva (Terraform)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Google Cloud Platform                    │
├─────────────────────────────────────────────────────────────────┤
│  Cloud Run Services                                            │
│  ├── N8N (southamerica-west1)                                 │
│  ├── Chatwoot (southamerica-west1)                            │
│  └── OptimaCX Frontend (southamerica-west1)                   │
├─────────────────────────────────────────────────────────────────┤
│  Supabase PostgreSQL (Brasil)                                  │
│  ├── Schema: n8n_dev                                          │
│  ├── Schema: chatwoot_dev                                     │
│  ├── Schema: public (frontend)                                │
│  └── Row Level Security (RLS)                                 │
├─────────────────────────────────────────────────────────────────┤
│  Cloud Memorystore Redis                                       │
│  ├── Instance: chatwoot-redis-dev                             │
│  ├── Memory: 1GB STANDARD_HA                                  │
│  └── Private VPC: 10.129.0.4:6379                            │
├─────────────────────────────────────────────────────────────────┤
│  Infrastructure as Code                                        │
│  ├── Terraform Modules (reusable)                             │
│  ├── Environment Configurations                               │
│  ├── Secret Manager Integration                               │
│  └── VPC Private Networking                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🏗️ Arquitectura Legacy (Funcionando)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Google Cloud Platform                    │
├─────────────────────────────────────────────────────────────────┤
│  Cloud Run: n8n-optima-cx                                      │
│  ├── n8n Workflows                                             │
│  ├── Custom Nodes (RAG System)                                 │
│  ├── OptimaCx Integrations                                     │
│  └── Multi-tenant Configuration                                │
├─────────────────────────────────────────────────────────────────┤
│  Cloud SQL: n8n-optima-cx-postgres                             │
│  ├── PostgreSQL 15                                             │
│  ├── pgvector Extension                                        │
│  ├── n8n Workflows Data                                        │
│  └── OptimaCx Multi-tenant Data                                │
├─────────────────────────────────────────────────────────────────┤
│  AI/ML Services                                                │
│  ├── Gemini 2.5 Pro (LLM)                                     │
│  ├── Text-Embedding-004 (Embeddings)                          │
│  └── Vertex AI Vector Search                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Estructura del Proyecto

```
optimacx-platform/
├── infrastructure/terraform/        # Nueva infraestructura IaC
│   ├── modules/                    # Módulos reutilizables
│   │   ├── cloud-run/             # Configuración genérica Cloud Run
│   │   ├── networking/            # VPC, subnets, conectores
│   │   ├── security/              # Service accounts, IAM
│   │   ├── database/              # Secrets para Supabase
│   │   └── redis/                 # Cloud Memorystore
│   ├── services/                  # Configuraciones específicas
│   │   ├── n8n/                  # N8N service
│   │   ├── chatwoot/             # Chatwoot service
│   │   ├── optimacx-frontend/    # Frontend service
│   │   └── supabase/             # Supabase secrets
│   └── environments/             # Configuraciones por ambiente
│       └── dev/                  # Desarrollo
├── custom-nodes/                   # Nodos personalizados n8n (legacy)
│   └── rag-system/                # Sistema RAG OptimaCx
│       └── credentials/           # Credenciales n8n
├── terraform/                     # Infraestructura legacy
│   └── terraform.tfstate.backup   # Backup del estado legacy
├── scripts/                       # Scripts de base de datos
│   └── init-db.sql               # Inicialización DB
├── migration-backup/              # Logs de migración
│   └── migration.log             # Log migración ActivePieces → n8n
├── docker-compose.yml             # Docker local development
├── Makefile                       # Comandos automatizados
└── README.md                      # Este archivo
```

## 🔄 Flujo de Encuestas OptimaCx

### Canal 1: QR Code (Inmediato)
1. Cliente escanea QR único por concesionario
2. Respuesta instantánea con 4 preguntas + datos cliente
3. Registro automático en BD
4. Si nota 1-8: Email automático a jefatura

### Canal 2: WhatsApp (Automatizado)
1. Carga masiva de clientes (día siguiente)
2. Filtrado automático (excluye QR respondidos)
3. Envío vía WhatsApp Business API
4. Período de espera: 6 horas

### Canal 3: Contact Center (Manual)
1. Asignación automática de pendientes
2. Distribución equitativa entre agentes
3. Seguimiento telefónico
4. Registro manual en sistema

## 🤖 Sistema RAG para Reclamos

### Componentes Técnicos
- **Embeddings:** Gemini text-embedding-004
- **Vector DB:** Vertex AI Vector Search + pgvector
- **LLM:** Gemini 2.5 Pro
- **Procesamiento:** n8n workflows

### Flujo RAG
```
Reclamo → Embedding → Vector Search → Contexto → Gemini → Respuesta Estructurada
```

## 🔧 Configuración Nueva (Terraform)

### Variables de Ambiente Supabase + Redis
```bash
# Supabase Database
SUPABASE_URL=https://pnkdyagqibqxfxziqwxt.supabase.co
SUPABASE_HOST=aws-0-sa-east-1.pooler.supabase.com
SUPABASE_USER=postgres.pnkdyagqibqxfxziqwxt
SUPABASE_PASSWORD=***

# N8N Configuration
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=aws-0-sa-east-1.pooler.supabase.com
DB_POSTGRESDB_DATABASE=postgres
DB_POSTGRESDB_SCHEMA=n8n_dev
N8N_USER_MANAGEMENT_DISABLED=true
N8N_METRICS=true

# Chatwoot Configuration
POSTGRES_HOST=aws-0-sa-east-1.pooler.supabase.com
POSTGRES_DATABASE=postgres
REDIS_URL=redis://10.129.0.4:6379
RAILS_ENV=development
DATABASE_URL=postgresql://postgres.pnkdyagqibqxfxziqwxt:***@aws-0-sa-east-1.pooler.supabase.com:5432/postgres?schema=chatwoot_dev

# Google Cloud
PROJECT_ID=burnished-data-463915-d8
REGION=southamerica-west1
```

### Terraform Deployment
```bash
# Deploy infrastructure
cd infrastructure/terraform/environments/dev
terraform init
terraform plan
terraform apply
```

## 🔧 Configuración Legacy (Funcionando)

### Variables de Ambiente (Configuradas en Cloud Run)
```bash
# Base de datos
DATABASE_URL=postgresql://...
DB_POSTGRESDB_HOST=172.21.0.3
DB_POSTGRESDB_PORT=5432

# n8n Configuration
N8N_EDITOR_BASE_URL=https://n8n-optima-cx-e6nurdtj6a-tl.a.run.app
N8N_WEBHOOK_URL=https://n8n-optima-cx-e6nurdtj6a-tl.a.run.app

# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=/app/service-account.json
GCP_PROJECT_ID=burnished-data-463915-d8

# AI/ML
GEMINI_API_KEY=***
VERTEX_AI_PROJECT=burnished-data-463915-d8
```

## 🚀 Comandos Útiles

### Verificar Estado
```bash
# Cloud Run status
gcloud run services list --region=southamerica-west1

# Database status
gcloud sql instances list

# Logs
gcloud run services logs read n8n-optima-cx --region=southamerica-west1
```

### Deployment
```bash
# Deploy nueva versión
gcloud run deploy n8n-optima-cx \
  --source . \
  --region=southamerica-west1 \
  --allow-unauthenticated
```

## 🔐 Seguridad

### Multitenant
- ✅ Filtros por `tenant_id` en todas las consultas
- ✅ Credenciales encriptadas por concesionario
- ✅ Workflows completamente aislados
- ✅ Base de conocimiento segregada

### Backup
- ✅ Backups automáticos Cloud SQL
- ✅ Terraform state backup
- ✅ Migration logs preservados

## 📊 Monitoreo

### Métricas Disponibles
- Response time por tenant
- Success rate workflows
- Database performance
- API usage por concesionario

### Alertas Configuradas
- Workflow failures > 5%
- Database connection issues
- API rate limits

## 🛠️ Desarrollo Local

### Requisitos
- Docker
- Google Cloud SDK
- Node.js >= 18

### Setup
```bash
# Clonar repositorio
git clone https://github.com/BastianBerriosalarcon/optimacx-GCP.git
cd optimacx-GCP

# Configurar variables
cp .env.example .env

# Ejecutar localmente
docker-compose up -d
```

## 📝 Changelog

### v1.0.0 (2025-07-04)
- ✅ Implementación inicial OptimaCx
- ✅ Migración desde ActivePieces a n8n
- ✅ Sistema RAG con Gemini + pgvector
- ✅ Deployment Cloud Run exitoso
- ✅ Configuración multitenant

### v1.1.0 (2025-07-08)
- ✅ Repositorio GitHub configurado
- ✅ Documentación completa
- ✅ Backup y versionado implementado

## 👥 Contacto

- **Desarrollador:** Bastian Berrios
- **Email:** bastianberriosalarcon@gmail.com
- **GitHub:** @BastianBerriosalarcon

---

## 🎯 Estado Actual: PRODUCCIÓN ACTIVA

**El sistema está funcionando correctamente en Google Cloud Run**
- n8n: ✅ Activo (https://n8n-optimacx-supabase-1008284849803.southamerica-west1.run.app/)
- Supabase PostgreSQL: ✅ Activo (Schema: n8n_prod)
- RAG System: ✅ Configurado
- Multitenant: ✅ Funcionando
- Custom Nodes: ✅ Refactorizados con abstracciones

**Última verificación:** 2025-07-17 - **Restructuración completada**