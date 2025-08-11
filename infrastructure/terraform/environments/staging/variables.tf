# Variables del Entorno de Staging

variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "optima-cx-467616"  # Mismo proyecto, diferentes recursos
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "southamerica-west1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "staging"
}

# N8N Configuration para Staging
variable "n8n_image" {
  description = "N8N Docker image"
  type        = string
  default     = "southamerica-west1-docker.pkg.dev/optima-cx-467616/n8n/n8n-multitenant:latest"
}

variable "n8n_cpu_limit" {
  description = "N8N CPU limit"
  type        = string
  default     = "1"  # Menos recursos en staging
}

variable "n8n_memory_limit" {
  description = "N8N Memory limit" 
  type        = string
  default     = "1Gi"  # Menos recursos en staging
}

variable "n8n_max_instances" {
  description = "N8N Maximum instances"
  type        = number
  default     = 2  # Menos instancias en staging
}

# Supabase Configuration para Staging
variable "supabase_url" {
  description = "Supabase URL for staging"
  type        = string
  default     = ""  # Configurar cuando esté listo
}

variable "supabase_anon_key" {
  description = "Supabase anon key for staging"
  type        = string
  default     = ""  # Configurar cuando esté listo
  sensitive   = true
}

variable "supabase_service_key_secret" {
  description = "Secret name for Supabase service role key"
  type        = string
  default     = "supabase-service-key-staging"
}
