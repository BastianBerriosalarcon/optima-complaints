output "instance_name" {
  description = "Name of the Cloud SQL instance"
  value       = google_sql_database_instance.main.name
}

output "instance_connection_name" {
  description = "Connection name of the Cloud SQL instance"
  value       = google_sql_database_instance.main.connection_name
}

output "instance_ip_address" {
  description = "IP address of the Cloud SQL instance"
  value       = google_sql_database_instance.main.ip_address
}

output "private_ip_address" {
  description = "Private IP address of the Cloud SQL instance"
  value       = google_sql_database_instance.main.private_ip_address
}

output "database_names" {
  description = "Names of the created databases"
  value       = keys(google_sql_database.databases)
}

output "user_names" {
  description = "Names of the created users"
  value       = keys(google_sql_user.users)
}

output "user_password_secrets" {
  description = "Secret names for user passwords"
  value       = { for k, v in google_secret_manager_secret.user_passwords : k => v.secret_id }
}