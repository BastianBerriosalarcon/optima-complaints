# 🔄 Guía de Actualización Segura: N8N y Chatwoot

## 📋 **Proceso de Actualización sin Downtime**

### 🚦 **Estrategia General: Blue-Green Deployment**

#### **1. Preparación Pre-Actualización**

```bash
# 1.1 Crear snapshot de la base de datos
cd /workspaces/optimacx-GCP
./scripts/database/backup-production.sh

# 1.2 Verificar estado actual de servicios
gcloud run services list --region=southamerica-west1
curl -s -o /dev/null -w "%{http_code}" https://n8n-optimacx-supabase-1008284849803.southamerica-west1.run.app/
curl -s -o /dev/null -w "%{http_code}" https://chatwoot-multitenant-dev-1039900134024.southamerica-west1.run.app/

# 1.3 Backup de configuraciones actuales
cp infrastructure/terraform/services/chatwoot-multitenant/main.tf infrastructure/terraform/services/chatwoot-multitenant/main.tf.backup
cp infrastructure/terraform/environments/dev/main.tf infrastructure/terraform/environments/dev/main.tf.backup
```

### 🔷 **Actualización N8N**

#### **Paso 1: Verificar Nueva Versión**
```bash
# Revisar versiones disponibles en Docker Hub
docker search n8nio/n8n --limit 5
```

#### **Paso 2: Actualizar Terraform (N8N)**
```hcl
# En: infrastructure/terraform/environments/dev/main.tf
# CAMBIAR LÍNEA 79:
container_image = "southamerica-west1-docker.pkg.dev/optima-cx-467616/n8n/n8n-multitenant:v1.XX.X"
```

#### **Paso 3: Deploy Controlado N8N**
```bash
# 3.1 Aplicar cambios con staging
cd infrastructure/terraform/environments/dev
terraform plan -out=n8n-update.tfplan

# 3.2 Verificar plan de cambios
terraform show n8n-update.tfplan

# 3.3 Aplicar actualización (con rollback automático)
terraform apply n8n-update.tfplan

# 3.4 Verificar servicio actualizado
gcloud run services describe n8n-optimacx-supabase --region=southamerica-west1
```

### 🔶 **Actualización Chatwoot**

#### **Paso 1: Verificar Compatibilidad**
```bash
# Revisar changelog de Chatwoot
curl -s https://api.github.com/repos/chatwoot/chatwoot/releases/latest | jq .tag_name
```

#### **Paso 2: Actualizar Terraform (Chatwoot)**
```hcl
# En: infrastructure/terraform/services/chatwoot-multitenant/main.tf
# CAMBIAR LÍNEA 89:
container_image = "chatwoot/chatwoot:v4.5.0"  # Nueva versión

# También en: infrastructure/terraform/modules/chatwoot-multitenant/main.tf
# CAMBIAR LÍNEA 189:
image = "chatwoot/chatwoot:v4.5.0"
```

#### **Paso 3: Deploy Controlado Chatwoot**
```bash
# 3.1 Aplicar cambios con staging
cd infrastructure/terraform/services/chatwoot-multitenant
terraform plan -out=chatwoot-update.tfplan

# 3.2 Aplicar actualización
terraform apply chatwoot-update.tfplan

# 3.3 Verificar servicio actualizado
gcloud run services describe chatwoot-multitenant-dev --region=southamerica-west1
```

## 🛡️ **Procedimientos de Seguridad**

### **✅ Health Checks Post-Actualización**

```bash
#!/bin/bash
# health-check-post-update.sh

echo "🔍 Verificando N8N..."
N8N_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://n8n-optimacx-supabase-1008284849803.southamerica-west1.run.app/)
if [ "$N8N_STATUS" = "200" ]; then
    echo "✅ N8N: OK"
else
    echo "❌ N8N: FALLO ($N8N_STATUS)"
fi

echo "🔍 Verificando Chatwoot..."
CHATWOOT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://chatwoot-multitenant-dev-1039900134024.southamerica-west1.run.app/)
if [ "$CHATWOOT_STATUS" = "200" ]; then
    echo "✅ Chatwoot: OK"
else
    echo "❌ Chatwoot: FALLO ($CHATWOOT_STATUS)"
fi

echo "🔍 Verificando conectividad con Supabase..."
# Test de conexión a base de datos
```

### **🔄 Plan de Rollback**

```bash
#!/bin/bash
# rollback-deployment.sh

echo "🚨 Iniciando rollback..."

# Rollback N8N
cd infrastructure/terraform/environments/dev
cp main.tf.backup main.tf
terraform apply -auto-approve

# Rollback Chatwoot
cd ../../../services/chatwoot-multitenant
cp main.tf.backup main.tf
terraform apply -auto-approve

echo "✅ Rollback completado"
```

## 📅 **Cronograma Recomendado**

### **🕐 Horario de Mantenimiento**
- **Mejor momento:** Domingo 2:00 AM - 4:00 AM (menor tráfico)
- **Duración estimada:** 30-45 minutos por servicio
- **Ventana de rollback:** 2 horas

### **📋 Checklist Pre-Actualización**
- [ ] Backup de base de datos completado
- [ ] Terraform plans revisados
- [ ] Scripts de rollback preparados
- [ ] Health checks configurados
- [ ] Comunicación a usuarios (si aplica)

### **📋 Checklist Post-Actualización**
- [ ] Health checks pasados
- [ ] Workflows N8N funcionando
- [ ] Chatwoot multitenant operativo
- [ ] Logs sin errores críticos
- [ ] Performance normal
- [ ] Backup de configuración nueva

## 🎯 **Mejores Prácticas**

### **🔒 Seguridad**
1. **Siempre hacer backup** antes de actualizar
2. **Probar en staging** si está disponible
3. **Actualizaciones incrementales** (no saltar múltiples versiones)
4. **Monitoreo activo** durante 24h post-actualización

### **⚡ Performance**
1. **Una actualización a la vez** (N8N primero, luego Chatwoot)
2. **Verificar recursos** de Cloud Run post-actualización
3. **Monitorear métricas** de respuesta y CPU
4. **Rollback inmediato** si degradación > 10%

### **📊 Monitoreo**
1. **Logs en tiempo real**: `gcloud logging tail`
2. **Métricas GCP**: Console de Cloud Run
3. **Health endpoints**: Automatizar checks cada 5min
4. **Alertas**: Configurar notificaciones para fallos

¿Te gustaría que implemente alguno de estos scripts específicos o necesitas más detalles sobre algún paso particular?
