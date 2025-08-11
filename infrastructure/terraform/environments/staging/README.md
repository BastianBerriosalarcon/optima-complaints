# README - Entorno de Staging

## 🧪 Staging Environment

Este entorno está configurado para **testing y QA** antes de producción.

### Estado Actual
🚧 **EN CONFIGURACIÓN** - Aún no desplegado

### Configuración

#### Recursos Reducidos vs Dev/Prod
- **N8N**: 1 CPU, 1Gi memoria, máximo 2 instancias
- **Chatwoot**: Configuración reducida
- **Base de datos**: Instancias más pequeñas

#### Para Desplegar Staging

1. **Configurar Supabase para Staging**:
   ```bash
   # Crear nuevo proyecto Supabase o usar branch diferente
   # Actualizar variables en terraform.tfvars
   ```

2. **Configurar Secrets**:
   ```bash
   # Crear secrets específicos para staging
   gcloud secrets create supabase-service-key-staging --data-file=-
   gcloud secrets create supabase-anon-key-staging --data-file=-
   ```

3. **Deploy**:
   ```bash
   cd infrastructure/terraform/environments/staging
   terraform init
   terraform plan
   terraform apply
   ```

### Diferencias con Dev
- ✅ Recursos más pequeños (menos costo)
- ✅ Configuración más estricta
- ✅ Ideal para testing antes de prod
- ✅ Puede usar datos de prueba

### Diferencias con Prod  
- ✅ Menos recursos de CPU/memoria
- ✅ Menos instancias máximas
- ✅ Configuración de seguridad similar
- ✅ Mismo código, diferentes datos
