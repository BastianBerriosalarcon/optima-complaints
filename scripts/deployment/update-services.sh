#!/bin/bash
# 🔄 Script de Actualización Segura para N8N y Chatwoot
# Implementa Blue-Green deployment con rollback automático

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# URLs de servicios
N8N_URL="https://n8n-optimacx-supabase-dev-1039900134024.southamerica-west1.run.app"
CHATWOOT_URL="https://chatwoot-multitenant-dev-1039900134024.southamerica-west1.run.app"

# Función para verificar estado de servicio
check_service_health() {
    local url=$1
    local service_name=$2
    
    log_info "Verificando $service_name..."
    
    local status=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$status" = "200" ]; then
        log_success "$service_name: OK (HTTP $status)"
        return 0
    else
        log_error "$service_name: FALLO (HTTP $status)"
        return 1
    fi
}

# Función para crear backup de configuración
backup_terraform_config() {
    local service=$1
    local timestamp=$(date +%Y%m%d_%H%M%S)
    
    log_info "Creando backup de configuración $service..."
    
    case $service in
        "n8n")
            cp infrastructure/terraform/environments/dev/main.tf \
               infrastructure/terraform/environments/dev/main.tf.backup_$timestamp
            ;;
        "chatwoot")
            cp infrastructure/terraform/services/chatwoot-multitenant/main.tf \
               infrastructure/terraform/services/chatwoot-multitenant/main.tf.backup_$timestamp
            cp infrastructure/terraform/modules/chatwoot-multitenant/main.tf \
               infrastructure/terraform/modules/chatwoot-multitenant/main.tf.backup_$timestamp
            ;;
    esac
    
    log_success "Backup creado para $service"
}

# Función para actualizar N8N
update_n8n() {
    local new_version=$1
    
    log_info "Actualizando N8N a versión $new_version..."
    
    # Backup de configuración
    backup_terraform_config "n8n"
    
    # Actualizar imagen en Terraform
    local tf_file="infrastructure/terraform/environments/dev/main.tf"
    sed -i "s|container_image.*=.*\".*n8n.*\"|container_image       = \"southamerica-west1-docker.pkg.dev/optima-cx-467616/n8n/n8n-multitenant:$new_version\"|" "$tf_file"
    
    # Aplicar cambios
    cd infrastructure/terraform/environments/dev
    
    log_info "Generando plan de Terraform..."
    terraform plan -out=n8n-update.tfplan
    
    log_info "Aplicando actualización..."
    terraform apply n8n-update.tfplan
    
    cd ../../..
    
    # Verificar actualización
    sleep 30  # Dar tiempo para que el servicio inicie
    
    if check_service_health "$N8N_URL" "N8N"; then
        log_success "N8N actualizado correctamente a $new_version"
        rm -f infrastructure/terraform/environments/dev/n8n-update.tfplan
        return 0
    else
        log_error "Falló la actualización de N8N"
        return 1
    fi
}

# Función para actualizar Chatwoot
update_chatwoot() {
    local new_version=$1
    
    log_info "Actualizando Chatwoot a versión $new_version..."
    
    # Backup de configuración
    backup_terraform_config "chatwoot"
    
    # Actualizar imagen en Terraform (ambos archivos)
    local tf_file1="infrastructure/terraform/services/chatwoot-multitenant/main.tf"
    local tf_file2="infrastructure/terraform/modules/chatwoot-multitenant/main.tf"
    
    sed -i "s|container_image.*=.*\"chatwoot/chatwoot:.*\"|container_image = \"chatwoot/chatwoot:$new_version\"|" "$tf_file1"
    sed -i "s|image.*=.*\"chatwoot/chatwoot:.*\"|image = \"chatwoot/chatwoot:$new_version\"|" "$tf_file2"
    
    # Aplicar cambios
    cd infrastructure/terraform/services/chatwoot-multitenant
    
    log_info "Generando plan de Terraform..."
    terraform plan -out=chatwoot-update.tfplan
    
    log_info "Aplicando actualización..."
    terraform apply chatwoot-update.tfplan
    
    cd ../../..
    
    # Verificar actualización
    sleep 60  # Chatwoot toma más tiempo en iniciar
    
    if check_service_health "$CHATWOOT_URL" "Chatwoot"; then
        log_success "Chatwoot actualizado correctamente a $new_version"
        rm -f infrastructure/terraform/services/chatwoot-multitenant/chatwoot-update.tfplan
        return 0
    else
        log_error "Falló la actualización de Chatwoot"
        return 1
    fi
}

# Función de rollback
rollback_service() {
    local service=$1
    
    log_warning "Iniciando rollback para $service..."
    
    case $service in
        "n8n")
            # Buscar último backup
            local backup_file=$(ls -t infrastructure/terraform/environments/dev/main.tf.backup_* 2>/dev/null | head -n1)
            if [ -n "$backup_file" ]; then
                cp "$backup_file" infrastructure/terraform/environments/dev/main.tf
                cd infrastructure/terraform/environments/dev
                terraform apply -auto-approve
                cd ../../..
                log_success "Rollback de N8N completado"
            else
                log_error "No se encontró backup para N8N"
            fi
            ;;
        "chatwoot")
            # Buscar últimos backups
            local backup_file1=$(ls -t infrastructure/terraform/services/chatwoot-multitenant/main.tf.backup_* 2>/dev/null | head -n1)
            local backup_file2=$(ls -t infrastructure/terraform/modules/chatwoot-multitenant/main.tf.backup_* 2>/dev/null | head -n1)
            
            if [ -n "$backup_file1" ] && [ -n "$backup_file2" ]; then
                cp "$backup_file1" infrastructure/terraform/services/chatwoot-multitenant/main.tf
                cp "$backup_file2" infrastructure/terraform/modules/chatwoot-multitenant/main.tf
                cd infrastructure/terraform/services/chatwoot-multitenant
                terraform apply -auto-approve
                cd ../../..
                log_success "Rollback de Chatwoot completado"
            else
                log_error "No se encontraron backups para Chatwoot"
            fi
            ;;
    esac
}

# Función principal
main() {
    log_info "🚀 Iniciando proceso de actualización segura"
    
    # Verificar estado inicial
    log_info "Verificando estado inicial de servicios..."
    check_service_health "$N8N_URL" "N8N" || { log_error "N8N no está disponible inicialmente"; exit 1; }
    check_service_health "$CHATWOOT_URL" "Chatwoot" || { log_error "Chatwoot no está disponible inicialmente"; exit 1; }
    
    # Parsear argumentos
    case $1 in
        "n8n")
            if [ -z "$2" ]; then
                log_error "Especifica la versión de N8N (ej: ./update-services.sh n8n latest)"
                exit 1
            fi
            
            if update_n8n "$2"; then
                log_success "Actualización de N8N completada exitosamente"
            else
                log_error "Falló la actualización de N8N, iniciando rollback..."
                rollback_service "n8n"
                exit 1
            fi
            ;;
        "chatwoot")
            if [ -z "$2" ]; then
                log_error "Especifica la versión de Chatwoot (ej: ./update-services.sh chatwoot v4.5.0)"
                exit 1
            fi
            
            if update_chatwoot "$2"; then
                log_success "Actualización de Chatwoot completada exitosamente"
            else
                log_error "Falló la actualización de Chatwoot, iniciando rollback..."
                rollback_service "chatwoot"
                exit 1
            fi
            ;;
        "both")
            if [ -z "$2" ] || [ -z "$3" ]; then
                log_error "Especifica ambas versiones (ej: ./update-services.sh both latest v4.5.0)"
                exit 1
            fi
            
            # Actualizar N8N primero
            if update_n8n "$2"; then
                log_success "N8N actualizado correctamente"
                
                # Luego Chatwoot
                if update_chatwoot "$3"; then
                    log_success "Ambos servicios actualizados exitosamente"
                else
                    log_error "Falló Chatwoot, haciendo rollback de ambos..."
                    rollback_service "chatwoot"
                    rollback_service "n8n"
                    exit 1
                fi
            else
                log_error "Falló N8N, cancelando actualización completa"
                rollback_service "n8n"
                exit 1
            fi
            ;;
        "health-check")
            log_info "Ejecutando health check..."
            check_service_health "$N8N_URL" "N8N"
            check_service_health "$CHATWOOT_URL" "Chatwoot"
            ;;
        *)
            echo "Uso: $0 {n8n|chatwoot|both|health-check} [version_n8n] [version_chatwoot]"
            echo ""
            echo "Ejemplos:"
            echo "  $0 n8n latest"
            echo "  $0 chatwoot v4.5.0"
            echo "  $0 both latest v4.5.0"
            echo "  $0 health-check"
            exit 1
            ;;
    esac
    
    log_success "🎉 Proceso completado exitosamente"
}

# Ejecutar función principal con todos los argumentos
main "$@"
