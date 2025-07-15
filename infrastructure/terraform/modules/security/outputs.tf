output "n8n_service_account" {
  description = "N8N service account"
  value       = google_service_account.n8n_service_account
}

output "frontend_service_account" {
  description = "Frontend service account"
  value       = google_service_account.frontend_service_account
}

output "chatwoot_service_account" {
  description = "Chatwoot service account"
  value       = google_service_account.chatwoot_service_account
}