# Scripts - Optima-Complaints

Documentación de scripts organizados por categoría.

## Estructura

```
scripts/
├── deployment/         # Scripts de despliegue
│   └── n8n/           # Despliegue N8N workflows
├── testing/           # Scripts de testing y monitoreo
├── database/          # Scripts de base de datos
└── deprecated/        # Scripts obsoletos (histórico)
```

**Última limpieza:** 28 de Octubre 2025 - Eliminación de módulos contaminados

## Deployment - Scripts ACTIVOS

### N8N Workflows
- `import-n8n-workflows-direct.sh` - Importar workflows de reclamos
- Despliegue de workflows RAG
- Configuración de workflows de notificaciones

### General
- `update-services.sh` - Actualización de servicios

## Testing - Scripts ACTIVOS

- `n8n-health-check.sh` - Verificación de salud N8N
- `monitor-services.sh` - Monitoreo de servicios

## Database - Scripts ACTIVOS

- `execute_migration.js` - Ejecutor de migraciones
- `init-db.sql` - Inicialización de base de datos
- `backup-production.sh` - Backup de producción

## Deprecated - Scripts OBSOLETOS

Ver `deprecated/README.md` para detalles de scripts movidos por ser obsoletos.

## Uso

```bash
# Deployment
./scripts/deployment/update-services.sh

# Testing
./scripts/testing/monitor-services.sh

# Database
./scripts/database/backup-production.sh
```

## Estadísticas

- **Scripts Activos**: 6 scripts enfocados en reclamos
- **Última Actualización**: 28 de Octubre 2025
