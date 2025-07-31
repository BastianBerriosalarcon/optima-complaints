variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "environment" {
  description = "Environment"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
}

variable "service_account_email" {
  description = "Service account email for the Chatwoot service"
  type        = string
}

variable "vpc_connector_name" {
  description = "VPC connector name"
  type        = string
}

variable "database_url_secret_name" {
  description = "Secret name for the database URL"
  type        = string
}

variable "secret_key_base_secret_name" {
  description = "Secret name for the SECRET_KEY_BASE"
  type        = string
}

variable "redis_url_secret_name" {
  description = "Secret name for the Redis URL"
  type        = string
}