# OptimaCX Platform - Infrastructure Terraform

## 🏗️ Estructura Modular

```
infrastructure/terraform/
├── modules/                    # Módulos reutilizables
│   ├── cloud-run/             # Módulo genérico Cloud Run
│   ├── database/              # Secrets para Supabase
│   ├── networking/            # VPC, SSL, Load Balancer
│   └── security/              # Service Accounts, IAM
├── services/                  # Servicios específicos
│   ├── n8n/                   # N8N workflow automation
│   ├── optimacx-frontend/     # Frontend OptimaCX (Next.js)
│   ├── chatwoot/              # Chatwoot customer service
│   └── supabase/              # Supabase secrets management
└── environments/              # Ambientes
    ├── dev/                   # Desarrollo
    ├── staging/               # Testing (futuro)
    └── prod/                  # Producción (futuro)
```

## 🚀 Servicios Configurados

### 1. **N8N (Workflow Automation)**
- **Ubicación**: `services/n8n/`
- **Función**: Automatización de workflows y integraciones
- **Recursos**: 2Gi RAM, 1 CPU, 1-3 instancias
- **Base de datos**: Supabase (hosteado en Brasil)

### 2. **OptimaCX Frontend**
- **Ubicación**: `services/optimacx-frontend/`
- **Función**: Frontend del CRM (Next.js)
- **Recursos**: 1Gi RAM, 1 CPU, 1-5 instancias
- **Estado**: Listo para desarrollo

### 3. **Chatwoot**
- **Ubicación**: `services/chatwoot/`
- **Función**: Customer service platform
- **Recursos**: 2Gi RAM, 1 CPU, 1-3 instancias
- **Base de datos**: Separada de Supabase

### 4. **Supabase**
- **Ubicación**: `services/supabase/`
- **Función**: Backend as a Service
- **Hosting**: supabase.com (región Brasil)
- **Configuración**: Solo secrets management

## 📋 Configuración Inicial

### 1. Configurar Secrets
```bash
# Navegar al environment
cd infrastructure/terraform/environments/dev

# Supabase secrets (obtener de supabase.com)
echo -n "https://your-project.supabase.co" | gcloud secrets create supabase-url-dev --data-file=-
echo -n "your-anon-key" | gcloud secrets create supabase-anon-key-dev --data-file=-
echo -n "your-service-role-key" | gcloud secrets create supabase-service-role-key-dev --data-file=-
echo -n "your-jwt-secret" | gcloud secrets create supabase-jwt-secret-dev --data-file=-

# N8N secrets
echo -n "your-32-char-encryption-key-here" | gcloud secrets create optimacx-n8n-encryption-key-dev --data-file=-
echo -n "your-db-password" | gcloud secrets create optimacx-database-password-dev --data-file=-

# Chatwoot secrets
echo -n "your-chatwoot-secret-key-base" | gcloud secrets create optimacx-chatwoot-secret-key-dev --data-file=-
```

### 2. Ejecutar Terraform
```bash
# Inicializar
terraform init

# Planificar
terraform plan

# Aplicar
terraform apply
```

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