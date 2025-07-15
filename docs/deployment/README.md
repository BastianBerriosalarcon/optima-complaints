# OptimaCx GCP - n8n Cloud Run Deployment

Sistema de automatización para el proyecto OptimaCx desplegado en Google Cloud Run.

## 🚀 Estado del Proyecto

**✅ ACTIVO y FUNCIONANDO**
- **n8n URL:** https://n8n-optima-cx-e6nurdtj6a-tl.a.run.app
- **Base de Datos:** n8n-optima-cx-postgres (Cloud SQL)
- **Región:** southamerica-west1
- **Último Deploy:** 2025-07-04T20:41:11.403042Z

## 📋 Descripción del Proyecto

OptimaCx es una plataforma multitenant de experiencia al cliente para el sector automotriz que utiliza n8n como motor de automatización para:

- ✅ **Sistema de Encuestas Multi-canal:** QR, WhatsApp, Contact Center
- ✅ **Gestión de Reclamos con IA:** Procesamiento automatizado con RAG
- ✅ **Multitenant:** Aislamiento completo por concesionario
- ✅ **Automatización Inteligente:** Workflows personalizados

## 🏗️ Arquitectura Actual

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
n8n-cloudrun-deployment/
├── custom-nodes/                    # Nodos personalizados n8n
│   └── rag-system/                 # Sistema RAG OptimaCx
│       └── credentials/            # Credenciales n8n
├── docker/                         # Configuración Docker
├── src/                           # Código fuente
│   ├── config/                    # Configuraciones
│   └── monitoring/                # Monitoreo y métricas
├── terraform/                     # Infraestructura como código
│   └── terraform.tfstate.backup   # Backup del estado
├── tests/                         # Pruebas
├── migration-backup/              # Logs de migración
│   └── migration.log             # Log de migración ActivePieces → n8n
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

## 🔧 Configuración Actual

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
- n8n: ✅ Activo
- PostgreSQL: ✅ Activo  
- RAG System: ✅ Configurado
- Multitenant: ✅ Funcionando

**Última verificación:** 2025-07-08 18:04 UTC