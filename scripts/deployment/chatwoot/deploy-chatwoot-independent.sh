#!/bin/bash

# 🚀 Script de Despliegue Independiente - Chatwoot OptimaCX
# Despliega Chatwoot utilizando infraestructura compartida

set -e

echo "🚀 Iniciando despliegue independiente de Chatwoot..."
echo "=============================================="

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuración
PROJECT_ID="optima-cx-467616"
REGION="southamerica-west1"
CHATWOOT_DIR="/workspaces/optimacx-GCP/infrastructure/terraform/environments/chatwoot"

echo -e "${YELLOW}📋 Verificando pre-requisitos...${NC}"

# Verificar que existe la infraestructura base
echo "🔍 Verificando Redis..."
if gcloud redis instances describe chatwoot-redis-dev --region=$REGION --project=$PROJECT_ID > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis encontrado: chatwoot-redis-dev${NC}"
else
    echo -e "${RED}❌ Redis no encontrado. Ejecuta primero el despliegue base (dev environment)${NC}"
    exit 1
fi

echo "🔍 Verificando VPC..."
if gcloud compute networks describe optimacx-vpc-dev --project=$PROJECT_ID > /dev/null 2>&1; then
    echo -e "${GREEN}✅ VPC encontrada: optimacx-vpc-dev${NC}"
else
    echo -e "${RED}❌ VPC no encontrada. Ejecuta primero el despliegue base (dev environment)${NC}"
    exit 1
fi

echo "🔍 Verificando Service Account..."
if gcloud iam service-accounts describe chatwoot-service-account-dev@$PROJECT_ID.iam.gserviceaccount.com --project=$PROJECT_ID > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Service Account encontrado: chatwoot-service-account-dev${NC}"
else
    echo -e "${RED}❌ Service Account no encontrado. Ejecuta primero el despliegue base (dev environment)${NC}"
    exit 1
fi

echo -e "${YELLOW}🏗️ Desplegando Chatwoot...${NC}"

# Navegar al directorio de Chatwoot
cd $CHATWOOT_DIR

# Inicializar Terraform
echo "📦 Inicializando Terraform..."
terraform init

# Planificar despliegue
echo "📋 Generando plan de despliegue..."
terraform plan -out=chatwoot.tfplan

# Confirmar despliegue
echo -e "${YELLOW}¿Continuar con el despliegue? (y/N):${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "🚀 Aplicando cambios..."
    terraform apply chatwoot.tfplan
    
    # Limpiar plan file
    rm -f chatwoot.tfplan
    
echo "✅ Despliegue de Chatwoot completado exitosamente!"
echo ""
echo "🌐 Acceso a Chatwoot:"
echo "   Admin Panel: https://chatwoot-multitenant-dev-1008284849803.southamerica-west1.run.app/super_admin"
echo "   API Docs: https://chatwoot-multitenant-dev-1008284849803.southamerica-west1.run.app/api-docs"
echo ""
echo "🏢 URLs por Tenant (requiere configuración DNS):"
echo "   concesionario_001: https://concesionario1.chat.optimacx.net"
echo "   concesionario_002: https://concesionario2.chat.optimacx.net"  
echo "   concesionario_003: https://concesionario3.chat.optimacx.net"
echo ""
echo "🔧 Configuración Multitenant:"
echo "   Ejecuta: ./scripts/setup-chatwoot-multitenant.sh"
echo ""
echo "📊 Monitoreo:"
echo "   Cloud Run: https://console.cloud.google.com/run/detail/$REGION/chatwoot-multitenant-dev"
echo "   Logs: gcloud logs tail --service=chatwoot-multitenant-dev"
echo ""    # Mostrar información del servicio
    echo -e "${YELLOW}📊 Información del servicio:${NC}"
    terraform output
    
    echo -e "${GREEN}🎉 Chatwoot está funcionando de forma independiente!${NC}"
    echo "🔗 Arquitectura:"
    echo "   ├── N8N: Funcionando independientemente"
    echo "   ├── Chatwoot: Desplegado y funcionando"
    echo "   ├── Redis: Compartido entre servicios"
    echo "   └── Base: Infraestructura compartida"
    
else
    echo -e "${RED}❌ Despliegue cancelado${NC}"
    rm -f chatwoot.tfplan
    exit 0
fi
