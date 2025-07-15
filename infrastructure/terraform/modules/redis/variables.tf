variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "instance_name" {
  description = "Name of the Redis instance"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "southamerica-west1"
}

variable "tier" {
  description = "Redis tier"
  type        = string
  default     = "STANDARD_HA"
}

variable "memory_size_gb" {
  description = "Memory size in GB"
  type        = number
  default     = 1
}

variable "location_id" {
  description = "Location ID"
  type        = string
  default     = "southamerica-west1-a"
}

variable "alternative_location_id" {
  description = "Alternative location ID"
  type        = string
  default     = "southamerica-west1-b"
}

variable "vpc_network_id" {
  description = "VPC network ID"
  type        = string
}

variable "connect_mode" {
  description = "Connect mode"
  type        = string
  default     = "PRIVATE_SERVICE_ACCESS"
}

variable "redis_version" {
  description = "Redis version"
  type        = string
  default     = "REDIS_6_X"
}

variable "display_name" {
  description = "Display name"
  type        = string
  default     = ""
}

variable "redis_configs" {
  description = "Redis configurations"
  type        = map(string)
  default     = {}
}

variable "labels" {
  description = "Labels"
  type        = map(string)
  default     = {}
}

variable "project_services" {
  description = "List of enabled GCP services"
  type        = list(string)
  default     = []
}