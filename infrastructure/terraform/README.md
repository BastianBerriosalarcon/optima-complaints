# Terraform Infrastructure - Óptima-CX ✨ REORGANIZADO

Esta c## 🚀 DEPLOYMENT REORGANIZADO

### Deploy Completo por Entorno
```bash
# Desplegar TODO el entorno dev (N8N + Chatwoot + Supabase)
cd infrastructure/terraform/environments/dev
terraform init
terraform plan
terraform apply
```

### Deploy Selectivo por Servicio
```bash
# Solo N8N en dev
cd infrastructure/terraform/environments/dev  
terraform apply -target=module.n8n

# Solo Chatwoot en dev
terraform apply -target=module.chatwoot
```

### Deploy Staging (Futuro)
```bash
cd infrastructure/terraform/environments/staging
terraform init
terraform apply
```ión de Terraform gestiona la infraestructura **REAL Y DESPLEGADA** de Óptima-CX en Google Cloud Platform.

## 🏗️ NUEVA Estructura Organizada

```
infrastructure/terraform/
├── 🌍 environments/              # ← ENTORNOS (no servicios específicos)
│   ├── dev/                     # ✅ Entorno desarrollo ACTIVO
│   │   ├── main.tf              # Todos los servicios juntos  
│   │   ├── variables.tf         # Variables del entorno
│   │   ├── outputs.tf           # Outputs consolidados
│   │   ├── terraform.tfvars     # Valores reales para dev
│   │   └── services/            # Configuraciones específicas
│   │       ├── n8n.tf           # Config N8N para dev
│   │       ├── chatwoot.tf      # Config Chatwoot para dev
│   │       └── supabase.tf      # Config Supabase para dev
│   ├── staging/                 # 🔄 Entorno staging (plantilla)
│   └── prod/                    # 🔄 Entorno producción (futuro)
├── 🏗️ services/                 # ← MÓDULOS DE SERVICIOS
│   ├── n8n/                     # ✅ N8N service module
│   ├── chatwoot/                # ✅ Chatwoot service module (movido desde deprecated)
│   ├── frontend/                # ✅ Frontend module (movido desde deprecated)
│   └── supabase/                # ✅ Supabase secrets management
├── 🧩 modules/                  # ← MÓDULOS REUTILIZABLES
│   ├── cloud-run/               # Módulo genérico Cloud Run
│   ├── cloud-sql/               # Módulo Cloud SQL
│   ├── networking/              # VPC, SSL, Load Balancer
│   ├── security/                # Service Accounts, IAM
│   └── chatwoot-multitenant/    # Módulo Chatwoot específico
├── 📁 shared/                   # ← CONFIGURACIONES COMPARTIDAS
│   ├── providers.tf             # Providers y versiones
│   └── variables.tf             # Variables globales
└── 📁 backup/                   # ← BACKUP configuraciones anteriores
    └── old-environments/        # Configuraciones antiguas
        ├── n8n/                 # Backup de /environments/n8n/
        └── chatwoot/            # Backup de /environments/chatwoot/
```

## 🚀 INFRAESTRUCTURA DESPLEGADA Y FUNCIONANDO

### ✅ N8N Multitenant (ACTIVO)
- **URL**: https://n8n-optimacx-supabase-dev-wfzra4ruxq-tl.a.run.app
- **Imagen**: `southamerica-west1-docker.pkg.dev/optima-cx-467616/n8n/n8n-multitenant:latest`
- **Recursos**: 2 CPU, 2Gi memoria, máximo 3 instancias
- **Base de Datos**: Cloud SQL (separada de Supabase)
- **Configuración**: Conectado a Supabase para datos de workflows
- **Multitenant**: Habilitado (`N8N_USER_MANAGEMENT_DISABLED=false`)

### ✅ Chatwoot Multitenant (ACTIVO)
- **Base de Datos**: Cloud SQL (separada de Supabase y N8N)
- **Configuración**: Cuentas separadas por concesionario
- **Función**: WhatsApp Business API multitenant

### ✅ Supabase PostgreSQL (ACTIVO)
- **URL**: https://gdnlodwwmvbgayzzudiu.supabase.co
- **Función**: Base de datos principal para datos de la aplicación
- **Configuración**: Row Level Security (RLS) por concesionario_id
- **Migraciones**: Esquema completo implementado

## � DEPLOYMENT REAL

### Configuración N8N (ACTIVA)
```bash
cd infrastructure/terraform/environments/n8n
terraform init
terraform plan
terraform apply
```

### Variables de Entorno Configuradas ✅
- `SUPABASE_URL`: https://gdnlodwwmvbgayzzudiu.supabase.co
- `SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (configurado)
- `SUPABASE_SERVICE_KEY`: Desde Secret Manager `supabase-service-key-dev`
- `N8N_USER_MANAGEMENT_DISABLED`: false (multitenant habilitado)
- `N8N_PORT`: 8080

### Arquitectura de Bases de Datos ✅
1. **Supabase PostgreSQL**: Datos de aplicación, workflows, configuraciones
2. **Cloud SQL (N8N)**: Base de datos propia de N8N para usuarios y workflows
3. **Cloud SQL (Chatwoot)**: Base de datos propia de Chatwoot para cuentas y conversaciones

## 🎯 **VENTAJAS DE LA NUEVA ESTRUCTURA**

### ✅ **Organización por Entornos**
- **Un directorio por entorno**: dev, staging, prod
- **Configuración unificada**: Todos los servicios en un solo lugar
- **Variables centralizadas**: Por entorno, no por servicio

### ✅ **Deployment Simplificado**
- **Deploy completo**: `terraform apply` despliega todo el entorno
- **Deploy selectivo**: Target específico por servicio si es necesario
- **Configuración consistente**: Misma estructura en todos los entornos

### ✅ **Mantenimiento Fácil**
- **No más confusion**: Entornos son entornos, servicios son servicios
- **Backup conservado**: Configuraciones anteriores en `/backup/`
- **Escalabilidad**: Fácil agregar nuevos entornos

## 🔄 **MIGRACIÓN COMPLETADA**

### ✅ Movimientos Realizados:
- `deprecated/services/chatwoot-multitenant/` → `services/chatwoot/`
- `deprecated/services/optimacx-frontend/` → `services/frontend/`
- `environments/n8n/` → `backup/old-environments/n8n/`
- `environments/chatwoot/` → `backup/old-environments/chatwoot/`
- Eliminada carpeta `deprecated/` (vacía)

### ✅ Nuevas Configuraciones:
- `environments/dev/` - Entorno unificado y funcional
- `environments/staging/` - Plantilla para testing
- `shared/` - Configuraciones globales
- Documentación actualizada en cada nivel

## 🔧 Características Clave

### ✅ **Seguridad**
- Secrets en Google Secret Manager
- Service Accounts específicos por servicio
- VPC privada con conector
- Cloud Armor para protección DDoS

### ✅ **Escalabilidad**
- Auto-scaling por servicio
- Configuración de recursos por ambiente
- Load balancer con SSL automático

### ✅ **Modularidad**
- Módulos reutilizables
- Servicios independientes
- Fácil adición de nuevos servicios

### ✅ **Networking**
- VPC privada en Chile (`southamerica-west1`)
- SSL certificates automáticos
- Rate limiting y seguridad

## 📊 Configuración por Ambiente

### Development (dev)
- Recursos mínimos
- SSL opcional
- Instancias: 1-3 por servicio

### Staging (futuro)
- Recursos intermedios
- SSL requerido
- Instancias: 1-5 por servicio

### Production (futuro)
- Recursos máximos
- SSL + CDN
- Instancias: 2-10 por servicio

## 🎯 Próximos Pasos

1. **Desarrollar Frontend**: Crear Dockerfile y CI/CD
2. **Configurar Dominios**: Añadir SSL certificates
3. **Implementar Staging**: Copiar estructura dev
4. **Añadir Monitoring**: Logs y métricas
5. **Backup Strategy**: Para bases de datos

## 📝 Notas Importantes

- **Supabase**: Hosteado en Brasil, no Chile
- **N8N**: Requiere base de datos PostgreSQL
- **Chatwoot**: Necesita Redis (añadir si es necesario)
- **Frontend**: Placeholder listo para cuando esté desarrollado

## 🚨 Comandos Útiles

```bash
# Ver outputs
terraform output

# Destruir ambiente (cuidado!)
terraform destroy

# Validar configuración
terraform validate

# Formatear código
terraform fmt

# Ver estado
terraform show
```

---

*Estructura creada: 2025-07-15*  
*Estado: Listo para desarrollo*  
*Próximo: Implementar frontend y conectar servicios*