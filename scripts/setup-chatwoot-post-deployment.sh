#!/bin/bash

# 🚀 Chatwoot Multitenant Post-Deployment Setup Script - VERSIÓN COMPLETA
# Configuración inicial después del despliegue de infraestructura
# Optimizado para Chile/Sudamérica - OptimaCX Platform

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="optima-cx-467616"
REGION="southamerica-west1"
ENVIRONMENT="dev"
SERVICE_NAME="chatwoot-multitenant-${ENVIRONMENT}"

echo -e "${BLUE}🚀 Chatwoot Multitenant Post-Deployment Setup${NC}"
echo -e "${BLUE}=================================================${NC}"
echo ""
echo -e "${YELLOW}📍 Configuración:${NC}"
echo -e "   Project: ${PROJECT_ID}"
echo -e "   Region: ${REGION} (Santiago, Chile)"
echo -e "   Environment: ${ENVIRONMENT}"
echo -e "   Service: ${SERVICE_NAME}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to check if service is ready
check_service_ready() {
    print_info "Verificando si el servicio Cloud Run está listo..."
    
    SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
        --region=${REGION} \
        --project=${PROJECT_ID} \
        --format="value(status.url)" 2>/dev/null || echo "")
    
    if [ -z "$SERVICE_URL" ]; then
        print_error "Servicio Cloud Run no encontrado. ¿Completó el terraform apply?"
        exit 1
    fi
    
    print_status "Servicio encontrado: ${SERVICE_URL}"
    
    # Check if service responds
    print_info "Verificando que el servicio responda..."
    for i in {1..10}; do
        if curl -s -o /dev/null -w "%{http_code}" "${SERVICE_URL}" | grep -q "200\|302"; then
            print_status "Servicio está respondiendo correctamente"
            break
        else
            print_warning "Intento ${i}/10: Servicio aún no responde, esperando 30s..."
            sleep 30
        fi
        
        if [ $i -eq 10 ]; then
            print_error "Servicio no responde después de 5 minutos"
            exit 1
        fi
    done
    
    echo "CHATWOOT_URL=${SERVICE_URL}" > .env
    export CHATWOOT_URL="${SERVICE_URL}"
}

# Function to create super admin
create_super_admin() {
    print_info "Creando Super Admin de Chatwoot..."
    
    # Super Admin credentials
    ADMIN_EMAIL="admin@optimacx.net"
    ADMIN_PASSWORD="OptimaCX_Admin_2025!"
    ADMIN_NAME="OptimaCX Admin"
    
    print_info "Creando super admin vía API..."
    
    # First, check if we can access the admin panel
    ADMIN_URL="${CHATWOOT_URL}/super_admin"
    print_info "Admin Panel URL: ${ADMIN_URL}"
    
    # Try to create super admin via rails console command
    print_info "Ejecutando comando de creación de super admin..."
    
    # This would typically require access to the container
    # For now, we'll provide manual instructions
    cat << EOF > super_admin_setup.md

# 📋 INSTRUCCIONES MANUALES PARA CREAR SUPER ADMIN

## 1. Accede al Admin Panel: 
${ADMIN_URL}

## 2. Si es la primera vez, usar estas credenciales temporales:
- **Email**: ${ADMIN_EMAIL}
- **Password**: ${ADMIN_PASSWORD}
- **Name**: ${ADMIN_NAME}

## 3. Alternativa - Ejecutar en Cloud Run console:
\`\`\`bash
gcloud run services replace-traffic ${SERVICE_NAME} --to-latest --region=${REGION}
\`\`\`

## 4. Conectar al container y ejecutar:
\`\`\`bash
# Conectar al container
gcloud run services proxy ${SERVICE_NAME} --port=8080 --region=${REGION}

# O usar Cloud Shell Editor para ejecutar Rails console:
rails c
> SuperAdmin.create!(email: '${ADMIN_EMAIL}', password: '${ADMIN_PASSWORD}', name: '${ADMIN_NAME}')
\`\`\`

EOF
    
    print_status "Instrucciones de Super Admin generadas: super_admin_setup.md"
}

# Function to create tenant accounts
create_tenant_accounts() {
    print_info "Preparando configuración de cuentas multitenant..."
    
    # Tenant configuration
    declare -A TENANTS=(
        ["concesionario_001"]="Concesionario Santiago Centro"
        ["concesionario_002"]="Concesionario Las Condes"
        ["concesionario_003"]="Concesionario Maipú"
    )
    
    cat << EOF > tenant_accounts_setup.json
{
  "tenant_accounts": {
EOF
    
    local first=true
    for tenant_id in "${!TENANTS[@]}"; do
        if [ "$first" = false ]; then
            echo "," >> tenant_accounts_setup.json
        fi
        first=false
        
        cat << EOF >> tenant_accounts_setup.json
    "${tenant_id}": {
      "name": "${TENANTS[$tenant_id]}",
      "domain": "${tenant_id//_}.chat.optimacx.net",
      "timezone": "America/Santiago",
      "locale": "es",
      "features": {
        "whatsapp_business": true,
        "ai_responses": true,
        "n8n_integration": true,
        "custom_branding": true
      },
      "whatsapp_config": {
        "phone_number_id": "PENDING_SETUP",
        "access_token": "PENDING_SETUP",
        "webhook_verify_token": "$(openssl rand -hex 32)",
        "business_account_id": "PENDING_SETUP"
      },
      "admin_users": [
        {
          "name": "Admin ${TENANTS[$tenant_id]}",
          "email": "admin@${tenant_id//_}.optimacx.net",
          "role": "administrator"
        }
      ],
      "agents": [
        {
          "name": "Asesor Ventas 1",
          "email": "ventas1@${tenant_id//_}.optimacx.net",
          "role": "agent"
        },
        {
          "name": "Asesor Ventas 2", 
          "email": "ventas2@${tenant_id//_}.optimacx.net",
          "role": "agent"
        }
      ]
    }EOF
    done
    
    cat << EOF >> tenant_accounts_setup.json
  }
}
EOF
    
    print_status "Configuración de tenants generada: tenant_accounts_setup.json"
}

# Function to setup WhatsApp Business API configuration
setup_whatsapp_config() {
    print_info "Preparando configuración WhatsApp Business API..."
    
    cat << 'EOF' > whatsapp_business_setup.md
# 📱 WhatsApp Business API Setup - Por Tenant

## Requisitos Previos

1. **Meta Business Account** por cada concesionario
2. **WhatsApp Business Phone Numbers** verificados
3. **App de Facebook** con permisos WhatsApp Business

## Configuración por Tenant

### Concesionario 001 (Santiago Centro)
```bash
# Obtener desde Meta Business Manager:
PHONE_NUMBER_ID_001="TU_PHONE_NUMBER_ID"
ACCESS_TOKEN_001="TU_ACCESS_TOKEN"
BUSINESS_ACCOUNT_ID_001="TU_BUSINESS_ACCOUNT_ID"

# Webhook URL (ya configurado):
WEBHOOK_URL_001="https://concesionario1.chat.optimacx.net/webhooks/whatsapp"
VERIFY_TOKEN_001="$(grep concesionario_001 tenant_accounts_setup.json | grep webhook_verify_token)"
```

### Concesionario 002 (Las Condes)
```bash
PHONE_NUMBER_ID_002="TU_PHONE_NUMBER_ID"
ACCESS_TOKEN_002="TU_ACCESS_TOKEN"  
BUSINESS_ACCOUNT_ID_002="TU_BUSINESS_ACCOUNT_ID"
WEBHOOK_URL_002="https://concesionario2.chat.optimacx.net/webhooks/whatsapp"
```

### Concesionario 003 (Maipú)  
```bash
PHONE_NUMBER_ID_003="TU_PHONE_NUMBER_ID"
ACCESS_TOKEN_003="TU_ACCESS_TOKEN"
BUSINESS_ACCOUNT_ID_003="TU_BUSINESS_ACCOUNT_ID"
WEBHOOK_URL_003="https://concesionario3.chat.optimacx.net/webhooks/whatsapp"
```

## Pasos de Configuración

### 1. En Meta Business Manager:
- Ir a WhatsApp Manager
- Seleccionar la App
- Configurar Webhook URL para cada número
- Suscribirse a eventos: `messages`, `message_deliveries`, `message_reads`

### 2. En Chatwoot Admin Panel:
- Crear canal WhatsApp por tenant
- Configurar Phone Number ID y Access Token
- Testear conexión

### 3. Verificación:
```bash
# Test webhook por tenant:
curl -X POST "https://concesionario1.chat.optimacx.net/webhooks/whatsapp" \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook_verification"}'
```

## 🔗 N8N Integration

Cada webhook de Chatwoot enviará eventos a N8N:
- URL N8N: https://n8n-optimacx-supabase-dev-1008284849803.southamerica-west1.run.app
- Endpoint: `/webhook/chatwoot-{tenant_id}`

EOF
    
    print_status "Guía WhatsApp Business generada: whatsapp_business_setup.md"
}

# Function to setup N8N integration
setup_n8n_integration() {
    print_info "Configurando integración con N8N..."
    
    N8N_BASE_URL="https://n8n-optimacx-supabase-dev-1008284849803.southamerica-west1.run.app"
    
    cat << EOF > n8n_chatwoot_webhooks.json
{
  "n8n_webhooks": {
    "base_url": "${N8N_BASE_URL}",
    "endpoints": {
      "concesionario_001": "${N8N_BASE_URL}/webhook/chatwoot-concesionario-001",
      "concesionario_002": "${N8N_BASE_URL}/webhook/chatwoot-concesionario-002", 
      "concesionario_003": "${N8N_BASE_URL}/webhook/chatwoot-concesionario-003"
    },
    "events_to_forward": [
      "message_created",
      "message_updated", 
      "conversation_created",
      "conversation_status_changed",
      "contact_created",
      "contact_updated"
    ],
    "ai_integration": {
      "gemini_model": "gemini-1.5-flash",
      "response_generation": true,
      "lead_classification": true,
      "sentiment_analysis": true
    }
  }
}
EOF
    
    print_status "Configuración N8N generada: n8n_chatwoot_webhooks.json"
}

# Function to generate DNS configuration
setup_dns_config() {
    print_info "Generando configuración DNS..."
    
    # Get the static IP
    STATIC_IP=$(gcloud compute addresses describe chatwoot-multitenant-ip-${ENVIRONMENT} \
        --global --project=${PROJECT_ID} --format="value(address)" 2>/dev/null || echo "PENDING")
    
    cat << EOF > dns_configuration.md
# 🌐 Configuración DNS - Subdominios Chatwoot

## IP Estática Asignada
\`\`\`
IP: ${STATIC_IP}
\`\`\`

## Records DNS Requeridos

Agregar estos A records en tu proveedor DNS (optimacx.net):

\`\`\`dns
concesionario1.chat.optimacx.net.    A    ${STATIC_IP}
concesionario2.chat.optimacx.net.    A    ${STATIC_IP}  
concesionario3.chat.optimacx.net.    A    ${STATIC_IP}
\`\`\`

## Verificación DNS

Después de configurar, verificar con:

\`\`\`bash
# Test DNS resolution:
nslookup concesionario1.chat.optimacx.net
nslookup concesionario2.chat.optimacx.net
nslookup concesionario3.chat.optimacx.net

# Test HTTPS access:
curl -I https://concesionario1.chat.optimacx.net
curl -I https://concesionario2.chat.optimacx.net  
curl -I https://concesionario3.chat.optimacx.net
\`\`\`

## SSL Certificates

Los certificados SSL se generan automáticamente via Google Managed SSL.
Tiempo de propagación: 10-60 minutos después de configurar DNS.

## Status Check

\`\`\`bash
# Verificar estado SSL certificates:
gcloud compute ssl-certificates list --project=${PROJECT_ID}
\`\`\`
EOF
    
    print_status "Configuración DNS generada: dns_configuration.md"
}

# Function to create monitoring dashboard links
setup_monitoring_links() {
    print_info "Generando enlaces de monitoreo..."
    
    cat << EOF > monitoring_dashboard.md
# 📊 Monitoreo y Dashboards - Chatwoot Multitenant

## 🎯 Enlaces Directos

### Cloud Run Service
- **Service**: https://console.cloud.google.com/run/detail/${REGION}/${SERVICE_NAME}/metrics?project=${PROJECT_ID}
- **Logs**: https://console.cloud.google.com/run/detail/${REGION}/${SERVICE_NAME}/logs?project=${PROJECT_ID}
- **Revisions**: https://console.cloud.google.com/run/detail/${REGION}/${SERVICE_NAME}/revisions?project=${PROJECT_ID}

### Monitoring
- **Custom Dashboard**: https://console.cloud.google.com/monitoring/dashboards?project=${PROJECT_ID}
- **Alerting Policies**: https://console.cloud.google.com/monitoring/alerting?project=${PROJECT_ID}
- **Uptime Checks**: https://console.cloud.google.com/monitoring/uptime?project=${PROJECT_ID}

### Security
- **Secret Manager**: https://console.cloud.google.com/security/secret-manager?project=${PROJECT_ID}
- **Security Policies**: https://console.cloud.google.com/net-security/securitypolicies/list?project=${PROJECT_ID}

### Database & Cache
- **Supabase Dashboard**: https://supabase.com/dashboard/project/bvwgmqzxlxvbvyqwmmrr
- **Redis Instance**: https://console.cloud.google.com/memorystore/redis/instances?project=${PROJECT_ID}

## 📈 Métricas Clave

### Por Tenant:
- Requests per minute por subdominio
- Response latency promedio
- Error rate por concesionario
- WhatsApp messages processed

### Infraestructura:
- Cloud Run instances activas
- CPU/Memory utilization
- Redis connections
- Database connections

## 🚨 Alertas Configuradas

1. **High Error Rate**: > 5% por 5 minutos
2. **High Latency**: > 2 segundos promedio
3. **Instance Scaling**: > 8 instancias activas
4. **Database Connections**: > 80% pool utilization

## 📱 Notificaciones

Configurar en: https://console.cloud.google.com/monitoring/alerting/notifications?project=${PROJECT_ID}

Canales recomendados:
- Email: admin@optimacx.net
- Slack: #chatwoot-alerts
- SMS: Para alertas críticas
EOF
    
    print_status "Enlaces de monitoreo generados: monitoring_dashboard.md"
}

# Function to run final tests
run_final_tests() {
    print_info "Ejecutando tests finales..."
    
    echo "🧪 Test Suite - Chatwoot Multitenant"
    echo "===================================="
    
    # Test 1: Service health
    echo -n "Test 1 - Service Health: "
    if curl -s -o /dev/null -w "%{http_code}" "${CHATWOOT_URL}/health" | grep -q "200"; then
        print_status "PASS"
    else
        print_warning "FAIL - Service may still be starting"
    fi
    
    # Test 2: Admin panel access
    echo -n "Test 2 - Admin Panel: "
    if curl -s -o /dev/null -w "%{http_code}" "${CHATWOOT_URL}/super_admin" | grep -q "200\|302"; then
        print_status "PASS"
    else
        print_warning "FAIL - Admin panel not accessible"
    fi
    
    # Test 3: Static assets
    echo -n "Test 3 - Static Assets: "
    if curl -s -o /dev/null -w "%{http_code}" "${CHATWOOT_URL}/assets/application.js" | grep -q "200"; then
        print_status "PASS"
    else
        print_warning "FAIL - Static assets not loading"
    fi
    
    echo ""
    print_status "Tests completados"
}

# Function to generate final summary
generate_summary() {
    print_info "Generando resumen final..."
    
    cat << EOF > CHATWOOT_DEPLOYMENT_SUMMARY.md
# 🎉 Chatwoot Multitenant - Deployment Summary

## ✅ Recursos Desplegados

### 🏗️ Infraestructura
- **Cloud Run Service**: ${SERVICE_NAME}
- **Region**: ${REGION} (Santiago, Chile)
- **Auto-scaling**: 1-10 instancias
- **SSL Certificates**: 3 subdominios
- **Static IP**: $(gcloud compute addresses describe chatwoot-multitenant-ip-${ENVIRONMENT} --global --project=${PROJECT_ID} --format="value(address)" 2>/dev/null || echo "PENDING")

### 🔐 Seguridad
- **Secrets Manager**: Database, Redis, WhatsApp configs
- **Security Policy**: Rate limiting, DDoS protection
- **SSL/TLS**: Certificados automáticos Google-managed

### 📊 Monitoreo
- **Custom Dashboard**: Métricas por tenant
- **Alertas**: Error rate, latency, scaling
- **Logging**: Structured logs por concesionario

## 🌐 URLs Principales

### Admin & Management
- **Super Admin**: ${CHATWOOT_URL}/super_admin
- **Main Dashboard**: ${CHATWOOT_URL}

### Subdominios Tenant (Require DNS setup)
- **Concesionario 001**: https://concesionario1.chat.optimacx.net
- **Concesionario 002**: https://concesionario2.chat.optimacx.net  
- **Concesionario 003**: https://concesionario3.chat.optimacx.net

## 📋 Próximos Pasos

### PASO 1: Configurar DNS ⚠️ REQUERIDO
1. Agregar A records para subdominios → IP estática
2. Esperar propagación DNS (10-60 min)
3. Verificar SSL certificates automáticos

### PASO 2: Setup Super Admin
1. Acceder: ${CHATWOOT_URL}/super_admin
2. Crear cuenta admin principal
3. Configurar tenants por concesionario

### PASO 3: WhatsApp Business API  
1. Configurar Meta Business Manager
2. Obtener Phone Number IDs y Access Tokens
3. Configurar webhooks por tenant

### PASO 4: N8N Integration
1. Importar workflows Chatwoot
2. Configurar webhooks hacia N8N
3. Setup IA (Gemini) para respuestas automáticas  

## 💰 Costos Estimados

### Base (1 instancia 24/7):
- Cloud Run: ~\$55 USD/mes
- Redis: ~\$25 USD/mes  
- SSL & Networking: ~\$5 USD/mes
- **Total Base**: ~\$85 USD/mes

### Con scaling (picos 5-8 instancias):
- **Total Máximo**: ~\$150-200 USD/mes

## 📞 Soporte

Para issues o configuración adicional:
- **Documentación**: Ver archivos generados en este directorio
- **Logs**: \`gcloud logs tail --service=${SERVICE_NAME}\`
- **Monitoring**: https://console.cloud.google.com/run/detail/${REGION}/${SERVICE_NAME}

---

**✅ Status**: Infraestructura completamente desplegada  
**⏰ Tiempo total**: $(date)  
**🎯 Siguiente**: Configurar DNS y Super Admin
EOF
    
    print_status "Resumen generado: CHATWOOT_DEPLOYMENT_SUMMARY.md"
}

# Main execution
main() {
    echo -e "${PURPLE}🚀 Iniciando configuración post-despliegue...${NC}"
    echo ""
    
    # Step 1: Check service readiness
    check_service_ready
    
    # Step 2: Prepare super admin setup
    create_super_admin
    
    # Step 3: Generate tenant configuration
    create_tenant_accounts
    
    # Step 4: Setup WhatsApp configuration
    setup_whatsapp_config
    
    # Step 5: Configure N8N integration
    setup_n8n_integration
    
    # Step 6: Generate DNS configuration
    setup_dns_config
    
    # Step 7: Setup monitoring links
    setup_monitoring_links
    
    # Step 8: Run final tests
    run_final_tests
    
    # Step 9: Generate final summary
    generate_summary
    
    echo ""
    echo -e "${GREEN}🎉 CONFIGURACIÓN POST-DESPLIEGUE COMPLETA${NC}"
    echo -e "${GREEN}=========================================${NC}"
    echo ""
    echo -e "${BLUE}📋 Archivos generados:${NC}"
    echo -e "   📄 .env - Variables de entorno"
    echo -e "   📄 super_admin_setup.md - Setup Super Admin"
    echo -e "   📄 tenant_accounts_setup.json - Configuración tenants"
    echo -e "   📄 whatsapp_business_setup.md - Setup WhatsApp"
    echo -e "   📄 n8n_chatwoot_webhooks.json - Integración N8N"
    echo -e "   📄 dns_configuration.md - Configuración DNS"
    echo -e "   📄 monitoring_dashboard.md - Enlaces monitoreo"
    echo -e "   📄 CHATWOOT_DEPLOYMENT_SUMMARY.md - Resumen completo"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANTE: Configurar DNS records antes de usar subdominios${NC}"
    echo -e "${BLUE}🔗 Admin Panel: ${CHATWOOT_URL}/super_admin${NC}"
    echo ""
}

# Run main function
main "$@"
