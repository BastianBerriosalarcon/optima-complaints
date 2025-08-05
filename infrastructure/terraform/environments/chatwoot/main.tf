# Chatwoot Environment - OptimaCX Platform
# Independent Chatwoot deployment using shared infrastructure

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  # backend "gcs" {
  #   bucket = "optimacx-terraform-state"
  #   prefix = "terraform/chatwoot"
  # }
}

# Provider configuration
provider "google" {
  project = var.project_id
  region  = var.region
}

# Data sources for shared resources (created by dev environment)
data "google_compute_network" "vpc_network" {
  name    = "optimacx-vpc-dev"
  project = var.project_id
}

data "google_vpc_access_connector" "connector" {
  name   = "optimacx-connector-dev"
  region = var.region
}

data "google_redis_instance" "redis" {
  name   = "chatwoot-redis-dev"
  region = var.region
}

data "google_service_account" "chatwoot_service_account" {
  account_id = "chatwoot-service-account-dev"
}

# Chatwoot multitenant service - Optimizado para Chile/Sudamérica
module "chatwoot" {
  source = "../../modules/chatwoot-multitenant"

  project_id        = var.project_id
  environment       = var.environment
  region            = var.region
  
  # Performance Configuration - Chile Optimized
  cpu            = var.cpu_limit
  memory         = var.memory_limit
  min_instances  = var.min_instances
  max_instances  = var.max_instances
  max_concurrency = var.max_concurrency
  
  # Networking (from shared infrastructure)
  vpc_connector_name = data.google_vpc_access_connector.connector.id
  service_account_email = data.google_service_account.chatwoot_service_account.email
  
  # Redis configuration (from shared infrastructure)
  redis_host = data.google_redis_instance.redis.host
  redis_port = data.google_redis_instance.redis.port
  
  # Database configuration (using Supabase SA-East-1)
  supabase_host     = var.supabase_host
  supabase_username = var.supabase_username
  supabase_password = var.supabase_password
  
  # N8N Integration - Santiago Region
  whatsapp_webhook_base_url = var.n8n_webhook_url
  
  # Monitoring
  enable_monitoring = true
  notification_channels = var.notification_channels

  depends_on = [
    data.google_redis_instance.redis,
    data.google_vpc_access_connector.connector,
    data.google_service_account.chatwoot_service_account
  ]
}