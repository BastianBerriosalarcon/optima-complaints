#!/bin/bash

# 🧪 Script de Pruebas End-to-End Chatwoot ↔ N8N
# Valida la integración completa webhook

set -e

echo "🧪 Ejecutando pruebas End-to-End Chatwoot → N8N"
echo "================================================"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# URLs
N8N_URL="https://n8n-optimacx-supabase-dev-wfzra4ruxq-tl.a.run.app"
TEST_WEBHOOK_URL="${N8N_URL}/webhook/webhook/chatwoot/test"

# Contador de pruebas
TESTS_PASSED=0
TESTS_FAILED=0

# Función para ejecutar test
run_test() {
    local test_name="$1"
    local webhook_url="$2"
    local payload="$3"
    
    echo -e "${BLUE}🧪 Test: $test_name${NC}"
    echo "   URL: $webhook_url"
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST \
        -H 'Content-Type: application/json' \
        -d "$payload" \
        "$webhook_url")
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}   ✅ PASS (HTTP: $http_code)${NC}"
        echo "   Response: $body"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}   ❌ FAIL (HTTP: $http_code)${NC}"
        echo "   Response: $body"
        ((TESTS_FAILED++))
    fi
    echo ""
}

# Test 1: Webhook Test Básico
echo -e "${YELLOW}=== Test 1: Webhook Test Básico ===${NC}"
run_test "Conectividad básica N8N" \
    "$TEST_WEBHOOK_URL" \
    '{"test": "basic_connectivity", "timestamp": "'$(date -Iseconds)'"}'

# Test 2: Simulación mensaje Chatwoot
echo -e "${YELLOW}=== Test 2: Simulación Mensaje Chatwoot ===${NC}"
run_test "Mensaje entrante simulado" \
    "$TEST_WEBHOOK_URL" \
    '{
        "account": {"id": 1},
        "event": "message_created",
        "content": "Hola, necesito información sobre autos nuevos",
        "message_type": "incoming",
        "conversation": {
            "id": 12345,
            "status": "open",
            "meta": {
                "sender": {
                    "phone_number": "+56912345678",
                    "name": "Cliente Test"
                }
            }
        },
        "created_at": "'$(date -Iseconds)'"
    }'

# Test 3: Evento conversation_created
echo -e "${YELLOW}=== Test 3: Evento Conversation Created ===${NC}"
run_test "Nueva conversación" \
    "$TEST_WEBHOOK_URL" \
    '{
        "account": {"id": 2},
        "event": "conversation_created",
        "conversation": {
            "id": 54321,
            "status": "open",
            "meta": {
                "sender": {
                    "phone_number": "+56987654321",
                    "name": "Nuevo Cliente"
                }
            }
        },
        "created_at": "'$(date -Iseconds)'"
    }'

# Test 4: Mensaje con contenido largo (IA trigger)
echo -e "${YELLOW}=== Test 4: Mensaje Largo (IA Trigger) ===${NC}"
run_test "Mensaje que requiere IA" \
    "$TEST_WEBHOOK_URL" \
    '{
        "account": {"id": 3},
        "event": "message_created",
        "content": "Hola, estoy interesado en comprar un auto nuevo para mi familia. Necesito algo espacioso, económico en combustible y con buenas características de seguridad. ¿Podrían recomendarme opciones y enviarme información sobre financiamiento?",
        "message_type": "incoming",
        "conversation": {
            "id": 99999,
            "status": "open",
            "meta": {
                "sender": {
                    "phone_number": "+56911223344",
                    "name": "María González",
                    "email": "maria.gonzalez@email.com"
                }
            }
        },
        "created_at": "'$(date -Iseconds)'"
    }'

# Test 5: Contact Created Event
echo -e "${YELLOW}=== Test 5: Contact Created Event ===${NC}"
run_test "Nuevo contacto creado" \
    "$TEST_WEBHOOK_URL" \
    '{
        "account": {"id": 1},
        "event": "contact_created",
        "contact": {
            "id": 777,
            "name": "Pedro Rodríguez",
            "phone_number": "+56955667788",
            "email": "pedro.rodriguez@email.com"
        },
        "created_at": "'$(date -Iseconds)'"
    }'

# Pruebas de Webhook Multitenant (estas fallarán si no están configuradas)
echo -e "${YELLOW}=== Tests Multitenant (Pueden fallar si no configurado) ===${NC}"

for tenant_id in 001 002 003; do
    account_id=${tenant_id#00}  # Remove leading zeros
    webhook_url="${N8N_URL}/webhook/webhook/chatwoot/concesionario_${tenant_id}"
    
    run_test "Webhook Concesionario $tenant_id" \
        "$webhook_url" \
        '{
            "account": {"id": '$account_id'},
            "event": "message_created",
            "content": "Test específico para concesionario '$tenant_id'",
            "message_type": "incoming",
            "conversation": {
                "id": '$((1000 + account_id))',
                "status": "open",
                "meta": {
                    "sender": {
                        "phone_number": "+569876543'$account_id'",
                        "name": "Cliente Concesionario '$tenant_id'"
                    }
                }
            }
        }'
done

# Resumen final
echo -e "${YELLOW}================================================${NC}"
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
echo -e "📊 Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 Todas las pruebas básicas pasaron!${NC}"
    echo -e "${BLUE}   Los webhooks multitenant requieren configuración manual en Chatwoot${NC}"
else
    echo -e "${RED}⚠️  Algunas pruebas fallaron. Verificar configuración.${NC}"
fi

echo ""
echo -e "${YELLOW}📋 Próximos pasos:${NC}"
echo "1. Configurar webhooks en Chatwoot Admin Panel"
echo "2. Usar URLs: ${N8N_URL}/webhook/webhook/chatwoot/concesionario_{001,002,003}"
echo "3. Configurar eventos: message_created, conversation_created, contact_created"
echo "4. Probar envío de mensajes reales desde Chatwoot"

echo ""
echo -e "${BLUE}📖 Ver guía completa: docs/deployment/chatwoot-n8n-webhook-setup.md${NC}"
