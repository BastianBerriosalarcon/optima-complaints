#!/bin/bash

# Script para estandarizar TypeVersions en workflows de negocio
# Actualiza versiones antiguas a la más reciente (2.1)

BUSINESS_DIR="/workspaces/optimacx-GCP/applications/workflows/business"
BACKUP_DIR="/workspaces/optimacx-GCP/temp/workflow-backup"

echo "🔧 Estandarizando TypeVersions en workflows de negocio..."

# Crear backup
mkdir -p "$BACKUP_DIR"
cp -r "$BUSINESS_DIR" "$BACKUP_DIR/business-$(date +%Y%m%d-%H%M%S)"

# Función para actualizar versiones
update_versions() {
    local file="$1"
    echo "Procesando: $file"
    
    # Backup del archivo individual
    cp "$file" "${file}.bak"
    
    # Actualizar typeVersion 1 a 2.1 (excepto para algunos nodos específicos)
    sed -i 's/"typeVersion": 1,/"typeVersion": 2.1,/g' "$file"
    sed -i 's/"typeVersion": 1\.1,/"typeVersion": 2.1,/g' "$file"
    sed -i 's/"typeVersion": 2,/"typeVersion": 2.1,/g' "$file"
    
    # Casos especiales que deben mantenerse en versión específica
    # Webhook nodes en versión 1 pueden quedarse
    sed -i 's/"type": "n8n-nodes-base\.webhook".*"typeVersion": 2\.1/"type": "n8n-nodes-base.webhook",\n      "typeVersion": 2.1/g' "$file"
}

# Encontrar y procesar todos los archivos JSON
find "$BUSINESS_DIR" -name "*.json" -type f | while read -r file; do
    update_versions "$file"
done

echo "✅ Estandarización completada. Backups creados en $BACKUP_DIR"
echo "💡 Revisa los cambios antes de commitear."
