#!/bin/bash

# Script para analizar y validar workflows en su ubicación original
# Documenta resultados en tests/

WORKFLOWS_DIR="/workspaces/optimacx-GCP/applications/workflows"
TESTS_DIR="/workspaces/optimacx-GCP/applications/workflows/tests"
BUSINESS_DIR="$WORKFLOWS_DIR/business"

echo "🔍 ANÁLISIS COMPLETO DE WORKFLOWS OPTIMACX"
echo "=========================================="
echo ""

# Crear estructura de tests
mkdir -p "$TESTS_DIR/reports"
mkdir -p "$TESTS_DIR/validation"

# Archivo de reporte principal
MAIN_REPORT="$TESTS_DIR/workflow-analysis-$(date +%Y%m%d-%H%M%S).md"

cat > "$MAIN_REPORT" << 'EOF'
# 📊 Análisis Completo de Workflows OptimaCX

*Generado automáticamente el $(date)*

## 🎯 Resumen Ejecutivo

### Estructura Actual:
- **Business Workflows**: Automatizaciones de procesos de negocio
- **Utils**: Utilidades y servicios compartidos
- **Templates**: Plantillas reutilizables
- **Config**: Configuraciones de ambiente
- **Tests**: Pruebas y validaciones

EOF

echo "## 📋 Inventario de Workflows por Categoría" >> "$MAIN_REPORT"
echo "" >> "$MAIN_REPORT"

# Función para validar JSON
validate_json() {
    local file="$1"
    if jq empty "$file" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Función para analizar una categoría
analyze_category() {
    local category="$1"
    local path="$2"
    
    echo "🔸 **$category**" >> "$MAIN_REPORT"
    
    if [[ ! -d "$path" ]]; then
        echo "   - ❌ Directorio no existe" >> "$MAIN_REPORT"
        return
    fi
    
    local total_files=0
    local valid_files=0
    local invalid_files=0
    
    while read -r file; do
        if [[ -f "$file" && "$file" =~ \.json$ && ! "$file" =~ \.bak$ ]]; then
            total_files=$((total_files + 1))
            filename=$(basename "$file")
            
            if validate_json "$file"; then
                echo "   - ✅ $filename" >> "$MAIN_REPORT"
                valid_files=$((valid_files + 1))
            else
                echo "   - ❌ $filename (JSON inválido)" >> "$MAIN_REPORT"
                invalid_files=$((invalid_files + 1))
            fi
        fi
    done < <(find "$path" -name "*.json" | sort)
    
    echo "   - **Total**: $total_files | **Válidos**: $valid_files | **Inválidos**: $invalid_files" >> "$MAIN_REPORT"
    echo "" >> "$MAIN_REPORT"
    
    # Devolver contadores globales
    echo "$total_files $valid_files $invalid_files"
}

# Analizar categorías principales
echo "📊 Analizando categorías de workflows..."

total_workflows=0
total_valid=0
total_invalid=0

# Business workflows
if [[ -d "$BUSINESS_DIR" ]]; then
    for category in "$BUSINESS_DIR"/*; do
        if [[ -d "$category" ]]; then
            category_name=$(basename "$category")
            echo "Analizando: $category_name"
            
            result=$(analyze_category "$category_name" "$category")
            read -r cat_total cat_valid cat_invalid <<< "$result"
            
            total_workflows=$((total_workflows + cat_total))
            total_valid=$((total_valid + cat_valid))
            total_invalid=$((total_invalid + cat_invalid))
        fi
    done
fi

# Utils
echo "Analizando: utils"
utils_result=$(analyze_category "Utils" "$WORKFLOWS_DIR/utils")
read -r utils_total utils_valid utils_invalid <<< "$utils_result"
total_workflows=$((total_workflows + utils_total))
total_valid=$((total_valid + utils_valid))
total_invalid=$((total_invalid + utils_invalid))

# Templates
echo "Analizando: templates"
templates_result=$(analyze_category "Templates" "$WORKFLOWS_DIR/templates")
read -r temp_total temp_valid temp_invalid <<< "$templates_result"
total_workflows=$((total_workflows + temp_total))
total_valid=$((total_valid + temp_valid))
total_invalid=$((total_invalid + temp_invalid))

# Agregar resumen final
cat >> "$MAIN_REPORT" << EOF

## 📈 Resumen Final

### Métricas Globales:
- **Total de workflows**: $total_workflows
- **Workflows válidos**: $total_valid ($(( total_valid * 100 / total_workflows ))%)
- **Workflows con problemas**: $total_invalid ($(( total_invalid * 100 / total_workflows ))%)

### Estado de Calidad:
EOF

if [[ $total_invalid -eq 0 ]]; then
    echo "- 🎉 **EXCELENTE**: Todos los workflows tienen JSON válido" >> "$MAIN_REPORT"
elif [[ $total_invalid -lt 5 ]]; then
    echo "- ✅ **BUENO**: Solo $total_invalid workflows necesitan corrección" >> "$MAIN_REPORT"
elif [[ $total_invalid -lt 15 ]]; then
    echo "- ⚠️ **REGULAR**: $total_invalid workflows necesitan atención" >> "$MAIN_REPORT"
else
    echo "- ❌ **CRÍTICO**: $total_invalid workflows requieren corrección urgente" >> "$MAIN_REPORT"
fi

cat >> "$MAIN_REPORT" << 'EOF'

## 🎯 Recomendaciones

### Acciones Inmediatas:
1. **Corregir workflows con JSON inválido**
2. **Validar dependencias entre workflows**
3. **Estandarizar naming conventions**

### Optimizaciones Estructurales:
1. **Organizar por prioridad de importación**
2. **Crear documentación de dependencias**
3. **Implementar tests automáticos**

### Próximos Pasos:
1. **Preparar orden de importación a n8n**
2. **Crear scripts de validación continua**
3. **Documentar configuraciones requeridas**

---
*Reporte generado por el sistema de análisis de workflows OptimaCX*
EOF

echo ""
echo "✅ ANÁLISIS COMPLETADO"
echo "======================"
echo "📊 Total workflows: $total_workflows"
echo "✅ Válidos: $total_valid"
echo "❌ Con problemas: $total_invalid"
echo ""
echo "📄 Reporte completo guardado en:"
echo "   $MAIN_REPORT"
echo ""
echo "🔄 Ejecutando validación detallada..."

# Crear reporte de validación detallada
VALIDATION_REPORT="$TESTS_DIR/validation/detailed-validation-$(date +%Y%m%d-%H%M%S).json"

{
    echo "{"
    echo '  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",'
    echo '  "total_workflows": '$total_workflows','
    echo '  "valid_workflows": '$total_valid','
    echo '  "invalid_workflows": '$total_invalid','
    echo '  "categories": {'
    
    first_cat=true
    for category in "$BUSINESS_DIR"/*; do
        if [[ -d "$category" ]]; then
            category_name=$(basename "$category")
            
            if [[ "$first_cat" = false ]]; then
                echo ","
            fi
            first_cat=false
            
            echo -n '    "'$category_name'": ['
            
            first_file=true
            find "$category" -name "*.json" -not -name "*.bak" | sort | while read -r file; do
                if [[ "$first_file" = false ]]; then
                    echo ","
                fi
                first_file=false
                
                filename=$(basename "$file")
                if validate_json "$file"; then
                    status="valid"
                else
                    status="invalid"
                fi
                
                echo -n '      {"name": "'$filename'", "status": "'$status'"}'
            done
            
            echo -n "]"
        fi
    done
    
    echo ""
    echo "  }"
    echo "}"
} > "$VALIDATION_REPORT"

echo "📋 Reporte de validación JSON guardado en:"
echo "   $VALIDATION_REPORT"
