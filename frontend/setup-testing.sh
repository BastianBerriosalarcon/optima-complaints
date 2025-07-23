#!/bin/bash

echo "🚀 Configurando Testing para Óptima-CX..."

# Install testing dependencies
echo "📦 Instalando dependencias de testing..."
npm install --save-dev @playwright/test @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/jest jest jest-environment-jsdom

# Install Playwright browsers
echo "🌐 Instalando navegadores de Playwright..."
npx playwright install

# Create test directories if they don't exist
echo "📁 Creando directorios de tests..."
mkdir -p src/components/__tests__
mkdir -p src/components/sections/__tests__
mkdir -p src/components/ui/__tests__
mkdir -p tests/e2e
mkdir -p test-results/screenshots

# Run initial tests to verify setup
echo "🧪 Ejecutando tests iniciales para verificar configuración..."
npm run test -- --passWithNoTests

echo "✅ Configuración de testing completada!"
echo ""
echo "📋 Comandos disponibles:"
echo "  npm run test              # Ejecutar tests unitarios"
echo "  npm run test:watch        # Ejecutar tests en modo watch"
echo "  npm run test:coverage     # Ejecutar tests con cobertura"
echo "  npm run test:e2e          # Ejecutar tests E2E"
echo "  npm run test:e2e:ui       # Ejecutar tests E2E con UI"
echo "  npm run test:all          # Ejecutar todos los tests"
echo ""
echo "🎯 Para ejecutar tests específicos:"
echo "  npm run test -- hero.test.tsx"
echo "  npm run test:e2e -- landing-page.spec.ts"