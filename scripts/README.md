# Scripts - Optima-Complaints

Este directorio contiene scripts de utilidad para despliegue, mantenimiento y testing del proyecto.

## Estructura de Directorios

```
scripts/
├── deployment/         # Scripts relacionados con el despliegue de aplicaciones
│   └── n8n/            # Scripts específicos para workflows de N8N
├── database/           # Scripts para la gestión de la base de datos
└── testing/            # Scripts para ejecutar pruebas y verificaciones
```

## Scripts Disponibles

### Deployment (`deployment/`)

- **`import-n8n-workflows-direct.sh`**: Importa o actualiza todos los workflows de N8N desde el repositorio local a una instancia de N8N en ejecución mediante la API.

### Database (`database/`)

- **`backup-production.sh`**: Realiza un backup completo de la base de datos de producción.
- **`execute_migration.js`**: Script para ejecutar nuevas migraciones de base de datos de forma controlada.

### Testing (`testing/`)

- **`n8n-health-check.sh`**: Verifica que la instancia de N8N esté activa y responda correctamente.
- **`monitor-services.sh`**: Script de monitoreo básico para los servicios principales de la aplicación.

## Uso General

La mayoría de los scripts son ejecutables y pueden ser invocados directamente desde la terminal.

```bash
# Ejemplo: Ejecutar un backup de la base de datos
./scripts/database/backup-production.sh

# Ejemplo: Importar workflows a N8N
./scripts/deployment/n8n/import-n8n-workflows-direct.sh
```

**Nota**: Asegúrate de que los scripts tengan permisos de ejecución (`chmod +x <script_name>`).