# Variables for Chatwoot Multitenant Service
# Following SOLID: Open/Closed Principle - Configuration through variables

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

# Chatwoot Configuration
variable "chatwoot_image" {
  description = "Chatwoot Docker image"
  type        = string
  default     = "chatwoot/chatwoot:v4.4.0"
}

# Resource Configuration
variable "cpu" {
  description = "CPU allocation"
  type        = string
  default     = "2"
}

variable "memory" {
  description = "Memory allocation"
  type        = string
  default     = "4Gi"
}

variable "min_instances" {
  description = "Minimum instances"
  type        = string
  default     = "1"
}

variable "max_instances" {
  description = "Maximum instances"
  type        = string
  default     = "10"
}

# Networking
variable "vpc_network_id" {
  description = "VPC Network ID"
  type        = string
}

variable "vpc_connector_name" {
  description = "VPC Connector name"
  type        = string
}

# Redis Configuration (using existing instance)
variable "redis_host" {
  description = "Redis host (from existing instance)"
  type        = string
}

variable "redis_port" {
  description = "Redis port (from existing instance)"
  type        = string
  default     = "6379"
}

# Database Configuration (Supabase)
variable "supabase_host" {
  description = "Supabase PostgreSQL host"
  type        = string
}

variable "supabase_username" {
  description = "Supabase PostgreSQL username"
  type        = string
}

variable "supabase_password" {
  description = "Supabase PostgreSQL password"
  type        = string
  sensitive   = true
}

# WhatsApp Configuration
variable "whatsapp_webhook_base_url" {
  description = "Base URL for WhatsApp webhooks"
  type        = string
}

# Monitoring
variable "enable_monitoring" {
  description = "Enable monitoring"
  type        = bool
  default     = true
}

variable "notification_channels" {
  description = "Notification channels for alerts"
  type        = list(string)
  default     = []
}

variable "log_level" {
  description = "Log level"
  type        = string
  default     = "info"
}

# Dependencies
variable "project_services" {
  description = "List of enabled project services"
  type        = list(string)
  default     = []
}