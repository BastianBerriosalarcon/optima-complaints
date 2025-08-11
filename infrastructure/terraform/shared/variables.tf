# Variables Globales Compartidas

variable "project_id" {
  description = "GCP Project ID"
  type        = string
  validation {
    condition     = length(var.project_id) > 0
    error_message = "Project ID cannot be empty."
  }
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "southamerica-west1"
  validation {
    condition = contains([
      "southamerica-west1",
      "us-central1",
      "us-east1"
    ], var.region)
    error_message = "Region must be a valid GCP region."
  }
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  validation {
    condition = contains([
      "dev",
      "staging", 
      "prod"
    ], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

# Locals compartidos
locals {
  # Tags comunes para todos los recursos
  common_labels = {
    project     = "optima-cx"
    managed_by  = "terraform"
    environment = var.environment
  }
  
  # Naming convention
  name_prefix = "optimacx-${var.environment}"
}
