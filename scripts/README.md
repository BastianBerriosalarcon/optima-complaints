# 🔧## 📁 Estructura Optimizada

```txt
scripts/
├── 🚀 deployment/         # Scripts de despliegue ACTIVOS
│   ├── chatwoot/         # Despliegue Chatwoot
│   └── n8n/             # Despliegue N8N
├── 🧪 testing/          # Scripts de testing y monitoreo
├── 🗄️ database/         # Scripts de base de datos
└── 📁 deprecated/       # Scripts obsoletos (histórico)
    ├── n8n-migration/   # Migración N8N completada
    ├── fixes/           # Fixes específicos aplicados
    └── utilities/       # Utilidades obsoletas
```

**🎯 Última limpieza:** Agosto 8, 2025 - 7 scripts movidos a `deprecated/`

## 🚀 Deployment - Scripts ACTIVOS

### Chatwoot (5 scripts)

- ✅ `deploy-chatwoot-independent.sh` - Despliegue independiente de Chatwoot
- ✅ `setup-chatwoot-multitenant.sh` - Configuración multitenant
- ✅ `setup-chatwoot-post-deployment.sh` - Configuración post-despliegue
- ✅ `setup-chatwoot-webhooks.sh` - Configuración de webhooks
- ✅ `chatwoot-fix.yaml` - Configuración de fixes

### N8N (2 scripts activos)

- ✅ `import-n8n-workflows-direct.sh` - Importar workflows
- ✅ `setup-n8n-chatwoot-webhooks.sh` - Webhooks N8N ↔ Chatwoot

### General (1 script)

- ✅ `update-services.sh` - Actualización de servicios (MUY RECIENTE)timaCX-GCP

Documentación de scripts organizados por categoría.

## 📁 Estructura Optimizada

```
scripts/
├── 🚀 deployment/         # Scripts de despliegue ACTIVOS
│   ├── chatwoot/         # Despliegue Chatwoot
│   └── n8n/             # Despliegue N8N
├── 🧪 testing/          # Scripts de testing y monitoreo
├── 🗄️ database/         # Scripts de base de datos
└── � deprecated/       # Scripts obsoletos (histórico)
    ├── n8n-migration/   # Migración N8N completada
    ├── fixes/           # Fixes específicos aplicados
    └── utilities/       # Utilidades obsoletas
```

**🎯 Última limpieza:** Agosto 8, 2025 - 7 scripts movidos a `deprecated/`

## 🚀 Deployment - Scripts ACTIVOS

### Chatwoot (5 scripts)
- ✅ `deploy-chatwoot-independent.sh` - Despliegue independiente de Chatwoot
- ✅ `setup-chatwoot-multitenant.sh` - Configuración multitenant
- ✅ `setup-chatwoot-post-deployment.sh` - Configuración post-despliegue
- ✅ `setup-chatwoot-webhooks.sh` - Configuración de webhooks
- ✅ `chatwoot-fix.yaml` - Configuración de fixes

### N8N (2 scripts activos)
- ✅ `import-n8n-workflows-direct.sh` - Importar workflows
- ✅ `setup-n8n-chatwoot-webhooks.sh` - Webhooks N8N ↔ Chatwoot

### General (1 script)
- ✅ `update-services.sh` - Actualización de servicios (MUY RECIENTE)

## 🧪 Testing - Scripts ACTIVOS

- ✅ `test-chatwoot-integration.sh` - Test de integración Chatwoot
- ✅ `n8n-health-check.sh` - Verificación de salud N8N
- ✅ `monitor-services.sh` - Monitoreo de servicios (MUY RECIENTE)

## 🗄️ Database - Scripts ACTIVOS

- ✅ `execute_migration.js` - Ejecutor de migraciones
- ✅ `init-db.sql` - Inicialización de base de datos
- ✅ `backup-production.sh` - Backup de producción (MUY RECIENTE)

## 📁 Deprecated - Scripts OBSOLETOS

Ver `deprecated/README.md` para detalles de scripts movidos por ser obsoletos.

**Scripts deprecados:** 7 (migración N8N completada, fixes específicos, utilities obsoletas)

## 🔧 Uso

```bash
# Deployment
./scripts/deployment/chatwoot/deploy-chatwoot-independent.sh
./scripts/deployment/update-services.sh

# Testing
./scripts/testing/monitor-services.sh
./scripts/testing/test-chatwoot-integration.sh

# Database
./scripts/database/backup-production.sh
```

## 📊 Estadísticas

- **Scripts Totales**: 12 activos + 7 deprecados = 19
- **Scripts Activos**: 12 (63% - OPTIMIZADO)
- **Scripts Deprecados**: 7 (37% - ARCHIVADOS)
- **Última Actualización**: Agosto 8, 2025
