#!/bin/bash

echo "🏗️  Reorganizando estructura del proyecto Óptima-CX..."

# Crear carpetas organizativas
mkdir -p config/{docker,n8n,supabase}
mkdir -p assets

echo "📁 Carpetas creadas: config/, assets/"

# 1. Mover archivos de Docker/Container
echo "🐋 Moviendo archivos Docker..."
mv docker-compose.yml config/docker/ 2>/dev/null
mv Dockerfile.proxy config/docker/ 2>/dev/null
mv startup-proxy.sh config/docker/ 2>/dev/null
mv n8n-simple.yaml config/n8n/ 2>/dev/null

# 2. Consolidar Supabase
echo "🗄️  Consolidando configuración Supabase..."
mv supabase/config.toml database/supabase-config.toml 2>/dev/null
cp -r supabase/migrations/* database/migrations/ 2>/dev/null
mv supabase/seed.sql database/seeds/ 2>/dev/null
rm -rf supabase/ 2>/dev/null

# 3. Mover documentación
echo "📚 Organizando documentación..."
mv CLAUDE.md docs/ 2>/dev/null
mv README-cloudshell.txt docs/ 2>/dev/null
mv roles.md docs/ 2>/dev/null
mv database_structure_analysis.md docs/ 2>/dev/null
mv test-automation-plan.md docs/ 2>/dev/null
mv twiliointegracion.md docs/ 2>/dev/null
mv ADVISOR_WORKLOAD_MANAGEMENT.md docs/ 2>/dev/null

# 4. Mover scripts y funciones SQL
echo "🔧 Organizando scripts y funciones..."
mkdir -p database/functions
mv search_function.sql database/functions/ 2>/dev/null
mv create_search_function.js database/functions/ 2>/dev/null
mv advisor_workload_functions.sql database/functions/ 2>/dev/null
mv execute_migration.js scripts/ 2>/dev/null

# 5. Mover assets
echo "🎨 Moviendo assets..."
mv logooptimacx.png assets/ 2>/dev/null

# 6. Limpiar archivos/carpetas obsoletas
echo "🗑️  Limpiando archivos obsoletos..."
rm -rf custom-nodes/ 2>/dev/null  # Duplicado de applications/custom-nodes/
rm -rf bin/ 2>/dev/null  # Vacío o innecesario

echo "✅ Reorganización completada!"
echo ""
echo "📊 Nueva estructura:"
echo "├── package.json (raíz limpia)"
echo "├── applications/"
echo "├── infrastructure/" 
echo "├── database/ (consolidado)"
echo "├── frontend/"
echo "├── shared/"
echo "├── config/ (nuevo)"
echo "│   ├── docker/"
echo "│   ├── n8n/"
echo "│   └── supabase/"
echo "├── assets/ (nuevo)"
echo "├── docs/ (ampliado)"
echo "└── scripts/"
echo ""
echo "🎉 Proyecto reorganizado exitosamente!"