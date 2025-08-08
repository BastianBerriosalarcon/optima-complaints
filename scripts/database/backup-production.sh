#!/bin/bash
# 🗃️ Script de Backup Automático para Supabase PostgreSQL
# Crea backups antes de actualizaciones críticas

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuración
BACKUP_DIR="database/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PROJECT_ID="optima-cx-467616"

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

# Función para backup de Supabase
backup_supabase() {
    log_info "Iniciando backup de Supabase PostgreSQL..."
    
    # Obtener credenciales de Supabase (desde variables de entorno o configuración)
    if [ -z "$SUPABASE_DB_URL" ]; then
        log_error "SUPABASE_DB_URL no está configurada"
        log_info "Configura: export SUPABASE_DB_URL='postgresql://postgres:[password]@[host]:5432/postgres'"
        exit 1
    fi
    
    local backup_file="$BACKUP_DIR/supabase_backup_$TIMESTAMP.sql"
    
    log_info "Creando backup en: $backup_file"
    
    # Realizar backup con pg_dump
    if pg_dump "$SUPABASE_DB_URL" \
        --schema=n8n_prod \
        --schema=chatwoot \
        --schema=rag_system \
        --data-only \
        --inserts \
        --verbose > "$backup_file" 2>/dev/null; then
        
        log_success "Backup completado: $backup_file"
        
        # Comprimir backup
        gzip "$backup_file"
        log_success "Backup comprimido: $backup_file.gz"
        
        # Mostrar tamaño
        local size=$(du -h "$backup_file.gz" | cut -f1)
        log_info "Tamaño del backup: $size"
        
        return 0
    else
        log_error "Falló el backup de Supabase"
        return 1
    fi
}

# Función para backup de configuraciones Terraform
backup_terraform() {
    log_info "Creando backup de configuraciones Terraform..."
    
    local terraform_backup_dir="$BACKUP_DIR/terraform_$TIMESTAMP"
    mkdir -p "$terraform_backup_dir"
    
    # Copiar archivos importantes de Terraform
    cp -r infrastructure/terraform/environments "$terraform_backup_dir/"
    cp -r infrastructure/terraform/services "$terraform_backup_dir/"
    cp -r infrastructure/terraform/modules "$terraform_backup_dir/"
    
    # Crear archivo tar comprimido
    tar -czf "$BACKUP_DIR/terraform_config_$TIMESTAMP.tar.gz" -C "$BACKUP_DIR" "terraform_$TIMESTAMP"
    rm -rf "$terraform_backup_dir"
    
    local size=$(du -h "$BACKUP_DIR/terraform_config_$TIMESTAMP.tar.gz" | cut -f1)
    log_success "Backup Terraform completado: terraform_config_$TIMESTAMP.tar.gz ($size)"
}

# Función para limpiar backups antiguos
cleanup_old_backups() {
    local days=${1:-7}  # Por defecto mantener 7 días
    
    log_info "Limpiando backups más antiguos de $days días..."
    
    # Limpiar backups SQL
    find "$BACKUP_DIR" -name "supabase_backup_*.sql.gz" -mtime +$days -delete 2>/dev/null || true
    
    # Limpiar backups Terraform
    find "$BACKUP_DIR" -name "terraform_config_*.tar.gz" -mtime +$days -delete 2>/dev/null || true
    
    log_success "Limpieza de backups completada"
}

# Función para listar backups existentes
list_backups() {
    log_info "Backups disponibles:"
    echo ""
    
    echo "📊 Backups de Base de Datos:"
    ls -lh "$BACKUP_DIR"/supabase_backup_*.sql.gz 2>/dev/null | awk '{print "  " $9 " - " $5 " - " $6 " " $7 " " $8}' || echo "  No hay backups de BD"
    
    echo ""
    echo "⚙️  Backups de Terraform:"
    ls -lh "$BACKUP_DIR"/terraform_config_*.tar.gz 2>/dev/null | awk '{print "  " $9 " - " $5 " - " $6 " " $7 " " $8}' || echo "  No hay backups de Terraform"
}

# Función para restaurar backup
restore_backup() {
    local backup_file=$1
    
    if [ -z "$backup_file" ]; then
        log_error "Especifica el archivo de backup a restaurar"
        list_backups
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        log_error "Archivo de backup no encontrado: $backup_file"
        exit 1
    fi
    
    log_info "Restaurando backup: $backup_file"
    
    # Descomprimir si es necesario
    if [[ "$backup_file" == *.gz ]]; then
        local temp_file="${backup_file%.gz}"
        gunzip -c "$backup_file" > "$temp_file"
        backup_file="$temp_file"
    fi
    
    # Restaurar a Supabase
    if [ -z "$SUPABASE_DB_URL" ]; then
        log_error "SUPABASE_DB_URL no está configurada para restauración"
        exit 1
    fi
    
    log_info "Restaurando a base de datos..."
    if psql "$SUPABASE_DB_URL" -f "$backup_file"; then
        log_success "Restauración completada exitosamente"
        
        # Limpiar archivo temporal si se descomprimió
        if [[ "$1" == *.gz ]]; then
            rm -f "$backup_file"
        fi
    else
        log_error "Falló la restauración"
        exit 1
    fi
}

# Función principal
main() {
    case $1 in
        "full")
            log_info "🗃️ Iniciando backup completo..."
            backup_supabase
            backup_terraform
            cleanup_old_backups 7
            log_success "🎉 Backup completo finalizado"
            ;;
        "database")
            backup_supabase
            ;;
        "terraform")
            backup_terraform
            ;;
        "list")
            list_backups
            ;;
        "cleanup")
            local days=${2:-7}
            cleanup_old_backups "$days"
            ;;
        "restore")
            restore_backup "$2"
            ;;
        *)
            echo "Uso: $0 {full|database|terraform|list|cleanup|restore} [options]"
            echo ""
            echo "Comandos:"
            echo "  full                    - Backup completo (BD + Terraform)"
            echo "  database               - Solo backup de base de datos"
            echo "  terraform              - Solo backup de configuraciones Terraform"
            echo "  list                   - Listar backups disponibles"
            echo "  cleanup [days]         - Limpiar backups antiguos (default: 7 días)"
            echo "  restore [backup_file]  - Restaurar desde backup específico"
            echo ""
            echo "Ejemplos:"
            echo "  $0 full"
            echo "  $0 database"
            echo "  $0 cleanup 14"
            echo "  $0 restore database/backups/supabase_backup_20250808_143000.sql.gz"
            echo ""
            echo "Configuración requerida:"
            echo "  export SUPABASE_DB_URL='postgresql://postgres:[password]@[host]:5432/postgres'"
            exit 1
            ;;
    esac
}

main "$@"
