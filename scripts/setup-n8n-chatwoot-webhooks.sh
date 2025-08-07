#!/bin/bash

# 🔧 Configuración Webhooks Chatwoot → N8N
# Fase 1: Setup básico de comunicación

set -e

echo "🚀 Iniciando configuración de webhooks Chatwoot → N8N..."
echo "================================================================"

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# URLs de servicios
CHATWOOT_URL="https://chatwoot-multitenant-dev-wfzra4ruxq-tl.a.run.app"
N8N_URL="https://n8n-optimacx-supabase-dev-wfzra4ruxq-tl.a.run.app"

# Webhooks endpoints por tenant
declare -A WEBHOOK_ENDPOINTS=(
    ["concesionario_001"]="${N8N_URL}/webhook/chatwoot/concesionario_001"
    ["concesionario_002"]="${N8N_URL}/webhook/chatwoot/concesionario_002"
    ["concesionario_003"]="${N8N_URL}/webhook/chatwoot/concesionario_003"
)

# Función para verificar conectividad
check_services() {
    echo -e "${YELLOW}📡 Verificando conectividad de servicios...${NC}"
    
    # Test Chatwoot
    if curl -s --max-time 10 "${CHATWOOT_URL}/api" > /dev/null; then
        echo -e "${GREEN}✅ Chatwoot disponible: ${CHATWOOT_URL}${NC}"
    else
        echo -e "${RED}❌ Chatwoot no disponible${NC}"
        exit 1
    fi
    
    # Test N8N
    if curl -s --max-time 10 "${N8N_URL}" > /dev/null; then
        echo -e "${GREEN}✅ N8N disponible: ${N8N_URL}${NC}"
    else
        echo -e "${RED}❌ N8N no disponible${NC}"
        exit 1
    fi
}

# Función para crear webhooks
create_webhooks() {
    echo -e "${YELLOW}🔗 Configurando webhooks por tenant...${NC}"
    
    # Nota: Estas llamadas requieren tokens de API válidos
    # Para desarrollo, configurar manualmente en Chatwoot Admin Panel
    
    for tenant_id in "${!WEBHOOK_ENDPOINTS[@]}"; do
        webhook_url="${WEBHOOK_ENDPOINTS[$tenant_id]}"
        echo -e "${BLUE}📎 Configurando webhook para ${tenant_id}:${NC}"
        echo "   URL: ${webhook_url}"
        
        # TODO: Implementar creación automática con API tokens
        # curl -X POST "${CHATWOOT_URL}/api/v1/accounts/{account_id}/webhooks" \
        #      -H "Content-Type: application/json" \
        #      -H "api_access_token: ${API_TOKEN}" \
        #      -d '{
        #        "webhook_url": "'$webhook_url'",
        #        "subscriptions": ["message_created", "conversation_created"]
        #      }'
    done
}

# Función para probar webhook test
test_webhook_connectivity() {
    echo -e "${YELLOW}🧪 Probando conectividad webhook...${NC}"
    
    test_payload='{
        "account": {"id": 1},
        "event": "message_created",
        "content": "Test message from setup script",
        "conversation": {
            "id": 999,
            "meta": {
                "sender": {
                    "phone_number": "+56912345999"
                }
            }
        }
    }'
    
    test_url="${N8N_URL}/webhook/chatwoot/test"
    
    echo "Enviando test payload a: ${test_url}"
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$test_payload" \
        "$test_url")
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✅ Test webhook exitoso!${NC}"
        echo "Respuesta: $body"
    else
        echo -e "${RED}❌ Test webhook falló (HTTP: $http_code)${NC}"
        echo "Respuesta: $body"
    fi
}

# Función para mostrar configuración manual
show_manual_config() {
    echo -e "${YELLOW}📋 Configuración Manual Requerida:${NC}"
    echo ""
    echo -e "${BLUE}1. Acceder a Chatwoot Admin Panel:${NC}"
    echo "   ${CHATWOOT_URL}/super_admin"
    echo ""
    echo -e "${BLUE}2. Para cada cuenta de concesionario, configurar webhook:${NC}"
    echo "   Settings → Integrations → Webhooks → Add Webhook"
    echo ""
    
    for tenant_id in "${!WEBHOOK_ENDPOINTS[@]}"; do
        echo -e "${GREEN}   ${tenant_id}:${NC}"
        echo "   URL: ${WEBHOOK_ENDPOINTS[$tenant_id]}"
        echo "   Events: message_created, conversation_created, contact_created"
        echo ""
    done
    
    echo -e "${BLUE}3. Importar workflows en N8N:${NC}"
    echo "   - chatwoot-test-minimal.json (para pruebas)"
    echo "   - chatwoot-multitenant-webhook-updated.json (producción)"
    echo ""
}

# Función para generar comandos de prueba
generate_test_commands() {
    echo -e "${YELLOW}🔧 Comandos de prueba:${NC}"
    echo ""
    
    for tenant_id in "${!WEBHOOK_ENDPOINTS[@]}"; do
        webhook_url="${WEBHOOK_ENDPOINTS[$tenant_id]}"
        echo -e "${GREEN}Test ${tenant_id}:${NC}"
        echo "curl -X POST \\"
        echo "  -H 'Content-Type: application/json' \\"
        echo "  -d '{\"account\":{\"id\":1},\"event\":\"test\",\"content\":\"Test message\"}' \\"
        echo "  '${webhook_url}'"
        echo ""
    done
}

# Función principal
main() {
    echo -e "${GREEN}🎯 Configuración Chatwoot → N8N Webhooks${NC}"
    echo "URLs de servicios:"
    echo "  Chatwoot: ${CHATWOOT_URL}"
    echo "  N8N: ${N8N_URL}"
    echo ""
    
    check_services
    echo ""
    
    create_webhooks
    echo ""
    
    test_webhook_connectivity
    echo ""
    
    show_manual_config
    echo ""
    
    generate_test_commands
    
    echo -e "${GREEN}✅ Configuración webhook completada!${NC}"
    echo ""
    echo -e "${YELLOW}📌 Próximos pasos:${NC}"
    echo "1. Configurar webhooks manualmente en Chatwoot Admin"
    echo "2. Importar workflows JSON en N8N"
    echo "3. Probar con comandos curl generados"
    echo "4. Verificar logs en ambos servicios"
}

# Ejecutar configuración
main
