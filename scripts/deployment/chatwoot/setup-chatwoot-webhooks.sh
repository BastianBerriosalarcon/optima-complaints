#!/bin/bash

# 🔧 Configuración Chatwoot Webhooks - Automated Setup
# Conectar Chatwoot → N8N usando webhooks

set -e

echo "🚀 Configurando webhooks en Chatwoot..."
echo "======================================="

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# URLs de servicios (deben ser configuradas como variables de entorno)
if [ -z "$CHATWOOT_URL" ] || [ -z "$N8N_URL" ]; then
    echo -e "${RED}Error: Las variables de entorno CHATWOOT_URL y N8N_URL deben estar configuradas.${NC}"
    echo "Ejemplo:"
    echo "  export CHATWOOT_URL=\"https://your-chatwoot-instance.elest.io\""
    echo "  export N8N_URL=\"https://your-n8n-instance.elest.io\""
    exit 1
fi

# Webhooks endpoints corregidos (con /webhook/webhook/)
declare -A WEBHOOK_ENDPOINTS=(
    ["1"]="${N8N_URL}/webhook/webhook/chatwoot/concesionario_001"
    ["2"]="${N8N_URL}/webhook/webhook/chatwoot/concesionario_002"
    ["3"]="${N8N_URL}/webhook/webhook/chatwoot/concesionario_003"
)

# Webhook de test para verificación
TEST_WEBHOOK_URL="${N8N_URL}/webhook/webhook/chatwoot/test"

# Eventos a configurar
WEBHOOK_EVENTS='["message_created", "conversation_created", "contact_created", "conversation_status_changed"]'

# Función para verificar acceso a Chatwoot
check_chatwoot_access() {
    echo -e "${YELLOW}📡 Verificando acceso a Chatwoot...${NC}"
    
    # Test básico de conectividad
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$CHATWOOT_URL/api")
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 401 ]; then
        echo -e "${GREEN}✅ Chatwoot accesible${NC}"
        return 0
    else
        echo -e "${RED}❌ Chatwoot no accesible (HTTP: $http_code)${NC}"
        return 1
    fi
}

# Función para verificar webhooks N8N
verify_n8n_webhooks() {
    echo -e "${YELLOW}🔍 Verificando webhooks N8N...${NC}"
    
    # Test webhook básico (sabemos que funciona)
    test_payload='{"test": "chatwoot_setup", "timestamp": "'$(date -Iseconds)'"}'
    
    echo "   Probando webhook test..."
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST \
        -H 'Content-Type: application/json' \
        -d "$test_payload" \
        "$TEST_WEBHOOK_URL")
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}   ✅ Webhook test funcionando (${TEST_WEBHOOK_URL})${NC}"
    else
        echo -e "${RED}   ❌ Webhook test no funciona (HTTP: $http_code)${NC}"
        echo "   URL: $TEST_WEBHOOK_URL"
        return 1
    fi
    
    # Test webhooks multitenant (estos pueden no existir aún)
    for account_id in "${!WEBHOOK_ENDPOINTS[@]}"; do
        webhook_url="${WEBHOOK_ENDPOINTS[$account_id]}"
        echo "   Probando webhook tenant $account_id..."
        
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
            -X POST \
            -H 'Content-Type: application/json' \
            -d "$test_payload" \
            "$webhook_url")
        
        http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
        
        if [ "$http_code" -eq 200 ]; then
            echo -e "${GREEN}   ✅ Webhook tenant $account_id OK${NC}"
        else
            echo -e "${YELLOW}   ⚠️  Webhook tenant $account_id pendiente (HTTP: $http_code)${NC}"
            echo -e "${BLUE}       Será configurado en Chatwoot Admin Panel${NC}"
        fi
    done
}

# Función para configurar webhook (requiere API token manual)
configure_webhook_for_account() {
    local account_id=$1
    local webhook_url=$2
    local api_token=$3
    
    if [ -z "$api_token" ]; then
        echo -e "${YELLOW}   ⚠️  API token requerido para cuenta $account_id${NC}"
        return 1
    fi
    
    echo -e "${BLUE}📎 Configurando webhook para cuenta $account_id...${NC}"
    echo "   URL: $webhook_url"
    
    webhook_payload=$(cat <<EOF
{
  "webhook_url": "$webhook_url",
  "subscriptions": $WEBHOOK_EVENTS
}
EOF
)
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "api_access_token: $api_token" \
        -d "$webhook_payload" \
        "$CHATWOOT_URL/api/v1/accounts/$account_id/webhooks")
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        webhook_id=$(echo "$body" | jq -r '.id // empty')
        echo -e "${GREEN}   ✅ Webhook configurado (ID: $webhook_id)${NC}"
        return 0
    else
        echo -e "${RED}   ❌ Error configurando webhook (HTTP: $http_code)${NC}"
        echo "   Response: $body"
        return 1
    fi
}

# Función para generar configuración manual
generate_manual_config() {
    echo -e "${YELLOW}📋 Configuración Manual de Webhooks${NC}"
    echo ""
    echo -e "${BLUE}1. Acceder a Chatwoot Admin Panel:${NC}"
    echo "   ${CHATWOOT_URL}/super_admin"
    echo ""
    echo -e "${BLUE}2. Crear cuentas multitenant (si no existen):${NC}"
    echo "   - Concesionario 001"
    echo "   - Concesionario 002"
    echo "   - Concesionario 003"
    echo ""
    echo -e "${BLUE}3. Para cada cuenta, configurar webhook:${NC}"
    echo "   Settings → Integrations → Webhooks → Add Webhook"
    echo ""
    
    for account_id in "${!WEBHOOK_ENDPOINTS[@]}"; do
        webhook_url="${WEBHOOK_ENDPOINTS[$account_id]}"
        echo -e "${GREEN}   Cuenta $account_id:${NC}"
        echo "   URL: $webhook_url"
        echo "   Events: message_created, conversation_created, contact_created, conversation_status_changed"
        echo ""
    done
    
    echo -e "${BLUE}4. Obtener API tokens:${NC}"
    echo "   - En cada cuenta: Settings → API Keys → Generate new API key"
    echo "   - Usar tokens para configuración automática (opcional)"
    echo ""
}

# Función para generar comandos de test
generate_test_commands() {
    echo -e "${YELLOW}🔧 Comandos de Test Webhook:${NC}"
    echo ""
    
    for account_id in "${!WEBHOOK_ENDPOINTS[@]}"; do
        webhook_url="${WEBHOOK_ENDPOINTS[$account_id]}"
        echo -e "${GREEN}Test Cuenta $account_id:${NC}"
        echo "curl -X POST \"
        echo "  -H 'Content-Type: application/json' \"
        echo "  -d '{\"account\":{\"id\":$account_id},\"event\":\"message_created\",\"content\":\"Test from setup\"}' \"
        echo "  '$webhook_url'"
        echo ""
    done
}

# Función para setup completo con tokens (opcional)
setup_with_tokens() {
    echo -e "${YELLOW}🔑 Setup automático con API tokens${NC}"
    echo ""
    echo "Si tienes API tokens de Chatwoot, puedes configurar automáticamente:"
    echo ""
    echo "export CHATWOOT_API_TOKEN_1='tu_token_cuenta_1'"
    echo "export CHATWOOT_API_TOKEN_2='tu_token_cuenta_2'"
    echo "export CHATWOOT_API_TOKEN_3='tu_token_cuenta_3'"
    echo ""
    echo "Luego ejecutar: ./scripts/setup-chatwoot-webhooks.sh --auto"
}

# Función para verificar configuración existente
check_existing_webhooks() {
    echo -e "${YELLOW}🔍 Verificando webhooks existentes...${NC}"
    echo ""
    
    for account_id in "${!WEBHOOK_ENDPOINTS[@]}"; do
        echo "   Cuenta $account_id: Requiere acceso manual para verificar"
        echo "   URL esperada: ${WEBHOOK_ENDPOINTS[$account_id]}"
    done
    echo ""
}

# Función principal
main() {
    echo -e "${GREEN}🎯 Configuración Chatwoot Webhooks${NC}"
    echo "Chatwoot: $CHATWOOT_URL"
    echo "N8N: $N8N_URL"
    echo ""
    
    # Verificar servicios
    check_chatwoot_access
    echo ""
    
    verify_n8n_webhooks
    echo ""
    
    check_existing_webhooks
    
    generate_manual_config
    
    generate_test_commands
    
    setup_with_tokens
    
    echo -e "${GREEN}✅ Setup de webhooks preparado!${NC}"
    echo ""
    echo -e "${YELLOW}📌 Próximos pasos:${NC}"
    echo "1. Acceder a Chatwoot Admin Panel manualmente"
    echo "2. Crear/verificar cuentas multitenant"
    echo "3. Configurar webhooks usando URLs generadas"
    echo "4. Probar con comandos curl proporcionados"
    echo "5. Verificar logs en N8N executions"
}

# Ejecutar setup
main "$@"
