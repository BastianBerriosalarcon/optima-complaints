# Cloud Run Module Outputs

output "service_url" {
  description = "URL of the Cloud Run service"
  value       = google_cloud_run_v2_service.n8n.uri
}

output "service_account_email" {
  description = "Email of the service account"
  value       = google_service_account.n8n_service_account.email
}