output "redis_instance_name" {
  description = "Name of the Redis instance"
  value       = google_redis_instance.main.name
}

output "redis_host" {
  description = "Host of the Redis instance"
  value       = google_redis_instance.main.host
}

output "redis_port" {
  description = "Port of the Redis instance"
  value       = google_redis_instance.main.port
}

output "redis_url" {
  description = "Redis URL"
  value       = "redis://${google_redis_instance.main.host}:${google_redis_instance.main.port}"
}

output "redis_url_secret_name" {
  description = "Secret name for Redis URL"
  value       = google_secret_manager_secret.redis_url.secret_id
}

output "redis_current_location_id" {
  description = "Current location ID of the Redis instance"
  value       = google_redis_instance.main.current_location_id
}

output "redis_memory_size_gb" {
  description = "Memory size in GB"
  value       = google_redis_instance.main.memory_size_gb
}

output "redis_persistence_iam_identity" {
  description = "Cloud IAM identity used by import/export operations"
  value       = google_redis_instance.main.persistence_iam_identity
}