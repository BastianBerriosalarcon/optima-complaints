# Chatwoot Environment Outputs - Optimizado para Chile

output "chatwoot_service_url" {
  description = "URL of the Chatwoot service"
  value       = module.chatwoot.service_url
}

output "chatwoot_admin_url" {
  description = "Chatwoot admin panel URL"
  value       = "${module.chatwoot.service_url}/super_admin"
}

# Load Balancer outputs
output "load_balancer_ip" {
  description = "Global Load Balancer IP address for custom domains"
  value       = module.chatwoot.load_balancer_ip
}

output "tenant_domains" {
  description = "Custom domains configured for each tenant"
  value       = module.chatwoot.tenant_domains
}

output "tenant_urls" {
  description = "HTTPS URLs for each tenant via Load Balancer"
  value       = {
    for config in var.tenant_configs :
    config.name => "https://${config.subdomain}"
  }
}

# Database information
output "database_info" {
  description = "Database configuration (Cloud SQL Santiago vs Supabase)"
  value = {
    type        = var.use_cloud_sql_santiago ? "Cloud SQL Santiago" : "Supabase São Paulo"
    region      = var.use_cloud_sql_santiago ? "southamerica-west1" : "sa-east-1"
    cost_est    = var.use_cloud_sql_santiago ? "~$20-25 USD/mes" : "Incluido en plan"
    latency_opt = var.use_cloud_sql_santiago ? "Optimizado para Chile" : "Latencia cross-region"
  }
}

output "region" {
  description = "Deployment region optimized for Chile"
  value       = var.region
}

output "latency_optimization" {
  description = "Latency optimizations applied"
  value = {
    region = "southamerica-west1 (Santiago, Chile)"
    cpu = var.cpu_limit
    memory = var.memory_limit
    min_instances = var.min_instances
    max_instances = var.max_instances
    timezone = var.timezone
  }
}
