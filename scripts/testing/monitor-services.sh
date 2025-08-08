#!/bin/bash
# 📊 Monitor de Servicios Post-Actualización
# Monitorea N8N y Chatwoot después de actualizaciones

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')]${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')]${NC} $1"
}

# URLs y configuración
N8N_URL="https://n8n-optimacx-supabase-dev-1039900134024.southamerica-west1.run.app"
CHATWOOT_URL="https://chatwoot-multitenant-dev-1039900134024.southamerica-west1.run.app"
REGION="southamerica-west1"

# Función para check completo de servicio
comprehensive_health_check() {
    local service_name=$1
    local url=$2
    local cloud_run_service=$3
    
    log_info "🔍 Verificando $service_name..."
    
    # 1. HTTP Health Check
    local http_status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    local response_time=$(curl -s -o /dev/null -w "%{time_total}" "$url" 2>/dev/null || echo "0")
    
    # 2. Cloud Run Status
    local service_status=$(gcloud run services describe "$cloud_run_service" \
        --region="$REGION" \
        --format="value(status.conditions[0].status)" 2>/dev/null || echo "Unknown")
    
    # 3. CPU y Memory Usage
    local cpu_usage=$(gcloud run services describe "$cloud_run_service" \
        --region="$REGION" \
        --format="value(spec.template.spec.containers[0].resources.limits.cpu)" 2>/dev/null || echo "N/A")
    
    local memory_usage=$(gcloud run services describe "$cloud_run_service" \
        --region="$REGION" \
        --format="value(spec.template.spec.containers[0].resources.limits.memory)" 2>/dev/null || echo "N/A")
    
    # 4. Último deploy
    local last_deploy=$(gcloud run services describe "$cloud_run_service" \
        --region="$REGION" \
        --format="value(metadata.creationTimestamp)" 2>/dev/null || echo "N/A")
    
    # Evaluar resultados
    echo "  📊 Resultados para $service_name:"
    
    if [ "$http_status" = "200" ]; then
        log_success "    ✅ HTTP Status: $http_status (Tiempo: ${response_time}s)"
    else
        log_error "    ❌ HTTP Status: $http_status"
        return 1
    fi
    
    if [ "$service_status" = "True" ]; then
        log_success "    ✅ Cloud Run Status: Ready"
    else
        log_warning "    ⚠️  Cloud Run Status: $service_status"
    fi
    
    log_info "    📈 CPU Limit: $cpu_usage"
    log_info "    💾 Memory Limit: $memory_usage"
    log_info "    🕐 Último Deploy: $last_deploy"
    
    return 0
}

# Función para obtener logs recientes
check_recent_logs() {
    local service_name=$1
    local cloud_run_service=$2
    local minutes=${3:-5}
    
    log_info "📋 Logs recientes de $service_name (últimos ${minutes} minutos):"
    
    # Obtener logs de Cloud Logging
    gcloud logging read "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"$cloud_run_service\"" \
        --limit=10 \
        --format="table(timestamp,severity,textPayload)" \
        --freshness="${minutes}m" 2>/dev/null || {
        log_warning "    No se pudieron obtener logs para $service_name"
    }
    
    echo ""
}

# Función para verificar conectividad con Supabase
check_database_connectivity() {
    log_info "🗄️ Verificando conectividad con Supabase..."
    
    # Test básico - esto requiere tener configurado SUPABASE_URL
    if [ -n "$SUPABASE_URL" ]; then
        local db_status=$(curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/" \
            -H "apikey: $SUPABASE_ANON_KEY" 2>/dev/null || echo "000")
        
        if [ "$db_status" = "200" ]; then
            log_success "    ✅ Supabase REST API: OK"
        else
            log_error "    ❌ Supabase REST API: Error ($db_status)"
        fi
    else
        log_warning "    ⚠️  SUPABASE_URL no configurado para test"
    fi
}

# Función para test de carga básico
load_test() {
    local service_name=$1
    local url=$2
    local requests=${3:-10}
    
    log_info "⚡ Test de carga básico para $service_name ($requests requests)..."
    
    local start_time=$(date +%s)
    local successful_requests=0
    local failed_requests=0
    local total_response_time=0
    
    for i in $(seq 1 $requests); do
        local status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
        local response_time=$(curl -s -o /dev/null -w "%{time_total}" "$url" 2>/dev/null || echo "0")
        
        if [ "$status" = "200" ]; then
            ((successful_requests++))
        else
            ((failed_requests++))
        fi
        
        total_response_time=$(echo "$total_response_time + $response_time" | bc -l 2>/dev/null || echo "$total_response_time")
        
        # Pequeña pausa entre requests
        sleep 0.5
    done
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local avg_response_time=$(echo "scale=3; $total_response_time / $requests" | bc -l 2>/dev/null || echo "0")
    local success_rate=$(echo "scale=2; $successful_requests * 100 / $requests" | bc -l 2>/dev/null || echo "0")
    
    echo "  📊 Resultados del test de carga:"
    log_info "    📈 Requests exitosos: $successful_requests/$requests ($success_rate%)"
    log_info "    ⏱️  Tiempo promedio respuesta: ${avg_response_time}s"
    log_info "    🕐 Duración total: ${duration}s"
    
    if [ "$success_rate" = "100.00" ]; then
        log_success "    ✅ Test de carga: PASÓ"
        return 0
    else
        log_error "    ❌ Test de carga: FALLÓ"
        return 1
    fi
}

# Función para monitoreo continuo
continuous_monitoring() {
    local duration_minutes=${1:-30}
    local check_interval=${2:-60}
    
    log_info "🔄 Iniciando monitoreo continuo por $duration_minutes minutos (cada ${check_interval}s)..."
    
    local end_time=$(($(date +%s) + duration_minutes * 60))
    local check_count=0
    local n8n_failures=0
    local chatwoot_failures=0
    
    while [ $(date +%s) -lt $end_time ]; do
        ((check_count++))
        log_info "🔍 Check #$check_count"
        
        # Check N8N
        if ! comprehensive_health_check "N8N" "$N8N_URL" "n8n-optimacx-supabase-dev"; then
            ((n8n_failures++))
        fi
        
        echo ""
        
        # Check Chatwoot
        if ! comprehensive_health_check "Chatwoot" "$CHATWOOT_URL" "chatwoot-multitenant-dev"; then
            ((chatwoot_failures++))
        fi
        
        echo "----------------------------------------"
        sleep $check_interval
    done
    
    # Resumen final
    log_info "📊 Resumen de monitoreo continuo:"
    log_info "    Total checks: $check_count"
    log_info "    N8N failures: $n8n_failures"
    log_info "    Chatwoot failures: $chatwoot_failures"
    
    local overall_success_rate=$(echo "scale=2; ($check_count * 2 - $n8n_failures - $chatwoot_failures) * 100 / ($check_count * 2)" | bc -l)
    log_info "    Success rate overall: $overall_success_rate%"
    
    if [ "$n8n_failures" -eq 0 ] && [ "$chatwoot_failures" -eq 0 ]; then
        log_success "✅ Monitoreo completado: Servicios estables"
        return 0
    else
        log_error "❌ Monitoreo completado: Se detectaron fallos"
        return 1
    fi
}

# Función principal
main() {
    case $1 in
        "health")
            log_info "🏥 Ejecutando health check completo..."
            echo ""
            
            comprehensive_health_check "N8N" "$N8N_URL" "n8n-optimacx-supabase-dev"
            echo ""
            comprehensive_health_check "Chatwoot" "$CHATWOOT_URL" "chatwoot-multitenant-dev"
            echo ""
            check_database_connectivity
            ;;
        "logs")
            local minutes=${2:-5}
            check_recent_logs "N8N" "n8n-optimacx-supabase-dev" "$minutes"
            check_recent_logs "Chatwoot" "chatwoot-multitenant-dev" "$minutes"
            ;;
        "load")
            local requests=${2:-10}
            load_test "N8N" "$N8N_URL" "$requests"
            echo ""
            load_test "Chatwoot" "$CHATWOOT_URL" "$requests"
            ;;
        "monitor")
            local duration=${2:-30}
            local interval=${3:-60}
            continuous_monitoring "$duration" "$interval"
            ;;
        "quick")
            log_info "⚡ Quick health check..."
            
            if curl -s -o /dev/null -w "%{http_code}" "$N8N_URL" | grep -q "200"; then
                log_success "✅ N8N: OK"
            else
                log_error "❌ N8N: FAIL"
            fi
            
            if curl -s -o /dev/null -w "%{http_code}" "$CHATWOOT_URL" | grep -q "200"; then
                log_success "✅ Chatwoot: OK"
            else
                log_error "❌ Chatwoot: FAIL"
            fi
            ;;
        *)
            echo "Uso: $0 {health|logs|load|monitor|quick} [options]"
            echo ""
            echo "Comandos:"
            echo "  health                     - Health check completo de ambos servicios"
            echo "  logs [minutes]            - Mostrar logs recientes (default: 5 min)"
            echo "  load [requests]           - Test de carga básico (default: 10 requests)"
            echo "  monitor [minutes] [interval] - Monitoreo continuo (default: 30min, 60s)"
            echo "  quick                     - Check rápido de disponibilidad"
            echo ""
            echo "Ejemplos:"
            echo "  $0 health"
            echo "  $0 logs 10"
            echo "  $0 load 20"
            echo "  $0 monitor 60 30"
            echo "  $0 quick"
            exit 1
            ;;
    esac
}

main "$@"
