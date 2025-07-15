variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "southamerica-west1"
}

variable "subnet_cidr" {
  description = "CIDR range for subnet"
  type        = string
  default     = "10.0.0.0/24"
}

variable "connector_cidr" {
  description = "CIDR range for VPC connector"
  type        = string
  default     = "10.1.0.0/28"
}

variable "domains" {
  description = "List of domains for SSL certificate"
  type        = list(string)
  default     = []
}

variable "project_services" {
  description = "List of enabled GCP services"
  type        = list(string)
  default     = []
}