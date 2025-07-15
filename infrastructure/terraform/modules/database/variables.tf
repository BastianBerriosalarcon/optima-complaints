variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "project_services" {
  description = "List of enabled GCP services"
  type        = list(string)
  default     = []
}