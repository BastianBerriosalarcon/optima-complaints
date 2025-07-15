output "supabase_url_secret" {
  description = "Supabase URL secret name"
  value       = google_secret_manager_secret.supabase_url.secret_id
}

output "supabase_anon_key_secret" {
  description = "Supabase anon key secret name"
  value       = google_secret_manager_secret.supabase_anon_key.secret_id
}

output "supabase_service_role_key_secret" {
  description = "Supabase service role key secret name"
  value       = google_secret_manager_secret.supabase_service_role_key.secret_id
}

output "supabase_jwt_secret" {
  description = "Supabase JWT secret name"
  value       = google_secret_manager_secret.supabase_jwt_secret.secret_id
}

# Note: No database outputs needed for hosted Supabase
# Database is managed by Supabase service in Brazil region