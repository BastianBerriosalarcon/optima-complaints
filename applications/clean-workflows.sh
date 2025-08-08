#!/bin/bash

# 🧹 Script para limpiar console.log de workflows OptimaCX
# Elimina líneas de console.log pero preserva la estructura JSON

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧹 Limpiando console.log de workflows OptimaCX...${NC}"
echo "=================================================="

# Directorio de workflows
WORKFLOWS_DIR="/workspaces/optimacx-GCP/applications/workflows"

# Contadores
total_files=0
modified_files=0
total_logs_removed=0

# Función para procesar archivos JSON
process_json_file() {
    local file="$1"
    local temp_file=$(mktemp)
    local logs_in_file=0
    
    # Contar console.log en el archivo
    logs_in_file=$(grep -o "console\.log" "$file" 2>/dev/null | wc -l)
    
    if [ "$logs_in_file" -gt 0 ]; then
        echo -e "${YELLOW}📄 Procesando: ${file##*/}${NC} (${logs_in_file} console.log encontrados)"
        
        # Crear versión limpia del archivo
        # Eliminar líneas que contienen console.log
        grep -v "console\.log" "$file" > "$temp_file"
        
        # Verificar que el archivo no está vacío
        if [ -s "$temp_file" ]; then
            mv "$temp_file" "$file"
            ((modified_files++))
            total_logs_removed=$((total_logs_removed + logs_in_file))
            echo -e "${GREEN}✅ Limpiado: ${logs_in_file} logs eliminados${NC}"
        else
            echo -e "${RED}❌ Error: Archivo vacío después de limpieza, conservando original${NC}"
            rm "$temp_file"
        fi
    else
        rm "$temp_file"
    fi
    
    ((total_files++))
}

# Buscar y procesar todos los archivos JSON en workflows
echo -e "${BLUE}🔍 Buscando archivos JSON en workflows...${NC}"

while IFS= read -r -d '' file; do
    process_json_file "$file"
done < <(find "$WORKFLOWS_DIR" -name "*.json" -type f -print0)

echo ""
echo "=============================================="
echo -e "${GREEN}📊 RESUMEN DE LIMPIEZA:${NC}"
echo "=============================================="
echo -e "Archivos procesados:     ${BLUE}${total_files}${NC}"
echo -e "Archivos modificados:    ${GREEN}${modified_files}${NC}"
echo -e "Console.log eliminados:  ${YELLOW}${total_logs_removed}${NC}"

if [ "$modified_files" -gt 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 Limpieza completada exitosamente!${NC}"
    echo ""
    echo "📋 Próximos pasos recomendados:"
    echo "  1. Revisar cambios: git diff"
    echo "  2. Probar workflows en desarrollo"
    echo "  3. Commit cambios: git add . && git commit -m \"🧹 Limpiar console.log de workflows\""
else
    echo ""
    echo -e "${BLUE}ℹ️  No se encontraron console.log para eliminar${NC}"
fi

echo ""
