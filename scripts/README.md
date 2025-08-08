# 🔧 Scripts de OptimaCX-GCP

Documentación de scripts organizados por categoría.

## 📁 Estructura

```
scripts/
├── 🚀 deployment/         # Scripts de despliegue
│   ├── chatwoot/         # Despliegue Chatwoot
│   └── n8n/             # Despliegue N8N
├── 🧪 testing/          # Scripts de testing y validación
├── 🗄️ database/         # Scripts de base de datos
├── 🛠️ utilities/        # Utilidades generales
├── 🔧 maintenance/      # Scripts de mantenimiento
└── ⚙️ setup/           # Scripts de configuración inicial
```

## 🚀 Deployment

### Chatwoot
- `deploy-chatwoot-independent.sh` - Despliegue independiente de Chatwoot
- `setup-chatwoot-multitenant.sh` - Configuración multitenant
- `setup-chatwoot-post-deployment.sh` - Configuración post-despliegue
- `setup-chatwoot-webhooks.sh` - Configuración de webhooks
- `chatwoot-fix.yaml` - Configuración de fixes
- `fix-chatwoot.sh` - Script de reparación

### N8N
- `deploy-n8n-fix.sh` - Despliegue con fixes de N8N
- `setup-n8n-chatwoot-webhooks.sh` - Webhooks N8N ↔ Chatwoot
- `n8n-terraform-migration-check.sh` - Verificación de migración
- `n8n-terraform-migration-complete.sh` - Completar migración
- `import-n8n-workflows-direct.sh` - Importar workflows

## 🧪 Testing

- `test-chatwoot-integration.sh` - Test de integración Chatwoot
- `n8n-health-check.sh` - Verificación de salud N8N

## 🗄️ Database

- `execute_migration.js` - Ejecutor de migraciones
- `init-db.sql` - Inicialización de base de datos

## 🛠️ Utilities

- `n8n-quick-fix.sh` - Fix rápido para N8N
- `reorganize-project.sh` - Reorganización del proyecto

## 🔧 Maintenance

- `fix-n8n-access.sh` - Reparar acceso N8N

## ⚙️ Setup

- `get-supabase-keys.sh` - Obtener claves Supabase

## 🔧 Uso

```bash
# Deployment
./scripts/deployment/chatwoot/deploy-chatwoot-independent.sh
./scripts/deployment/n8n/deploy-n8n-fix.sh

# Testing
./scripts/testing/test-chatwoot-integration.sh

# Maintenance
./scripts/maintenance/fix-n8n-access.sh
```
