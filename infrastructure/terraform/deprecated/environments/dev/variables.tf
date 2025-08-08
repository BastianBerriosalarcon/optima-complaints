# Development Environment Variables
# Configuration for OptimaCX development environment

variable "project_id" {
  description = "The GCP project ID"
  type        = string
  default     = "optima-cx-467616"
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "southamerica-west1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "domains" {
  description = "List of domains for the project"
  type        = list(string)
  default     = []
}

# N8N Configuration Variables
variable "n8n_db_password" {
  description = "N8N database password"
  type        = string
  sensitive   = true
  default     = ""
}

variable "n8n_encryption_key" {
  description = "N8N encryption key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "n8n_basic_auth_password" {
  description = "N8N basic auth password"
  type        = string
  sensitive   = true
  default     = "Junio.0706"
}
