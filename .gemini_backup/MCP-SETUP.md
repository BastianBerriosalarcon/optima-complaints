# Configuración MCP para OptimaCX

## Servidores Configurados

### 1. N8N Workflow Builder
- **Propósito:** Gestión de workflows de automatización
- **Herramientas:** Creación, ejecución y gestión de workflows
- **Timeout:** 30 segundos

### 2. Supabase MCP Server
- **Propósito:** Interacción con base de datos PostgreSQL
- **Herramientas:** Consultas, inserción, actualización de datos
- **Modo:** Solo lectura por seguridad

### 3. Google Cloud Run MCP
- **Propósito:** Gestión de servicios en Cloud Run
- **Herramientas:** Deploy, estado, logs de servicios
- **Región:** southamerica-west1

### 4. Terraform MCP (Nuevo)
- **Propósito:** Gestión de infraestructura como código
- **Herramientas:** Plan, apply, destroy de infraestructura
- **Directorio:** infrastructure/terraform

### 5. Database Schema MCP (Nuevo)
- **Propósito:** Exploración directa del esquema de base de datos
- **Herramientas:** Listado de tablas, descripción de esquemas

### 6. Git Operations MCP (Nuevo)
- **Propósito:** Operaciones de control de versiones
- **Herramientas:** Status, log, diff, commit, push

## Variables de Entorno Requeridas

```bash
# Supabase
SUPABASE_ACCESS_TOKEN=sbp_...
SUPABASE_URL=https://gdnlodwwmvbgayzzudiu.supabase.co
SUPABASE_DB_PASSWORD=your_db_password

# Google Cloud
GOOGLE_CLOUD_PROJECT=optima-cx-467616
GOOGLE_CLOUD_REGION=southamerica-west1

# N8N
N8N_HOST=https://n8n-optimacx-supabase-1008284849803.southamerica-west1.run.app
N8N_API_KEY=eyJhbGci...
```

## Comandos Útiles

```bash
# Verificar estado de servidores MCP
/mcp

# Autenticar con servidores específicos
/mcp auth supabase
/mcp auth cloud-run

# Listar herramientas disponibles
/mcp tools
```

## Troubleshooting

1. **Timeouts:** Aumentar valores de timeout en settings.json
2. **Autenticación:** Verificar tokens y credenciales
3. **Conectividad:** Verificar acceso de red a servicios
4. **Dependencias:** Reinstalar con `npm install -g`

## Seguridad

- Los servidores están configurados con `trust: false` para mayor seguridad
- Se utilizan `includeTools` para limitar las herramientas disponibles
- Los tokens sensibles están en variables de entorno
