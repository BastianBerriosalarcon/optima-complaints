# Configuración específica de N8N para el entorno dev
# Este archivo contiene las configuraciones específicas de N8N

locals {
  n8n_config = {
    service_name = "n8n-optimacx-supabase-dev"
    
    # Environment variables que van al container
    environment_variables = {
      N8N_PORT = "8080"
      N8N_USER_MANAGEMENT_DISABLED = "false"  # Multitenant habilitado
      SUPABASE_URL = var.supabase_url
      SUPABASE_ANON_KEY = var.supabase_anon_key
    }
    
    # Secrets from Google Secret Manager
    secrets = {
      SUPABASE_SERVICE_KEY = var.supabase_service_key_secret
    }
    
    # Resource configuration (valores reales del deployment)
    resources = {
      cpu_limit = "2"
      memory_limit = "2Gi"
      max_instances = 3
      min_instances = 0
    }
  }
}

# Output para usar en main.tf
output "n8n_config" {
  value = local.n8n_config
}
