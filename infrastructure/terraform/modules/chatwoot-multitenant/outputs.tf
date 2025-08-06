# Outputs for Chatwoot Multitenant Module
# Following SOLID: Interface Segregation - Only expose needed values

output "service_name" {
  description = "Name of the Chatwoot Cloud Run service"
  value       = google_cloud_run_service.chatwoot_multitenant.name
}

output "service_url" {
  description = "URL of the Chatwoot Cloud Run service"
  value       = google_cloud_run_service.chatwoot_multitenant.status[0].url
}

output "service_location" {
  description = "Location of the Chatwoot Cloud Run service"
  value       = google_cloud_run_service.chatwoot_multitenant.location
}

# Secret Manager outputs
output "postgres_password_secret_id" {
  description = "Secret Manager ID for PostgreSQL password"
  value       = google_secret_manager_secret.postgres_password.secret_id
  sensitive   = true
}

output "redis_url_secret_id" {
  description = "Secret Manager ID for Redis URL"
  value       = google_secret_manager_secret.redis_url.secret_id
  sensitive   = true
}

output "secret_key_base_secret_id" {
  description = "Secret Manager ID for Rails secret key base"
  value       = google_secret_manager_secret.secret_key_base.secret_id
  sensitive   = true
}

output "database_url_secret_id" {
  description = "Secret Manager ID for database URL"
  value       = google_secret_manager_secret.database_url.secret_id
  sensitive   = true
}

# WhatsApp configuration secrets per tenant
output "whatsapp_config_secret_ids" {
  description = "Map of tenant IDs to their WhatsApp config secret IDs"
  value = {
    for tenant_id, secret in google_secret_manager_secret.whatsapp_configs :
    tenant_id => secret.secret_id
  }
  sensitive = true
}

# Webhook URLs for each tenant
output "tenant_webhook_urls" {
  description = "Map of tenant IDs to their WhatsApp webhook URLs"
  value = {
    for tenant_id, domain in var.tenant_domains :
    tenant_id => "${var.whatsapp_webhook_base_url}/webhooks/whatsapp/${tenant_id}"
  }
}

# Tenant subdomain URLs
output "tenant_urls" {
  description = "Map of tenant IDs to their Chatwoot URLs"
  value = {
    for tenant_id, domain in var.tenant_domains :
    tenant_id => "https://${domain}"
  }
}

# Service account for further configurations
output "service_account_email" {
  description = "Service account email used by Chatwoot"
  value       = var.service_account_email
}

# Load Balancer outputs - TEMPORALMENTE COMENTADO
/*
output "load_balancer_ip" {
  description = "Global IP address for the load balancer"
  value       = length(google_compute_global_address.chatwoot_ip) > 0 ? google_compute_global_address.chatwoot_ip[0].address : null
}

output "ssl_certificate_ids" {
  description = "Map of tenant IDs to their SSL certificate IDs"
  value = {
    for tenant_id, cert in google_compute_managed_ssl_certificate.tenant_ssl_certs :
    tenant_id => cert.id
  }
}

output "ssl_certificate_status" {
  description = "Map of tenant IDs to their SSL certificate domains"
  value = {
    for tenant_id, cert in google_compute_managed_ssl_certificate.tenant_ssl_certs :
    tenant_id => cert.managed[0].domains
  }
}
*/

# Valores temporales para desarrollo sin Load Balancer
output "load_balancer_ip" {
  description = "Load Balancer temporalmente desactivado - usando Cloud Run directo"
  value       = null
}

output "ssl_certificate_ids" {
  description = "SSL certificates temporalmente desactivados"
  value       = {}
}

output "ssl_certificate_status" {
  description = "SSL certificates temporalmente desactivados"
  value       = {}
}

output "tenant_domains" {
  description = "List of all tenant domains configured"
  value       = [for config in var.tenant_configs : config.subdomain]
}