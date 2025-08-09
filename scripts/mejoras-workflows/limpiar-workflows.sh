#!/bin/bash

# Script para limpiar y preparar workflows antes de aplicar mejoras
# Corrige problemas de codificación y formato JSON

BUSINESS_DIR="/workspaces/optimacx-GCP/applications/workflows/business"
BACKUP_DIR="/workspaces/optimacx-GCP/temp/workflow-cleanup-backup"

echo "🧹 Limpiando y preparando workflows..."

# Crear backup
mkdir -p "$BACKUP_DIR"
cp -r "$BUSINESS_DIR" "$BACKUP_DIR/business-pre-cleanup-$(date +%Y%m%d-%H%M%S)"

# Función para limpiar un archivo JSON
clean_json_file() {
    local file="$1"
    local filename=$(basename "$file")
    
    echo "Limpiando: $filename"
    
    # Backup del archivo
    cp "$file" "${file}.cleanup.bak"
    
    # Limpiar caracteres de control y problemas de codificación
    # Remover caracteres de control (U+0000 a U+001F excepto \t, \n, \r)
    tr -d '\000-\010\013\014\016-\037' < "$file" > "${file}.temp"
    
    # Verificar si el resultado es JSON válido
    if jq empty "${file}.temp" 2>/dev/null; then
        # Si es válido, formatear JSON
        jq '.' "${file}.temp" > "$file" 2>/dev/null || {
            echo "⚠️  No se pudo formatear $filename, manteniendo versión limpia"
            mv "${file}.temp" "$file"
        }
        rm -f "${file}.temp"
        echo "✅ Limpiado: $filename"
    else
        echo "❌ Archivo sigue inválido después de limpieza: $filename"
        # Restaurar original si la limpieza falló
        mv "${file}.cleanup.bak" "$file"
        return 1
    fi
    
    return 0
}

# Contadores
total_files=0
cleaned_files=0
failed_files=0

# Procesar todos los archivos JSON
find "$BUSINESS_DIR" -name "*.json" -type f | while read -r file; do
    total_files=$((total_files + 1))
    
    if clean_json_file "$file"; then
        cleaned_files=$((cleaned_files + 1))
    else
        failed_files=$((failed_files + 1))
    fi
done

# Limpiar backups de limpieza
find "$BUSINESS_DIR" -name "*.cleanup.bak" -delete 2>/dev/null || true

echo ""
echo "🎉 LIMPIEZA COMPLETADA"
echo "======================"
echo "📄 Archivos procesados: $(find "$BUSINESS_DIR" -name "*.json" | wc -l)"
echo "✅ Archivos limpiados exitosamente"
echo "❌ Archivos con problemas persistentes (si los hay)"
echo ""
echo "💾 Backup disponible en: $BACKUP_DIR"
echo "🔄 Ahora puedes ejecutar las mejoras de workflows"
