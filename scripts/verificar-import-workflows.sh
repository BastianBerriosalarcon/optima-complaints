#!/bin/bash

# Script para verificar workflows listos para importación a n8n

IMPORT_DIR="/workspaces/optimacx-GCP/n8n-import"
REPORT_FILE="$IMPORT_DIR/validation-report.txt"

echo "🔍 Verificando workflows listos para importación a n8n..."
echo "📁 Directorio: $IMPORT_DIR"
echo ""

# Crear reporte
cat > "$REPORT_FILE" << EOF
# Reporte de Validación - Workflows para Importación n8n
Generado: $(date)

## Resumen de Validación
EOF

total_workflows=0
valid_workflows=0
invalid_workflows=0

# Función para validar un workflow
validate_workflow() {
    local file="$1"
    local filename=$(basename "$file")
    local category=$(basename $(dirname "$file"))
    
    total_workflows=$((total_workflows + 1))
    
    echo "Validando: $category/$filename"
    
    # Verificar JSON válido
    if jq empty "$file" 2>/dev/null; then
        # Verificar campos esenciales para n8n
        local has_name=$(jq -e '.name' "$file" >/dev/null 2>&1 && echo "yes" || echo "no")
        local has_nodes=$(jq -e '.nodes' "$file" >/dev/null 2>&1 && echo "yes" || echo "no")
        local has_connections=$(jq -e '.connections' "$file" >/dev/null 2>&1 && echo "yes" || echo "no")
        
        if [[ "$has_name" == "yes" && "$has_nodes" == "yes" && "$has_connections" == "yes" ]]; then
            echo "✅ VÁLIDO: $category/$filename" >> "$REPORT_FILE"
            valid_workflows=$((valid_workflows + 1))
            
            # Información adicional
            local node_count=$(jq '.nodes | length' "$file")
            local workflow_name=$(jq -r '.name' "$file")
            echo "   - Nombre: $workflow_name" >> "$REPORT_FILE"
            echo "   - Nodos: $node_count" >> "$REPORT_FILE"
            echo "" >> "$REPORT_FILE"
        else
            echo "⚠️  CAMPOS FALTANTES: $category/$filename" >> "$REPORT_FILE"
            echo "   - name: $has_name, nodes: $has_nodes, connections: $has_connections" >> "$REPORT_FILE"
            echo "" >> "$REPORT_FILE"
            invalid_workflows=$((invalid_workflows + 1))
        fi
    else
        echo "❌ JSON INVÁLIDO: $category/$filename" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        invalid_workflows=$((invalid_workflows + 1))
    fi
}

# Validar todos los workflows en subdirectorios
find "$IMPORT_DIR" -name "*.json" -type f | sort | while read -r file; do
    validate_workflow "$file"
done

# Contar archivos después del procesamiento
total_workflows=$(find "$IMPORT_DIR" -name "*.json" -type f | wc -l)

# Actualizar estadísticas en el reporte
sed -i "/## Resumen de Validación/a\\
\\
**📊 Estadísticas:**\\
- Total workflows: $total_workflows\\
- ✅ Válidos para n8n: $(grep "✅ VÁLIDO" "$REPORT_FILE" | wc -l)\\
- ⚠️  Con advertencias: $(grep "⚠️" "$REPORT_FILE" | wc -l)\\
- ❌ Con errores: $(grep "❌" "$REPORT_FILE" | wc -l)\\
\\
**📁 Distribución por Categoría:**" "$REPORT_FILE"

# Agregar distribución por categoría
for dir in "$IMPORT_DIR"/*/; do
    if [[ -d "$dir" && "$dir" != "$IMPORT_DIR/." && "$dir" != "$IMPORT_DIR/.." ]]; then
        category=$(basename "$dir")
        count=$(find "$dir" -name "*.json" | wc -l)
        if [[ $count -gt 0 ]]; then
            echo "- $category: $count workflows" >> "$REPORT_FILE"
        fi
    fi
done

echo "" >> "$REPORT_FILE"
echo "## Workflows Validados" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Mostrar estructura final
echo ""
echo "📁 ESTRUCTURA DE IMPORTACIÓN:"
tree "$IMPORT_DIR" -I "*.md|*.txt"

echo ""
echo "📊 RESUMEN FINAL:"
echo "  Total workflows: $total_workflows"
echo "  ✅ Listos para n8n: $(grep "✅ VÁLIDO" "$REPORT_FILE" | wc -l 2>/dev/null || echo "0")"
echo "  ⚠️  Con advertencias: $(grep "⚠️" "$REPORT_FILE" | wc -l 2>/dev/null || echo "0")" 
echo "  ❌ Con errores: $(grep "❌" "$REPORT_FILE" | wc -l 2>/dev/null || echo "0")"

echo ""
echo "📄 Reporte completo disponible en: $REPORT_FILE"
echo "📋 Manifiesto de importación: $IMPORT_DIR/IMPORT-MANIFEST.md"
echo ""
echo "🚀 ¡Workflows organizados y listos para importación a n8n!"
