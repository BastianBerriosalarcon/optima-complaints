# Chatwoot Independent Deployment Guide

## 🚀 Despliegue Independiente de Chatwoot

Este módulo despliega Chatwoot de forma completamente independiente de N8N, utilizando la infraestructura compartida.

### 📋 Pre-requisitos
- Infraestructura base desplegada (dev environment)
- Redis activo
- VPC y networking configurados
- Service accounts creados

### 🔧 Despliegue

```bash
# Navegar al directorio de Chatwoot
cd /workspaces/optimacx-GCP/infrastructure/terraform/environments/chatwoot

# Inicializar Terraform
terraform init

# Planificar despliegue
terraform plan

# Aplicar cambios
terraform apply
```

### 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│  Chatwoot Independent Module                                   │
├─────────────────────────────────────────────────────────────────┤
│  ├── Cloud Run: chatwoot-multitenant                          │
│  ├── Uses: Shared Redis (chatwoot-redis-dev)                  │
│  ├── Uses: Shared VPC Connector                               │
│  ├── Uses: Shared Service Account                             │
│  └── Database: Supabase PostgreSQL                            │
└─────────────────────────────────────────────────────────────────┘
```

### ✅ Ventajas de la Separación

1. **Despliegues Independientes**: N8N y Chatwoot se pueden actualizar por separado
2. **Estados Terraform Separados**: Menor riesgo de conflictos
3. **Escalabilidad Individual**: Cada servicio escala según sus necesidades
4. **Debugging Simplificado**: Logs y errores aislados por servicio
5. **Rollbacks Específicos**: Revertir solo el servicio con problemas

### 🔗 Dependencias Compartidas

- **Redis**: `chatwoot-redis-dev` (creado por dev environment)
- **VPC**: `optimacx-vpc-dev` (creado por dev environment)  
- **Service Account**: `chatwoot-service-account-dev` (creado por dev environment)
- **VPC Connector**: `optimacx-connector-dev` (creado por dev environment)

### 📊 Configuración Multitenant

Chatwoot soporta múltiples concesionarios a través de:
- **Accounts**: Un account por concesionario
- **Subdomains**: `concesionario1.chat.optimacx.com`
- **API Keys**: Diferentes por account
- **Webhooks**: URLs específicas por tenant

### 🚨 Notas Importantes

- **N8N debe estar funcionando** antes de desplegar Chatwoot
- **Infraestructura base requerida** (dev environment desplegado)
- **Secrets separados** para cada servicio
- **Logs independientes** en Cloud Console
