# Guía de Actualización de Servicios

## Proceso de Actualización Recomendado

### 1. Preparación (5-10 minutos)

Antes de cualquier actualización, es crucial asegurar el estado actual y tener un respaldo.

```bash
# 1.1 Verificar estado actual de los servicios
./scripts/testing/monitor-services.sh health

# 1.2 Crear backup completo (Base de Datos + Configuración)
./scripts/database/backup-production.sh full

# 1.3 (Opcional) Verificar versiones disponibles de N8N
docker search n8nio/n8n --limit 5
```

### 2. Actualización del Servicio (15-30 minutos)

El proceso se centra en actualizar la imagen del contenedor en la configuración de Terraform y aplicar los cambios.

#### Paso 1: Actualizar Versión en Terraform

Modifica el archivo `main.tf` correspondiente al servicio que deseas actualizar (ej. N8N o el frontend) con la nueva versión de la imagen del contenedor.

```hcl
# Ejemplo en: infrastructure/terraform/environments/dev/main.tf

module "n8n_service" {
  source = "../../modules/cloud-run-service"
  
  # CAMBIAR ESTA LÍNEA
  container_image = "n8nio/n8n:1.45.1" # Reemplazar con la nueva versión
  # ... resto de la configuración
}
```

#### Paso 2: Planificar y Aplicar el Despliegue

Usa Terraform para desplegar la nueva versión de forma controlada.

```bash
# Navegar al directorio del entorno
cd infrastructure/terraform/environments/dev

# 2.1 Crear un plan de despliegue
terraform plan -out=update.tfplan

# 2.2 (Opcional) Revisar los cambios que se aplicarán
terraform show update.tfplan

# 2.3 Aplicar la actualización
# Terraform gestionará el despliegue de la nueva versión y dará de baja la antigua.
terraform apply "update.tfplan"
```

### 3. Verificación y Monitoreo (30-60 minutos)

Una vez aplicado el cambio, verifica que todo siga funcionando correctamente.

```bash
# 3.1 Verificación rápida de salud del servicio
./scripts/testing/monitor-services.sh quick

# 3.2 Monitoreo extendido por 30 minutos para detectar problemas
./scripts/testing/monitor-services.sh monitor 30

# 3.3 Revisar logs en busca de errores
gcloud run services logs read <SERVICE_NAME> --region=southamerica-west1 --limit=100
```

## Procedimientos de Seguridad y Rollback

### Health Checks

El script de health check valida que los endpoints principales de los servicios estén respondiendo correctamente.

```bash
#!/bin/bash
# scripts/testing/monitor-services.sh (versión simplificada)

echo "Verificando N8N..."
N8N_STATUS=$(curl -s -o /dev/null -w "%{http_code}" <URL_N8N>)
if [ "$N8N_STATUS" = "200" ]; then
    echo "N8N: OK"
else
    echo "N8N: FALLO ($N8N_STATUS)"
fi

echo "Verificando Frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" <URL_FRONTEND>)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "Frontend: OK"
else
    echo "Frontend: FALLO ($FRONTEND_STATUS)"
fi
```

### Plan de Rollback

Si la nueva versión presenta problemas, puedes revertir al estado anterior usando el backup de Terraform.

```bash
# 1. Restaurar el archivo de backup de Terraform
# (Los scripts de deploy deberían crear backups automáticos)
cp main.tf.backup main.tf

# 2. Aplicar la configuración anterior
terraform apply -auto-approve

echo "Rollback completado a la versión anterior."
```

## Checklist de Actualización

### Pre-Actualización
- [ ] Backup de base de datos y configuración completado.
- [ ] Plan de Terraform revisado.
- [ ] Ventana de mantenimiento comunicada (si aplica).

### Post-Actualización
- [ ] Health checks automáticos pasaron correctamente.
- [ ] Verificación manual de funcionalidades críticas (ej. crear un reclamo).
- [ ] Monitoreo de logs durante 1 hora sin errores críticos.
- [ ] Performance del servicio dentro de los rangos normales.

