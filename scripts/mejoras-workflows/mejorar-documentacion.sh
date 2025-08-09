#!/bin/bash

# Script para mejorar la documentación de workflows
# Agrega campos estándar de metadatos y documentación

BUSINESS_DIR="/workspaces/optimacx-GCP/applications/workflows/business"

echo "📚 Mejorando documentación de workflows..."

# Función para agregar metadatos estándar
enhance_workflow_metadata() {
    local file="$1"
    local category=$(basename $(dirname "$file"))
    local workflow_name=$(basename "$file" .json)
    
    echo "Mejorando metadatos: $file"
    
    # Crear backup
    cp "$file" "${file}.metadata.bak"
    
    # Usar jq para agregar campos de metadatos si no existen
    jq --arg version "1.0.0" \
       --arg category "$category" \
       --arg lastUpdated "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
       --arg apiVersion "n8n/1.0" \
       --arg docsUrl "https://docs.optimacx.com/workflows/$category" \
       '. as $original | 
        {
          name: .name,
          description: .description,
          version: (if .version then .version else $version end),
          category: $category,
          tags: (.tags // []),
          metadata: {
            lastUpdated: $lastUpdated,
            apiVersion: $apiVersion,
            author: "OptimaCX Team",
            support: {
              email: "support@optimacx.com",
              docs: $docsUrl
            },
            dependencies: (if .metadata.dependencies then .metadata.dependencies else [] end),
            expectedInput: (if .metadata.expectedInput then .metadata.expectedInput else {} end),
            expectedOutput: (if .metadata.expectedOutput then .metadata.expectedOutput else {} end)
          }
        } + $original' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
}

# Procesar todos los workflows
find "$BUSINESS_DIR" -name "*.json" -type f | while read -r file; do
    enhance_workflow_metadata "$file"
done

echo "✅ Metadatos mejorados en todos los workflows"
