#!/bin/bash

# Script para obtener las claves de Supabase
# Primero necesitas configurar tu ACCESS_TOKEN y PROJECT_REF

echo "=== Configuración de Supabase ==="
echo ""
echo "1. Ve a https://supabase.com/dashboard/account/tokens"
echo "2. Crea un Personal Access Token"
echo "3. Configura las variables:"
echo ""
echo "export SUPABASE_ACCESS_TOKEN=\"tu-access-token\""
echo "export PROJECT_REF=\"tu-project-ref\""
echo ""
echo "4. Luego ejecuta estos comandos:"
echo ""
echo "# Obtener las claves del proyecto"
echo "curl -H \"Authorization: Bearer \$SUPABASE_ACCESS_TOKEN\" \\"
echo "  \"https://api.supabase.com/v1/projects/\$PROJECT_REF/api-keys?reveal=true\""
echo ""
echo "# Obtener URL del proyecto"
echo "curl -H \"Authorization: Bearer \$SUPABASE_ACCESS_TOKEN\" \\"
echo "  \"https://api.supabase.com/v1/projects/\$PROJECT_REF\""
echo ""
echo "5. Actualiza el archivo .env con los valores obtenidos"