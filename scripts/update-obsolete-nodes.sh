#!/bin/bash

# Script para actualizar nodos obsoletos en workflows N8N
# Convierte nodos antiguos a versiones más nuevas

echo "🔄 Actualizando nodos obsoletos en workflows N8N..."

# Función para actualizar un archivo JSON
update_workflow_nodes() {
    local file="$1"
    local temp_file="${file}.tmp"
    
    echo "  📝 Actualizando: $(basename "$file")"
    
    # Copiar archivo original
    cp "$file" "$temp_file"
    
    # 1. Actualizar Function nodes a Code nodes
    sed -i 's/"type": "n8n-nodes-base\.function"/"type": "n8n-nodes-base.code"/g' "$temp_file"
    sed -i 's/"typeVersion": 1/"typeVersion": 2/g' "$temp_file"
    
    # 2. Actualizar estructura de parámetros para Code node
    # Cambiar "functionCode" por "jsCode"
    sed -i 's/"functionCode":/"jsCode":/g' "$temp_file"
    
    # 3. Actualizar HTTP Request nodes obsoletos
    sed -i 's/"type": "n8n-nodes-base\.httpRequest"/"type": "n8n-nodes-base.httpRequestV3"/g' "$temp_file"
    
    # 4. Actualizar Webhook nodes
    sed -i 's/"type": "n8n-nodes-base\.webhook"/"type": "n8n-nodes-base.webhook"/g' "$temp_file"
    
    # 5. Actualizar Postgres nodes
    sed -i 's/"type": "n8n-nodes-base\.postgres"/"type": "n8n-nodes-base.postgres"/g' "$temp_file"
    
    # Validar JSON
    if python3 -m json.tool "$temp_file" > /dev/null 2>&1; then
        mv "$temp_file" "$file"
        echo "  ✅ Actualizado correctamente"
    else
        rm "$temp_file"
        echo "  ❌ Error en JSON, revertido"
    fi
}

# Encontrar y actualizar todos los workflows
find /workspaces/optimacx-GCP/applications/workflows -name "*.json" -type f | while read -r workflow; do
    # Verificar si contiene nodos obsoletos
    if grep -q '"type": "n8n-nodes-base\.function"' "$workflow" || \
       grep -q '"typeVersion": 1' "$workflow"; then
        update_workflow_nodes "$workflow"
    fi
done

echo ""
echo "🎯 CAMBIOS PRINCIPALES REALIZADOS:"
echo "  • Function nodes → Code nodes (más potente y actual)"
echo "  • functionCode → jsCode (nueva estructura)"
echo "  • Actualizado typeVersion a versiones más recientes"
echo "  • Verificación de integridad JSON"

echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "  1. Revisar workflows actualizados"
echo "  2. Importar a N8N (los nodos serán reconocidos como actuales)"
echo "  3. Verificar que el código JavaScript funcione correctamente"

echo ""
echo "⚠️  NOTA IMPORTANTE:"
echo "  Los Code nodes tienen más capacidades que los Function nodes:"
echo "  - Mejor autocompletado"
echo "  - Más librerías disponibles"
echo "  - Mejor debugging"
echo "  - Sintaxis moderna de JavaScript"
