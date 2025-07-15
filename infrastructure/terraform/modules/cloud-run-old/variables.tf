# Cloud Run Module Variables

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "southamerica-west1"
}

variable "service_name" {
  description = "Cloud Run service name"
  type        = string
}

variable "container_image" {
  description = "Container image for Cloud Run service"
  type        = string
  default     = "n8nio/n8n:latest"
}

variable "memory" {
  description = "Memory allocation for container"
  type        = string
  default     = "1Gi"
}

variable "cpu" {
  description = "CPU allocation for container"
  type        = string
  default     = "1000m"
}

variable "min_instances" {
  description = "Minimum number of instances"
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 3
}

variable "db_connection_name" {
  description = "Cloud SQL connection name"
  type        = string
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "db_user" {
  description = "Database user"
  type        = string
}

variable "db_password_secret" {
  description = "Secret Manager secret name for database password"
  type        = string
}

variable "n8n_encryption_key_secret" {
  description = "Secret Manager secret name for N8N encryption key"
  type        = string
}