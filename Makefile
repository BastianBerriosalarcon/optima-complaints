# OptimaCx GCP - Makefile
# Comandos útiles para desarrollo y deployment

.PHONY: help setup dev deploy status logs clean test

# Variables
PROJECT_ID := optima-cx-467616
REGION := southamerica-west1
SERVICE_NAME := n8n-optima-cx

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m # No Color

help: ## Mostrar ayuda
	@echo "${GREEN}OptimaCx GCP - Comandos Disponibles${NC}"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "${YELLOW}%-20s${NC} %s\n", $$1, $$2}'

setup: ## Configurar ambiente de desarrollo
	@echo "${GREEN}Configurando ambiente de desarrollo...${NC}"
	@if [ ! -f .env ]; then cp .env.example .env; echo "${YELLOW}Archivo .env creado. Configura las variables necesarias.${NC}"; fi
	@gcloud config set project $(PROJECT_ID)
	@gcloud config set compute/region $(REGION)
	@echo "${GREEN}Ambiente configurado.${NC}"

dev: ## Iniciar desarrollo local con Docker Compose
	@echo "${GREEN}Iniciando desarrollo local...${NC}"
	@docker-compose up -d
	@echo "${GREEN}Servicios iniciados:${NC}"
	@echo "  - n8n: http://localhost:5678"
	@echo "  - PostgreSQL: localhost:5432"
	@echo "  - Redis: localhost:6379"
	@echo "  - pgAdmin: http://localhost:8080"

dev-stop: ## Detener desarrollo local
	@echo "${YELLOW}Deteniendo desarrollo local...${NC}"
	@docker-compose down

dev-logs: ## Ver logs de desarrollo local
	@docker-compose logs -f

deploy: ## Desplegar a Google Cloud Run
	@echo "${GREEN}Desplegando a Google Cloud Run...${NC}"
	@gcloud run deploy $(SERVICE_NAME) \
		--source . \
		--region $(REGION) \
		--allow-unauthenticated \
		--platform managed \
		--memory 4Gi \
		--cpu 2 \
		--min-instances 1 \
		--max-instances 10
	@echo "${GREEN}Deployment completado.${NC}"

tf-init: ## Inicializar Terraform
	@echo "${GREEN}Inicializando Terraform...${NC}"
	@cd terraform && terraform init

tf-plan: ## Planificar cambios con Terraform
	@echo "${GREEN}Planificando cambios...${NC}"
	@cd terraform && terraform plan

tf-apply: ## Aplicar cambios con Terraform
	@echo "${GREEN}Aplicando cambios...${NC}"
	@cd terraform && terraform apply

tf-destroy: ## Destruir infraestructura con Terraform
	@echo "${RED}¿Estás seguro? Esto destruirá toda la infraestructura.${NC}"
	@read -p "Escribe 'destroy' para confirmar: " confirm && [ "$$confirm" = "destroy" ] || exit 1
	@cd terraform && terraform destroy

status: ## Verificar estado de servicios
	@echo "${GREEN}Estado de servicios:${NC}"
	@echo ""
	@echo "${YELLOW}Cloud Run Services:${NC}"
	@gcloud run services list --region $(REGION) --format="table(metadata.name,status.url,status.conditions[0].status)"
	@echo ""
	@echo "${YELLOW}Cloud SQL Instances:${NC}"
	@gcloud sql instances list --format="table(name,databaseVersion,region,settings.tier,state)"

logs: ## Ver logs de Cloud Run
	@echo "${GREEN}Logs de Cloud Run:${NC}"
	@gcloud run services logs read $(SERVICE_NAME) --region $(REGION) --limit 100

logs-tail: ## Seguir logs en tiempo real
	@echo "${GREEN}Siguiendo logs en tiempo real...${NC}"
	@gcloud run services logs tail $(SERVICE_NAME) --region $(REGION)

test: ## Ejecutar pruebas
	@echo "${GREEN}Ejecutando pruebas...${NC}"
	@if [ -f package.json ]; then npm test; else echo "${YELLOW}No se encontró package.json${NC}"; fi

clean: ## Limpiar archivos temporales
	@echo "${GREEN}Limpiando archivos temporales...${NC}"
	@docker system prune -f
	@docker volume prune -f
	@rm -rf node_modules
	@rm -rf .next
	@rm -rf dist
	@rm -rf build
	@echo "${GREEN}Limpieza completada.${NC}"

backup: ## Crear backup de la base de datos
	@echo "${GREEN}Creando backup de la base de datos...${NC}"
	@gcloud sql export sql n8n-optima-cx-postgres gs://$(PROJECT_ID)-backups/backup-$(shell date +%Y%m%d_%H%M%S).sql \
		--database=n8n_optima_cx
	@echo "${GREEN}Backup creado.${NC}"

db-connect: ## Conectar a la base de datos
	@echo "${GREEN}Conectando a la base de datos...${NC}"
	@gcloud sql connect n8n-optima-cx-postgres --user=n8n_user --database=n8n_optima_cx

url: ## Mostrar URL de n8n
	@echo "${GREEN}URL de n8n:${NC}"
	@gcloud run services describe $(SERVICE_NAME) --region $(REGION) --format="value(status.url)"

health: ## Verificar salud de la aplicación
	@echo "${GREEN}Verificando salud de la aplicación...${NC}"
	@curl -I $$(gcloud run services describe $(SERVICE_NAME) --region $(REGION) --format="value(status.url)")

secrets: ## Configurar secrets en Secret Manager
	@echo "${GREEN}Configurando secrets...${NC}"
	@echo "Implementar configuración de secrets aquí"

monitor: ## Abrir monitoreo en Cloud Console
	@echo "${GREEN}Abriendo monitoreo...${NC}"
	@open "https://console.cloud.google.com/run/detail/$(REGION)/$(SERVICE_NAME)/metrics?project=$(PROJECT_ID)"

docs: ## Generar documentación
	@echo "${GREEN}Documentación disponible en README.md${NC}"
	@if command -v mdbook > /dev/null; then mdbook serve docs; else echo "${YELLOW}Instala mdbook para generar docs${NC}"; fi

git-push: ## Subir cambios a GitHub
	@echo "${GREEN}Subiendo cambios a GitHub...${NC}"
	@git add .
	@git commit -m "Update project files - $(shell date)"
	@git push origin main

# Comandos de mantenimiento
update-deps: ## Actualizar dependencias
	@echo "${GREEN}Actualizando dependencias...${NC}"
	@docker-compose pull
	@if [ -f package.json ]; then npm update; fi

restart: ## Reiniciar servicios
	@echo "${GREEN}Reiniciando servicios...${NC}"
	@gcloud run services update $(SERVICE_NAME) --region $(REGION) --update-env-vars RESTART=$$(date +%s)

scale-up: ## Escalar hacia arriba
	@echo "${GREEN}Escalando hacia arriba...${NC}"
	@gcloud run services update $(SERVICE_NAME) --region $(REGION) --min-instances 2 --max-instances 20

scale-down: ## Escalar hacia abajo
	@echo "${GREEN}Escalando hacia abajo...${NC}"
	@gcloud run services update $(SERVICE_NAME) --region $(REGION) --min-instances 1 --max-instances 5

# Comandos específicos de OptimaCx
survey-test: ## Probar webhook de encuesta
	@echo "${GREEN}Probando webhook de encuesta...${NC}"
	@curl -X GET "$$(gcloud run services describe $(SERVICE_NAME) --region $(REGION) --format="value(status.url)")/webhook/encuesta-qr?tenant=demo&sucursal=principal"

rag-test: ## Probar sistema RAG
	@echo "${GREEN}Probando sistema RAG...${NC}"
	@curl -X POST "$$(gcloud run services describe $(SERVICE_NAME) --region $(REGION) --format="value(status.url)")/webhook/complaint" \
		-H "Content-Type: application/json" \
		-d '{"tenant_id": "demo", "complaint": "Mi auto tiene problemas con el aire acondicionado"}'