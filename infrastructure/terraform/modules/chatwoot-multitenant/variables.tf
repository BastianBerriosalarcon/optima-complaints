# Variables for Chatwoot Multitenant Module
# Following SOLID: Open/Closed Principle - Extensible through variables

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

# Container Configuration
variable "container_image" {
  description = "Chatwoot container image"
  type        = string
  default     = "chatwoot/chatwoot:v4.4.0"
}

# Resource Configuration
variable "cpu" {
  description = "CPU allocation for Chatwoot container"
  type        = string
  default     = "2"
}

variable "memory" {
  description = "Memory allocation for Chatwoot container"
  type        = string
  default     = "4Gi"
}

variable "min_instances" {
  description = "Minimum number of instances"
  type        = string
  default     = "1"
}

# Missing variables for Chatwoot configuration
variable "max_concurrency" {
  description = "Maximum requests per container instance"
  type        = number
  default     = 80
}

variable "timeout_seconds" {
  description = "Timeout for requests in seconds"
  type        = number
  default     = 300
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = string
  default     = "10"
}

# Networking
variable "vpc_connector_name" {
  description = "VPC Connector name for private network access"
  type        = string
}

variable "allow_unauthenticated" {
  description = "Allow unauthenticated access"
  type        = bool
  default     = true
}

# Service Account
variable "service_account_email" {
  description = "Service account email for Cloud Run"
  type        = string
}

# Database Configuration
variable "supabase_host" {
  description = "Supabase PostgreSQL host"
  type        = string
}

variable "supabase_username" {
  description = "Supabase PostgreSQL username"
  type        = string
}

variable "supabase_password" {
  description = "Supabase PostgreSQL password (will be stored in Secret Manager)"
  type        = string
  sensitive   = true
}

# Redis Configuration
variable "redis_host" {
  description = "Redis host"
  type        = string
}

variable "redis_port" {
  description = "Redis port"
  type        = string
  default     = "6379"
}

# Multitenant Configuration
variable "tenant_domains" {
  description = "Map of tenant IDs to their custom domains"
  type        = map(string)
  default = {
    "concesionario_001" = "concesionario1.chat.optimacx.net"
    "concesionario_002" = "concesionario2.chat.optimacx.net"
    "concesionario_003" = "concesionario3.chat.optimacx.net"
  }
}

variable "whatsapp_webhook_base_url" {
  description = "Base URL for WhatsApp webhooks"
  type        = string
  default     = "https://n8n-optimacx-supabase-dev-1008284849803.southamerica-west1.run.app"
}

variable "n8n_webhook_base_url" {
  description = "N8N webhook base URL for integrations"
  type        = string
  default     = "https://n8n-optimacx-supabase-dev-1008284849803.southamerica-west1.run.app"
}

# Monitoring
variable "enable_monitoring" {
  description = "Enable monitoring and logging"
  type        = bool
  default     = true
}

variable "log_level" {
  description = "Log level for Chatwoot"
  type        = string
  default     = "info"
  validation {
    condition     = contains(["debug", "info", "warn", "error"], var.log_level)
    error_message = "Log level must be debug, info, warn, or error."
  }
}

variable "notification_channels" {
  description = "List of notification channels for alerting"
  type        = list(string)
  default     = []
}

# Cloud SQL Santiago Variables
variable "use_cloud_sql_santiago" {
  description = "Whether to use Cloud SQL Santiago instead of Supabase"
  type        = bool
  default     = false
}

variable "chatwoot_db_password" {
  description = "Password for Chatwoot database user"
  type        = string
  sensitive   = true
  default     = "chatwoot_secure_password_123"
}

variable "supabase_database_url" {
  description = "Complete Supabase database URL"
  type        = string
  sensitive   = true
  default     = ""
}