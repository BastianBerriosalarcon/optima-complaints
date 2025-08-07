#!/bin/bash

# 🔧 Import N8N Workflows via Direct API
# Solución al problema del MCP defectuoso

set -e

echo "🚀 Importando workflows N8N via API directa..."
echo "=============================================="

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
N8N_URL="https://n8n-optimacx-supabase-dev-wfzra4ruxq-tl.a.run.app"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzMjc0OTQ5OC00ZWFmLTRiOTgtOTk4Mi0xNGQ3ZmM1N2EzNTAiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NjAwODU5fQ.vWKSEZMdvGCDttnUIYi3UKZT-JoiOc_QDt9vM5nuKjQ"

# Arrays de workflows para importar
declare -A WORKFLOWS=(
    ["chatwoot-test-minimal.json"]="Test básico de conectividad"
    ["chatwoot-multitenant-webhook-updated.json"]="Handler principal multitenant"
)

# Función para verificar API key
verify_api_connection() {
    echo -e "${YELLOW}📡 Verificando conexión con N8N API...${NC}"
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -H "X-N8N-API-KEY: $API_KEY" \
        -H "Content-Type: application/json" \
        "$N8N_URL/api/v1/workflows")
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✅ Conexión API exitosa${NC}"
        return 0
    else
        echo -e "${RED}❌ Error de conexión API (HTTP: $http_code)${NC}"
        echo "Response: $response"
        exit 1
    fi
}

# Función para limpiar JSON (remover campos read-only)
clean_workflow_json() {
    local input_file=$1
    local output_file="${input_file%.json}_clean.json"
    
    # Remover campos read-only que causan errores en la API
    jq 'del(.active, .id, .createdAt, .updatedAt, .versionId, .triggerCount, .meta, .pinData, .shared, .tags)' \
        "$input_file" > "$output_file"
    
    echo "$output_file"
}

# Función para crear workflow
create_workflow() {
    local workflow_file=$1
    local description=$2
    
    echo -e "${BLUE}📄 Procesando: $workflow_file${NC}"
    echo "   Descripción: $description"
    
    if [ ! -f "$workflow_file" ]; then
        echo -e "${RED}❌ Archivo no encontrado: $workflow_file${NC}"
        return 1
    fi
    
    # Limpiar JSON
    clean_file=$(clean_workflow_json "$workflow_file")
    
    # Crear workflow
    echo "   Creando workflow..."
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST \
        -H "X-N8N-API-KEY: $API_KEY" \
        -H "Content-Type: application/json" \
        -d @"$clean_file" \
        "$N8N_URL/api/v1/workflows")
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        workflow_id=$(echo "$body" | jq -r '.id')
        workflow_name=$(echo "$body" | jq -r '.name')
        
        echo -e "${GREEN}   ✅ Workflow creado: $workflow_name (ID: $workflow_id)${NC}"
        
        # Activar workflow
        echo "   Activando workflow..."
        activate_response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
            -X POST \
            -H "X-N8N-API-KEY: $API_KEY" \
            -H "Content-Type: application/json" \
            "$N8N_URL/api/v1/workflows/$workflow_id/activate")
        
        activate_code=$(echo $activate_response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
        
        if [ "$activate_code" -eq 200 ]; then
            echo -e "${GREEN}   ✅ Workflow activado exitosamente${NC}"
            
            # Extraer webhook path si existe
            webhook_path=$(echo "$body" | jq -r '.nodes[]? | select(.type == "n8n-nodes-base.webhook") | .parameters.path' 2>/dev/null || echo "")
            if [ -n "$webhook_path" ] && [ "$webhook_path" != "null" ]; then
                echo -e "${GREEN}   🔗 Webhook disponible: $N8N_URL/webhook/$webhook_path${NC}"
            fi
        else
            echo -e "${YELLOW}   ⚠️  Warning: Workflow creado pero no se pudo activar (HTTP: $activate_code)${NC}"
        fi
        
        # Limpiar archivo temporal
        rm -f "$clean_file"
        return 0
    else
        echo -e "${RED}   ❌ Error creando workflow (HTTP: $http_code)${NC}"
        echo "   Response: $body"
        rm -f "$clean_file"
        return 1
    fi
}

# Función para listar workflows existentes
list_existing_workflows() {
    echo -e "${YELLOW}📋 Workflows existentes en N8N:${NC}"
    
    response=$(curl -s \
        -H "X-N8N-API-KEY: $API_KEY" \
        -H "Content-Type: application/json" \
        "$N8N_URL/api/v1/workflows")
    
    echo "$response" | jq -r '.data[] | "   - \(.name) (ID: \(.id), Active: \(.active))"'
    echo ""
}

# Función para probar webhook
test_webhook() {
    local webhook_path=$1
    local description=$2
    
    echo -e "${YELLOW}🧪 Probando webhook: $webhook_path${NC}"
    echo "   $description"
    
    test_payload='{"test": "API directa", "timestamp": "'$(date -Iseconds)'", "source": "import_script"}'
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST \
        -H 'Content-Type: application/json' \
        -d "$test_payload" \
        "$N8N_URL/webhook/$webhook_path")
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}   ✅ Webhook funcionando correctamente${NC}"
        echo "   Respuesta: $body"
    else
        echo -e "${RED}   ❌ Webhook no funciona (HTTP: $http_code)${NC}"
        echo "   Respuesta: $body"
    fi
    echo ""
}

# Función principal
main() {
    echo -e "${GREEN}🎯 Import N8N Workflows - API Directa${NC}"
    echo "N8N URL: $N8N_URL"
    echo ""
    
    # Verificar conexión
    verify_api_connection
    echo ""
    
    # Listar workflows existentes
    list_existing_workflows
    
    # Importar workflows
    echo -e "${YELLOW}📦 Importando workflows...${NC}"
    echo ""
    
    # Workflow 1: Test básico
    if [ -f "applications/n8n-workflows/templates/chatwoot-test-minimal.json" ]; then
        create_workflow "applications/n8n-workflows/templates/chatwoot-test-minimal.json" "Test básico de conectividad"
        echo ""
    fi
    
    # Workflow 2: Handler principal
    if [ -f "applications/n8n-workflows/templates/chatwoot-multitenant-webhook-updated.json" ]; then
        create_workflow "applications/n8n-workflows/templates/chatwoot-multitenant-webhook-updated.json" "Handler principal multitenant"
        echo ""
    fi
    
    # Probar webhooks
    echo -e "${YELLOW}🧪 Ejecutando pruebas de webhooks...${NC}"
    echo ""
    
    test_webhook "chatwoot-test-direct" "Webhook creado anteriormente"
    
    echo -e "${GREEN}✅ Importación completada!${NC}"
    echo ""
    echo -e "${YELLOW}📌 Próximos pasos:${NC}"
    echo "1. Verificar que todos los workflows están activos"
    echo "2. Configurar webhooks en Chatwoot"
    echo "3. Probar integración end-to-end"
}

# Ejecutar importación
main
