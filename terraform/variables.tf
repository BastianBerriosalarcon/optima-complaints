# OptimaCx GCP - Terraform Variables

variable "project_id" {
  description = "The GCP project ID"
  type        = string
  default     = "burnished-data-463915-d8"
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "southamerica-west1"
}

variable "zone" {
  description = "The GCP zone"
  type        = string
  default     = "southamerica-west1-a"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "n8n_image" {
  description = "n8n Docker image"
  type        = string
  default     = "n8nio/n8n:latest"
}

variable "db_tier" {
  description = "Cloud SQL instance tier"
  type        = string
  default     = "db-f1-micro"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "n8n_optima_cx"
}

variable "db_user" {
  description = "Database user"
  type        = string
  default     = "n8n_user"
}

variable "db_password" {
  description = "Database password"
  type        = string
  default     = "n8n_secure_password_change_me"
  sensitive   = true
}

variable "n8n_encryption_key" {
  description = "n8n encryption key"
  type        = string
  default     = "n8n-encryption-key-optimacx-change-me"
  sensitive   = true
}

variable "min_instances" {
  description = "Minimum number of Cloud Run instances"
  type        = number
  default     = 1
}

variable "max_instances" {
  description = "Maximum number of Cloud Run instances"
  type        = number
  default     = 10
}

variable "cpu_limit" {
  description = "CPU limit for Cloud Run container"
  type        = string
  default     = "2"
}

variable "memory_limit" {
  description = "Memory limit for Cloud Run container"
  type        = string
  default     = "4Gi"
}

variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 7
}

variable "enable_private_ip" {
  description = "Enable private IP for Cloud SQL"
  type        = bool
  default     = true
}

variable "enable_ssl" {
  description = "Enable SSL for Cloud SQL"
  type        = bool
  default     = true
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "subnet_cidr" {
  description = "CIDR block for subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "allowed_ip_ranges" {
  description = "IP ranges allowed to access Cloud SQL"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "labels" {
  description = "Labels to apply to resources"
  type        = map(string)
  default = {
    project     = "optimacx"
    environment = "prod"
    team        = "engineering"
    component   = "n8n"
  }
}

variable "gemini_api_key" {
  description = "Gemini API key for AI features"
  type        = string
  default     = ""
  sensitive   = true
}

variable "whatsapp_token" {
  description = "WhatsApp Business API token"
  type        = string
  default     = ""
  sensitive   = true
}

variable "smtp_password" {
  description = "SMTP password for email notifications"
  type        = string
  default     = ""
  sensitive   = true
}