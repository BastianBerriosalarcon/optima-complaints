# Outputs for Chatwoot Multitenant Service
# Following SOLID: Interface Segregation - Only expose necessary information

output "chatwoot_service_url" {
  description = "URL of the Chatwoot multitenant service"
  value       = module.chatwoot_multitenant.service_url
}

output "chatwoot_service_name" {
  description = "Name of the Chatwoot Cloud Run service"
  value       = module.chatwoot_multitenant.service_name
}

output "tenant_urls" {
  description = "Map of tenant IDs to their Chatwoot URLs"
  value       = module.chatwoot_multitenant.tenant_urls
}

output "tenant_webhook_urls" {
  description = "Map of tenant IDs to their WhatsApp webhook URLs"
  value       = module.chatwoot_multitenant.tenant_webhook_urls
}

output "redis_host" {
  description = "Redis host for Chatwoot (using existing instance)"
  value       = var.redis_host
  sensitive   = true
}

output "redis_port" {
  description = "Redis port for Chatwoot (using existing instance)"
  value       = var.redis_port
}

output "service_account_email" {
  description = "Service account email for Chatwoot"
  value       = google_service_account.chatwoot_service_account.email
}

# Secret Manager references for N8N integration
output "whatsapp_config_secrets" {
  description = "Map of tenant IDs to their WhatsApp config secret IDs"
  value       = module.chatwoot_multitenant.whatsapp_config_secret_ids
  sensitive   = true
}

output "database_connection_secret" {
  description = "Database connection secret ID"
  value       = module.chatwoot_multitenant.database_url_secret_id
  sensitive   = true
}

# For N8N webhook configuration
output "n8n_webhook_endpoints" {
  description = "Webhook endpoints for N8N integration per tenant"
  value = {
    for tenant_id, webhook_url in module.chatwoot_multitenant.tenant_webhook_urls :
    tenant_id => {
      webhook_url     = webhook_url
      chatwoot_url   = module.chatwoot_multitenant.tenant_urls[tenant_id]
      whatsapp_secret = module.chatwoot_multitenant.whatsapp_config_secret_ids[tenant_id]
    }
  }
  sensitive = true
}