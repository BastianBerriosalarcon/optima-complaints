output "service_name" {
  description = "Frontend service name"
  value       = module.frontend_cloud_run.service_name
}

output "service_url" {
  description = "Frontend service URL"
  value       = module.frontend_cloud_run.service_url
}

output "service_id" {
  description = "Frontend service ID"
  value       = module.frontend_cloud_run.service_id
}

output "custom_domain_url" {
  description = "Custom domain URL (if configured)"
  value       = var.custom_domain != "" ? "https://${var.custom_domain}" : ""
}