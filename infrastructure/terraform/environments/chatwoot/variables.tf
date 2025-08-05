# Chatwoot Environment Variables - Optimizado para Chile/Sudamérica

variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "optima-cx-467616"
}

variable "region" {
  description = "GCP Region - Optimizado para Chile/Sudamérica"
  type        = string
  default     = "southamerica-west1"  # Santiago, Chile - Mínima latencia
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

# Database Configuration - Supabase SA-East-1 (São Paulo) para Sudamérica
variable "supabase_host" {
  description = "Supabase PostgreSQL host for Chatwoot"
  type        = string
  default     = "aws-0-sa-east-1.pooler.supabase.com"  # SA-East-1 São Paulo
}

variable "supabase_username" {
  description = "Supabase PostgreSQL username for Chatwoot"
  type        = string
  default     = "postgres.bvwgmqzxlxvbvyqwmmrr"
}

variable "supabase_port" {
  description = "Supabase PostgreSQL port"
  type        = number
  default     = 6543
}

variable "supabase_password" {
  description = "Supabase PostgreSQL password for Chatwoot"
  type        = string
  sensitive   = true
  default     = "Junio.0706"
}

# N8N Integration - Cloud Run Santiago
variable "n8n_webhook_url" {
  description = "N8N webhook URL for integrations"
  type        = string
  default     = "https://n8n-optimacx-supabase-dev-1008284849803.southamerica-west1.run.app"
}

# Monitoring
variable "notification_channels" {
  description = "Notification channels for alerts"
  type        = list(string)
  default     = []
}

# Performance Optimization para Chile
variable "cpu_limit" {
  description = "CPU limit for Chatwoot container"
  type        = string
  default     = "2000m"  # 2 CPU cores para mejor performance
}

variable "memory_limit" {
  description = "Memory limit for Chatwoot container"
  type        = string
  default     = "4Gi"    # 4GB RAM para manejar múltiples conversaciones
}

variable "min_instances" {
  description = "Minimum number of instances"
  type        = number
  default     = 1        # Siempre al menos 1 instancia para latencia mínima
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 5        # Ajustado según quota disponible
}

variable "max_concurrency" {
  description = "Maximum concurrent requests per instance"
  type        = number
  default     = 80       # Optimizado para conversaciones WhatsApp
}

# Timezone Configuration - Chile
variable "timezone" {
  description = "Timezone for Chatwoot"
  type        = string
  default     = "America/Santiago"
}

# Multitenant Configuration
variable "tenant_configs" {
  description = "Configuration for each tenant"
  type = list(object({
    name            = string
    subdomain       = string
    whatsapp_number = string
  }))
  default = []
}

variable "domains" {
  description = "List of domains for SSL certificates"
  type        = list(string)
  default     = []
}

variable "chatwoot_image" {
  description = "Chatwoot Docker image"
  type        = string
  default     = "chatwoot/chatwoot:v4.4.0"
}
