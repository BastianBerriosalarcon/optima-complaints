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

# Note: No additional variables needed for hosted Supabase
# All configuration is done through secrets management