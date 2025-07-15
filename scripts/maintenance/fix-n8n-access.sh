#!/bin/bash

# ==============================================================================
# SCRIPT DE DIAGNÓSTICO Y FIX PARA N8N.OPTIMACX.NET
# ==============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"; }
warn() { echo -e "${YELLOW}[$(date +'%H:%M:%S')] $1${NC}"; }
error() { echo -e "${RED}[$(date +'%H:%M:%S')] $1${NC}"; }

# Variables
PROJECT_ID="burnished-data-463915-d8"
REGION="southamerica-west1"
SERVICE_NAME="n8n"

log "🔍 DIAGNÓSTICO DE N8N.OPTIMACX.NET"
echo ""

# 1. Verificar servicio Cloud Run
log "1. Verificando Cloud Run service..."
CLOUD_RUN_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)" 2>/dev/null || echo "")

if [[ -n "$CLOUD_RUN_URL" ]]; then
    log "✅ Cloud Run activo: $CLOUD_RUN_URL"
    
    # Test de conectividad directa
    log "Probando conectividad directa..."
    if curl -s -o /dev/null -w "%{http_code}" "$CLOUD_RUN_URL" --max-time 10 | grep -q "200\|302"; then
        log "✅ Cloud Run responde correctamente"
        echo ""
        warn "🎯 ACCESO DIRECTO DISPONIBLE:"
        echo -e "${YELLOW}   $CLOUD_RUN_URL${NC}"
        echo ""
    else
        error "❌ Cloud Run no responde"
    fi
else
    error "❌ Cloud Run service no encontrado"
    exit 1
fi

# 2. Verificar certificado SSL
log "2. Verificando certificado SSL..."
SSL_STATUS=$(gcloud compute ssl-certificates describe optimacx-ssl-cert --global --format="value(managed.status)" 2>/dev/null || echo "NOT_FOUND")

if [[ "$SSL_STATUS" == "ACTIVE" ]]; then
    log "✅ Certificado SSL activo"
elif [[ "$SSL_STATUS" == "PROVISIONING" ]]; then
    warn "⏳ Certificado SSL en provisioning (puede tomar hasta 60 minutos)"
else
    error "❌ Certificado SSL: $SSL_STATUS"
fi

# 3. Verificar dominios del certificado
log "3. Verificando dominios del certificado..."
gcloud compute ssl-certificates describe optimacx-ssl-cert --global --format="table(managed.domainStatus.yesno(no=''):label='DOMAIN STATUS')" 2>/dev/null || true

# 4. Verificar Load Balancer
log "4. Verificando Load Balancer..."
LB_IP=$(gcloud compute forwarding-rules describe optimacx-forwarding-rule --global --format="value(IPAddress)" 2>/dev/null || echo "")

if [[ -n "$LB_IP" ]]; then
    log "✅ Load Balancer IP: $LB_IP"
    
    # Verificar si el dominio apunta a esta IP
    log "Verificando DNS para n8n.optimacx.net..."
    DNS_IP=$(nslookup n8n.optimacx.net 8.8.8.8 2>/dev/null | grep "Address:" | tail -1 | awk '{print $2}' || echo "")
    
    if [[ "$DNS_IP" == "$LB_IP" ]]; then
        log "✅ DNS apunta correctamente al Load Balancer"
    else
        warn "⚠️  DNS mismatch:"
        echo "   Load Balancer IP: $LB_IP"
        echo "   DNS resuelve a: $DNS_IP"
    fi
else
    error "❌ Load Balancer no encontrado"
fi

# 5. Verificar Backend Health
log "5. Verificando backend health..."
BACKEND_STATUS=$(gcloud compute backend-services get-health n8n-backend --global --format="value(status[].healthStatus)" 2>/dev/null || echo "")

if [[ -n "$BACKEND_STATUS" ]]; then
    log "Backend status: $BACKEND_STATUS"
else
    warn "No se pudo obtener estado del backend"
fi

echo ""
log "🔧 RECOMENDACIONES:"

if [[ "$SSL_STATUS" == "PROVISIONING" ]]; then
    echo "1. ⏳ Esperar que el certificado SSL termine de provisionar"
    echo "2. 🌐 Mientras tanto, usar URL directa de Cloud Run:"
    echo -e "   ${YELLOW}$CLOUD_RUN_URL${NC}"
fi

if [[ "$DNS_IP" != "$LB_IP" && -n "$LB_IP" ]]; then
    echo "3. 📝 Actualizar DNS record:"
    echo "   n8n.optimacx.net A $LB_IP"
fi

echo ""
log "🚀 ACCESOS DISPONIBLES:"
echo -e "${GREEN}📱 Cloud Run Directo:${NC} $CLOUD_RUN_URL"

if [[ "$SSL_STATUS" == "ACTIVE" && "$DNS_IP" == "$LB_IP" ]]; then
    echo -e "${GREEN}🌐 Dominio Principal:${NC} https://n8n.optimacx.net"
else
    echo -e "${YELLOW}🌐 Dominio Principal:${NC} https://n8n.optimacx.net (en configuración)"
fi

echo ""
warn "💡 TIP: Si necesitas acceso inmediato, usa la URL directa de Cloud Run."