#!/bin/bash

echo "=== Fix Chatwoot ActionCable ==="
cd /workspaces/optimacx-GCP/infrastructure/terraform/environments/chatwoot

echo "Aplicando fix para ActionCable..."
terraform apply -auto-approve

echo "Esperando despliegue..."
sleep 30

echo "Verificando servicio..."
curl -I https://chatwoot-multitenant-dev-wfzra4ruxq-tl.a.run.app/

echo "Fix completado!"
