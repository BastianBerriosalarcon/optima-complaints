# Plataforma OptimaCX - Infraestructura Multi-Servicio en GCP

Plataforma multitenant de experiencia al cliente que combina N8N, Chatwoot y un frontend personalizado, desplegada en Google Cloud Platform usando infraestructura como código (Terraform).

## 🚀 Estado del Proyecto

### 🎯 **Infraestructura Productiva (Actual)**
**✅ ACTIVA y OPTIMIZADA** - Funcionando con reorganización v2.0
- **N8N Productivo:** ✅ https://n8n-optimacx-supabase-1008284849803.southamerica-west1.run.app/
- **Chatwoot Productivo:** ✅ https://chatwoot-multitenant-dev-1039900134024.southamerica-west1.run.app/
- **Base de Datos:** ✅ Supabase PostgreSQL (Brasil) - Schema: n8n_prod
- **Redis:** ✅ Cloud Memorystore (10.129.0.4:6379)
- **Región:** southamerica-west1
- **Última Reparación:** 8 de agosto, 2025 - Chatwoot ActionCable fix aplicado
- **Estado:** 🚀 **PRODUCCIÓN + REORGANIZADO v2.0**

### 🔧 **Infraestructura de Desarrollo (Terraform)**
**🔄 PREPARADA** - Lista para nuevos deployments
- **N8N Dev:** 🟡 Infraestructura lista, pendiente deployment
- **Chatwoot Dev:** 🟡 Infraestructura lista, pendiente deployment  
- **Frontend Dev:** 🟡 Infraestructura lista, pendiente deployment
- **Base de Datos:** ✅ Supabase PostgreSQL (Brasil) - Schemas preparados
- **Redis:** ✅ Cloud Memorystore configurado
- **Región:** southamerica-west1
- **Última Configuración:** 8 de agosto, 2025

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

## 📁 Estructura del Proyecto (Reorganizada v2.0)

```
optimacx-GCP/
├── � README.md                   # Documentación principal del proyecto
├── 📄 LICENSE                     # Licencia MIT
├── 📦 package.json                # Monorepo configuration + workspaces
├── 🔧 tsconfig.base.json          # TypeScript configuration base
├── 🛠️ Makefile                    # Comandos desarrollo y deployment (25+ comandos)
├── 🌍 .env.example                # Template variables de entorno
├── 🚫 .gitignore                  # Control de versiones (rules completas)
├── 🐳 .dockerignore               # Docker ignore rules
├── 🔄 .github/workflows/          # CI/CD pipelines (ci.yml, cd.yml)
├── 🚀 applications/               # Aplicaciones y extensiones
│   ├── extensions/               # Extensiones y nodos personalizados
│   │   ├── custom-nodes/        # Nodos N8N personalizados
│   │   └── rag-system/          # Sistema RAG independiente
│   └── workflows/               # Workflows organizados por dominio
│       ├── business/            # Workflows por área de negocio
│       │   ├── administracion/  # Workflows administrativos
│       │   ├── campañas/        # Gestión de campañas
│       │   ├── encuestas/       # Sistema de encuestas
│       │   ├── leads/           # Gestión de leads
│       │   └── reclamos/        # Sistema de reclamos con RAG
│       ├── templates/           # Plantillas reutilizables
│       ├── tests/               # Tests de workflows
│       └── utils/               # Utilidades compartidas
├── ⚙️ config/                     # Configuraciones del sistema
│   └── docker/                  # Configuraciones Docker
├── 🗄️ database/                   # Gestión de base de datos
│   ├── supabase-config.toml     # Configuración local Supabase
│   ├── migrations/              # Migraciones SQL versionadas
│   ├── policies/                # Row Level Security policies
│   ├── schemas/                 # Definiciones de esquemas
│   │   ├── core/               # Esquemas principales
│   │   └── modules/            # Módulos específicos (RAG)
│   ├── functions/               # Funciones SQL y triggers
│   ├── seeds/                   # Datos de prueba
│   └── deprecated/              # Migrations obsoletos documentados
├── � docs/                       # Documentación del proyecto
│   ├── deployment/              # Guías de deployment
│   ├── cleanup/                 # Reportes de cleanup y análisis
│   └── *.md                     # Documentación técnica
├── 🎨 frontend/                   # Aplicación Next.js
│   ├── src/                     # Código fuente
│   ├── tests/                   # Tests E2E y unitarios
│   └── supabase/                # Configuración Supabase
├── 🏗️ infrastructure/terraform/    # Infraestructura como código
│   ├── environments/            # Configuraciones por ambiente
│   │   ├── chatwoot/           # Ambiente Chatwoot
│   │   └── n8n/                # Ambiente N8N
│   ├── modules/                 # Módulos Terraform reutilizables
│   │   ├── chatwoot-multitenant/ # Módulo Chatwoot multitenant
│   │   ├── cloud-run/          # Módulo Cloud Run
│   │   └── database/           # Módulo base de datos
│   ├── services/                # Servicios específicos
│   │   ├── n8n/               # Service N8N
│   │   └── supabase/          # Service Supabase
│   └── deprecated/              # Infraestructura obsoleta documentada
├── 🔧 scripts/                    # Scripts organizados por categoría
│   ├── deployment/              # Scripts de despliegue
│   │   ├── chatwoot/           # Específicos Chatwoot
│   │   └── n8n/                # Específicos N8N
│   ├── database/                # Migraciones y setup DB
│   ├── maintenance/             # Scripts de mantenimiento
│   ├── setup/                   # Configuración inicial
│   ├── testing/                 # Validación y health checks
│   ├── utilities/               # Herramientas generales
│   └── deprecated/              # Scripts obsoletos documentados
├── 🤝 shared/                     # Código compartido entre módulos
│   ├── index.ts                 # Entry point exports
│   ├── package.json             # Config @optimacx/shared
│   ├── tsconfig.json            # TypeScript config
│   ├── types/                   # Tipos TypeScript compartidos
│   ├── services/                # Servicios comunes
│   └── config/                  # Configuraciones compartidas
└── �️ temp/                       # Archivos temporales (gitignored)
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
PROJECT_ID=optima-cx-467616
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

### v2.0.0 (8 de agosto, 2025) ✨ NUEVA VERSIÓN - REORGANIZADA + OPTIMIZADA
- 🗂️ **Reorganización completa del proyecto**
  - ✅ Applications: Separados extensions/ y workflows/ por dominio
  - ✅ Scripts: Categorizados por función (deployment, testing, database, utilities)
  - ✅ Documentación: README específicos por módulo
  - ✅ Estructura modular y escalable implementada
- 🧹 **Optimización y limpieza completada**
  - ✅ **Fase 1**: Eliminados archivos de respaldo Terraform (~256KB)
  - ✅ **Fase 2**: Optimización conservadora node_modules (~20MB)
  - ✅ Limpieza de archivos temporales, cache y sourcemaps
  - ✅ Zero downtime - deployments preservados
- 📋 **Documentación mejorada**
  - ✅ ARCHITECTURE.md con nueva estructura detallada
  - ✅ Guías de scripts organizadas por categoría
  - ✅ Reportes de limpieza y optimización
  - ✅ README.md actualizado con estado real
- 🚀 **Estado actualizado**
  - ✅ N8N y Chatwoot funcionando normalmente
  - ✅ Proyecto preparado para escalabilidad horizontal
  - ✅ Estructura mantenible y clara para desarrollo

### v1.2.0 (23 de julio, 2025)
- ✅ Workflows RAG de procesamiento de conocimiento implementados
- ✅ AdvisorWorkloadManager para asignación inteligente
- ✅ Servidores MCP configurados (Supabase, N8N, Context7)
- ✅ Esquemas de base de datos RAG completados

### v1.1.0 (8 de julio, 2025)
- ✅ Repositorio GitHub configurado
- ✅ Documentación completa
- ✅ Respaldos y versionado implementado

### v1.0.0 (4 de julio, 2025)
- ✅ Implementación inicial OptimaCx
- ✅ Migración desde ActivePieces a n8n
- ✅ Sistema RAG con Gemini + pgvector
- ✅ Despliegue exitoso en Cloud Run
- ✅ Configuración multitenant

## 👥 Contacto

- **Desarrollador:** Bastián Berríos
- **Email:** bastianberriosalarcon@gmail.com
- **GitHub:** @BastianBerriosalarcon

---

## 🎯 Estado Actual: PRODUCCIÓN ACTIVA + REORGANIZADA v2.0

**✅ El sistema está funcionando correctamente en Google Cloud Run**

### 🚀 **Servicios Activos**
- **N8N Productivo:** ✅ https://n8n-optimacx-supabase-dev-1039900134024.southamerica-west1.run.app/
- **Chatwoot Productivo:** ✅ https://chatwoot-multitenant-dev-1039900134024.southamerica-west1.run.app/
- **Supabase PostgreSQL:** ✅ Activo (Schema: n8n_prod)
- **Sistema RAG:** ✅ Configurado con workflows de procesamiento de conocimiento
- **Multitenant:** ✅ Funcionando
- **Nodos Personalizados:** ✅ Refactorizados con abstracciones
- **Integración MCP:** ✅ Supabase y N8N conectados
- **ActionCable (Chatwoot):** ✅ Fix aplicado - funcionando correctamente

### 📊 **Optimizaciones v2.0 Aplicadas**
- ✅ **Reorganización completa:** Estructura modular implementada
- ✅ **Limpieza de archivos:** ~20MB de espacio liberado
- ✅ **Scripts organizados:** Por categoría y función
- ✅ **Documentación actualizada:** README específicos por módulo
- ✅ **Zero downtime:** Deployments preservados sin impacto

**Última verificación:** 8 de agosto, 2025 - **Proyecto reorganizado v2.0 + optimizaciones completadas**

## 🚀 Mejoras v2.0

### ✨ **Nueva Estructura Modular**
- 🗂️ Applications organizados por dominio de negocio
- 🔧 Scripts categorizados por función
- 📋 Documentación completa por módulo
- 🏗️ Arquitectura escalable y mantenible

### 🧹 **Optimización Aplicada**
- 💾 ~20MB de espacio liberado
- 🗑️ Archivos basura eliminados
- ⚡ Cache optimizado
- 🔒 Deployments preservados sin impacto

---

📊 **Proyecto optimizado y listo para escalabilidad horizontal**