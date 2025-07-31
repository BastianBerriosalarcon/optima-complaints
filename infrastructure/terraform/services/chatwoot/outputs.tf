output "service_name" {
  description = "Name of the Chatwoot service"
  value       = google_cloud_run_v2_service.main.name
}

output "service_url" {
  description = "URL of the Chatwoot service"
  value       = google_cloud_run_v2_service.main.uri
}