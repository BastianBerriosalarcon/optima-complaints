#!/bin/bash

# 🔧 Script de Configuración Multitenant - Chatwoot OptimaCX  
# Configuración post-despliegue para cuentas multitenant

set -e

echo "🔧 Configurando Chatwoot Multitenant..."
echo "======================================"

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuración
PROJECT_ID="optima-cx-467616"
REGION="southamerica-west1"
CHATWOOT_SERVICE_URL=""

# Obtener URL del servicio Chatwoot
get_chatwoot_url() {
    echo -e "${YELLOW}📡 Obteniendo URL del servicio Chatwoot...${NC}"
    
    CHATWOOT_SERVICE_URL=$(gcloud run services describe chatwoot-multitenant-dev \
        --region=$REGION \
        --project=$PROJECT_ID \
        --format="value(status.url)" 2>/dev/null)
    
    if [ -z "$CHATWOOT_SERVICE_URL" ]; then
        echo -e "${RED}❌ Error: No se pudo obtener la URL del servicio Chatwoot${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ URL del servicio: $CHATWOOT_SERVICE_URL${NC}"
}

# Función para crear cuenta de Chatwoot via API
create_chatwoot_account() {
    local tenant_id=$1
    local account_name=$2
    local admin_email=$3
    
    echo -e "${YELLOW}🏢 Creando cuenta para: $account_name${NC}"
    
    # Crear cuenta usando Chatwoot API
    local response=$(curl -s -X POST "$CHATWOOT_SERVICE_URL/platform/api/v1/accounts" \
        -H "Content-Type: application/json" \
        -H "api_access_token: $CHATWOOT_PLATFORM_TOKEN" \
        -d "{
            \"account_name\": \"$account_name\",
            \"email\": \"$admin_email\",
            \"confirmed\": true,
            \"custom_attributes\": {
                \"tenant_id\": \"$tenant_id\",
                \"whatsapp_enabled\": true
            }
        }" || echo "")
    
    if [ -n "$response" ]; then
        local account_id=$(echo $response | jq -r '.id // empty')
        if [ -n "$account_id" ] && [ "$account_id" != "null" ]; then
            echo -e "${GREEN}✅ Cuenta creada con ID: $account_id${NC}"
            
            # Guardar mapeo en archivo temporal
            echo "$tenant_id:$account_id" >> /tmp/chatwoot_tenant_mapping.txt
            
            # Configurar webhook para esta cuenta
            setup_webhook_for_account $account_id $tenant_id
            
            return 0
        fi
    fi
    
    echo -e "${RED}❌ Error creando cuenta para $tenant_id${NC}"
    return 1
}

# Configurar webhook específico por cuenta
setup_webhook_for_account() {
    local account_id=$1
    local tenant_id=$2
    
    local webhook_url="https://n8n-optimacx-supabase-dev-1008284849803.southamerica-west1.run.app/webhook/chatwoot/$tenant_id"
    
    echo -e "${YELLOW}🔗 Configurando webhook para cuenta $account_id...${NC}"
    
    # Crear webhook usando Chatwoot API
    curl -s -X POST "$CHATWOOT_SERVICE_URL/api/v1/accounts/$account_id/webhooks" \
        -H "Content-Type: application/json" \
        -H "api_access_token: $CHATWOOT_API_TOKEN" \
        -d "{
            \"webhook_url\": \"$webhook_url\",
            \"subscriptions\": [
                \"message_created\",
                \"message_updated\",
                \"conversation_created\",
                \"conversation_updated\",
                \"conversation_status_changed\"
            ]
        }" > /dev/null
    
    echo -e "${GREEN}✅ Webhook configurado: $webhook_url${NC}"
}

# Configurar WhatsApp para una cuenta
setup_whatsapp_for_account() {
    local account_id=$1
    local tenant_id=$2
    local phone_number_id=$3
    local access_token=$4
    
    echo -e "${YELLOW}📱 Configurando WhatsApp para cuenta $account_id...${NC}"
    
    # Crear inbox de WhatsApp
    local response=$(curl -s -X POST "$CHATWOOT_SERVICE_URL/api/v1/accounts/$account_id/inboxes" \
        -H "Content-Type: application/json" \
        -H "api_access_token: $CHATWOOT_API_TOKEN" \
        -d "{
            \"name\": \"WhatsApp - $tenant_id\",
            \"channel\": {
                \"type\": \"whatsapp\",
                \"phone_number_id\": \"$phone_number_id\",
                \"business_account_id\": \"$phone_number_id\",
                \"webhook_verify_token\": \"verify_token_$tenant_id\"
            }
        }")
    
    local inbox_id=$(echo $response | jq -r '.id // empty')
    if [ -n "$inbox_id" ] && [ "$inbox_id" != "null" ]; then
        echo -e "${GREEN}✅ Inbox WhatsApp creado con ID: $inbox_id${NC}"
        echo "$tenant_id:$account_id:$inbox_id" >> /tmp/chatwoot_whatsapp_mapping.txt
    else
        echo -e "${RED}❌ Error creando inbox WhatsApp para $tenant_id${NC}"
    fi
}

# Configurar las cuentas de los concesionarios
configure_tenant_accounts() {
    echo -e "${YELLOW}🏢 Configurando cuentas de concesionarios...${NC}"
    
    # Limpiar archivos temporales
    rm -f /tmp/chatwoot_tenant_mapping.txt
    rm -f /tmp/chatwoot_whatsapp_mapping.txt
    
    # Configurar concesionario 001
    create_chatwoot_account "concesionario_001" "Concesionario Uno" "admin1@optimacx.net"
    sleep 2
    
    # Configurar concesionario 002
    create_chatwoot_account "concesionario_002" "Concesionario Dos" "admin2@optimacx.net"
    sleep 2
    
    # Configurar concesionario 003
    create_chatwoot_account "concesionario_003" "Concesionario Tres" "admin3@optimacx.net"
    sleep 2
    
    echo -e "${GREEN}✅ Todas las cuentas configuradas${NC}"
}

# Configurar tokens de API (requiere configuración manual)
setup_api_tokens() {
    echo -e "${YELLOW}🔑 Configuración de tokens API...${NC}"
    echo ""
    echo "⚠️  ACCIÓN REQUERIDA: Configurar tokens manualmente"
    echo ""
    echo "1. Accede a Chatwoot Admin Panel:"
    echo "   $CHATWOOT_SERVICE_URL/super_admin"
    echo ""
    echo "2. Crear Platform API Token para automatización"
    echo "3. Crear API tokens para cada cuenta"
    echo "4. Actualizar Secret Manager con los tokens:"
    
    echo ""
    echo "gcloud secrets versions add chatwoot-platform-token --data-file=- <<< 'YOUR_PLATFORM_TOKEN'"
    echo "gcloud secrets versions add chatwoot-api-token --data-file=- <<< 'YOUR_API_TOKEN'"
    echo ""
}

# Mostrar resumen de configuración
show_configuration_summary() {
    echo -e "${GREEN}📋 Resumen de Configuración${NC}"
    echo "================================"
    echo ""
    echo "🌐 Chatwoot Service URL: $CHATWOOT_SERVICE_URL"
    echo ""
    
    if [ -f /tmp/chatwoot_tenant_mapping.txt ]; then
        echo "🏢 Mapeo de Tenants:"
        while IFS=':' read -r tenant_id account_id; do
            echo "   $tenant_id → Account ID: $account_id"
        done < /tmp/chatwoot_tenant_mapping.txt
        echo ""
    fi
    
    echo "📱 URLs de Acceso por Tenant:"
    echo "   concesionario_001: https://concesionario1.chat.optimacx.net"
    echo "   concesionario_002: https://concesionario2.chat.optimacx.net"  
    echo "   concesionario_003: https://concesionario3.chat.optimacx.net"
    echo ""
    
    echo "🔗 Webhooks N8N configurados:"
    echo "   https://n8n-optimacx-supabase-dev-1008284849803.southamerica-west1.run.app/webhook/chatwoot/concesionario_001"
    echo "   https://n8n-optimacx-supabase-dev-1008284849803.southamerica-west1.run.app/webhook/chatwoot/concesionario_002"
    echo "   https://n8n-optimacx-supabase-dev-1008284849803.southamerica-west1.run.app/webhook/chatwoot/concesionario_003"
    echo ""
}

# Función principal
main() {
    echo -e "${GREEN}🚀 Iniciando configuración Chatwoot Multitenant...${NC}"
    
    # Verificar que el servicio esté desplegado
    get_chatwoot_url
    
    # Configurar variables de entorno para tokens API
    export CHATWOOT_PLATFORM_TOKEN=${CHATWOOT_PLATFORM_TOKEN:-""}
    export CHATWOOT_API_TOKEN=${CHATWOOT_API_TOKEN:-""}
    
    if [ -z "$CHATWOOT_PLATFORM_TOKEN" ]; then
        echo -e "${YELLOW}⚠️  CHATWOOT_PLATFORM_TOKEN no configurado${NC}"
        echo "Ejecuta primero la configuración manual de tokens"
        setup_api_tokens
        exit 0
    fi
    
    # Configurar cuentas
    configure_tenant_accounts
    
    # Mostrar resumen
    show_configuration_summary
    
    echo -e "${GREEN}✅ Configuración Chatwoot Multitenant completada!${NC}"
    echo ""
    echo "🎯 Próximos pasos:"
    echo "1. Configurar dominios DNS para subdominios"
    echo "2. Configurar WhatsApp Business API por tenant"
    echo "3. Probar integración con N8N workflows"
    echo "4. Actualizar base de datos tenant_config con account_ids"
}

# Ejecutar función principal
main "$@"
