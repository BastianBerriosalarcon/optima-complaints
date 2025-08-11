# Variables del Entorno de Desarrollo

variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "optima-cx-467616"
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "southamerica-west1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

# N8N Configuration
variable "n8n_image" {
  description = "N8N Docker image"
  type        = string
  default     = "southamerica-west1-docker.pkg.dev/optima-cx-467616/n8n/n8n-multitenant:latest"
}

variable "n8n_cpu_limit" {
  description = "N8N CPU limit"
  type        = string
  default     = "2"
}

variable "n8n_memory_limit" {
  description = "N8N Memory limit"
  type        = string
  default     = "2Gi"
}

variable "n8n_max_instances" {
  description = "N8N Maximum instances"
  type        = number
  default     = 3
}

# Supabase Configuration
variable "supabase_url" {
  description = "Supabase URL"
  type        = string
  default     = "https://gdnlodwwmvbgayzzudiu.supabase.co"
}

variable "supabase_anon_key" {
  description = "Supabase anon key"
  type        = string
  default     = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkbmxvZHd3bXZiZ2F5enp1ZGl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDYyMjIsImV4cCI6MjA2ODA4MjIyMn0.j4WztRRhuj-h0z7fxPhWd1pDyPmb-ouSjmbadfTxK3M"
  sensitive   = true
}

variable "supabase_service_key_secret" {
  description = "Secret name for Supabase service role key"
  type        = string
  default     = "supabase-service-key-dev"
}
