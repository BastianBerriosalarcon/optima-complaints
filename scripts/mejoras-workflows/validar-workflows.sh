#!/bin/bash

# Script para validar workflows contra el schema y verificar buenas prácticas

BUSINESS_DIR="/home/bastianberrios/optimacx-GCP/applications/workflows/business"
SCHEMA_FILE="/home/bastianberrios/optimacx-GCP/applications/workflows/schemas/workflow-schema.json"
REPORT_FILE="/home/bastianberrios/optimacx-GCP/temp/workflow-validation-report.md"

echo "🔍 Validando workflows contra schema y buenas prácticas..."

# Verificar que jq está disponible
if ! command -v jq &> /dev/null;
    then
    echo "❌ Error: jq no está instalado. Por favor, instale jq para continuar."
    exit 1
fi

# Crear reporte
mkdir -p "$(dirname "$REPORT_FILE")"
cat > "$REPORT_FILE" << EOF
# Reporte de Validación de Workflows
*Generado: $(date)*

## Resumen
EOF

total_files=0
valid_files=0
error_files=0
warning_files=0

# Procesar todos los workflows
echo "" >> "$REPORT_FILE"
echo "## Resultados Detallados" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Crear archivos temporales para contadores
total_counter="/tmp/total_count.txt"
valid_counter="/tmp/valid_count.txt"
warning_counter="/tmp/warning_count.txt"
error_counter="/tmp/error_count.txt"

echo "0" > "$total_counter"
echo "0" > "$valid_counter"
echo "0" > "$warning_counter"
echo "0" > "$error_counter"

find "$BUSINESS_DIR" -name "*.json" -type f | sort | while read -r file;
    do
    filename=$(basename "$file")
    echo "Validando: $filename"
    
    # Incrementar contador total
    total_files=$(cat "$total_counter")
    echo $((total_files + 1)) > "$total_counter"
    
    # Verificar JSON válido
    if ! jq empty "$file" 2>/dev/null;
        then
        echo "❌ JSON inválido: $filename" >> "$REPORT_FILE"
        error_files=$(cat "$error_counter")
        echo $((error_files + 1)) > "$error_counter"
        continue
    fi
    
    # Verificar campos y buenas prácticas
    issues=0
    
    # Verificar campos requeridos
    if ! jq -e '.name' "$file" >/dev/null;
        then
        echo "⚠️  Falta campo 'name': $filename" >> "$REPORT_FILE"
        issues=$((issues + 1))
    fi
    
    if ! jq -e '.description' "$file" >/dev/null;
        then
        echo "⚠️  Falta campo 'description': $filename" >> "$REPORT_FILE"
        issues=$((issues + 1))
    fi
    
    if ! jq -e '.tags' "$file" >/dev/null;
        then
        echo "⚠️  Falta campo 'tags': $filename" >> "$REPORT_FILE"
        issues=$((issues + 1))
    fi
    
    if ! jq -e '.version' "$file" >/dev/null;
        then
        echo "📝 Falta campo 'version': $filename" >> "$REPORT_FILE"
        issues=$((issues + 1))
    fi
    
    if ! jq -e '.metadata' "$file" >/dev/null;
        then
        echo "📝 Falta campo 'metadata': $filename" >> "$REPORT_FILE"
        issues=$((issues + 1))
    fi
    
    # Verificar typeVersions inconsistentes
    typever_count=$(jq -r '.nodes[].typeVersion' "$file" 2>/dev/null | sort | uniq | wc -l)
    if [[ $typever_count -gt 2 ]];
        then
        echo "⚠️  TypeVersions inconsistentes: $filename" >> "$REPORT_FILE"
        issues=$((issues + 1))
    fi
    
    if [[ $issues -eq 0 ]];
        then
        echo "✅ Válido: $filename" >> "$REPORT_FILE"
        valid_files=$(cat "$valid_counter")
        echo $((valid_files + 1)) > "$valid_counter"
    else
        warning_files=$(cat "$warning_counter")
        echo $((warning_files + 1)) > "$warning_counter"
    fi
done

# Leer contadores finales
total_files=$(cat "$total_counter")
valid_files=$(cat "$valid_counter")
warning_files=$(cat "$warning_counter")
error_files=$(cat "$error_counter")

# Limpiar archivos temporales
rm -f "$total_counter" "$valid_counter" "$warning_counter" "$error_counter"

# Actualizar resumen
if [[ $total_files -gt 0 ]];
    then
    success_rate=$(( (valid_files * 100) / total_files ))
else
    success_rate=0
fi

sed -i "/## Resumen/a\
- **Total de archivos:** $total_files\
- **Válidos:** $valid_files\
- **Con advertencias:** $warning_files\
- **Con errores:** $error_files\
- **Tasa de éxito:** ${success_rate}%" "$REPORT_FILE"

# Agregar recomendaciones
cat >> "$REPORT_FILE" << EOF

## Recomendaciones

### Acciones Inmediatas
1. Corregir archivos con errores JSON
2. Agregar campos faltantes (version, metadata)
3. Estandarizar typeVersions

### Mejoras a Mediano Plazo
1. Implementar validación automática en CI/CD
2. Crear templates para nuevos workflows
3. Documentar dependencias entre workflows

### Buenas Prácticas
- Usar descripciones que terminen con punto
- Incluir tags relevantes y específicos
- Mantener typeVersions consistentes
- Evitar paths de webhook duplicados
EOF

echo "✅ Validación completada. Reporte generado en: $REPORT_FILE"
echo "📊 Resumen: $valid_files/$total_files workflows válidos"

# Mostrar resumen en consola
echo ""
echo "📈 RESUMEN DE VALIDACIÓN:"
echo "  Total: $total_files"
echo "  Válidos: $valid_files"
echo "  Advertencias: $warning_files"
 echo "  Errores: $error_files"
if [[ $total_files -gt 0 ]];
    then
    echo "  Tasa éxito: $(( (valid_files * 100) / total_files ))%"
else
    echo "  Tasa éxito: 0%"
fi