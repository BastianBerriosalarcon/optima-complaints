output "database_url_secret" {
  description = "Database URL secret name"
  value       = google_secret_manager_secret.database_url.secret_id
}

output "database_password_secret" {
  description = "Database password secret name"
  value       = google_secret_manager_secret.database_password.secret_id
}

output "jwt_secret" {
  description = "JWT secret name"
  value       = google_secret_manager_secret.jwt_secret.secret_id
}

output "anon_key_secret" {
  description = "Anon key secret name"
  value       = google_secret_manager_secret.anon_key.secret_id
}

output "service_role_key_secret" {
  description = "Service role key secret name"
  value       = google_secret_manager_secret.service_role_key.secret_id
}