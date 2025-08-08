# 🚀 Guía Rápida: Actualización de Servicios

## ⚡ **Comandos Esenciales**

### **1. Health Check Rápido**
```bash
# Verificar estado actual
./scripts/testing/monitor-services.sh quick

# Health check completo
./scripts/testing/monitor-services.sh health
```

### **2. Backup Antes de Actualizar**
```bash
# Backup completo (recomendado)
./scripts/database/backup-production.sh full

# Solo base de datos
./scripts/database/backup-production.sh database
```

### **3. Actualizar Servicios**
```bash
# Actualizar solo N8N
./scripts/deployment/update-services.sh n8n latest

# Actualizar solo Chatwoot
./scripts/deployment/update-services.sh chatwoot v4.5.0

# Actualizar ambos (N8N primero, luego Chatwoot)
./scripts/deployment/update-services.sh both latest v4.5.0
```

### **4. Monitoreo Post-Actualización**
```bash
# Monitoreo continuo por 30 minutos
./scripts/testing/monitor-services.sh monitor 30

# Test de carga
./scripts/testing/monitor-services.sh load 20

# Ver logs recientes
./scripts/testing/monitor-services.sh logs 10
```

## 🛡️ **Proceso Recomendado Step-by-Step**

### **Preparación (5 minutos)**
```bash
# 1. Verificar estado actual
./scripts/testing/monitor-services.sh health

# 2. Crear backup completo
./scripts/database/backup-production.sh full

# 3. Verificar versiones disponibles
docker search n8nio/n8n --limit 3
curl -s https://api.github.com/repos/chatwoot/chatwoot/releases/latest | jq .tag_name
```

### **Actualización (15-30 minutos)**
```bash
# 4. Actualizar N8N primero
./scripts/deployment/update-services.sh n8n latest

# 5. Verificar N8N funcionando
./scripts/testing/monitor-services.sh quick

# 6. Actualizar Chatwoot
./scripts/deployment/update-services.sh chatwoot v4.5.0

# 7. Verificación final
./scripts/testing/monitor-services.sh health
```

### **Monitoreo (30-60 minutos)**
```bash
# 8. Monitoreo extendido
./scripts/testing/monitor-services.sh monitor 60 30

# 9. Test de carga
./scripts/testing/monitor-services.sh load 50
```

## 🚨 **En Caso de Problemas**

### **Rollback Automático**
- Los scripts incluyen rollback automático si falla la actualización
- Se restauran las configuraciones Terraform previas
- Los servicios vuelven a la versión anterior

### **Rollback Manual**
```bash
# Si necesitas rollback manual
cd infrastructure/terraform/environments/dev
cp main.tf.backup_[TIMESTAMP] main.tf
terraform apply -auto-approve

cd ../../services/chatwoot-multitenant  
cp main.tf.backup_[TIMESTAMP] main.tf
terraform apply -auto-approve
```

### **Restaurar Base de Datos**
```bash
# Listar backups disponibles
./scripts/database/backup-production.sh list

# Restaurar backup específico
./scripts/database/backup-production.sh restore database/backups/supabase_backup_20250808_143000.sql.gz
```

## 📊 **Monitoreo de Versiones Actuales**

### **Verificar Versiones Desplegadas**
```bash
# Ver imagen actual de N8N
gcloud run services describe n8n-optimacx-supabase \
  --region=southamerica-west1 \
  --format="value(spec.template.spec.containers[0].image)"

# Ver imagen actual de Chatwoot  
gcloud run services describe chatwoot-multitenant-dev \
  --region=southamerica-west1 \
  --format="value(spec.template.spec.containers[0].image)"
```

## ⚙️ **Configuración de Variables**

### **Variables de Entorno Necesarias**
```bash
# Para backups de base de datos
export SUPABASE_DB_URL='postgresql://postgres:[password]@[host]:5432/postgres'

# Para tests de conectividad (opcional)
export SUPABASE_URL='https://[project].supabase.co'
export SUPABASE_ANON_KEY='[your-anon-key]'
```

## 🎯 **Checklist de Actualización**

### **Antes de Actualizar**
- [ ] ✅ Servicios funcionando correctamente
- [ ] ✅ Backup completo creado
- [ ] ✅ Versiones objetivo verificadas
- [ ] ✅ Ventana de mantenimiento planificada
- [ ] ✅ Scripts de rollback preparados

### **Durante la Actualización**
- [ ] ✅ Un servicio a la vez
- [ ] ✅ Health checks entre actualizaciones
- [ ] ✅ Logs monitoreados
- [ ] ✅ Tiempo de respuesta verificado

### **Después de Actualizar**
- [ ] ✅ Health check completo pasado
- [ ] ✅ Test de carga exitoso
- [ ] ✅ Logs sin errores críticos
- [ ] ✅ Monitoreo extendido por 1 hora
- [ ] ✅ Documentación actualizada

## 📈 **Mejores Prácticas**

### **Timing**
- **Mejor momento:** Domingo 2:00-4:00 AM
- **Evitar:** Viernes y días previos a feriados
- **Duración:** 30-45 min por servicio

### **Seguridad**
- **Siempre backup** antes de cualquier cambio
- **Una versión a la vez** (no saltar múltiples versiones)
- **Rollback inmediato** si degradación > 10%

### **Comunicación**
- **Notificar usuarios** con 24h anticipación
- **Status page** actualizada durante mantenimiento
- **Confirmación** post-actualización a stakeholders

---

💡 **Tip:** Guarda estos comandos en tu `.bashrc` para acceso rápido:
```bash
alias health-check='./scripts/testing/monitor-services.sh quick'
alias backup-db='./scripts/database/backup-production.sh full'
alias update-n8n='./scripts/deployment/update-services.sh n8n'
alias update-chatwoot='./scripts/deployment/update-services.sh chatwoot'
```
