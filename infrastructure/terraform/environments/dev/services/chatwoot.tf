# Configuración específica de Chatwoot para el entorno dev

locals {
  chatwoot_config = {
    # Configuración multitenant
    enable_multitenant = true
    
    # Database configuration (Cloud SQL separado)
    database_config = {
      instance_name = "chatwoot-${var.environment}"
      database_version = "POSTGRES_15"
      tier = "db-custom-1-4096"  # 1 vCPU, 4GB RAM
    }
    
    # Service configuration
    service_config = {
      image = "chatwoot/chatwoot:latest"
      cpu_limit = "1"
      memory_limit = "2Gi"
      max_instances = 3
    }
  }
}

# Output para usar en main.tf
output "chatwoot_config" {
  value = local.chatwoot_config
}
