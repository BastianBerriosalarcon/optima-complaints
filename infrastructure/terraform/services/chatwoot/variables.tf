variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "southamerica-west1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "container_image" {
  description = "Chatwoot container image"
  type        = string
  default     = "chatwoot/chatwoot:v3.11.0"
}

variable "service_account_email" {
  description = "Service account email for Chatwoot"
  type        = string
}

variable "memory" {
  description = "Memory allocation for Chatwoot service"
  type        = string
  default     = "2Gi"
}

variable "cpu" {
  description = "CPU allocation for Chatwoot service"
  type        = string
  default     = "1"
}

variable "min_instances" {
  description = "Minimum number of instances"
  type        = number
  default     = 1
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 10
}

variable "supabase_db_password_secret" {
  description = "Secret name for Supabase database password"
  type        = string
}

variable "chatwoot_secret_key_secret" {
  description = "Secret name for Chatwoot secret key"
  type        = string
}

variable "vpc_connector_name" {
  description = "VPC connector name"
  type        = string
}

variable "supabase_db_host" {
  description = "Supabase database host"
  type        = string
}

variable "supabase_db_user" {
  description = "Supabase database user"
  type        = string
}

variable "supabase_db_password" {
  description = "Supabase database password"
  type        = string
  sensitive   = true
}

variable "redis_url_secret" {
  description = "Secret name for Redis URL"
  type        = string
}

variable "allow_unauthenticated" {
  description = "Allow unauthenticated access"
  type        = bool
  default     = true
}

variable "custom_domain" {
  description = "Custom domain for Chatwoot (optional)"
  type        = string
  default     = ""
}