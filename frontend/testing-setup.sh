#!/bin/bash

# 🧪 Script unificado para configuración de testing OptimaCX
# Combina setup, instalación de dependencias y verificación

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Configurando Testing Completo para OptimaCX...${NC}"
echo "=================================================="

# Función para mostrar check o error
check_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

# Función para mostrar progreso
show_progress() {
    echo -e "${BLUE}📦 $1...${NC}"
}

# 1. Instalar dependencias de testing
show_progress "Instalando dependencias de testing"
npm install --save-dev @playwright/test @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/jest jest jest-environment-jsdom > /dev/null 2>&1
check_result $? "Dependencias de testing instaladas"

# 2. Crear directorios de tests
show_progress "Creando estructura de directorios"
mkdir -p src/components/__tests__
mkdir -p src/components/sections/__tests__
mkdir -p src/components/ui/__tests__
mkdir -p tests/e2e
mkdir -p test-results/screenshots
check_result $? "Directorios de tests creados"

# 3. Instalar navegadores de Playwright
show_progress "Instalando navegadores de Playwright"
npx playwright install > /dev/null 2>&1
check_result $? "Navegadores de Playwright instalados"

# 4. Verificar Jest
show_progress "Verificando configuración de Jest"
npm test -- --version > /dev/null 2>&1
check_result $? "Jest configurado correctamente"

# 5. Ejecutar tests iniciales
show_progress "Ejecutando tests iniciales"
npm test -- --passWithNoTests --silent > /dev/null 2>&1
check_result $? "Tests unitarios funcionando"

# 6. Verificar dependencias de sistema (solo si es root)
if [ "$EUID" -eq 0 ]; then
    show_progress "Instalando dependencias de sistema para Playwright"
    apt-get update > /dev/null 2>&1
    apt-get install -y --no-install-recommends \
        libasound2t64 libatk-bridge2.0-0t64 libatk1.0-0t64 libatspi2.0-0t64 \
        libcairo2 libcups2t64 libdbus-1-3 libdrm2 libgbm1 libglib2.0-0t64 \
        libnspr4 libnss3 libpango-1.0-0 libx11-6 libxcb1 libxcomposite1 \
        libxdamage1 libxext6 libxfixes3 libxkbcommon0 libxrandr2 > /dev/null 2>&1
    check_result $? "Dependencias de sistema instaladas"
    DEPS_AVAILABLE=true
else
    echo -e "${YELLOW}⚠️  Para instalar dependencias de sistema, ejecuta con sudo${NC}"
    dpkg -l | grep -q "libnspr4" && dpkg -l | grep -q "libnss3"
    DEPS_AVAILABLE=$?
fi

echo ""
echo "=============================================="
echo -e "${GREEN}📊 RESUMEN DE CONFIGURACIÓN:${NC}"
echo "=============================================="
echo -e "Jest Tests:      ${GREEN}✅ Configurado${NC}"
echo -e "Playwright:      ${GREEN}✅ Instalado${NC}"
echo -e "Directorios:     ${GREEN}✅ Creados${NC}"

if [ "$DEPS_AVAILABLE" -eq 0 ]; then
    echo -e "E2E Tests:       ${GREEN}✅ Completamente listo${NC}"
else
    echo -e "E2E Tests:       ${YELLOW}⚠️  Necesita: sudo ./testing-setup.sh${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Configuración completada!${NC}"
echo ""
echo "📋 Comandos disponibles:"
echo "  npm run test              # Tests unitarios"
echo "  npm run test:watch        # Tests en modo watch"
echo "  npm run test:coverage     # Tests con cobertura"
echo "  npm run test:e2e          # Tests E2E"
echo "  npm run test:e2e:ui       # Tests E2E con UI"
echo "  npm run test:all          # Todos los tests"
echo ""
echo "🎯 Para tests específicos:"
echo "  npm run test -- hero.test.tsx"
echo "  npm run test:e2e -- landing-page.spec.ts"
