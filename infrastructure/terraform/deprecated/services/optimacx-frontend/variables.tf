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
  description = "Frontend container image"
  type        = string
  default     = "gcr.io/PROJECT_ID/optimacx-frontend:latest"
}

variable "service_account_email" {
  description = "Service account email for frontend"
  type        = string
}

variable "memory" {
  description = "Memory allocation for frontend service"
  type        = string
  default     = "1Gi"
}

variable "cpu" {
  description = "CPU allocation for frontend service"
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

variable "supabase_url_secret" {
  description = "Secret name for Supabase URL"
  type        = string
}

variable "supabase_anon_key_secret" {
  description = "Secret name for Supabase anon key"
  type        = string
}

variable "supabase_service_role_key_secret" {
  description = "Secret name for Supabase service role key"
  type        = string
}

variable "vpc_connector_name" {
  description = "VPC connector name"
  type        = string
}

variable "allow_unauthenticated" {
  description = "Allow unauthenticated access"
  type        = bool
  default     = true
}

variable "custom_domain" {
  description = "Custom domain for frontend (optional)"
  type        = string
  default     = ""
}