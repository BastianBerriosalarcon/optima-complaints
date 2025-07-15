output "service_name" {
  description = "Chatwoot service name"
  value       = module.chatwoot_cloud_run.service_name
}

output "service_url" {
  description = "Chatwoot service URL"
  value       = module.chatwoot_cloud_run.service_url
}

output "service_id" {
  description = "Chatwoot service ID"
  value       = module.chatwoot_cloud_run.service_id
}

output "custom_domain_url" {
  description = "Custom domain URL (if configured)"
  value       = var.custom_domain != "" ? "https://${var.custom_domain}" : ""
}