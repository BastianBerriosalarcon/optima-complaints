# Development Environment Variables

variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "burnished-data-463915-d8"
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

# Networking variables
variable "domains" {
  description = "List of domains for SSL certificates"
  type        = list(string)
  default     = []
}

# WhatsApp Configuration
variable "whatsapp_webhook_base_url" {
  description = "Base URL for WhatsApp webhooks"
  type        = string
  default     = "https://n8n-optimacx-supabase-1008284849803.southamerica-west1.run.app"
}

# Monitoring Configuration
variable "enable_monitoring" {
  description = "Enable monitoring and alerting"
  type        = bool
  default     = true
}

variable "notification_channels" {
  description = "List of notification channels for alerts"
  type        = list(string)
  default     = []
}

variable "log_level" {
  description = "Log level for services"
  type        = string
  default     = "info"
}

# N8N service variables
variable "n8n_container_image" {
  description = "N8N container image"
  type        = string
  default     = "n8nio/n8n:latest"
}

variable "n8n_memory" {
  description = "Memory for N8N service"
  type        = string
  default     = "2Gi"
}

variable "n8n_cpu" {
  description = "CPU for N8N service"
  type        = string
  default     = "1"
}

variable "n8n_min_instances" {
  description = "Minimum instances for N8N"
  type        = number
  default     = 1
}

variable "n8n_max_instances" {
  description = "Maximum instances for N8N"
  type        = number
  default     = 3
}

variable "n8n_encryption_key_secret" {
  description = "Secret name for N8N encryption key"
  type        = string
  default     = "optimacx-n8n-encryption-key-dev"
}

variable "n8n_domain" {
  description = "Custom domain for N8N"
  type        = string
  default     = ""
}

# Supabase configuration
variable "supabase_db_host" {
  description = "Supabase database host"
  type        = string
  default     = "aws-0-sa-east-1.pooler.supabase.com"
}

variable "supabase_db_user" {
  description = "Supabase database user"
  type        = string
  default     = "postgres.pnkdyagqibqxfxziqwxt"
}

variable "supabase_db_password" {
  description = "Supabase database password"
  type        = string
  sensitive   = true
  default     = "Supab4s3!2024"
}

# Frontend service variables
variable "frontend_container_image" {
  description = "Frontend container image"
  type        = string
  default     = "gcr.io/burnished-data-463915-d8/optimacx-frontend:latest"
}

variable "frontend_memory" {
  description = "Memory for frontend service"
  type        = string
  default     = "1Gi"
}

variable "frontend_cpu" {
  description = "CPU for frontend service"
  type        = string
  default     = "1"
}

variable "frontend_min_instances" {
  description = "Minimum instances for frontend"
  type        = number
  default     = 1
}

variable "frontend_max_instances" {
  description = "Maximum instances for frontend"
  type        = number
  default     = 5
}

variable "frontend_domain" {
  description = "Custom domain for frontend"
  type        = string
  default     = ""
}

# Chatwoot service variables
variable "chatwoot_container_image" {
  description = "Chatwoot container image"
  type        = string
  default     = "chatwoot/chatwoot:latest"
}

variable "chatwoot_memory" {
  description = "Memory for Chatwoot service"
  type        = string
  default     = "2Gi"
}

variable "chatwoot_cpu" {
  description = "CPU for Chatwoot service"
  type        = string
  default     = "1"
}

variable "chatwoot_min_instances" {
  description = "Minimum instances for Chatwoot"
  type        = number
  default     = 1
}

variable "chatwoot_max_instances" {
  description = "Maximum instances for Chatwoot"
  type        = number
  default     = 3
}

variable "chatwoot_secret_key_secret" {
  description = "Secret name for Chatwoot secret key"
  type        = string
  default     = "optimacx-chatwoot-secret-key-dev"
}

variable "chatwoot_domain" {
  description = "Custom domain for Chatwoot"
  type        = string
  default     = ""
}

# Redis configuration handled by module