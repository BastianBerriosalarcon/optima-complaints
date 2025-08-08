#!/bin/bash

# 🔧 Script para configurar variables de entorno en N8N Cloud Run
# Este script debe ejecutarse una vez para configurar todas las variables necesarias

N8N_URL="https://n8n-optimacx-supabase-dev-1039900134024.southamerica-west1.run.app"
N8N_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNTIyYzQ1Ny0zMTkxLTQ1OTAtOGNiMi0yM2FmOTNmYjZhOWUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUzODQ3NTM4fQ.-k3vQzfiMSYvfHRQ33eZ78p7pU7zB8G13X3777SSVL0"

echo "🚀 Configurando variables de entorno en N8N..."

# Variables críticas para workflows
declare -A variables=(
    ["SUPABASE_URL"]="https://gdnlodwwmvbgayzzudiu.supabase.co"
    ["SUPABASE_ANON_KEY"]="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkbmxvZHd3bXZiZ2F5enp1ZGl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDYyMjIsImV4cCI6MjA2ODA4MjIyMn0.j4WztRRhuj-h0z7fxPhWd1pDyPmb-ouSjmbadfTxK3M"
    ["SUPABASE_SERVICE_KEY"]="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkbmxvZHd3bXZiZ2F5enp1ZGl1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjUwNjIyMiwiZXhwIjoyMDY4MDgyMjIyfQ.G1TkMLmYVrk6R8ZmoakK6mvwqWsV8Crctc74iW5sh7c"
    ["GEMINI_API_KEY"]="PENDIENTE_CONFIGURAR"
    ["N8N_WEBHOOK_URL"]="https://n8n-optimacx-supabase-dev-1039900134024.southamerica-west1.run.app"
    ["WHATSAPP_ACCESS_TOKEN"]="PENDIENTE_CONFIGURAR"
    ["CHATWOOT_URL"]="https://chatwoot-multitenant-dev-1039900134024.southamerica-west1.run.app"
    ["ENVIRONMENT"]="development"
    ["TENANT_DEFAULT_ID"]="concesionario_001"
)

# Función para crear/actualizar variable
create_variable() {
    local key=$1
    local value=$2
    
    echo "📝 Configurando: $key"
    
    # Intentar crear la variable
    response=$(curl -s -w "%{http_code}" \
        -X POST \
        -H "X-N8N-API-KEY: $N8N_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"key\":\"$key\",\"value\":\"$value\"}" \
        "$N8N_URL/api/v1/variables" \
        -o /tmp/n8n_response.json)
    
    http_code="${response: -3}"
    
    if [ "$http_code" = "201" ]; then
        echo "   ✅ Creada exitosamente"
    elif [ "$http_code" = "400" ]; then
        # Probablemente ya existe, intentar actualizar
        echo "   🔄 Variable existe, intentando actualizar..."
        
        # Primero obtener el ID de la variable
        var_id=$(curl -s \
            -H "X-N8N-API-KEY: $N8N_API_KEY" \
            "$N8N_URL/api/v1/variables" | \
            jq -r ".[] | select(.key==\"$key\") | .id")
        
        if [ "$var_id" != "null" ] && [ -n "$var_id" ]; then
            # Actualizar la variable
            update_response=$(curl -s -w "%{http_code}" \
                -X PATCH \
                -H "X-N8N-API-KEY: $N8N_API_KEY" \
                -H "Content-Type: application/json" \
                -d "{\"value\":\"$value\"}" \
                "$N8N_URL/api/v1/variables/$var_id" \
                -o /tmp/n8n_update_response.json)
            
            update_code="${update_response: -3}"
            if [ "$update_code" = "200" ]; then
                echo "   ✅ Actualizada exitosamente"
            else
                echo "   ❌ Error actualizando (código: $update_code)"
                cat /tmp/n8n_update_response.json
            fi
        else
            echo "   ❌ No se pudo obtener ID de variable existente"
        fi
    else
        echo "   ❌ Error (código: $http_code)"
        cat /tmp/n8n_response.json
    fi
}

# Configurar todas las variables
for key in "${!variables[@]}"; do
    create_variable "$key" "${variables[$key]}"
    sleep 1  # Pequeña pausa entre requests
done

echo ""
echo "🎯 Configuración completada!"
echo ""
echo "📋 Variables que requieren configuración manual:"
echo "   • GEMINI_API_KEY: Obtener desde Google AI Studio"
echo "   • WHATSAPP_ACCESS_TOKEN: Obtener desde Meta Business"
echo ""
echo "🔍 Para verificar las variables configuradas:"
echo "   curl -H 'X-N8N-API-KEY: $N8N_API_KEY' '$N8N_URL/api/v1/variables'"
