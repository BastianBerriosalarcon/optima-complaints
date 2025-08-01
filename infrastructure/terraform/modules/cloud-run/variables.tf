variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
}

variable "service_name" {
  description = "Name of the Cloud Run service"
  type        = string
}

variable "container_image" {
  description = "Container image to deploy"
  type        = string
}

variable "service_account" {
  description = "Service account email for the service"
  type        = string
}

variable "memory" {
  description = "Memory allocation"
  type        = string
  default     = "1Gi"
}

variable "cpu" {
  description = "CPU allocation"
  type        = string
  default     = "1"
}

variable "min_instances" {
  description = "Minimum number of instances"
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 10
}

variable "container_port" {
  description = "Container port"
  type        = number
  default     = 8080
}

variable "env_vars" {
  description = "Environment variables"
  type        = map(string)
  default     = {}
}

variable "secret_env_vars" {
  description = "Secret environment variables"
  type        = map(string)
  default     = {}
}

variable "vpc_connector_name" {
  description = "VPC connector name"
  type        = string
  default     = ""
}

variable "db_connection_name" {
  description = "Database connection name"
  type        = string
  default     = ""
}

variable "allow_unauthenticated" {
  description = "Allow unauthenticated access"
  type        = bool
  default     = true
}

variable "custom_domain" {
  description = "Custom domain for the service"
  type        = string
  default     = ""
}

variable "health_check_path" {
  description = "Health check path"
  type        = string
  default     = "/"
}

variable "ingress" {
  description = "Ingress settings"
  type        = string
  default     = "INGRESS_TRAFFIC_ALL"
}

variable "execution_environment" {
  description = "Execution environment"
  type        = string
  default     = "EXECUTION_ENVIRONMENT_GEN2"
}

variable "timeout_seconds" {
  description = "Request timeout in seconds"
  type        = number
  default     = 300
}



variable "max_instance_request_concurrency" {
  description = "Maximum concurrent requests per instance"
  type        = number
  default     = 1000
}

variable "container_command" {
  description = "Container command override"
  type        = list(string)
  default     = []
}

variable "container_args" {
  description = "Container args override"
  type        = list(string)
  default     = []
}

variable "startup_probe_failure_threshold" {
  description = "Number of consecutive failures for the startup probe to be considered failed."
  type        = number
  default     = 3
}

variable "startup_probe_initial_delay_seconds" {
  description = "Initial delay for the startup probe."
  type        = number
  default     = 0
}

variable "startup_probe_period_seconds" {
  description = "Period for the startup probe."
  type        = number
  default     = 240
}

variable "startup_probe_timeout_seconds" {
  description = "Timeout for the startup probe. If 0, no probe is configured."
  type        = number
  default     = 0
}
