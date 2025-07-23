# Plataforma OptimaCX - Infraestructura Multi-Servicio en GCP

Plataforma multitenant de experiencia al cliente que combina N8N, Chatwoot y un frontend personalizado, desplegada en Google Cloud Platform usando infraestructura como código (Terraform).

## 🚀 Estado del Proyecto

### Infraestructura Actual (Terraform)
**🔄 EN DESARROLLO** - Infraestructura base completada
- **N8N Dev:** No desplegado aún ❌
- **Chatwoot Dev:** No desplegado aún ❌
- **Frontend Dev:** No desplegado aún ❌
- **Base de Datos:** Supabase PostgreSQL (Brasil) ✅
- **Redis:** Cloud Memorystore (10.129.0.4:6379) ✅
- **Región:** southamerica-west1
- **Último Deploy:** 15 de julio, 2025

### Infraestructura Legacy (Funcionando)
**✅ ACTIVA y FUNCIONANDO**
- **URL n8n:** https://n8n-optimacx-supabase-1008284849803.southamerica-west1.run.app/
- **Base de Datos:** Supabase PostgreSQL (Schema: n8n_prod)
- **Región:** southamerica-west1
- **Último Deploy:** 17 de julio, 2025

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
│  Servicios Cloud Run                                           │
│  ├── N8N (southamerica-west1)                                 │
│  ├── Chatwoot (southamerica-west1)                            │
│  └── Frontend OptimaCX (southamerica-west1)                   │
├─────────────────────────────────────────────────────────────────┤
│  Supabase PostgreSQL (Brasil)                                  │
│  ├── Schema: n8n_dev                                          │
│  ├── Schema: chatwoot_dev                                     │
│  ├── Schema: public (frontend)                                │
│  └── Row Level Security (RLS)                                 │
├─────────────────────────────────────────────────────────────────┤
│  Cloud Memorystore Redis                                       │
│  ├── Instancia: chatwoot-redis-dev                            │
│  ├── Memoria: 1GB STANDARD_HA                                 │
│  └── VPC Privada: 10.129.0.4:6379                            │
├─────────────────────────────────────────────────────────────────┤
│  Infraestructura como Código                                   │
│  ├── Módulos Terraform (reutilizables)                        │
│  ├── Configuraciones por Ambiente                             │
│  ├── Integración Secret Manager                               │
│  └── Networking VPC Privado                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🏗️ Arquitectura Legacy (Funcionando)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Google Cloud Platform                    │
├─────────────────────────────────────────────────────────────────┤
│  Cloud Run: n8n-optima-cx                                      │
│  ├── Workflows n8n                                             │
│  ├── Nodos Personalizados (Sistema RAG)                        │
│  ├── Integraciones OptimaCx                                    │
│  └── Configuración Multi-tenant                                │
├─────────────────────────────────────────────────────────────────┤
│  Cloud SQL: n8n-optima-cx-postgres                             │
│  ├── PostgreSQL 15                                             │
│  ├── Extensión pgvector                                        │
│  ├── Datos Workflows n8n                                       │
│  └── Datos Multi-tenant OptimaCx                               │
├─────────────────────────────────────────────────────────────────┤
│  Servicios IA/ML                                               │
│  ├── Gemini 2.5 Pro (LLM)                                     │
│  ├── gemini-embedding-001 (Embeddings)                         │
│  └── Vertex AI Vector Search                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Estructura del Proyecto

```
optimacx-platform/
├── applications/
│   ├── n8n-workflows/              # Workflows N8N organizados por módulo
│   │   ├── encuestas/             # Workflows de encuestas post-venta
│   │   ├── leads/                 # Workflows de gestión de leads
│   │   ├── reclamos/              # Workflows de reclamos con RAG
│   │   └── utils/                 # Utilidades y configuraciones
│   └── custom-nodes/              # Nodos personalizados N8N
│       └── rag-system/            # Sistema RAG OptimaCx
├── infrastructure/terraform/       # Nueva infraestructura IaC
│   ├── modules/                   # Módulos reutilizables
│   └── environments/             # Configuraciones por ambiente
├── database/schemas/              # Esquemas de base de datos
│   └── modules/rag/              # Módulo RAG con funciones de búsqueda
├── shared/services/               # Servicios compartidos
│   └── helpers/                  # Helpers como AdvisorWorkloadManager
└── README.md                     # Este archivo
```

## 🔄 Flujo de Encuestas OptimaCx

### Canal 1: Código QR (Inmediato)
1. Cliente escanea QR único por concesionario
2. Respuesta instantánea con 4 preguntas + datos del cliente
3. Registro automático en BD
4. Si calificación 1-8: Email automático a jefatura

### Canal 2: WhatsApp (Automatizado)
1. Carga masiva de clientes (día siguiente)
2. Filtrado automático (excluye QR ya respondidos)
3. Envío vía WhatsApp Business API
4. Período de espera: 6 horas

### Canal 3: Contact Center (Manual)
1. Asignación automática de pendientes
2. Distribución equitativa entre agentes
3. Seguimiento telefónico
4. Registro manual en sistema

## 🤖 Sistema RAG para Reclamos

### Componentes Técnicos
- **Embeddings:** gemini-embedding-001 (3,072 dimensiones)
- **Base de Datos Vectorial:** Vertex AI Vector Search + pgvector
- **LLM:** Gemini 2.5 Pro
- **Procesamiento:** workflows n8n

### Flujo RAG
```
Reclamo → Embedding → Búsqueda Vectorial → Contexto → Gemini → Respuesta Estructurada
```

## 🔧 Configuración Nueva (Terraform)

### Variables de Ambiente Supabase + Redis
```bash
# Base de Datos Supabase
SUPABASE_URL=https://pnkdyagqibqxfxziqwxt.supabase.co
SUPABASE_HOST=aws-0-sa-east-1.pooler.supabase.com
SUPABASE_USER=postgres.pnkdyagqibqxfxziqwxt
SUPABASE_PASSWORD=***

# Configuración N8N
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=aws-0-sa-east-1.pooler.supabase.com
DB_POSTGRESDB_DATABASE=postgres
DB_POSTGRESDB_SCHEMA=n8n_dev
N8N_USER_MANAGEMENT_DISABLED=true
N8N_METRICS=true

# Configuración Chatwoot
POSTGRES_HOST=aws-0-sa-east-1.pooler.supabase.com
POSTGRES_DATABASE=postgres
REDIS_URL=redis://10.129.0.4:6379
RAILS_ENV=development

# Google Cloud
PROJECT_ID=burnished-data-463915-d8
REGION=southamerica-west1
```

## 🚀 Comandos Útiles

### Verificar Estado
```bash
# Estado Cloud Run
gcloud run services list --region=southamerica-west1

# Estado de Base de Datos
gcloud sql instances list

# Logs
gcloud run services logs read n8n-optima-cx --region=southamerica-west1
```

### Despliegue
```bash
# Desplegar nueva versión
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

### Respaldos
- ✅ Respaldos automáticos Cloud SQL
- ✅ Respaldo del estado Terraform
- ✅ Logs de migración preservados

## 📊 Monitoreo

### Métricas Disponibles
- Tiempo de respuesta por tenant
- Tasa de éxito de workflows
- Performance de base de datos
- Uso de API por concesionario

### Alertas Configuradas
- Fallas de workflow > 5%
- Problemas de conexión a BD
- Límites de rate de API

## 🛠️ Desarrollo Local

### Requisitos
- Docker
- Google Cloud SDK
- Node.js >= 18

### Configuración
```bash
# Clonar repositorio
git clone https://github.com/BastianBerriosalarcon/optimacx-GCP.git
cd optimacx-GCP

# Configurar variables
cp .env.example .env

# Ejecutar localmente
docker-compose up -d
```

## 📝 Historial de Cambios

### v1.0.0 (4 de julio, 2025)
- ✅ Implementación inicial OptimaCx
- ✅ Migración desde ActivePieces a n8n
- ✅ Sistema RAG con Gemini + pgvector
- ✅ Despliegue exitoso en Cloud Run
- ✅ Configuración multitenant

### v1.1.0 (8 de julio, 2025)
- ✅ Repositorio GitHub configurado
- ✅ Documentación completa
- ✅ Respaldos y versionado implementado

### v1.2.0 (23 de julio, 2025)
- ✅ Workflows RAG de procesamiento de conocimiento implementados
- ✅ AdvisorWorkloadManager para asignación inteligente
- ✅ Servidores MCP configurados (Supabase, N8N, Context7)
- ✅ Esquemas de base de datos RAG completados

## 👥 Contacto

- **Desarrollador:** Bastián Berríos
- **Email:** bastianberriosalarcon@gmail.com
- **GitHub:** @BastianBerriosalarcon

---

## 🎯 Estado Actual: PRODUCCIÓN ACTIVA

**El sistema está funcionando correctamente en Google Cloud Run**
- n8n: ✅ Activo (https://n8n-optimacx-supabase-1008284849803.southamerica-west1.run.app/)
- Supabase PostgreSQL: ✅ Activo (Schema: n8n_prod)
- Sistema RAG: ✅ Configurado con workflows de procesamiento de conocimiento
- Multitenant: ✅ Funcionando
- Nodos Personalizados: ✅ Refactorizados con abstracciones
- Integración MCP: ✅ Supabase y N8N conectados

**Última verificación:** 23 de julio, 2025 - **Workflows RAG e integración MCP completados**