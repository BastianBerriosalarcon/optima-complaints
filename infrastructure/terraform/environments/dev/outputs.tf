# Outputs del Entorno de Desarrollo

output "n8n_service_url" {
  description = "N8N Service URL"
  value       = module.n8n.service_url
}

output "n8n_service_name" {
  description = "N8N Service name"
  value       = module.n8n.service_name
}

output "chatwoot_service_url" {
  description = "Chatwoot Service URL"
  value       = try(module.chatwoot.service_url, "Not deployed")
}

output "supabase_url" {
  description = "Supabase URL"
  value       = var.supabase_url
}

output "environment" {
  description = "Environment name"
  value       = var.environment
}
