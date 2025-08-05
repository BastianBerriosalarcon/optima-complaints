# Chatwoot Environment Outputs - Optimizado para Chile

output "chatwoot_service_url" {
  description = "URL of the Chatwoot service"
  value       = "Will be available after deployment - Check Cloud Run console"
}

output "chatwoot_admin_url" {
  description = "Chatwoot admin panel URL"
  value       = "https://chatwoot-multitenant-dev-{PROJECT_NUMBER}.southamerica-west1.run.app/super_admin"
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
