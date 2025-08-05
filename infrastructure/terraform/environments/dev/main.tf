# Development Environment - OptimaCX Platform
# Modular and secure infrastructure configuration

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
  #   prefix = "terraform/dev"
  # }
}

# Provider configuration
provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "cloudresourcemanager.googleapis.com",
    "run.googleapis.com",
    "vpcaccess.googleapis.com",
    "secretmanager.googleapis.com",
    "aiplatform.googleapis.com",
    "compute.googleapis.com",
    "redis.googleapis.com",
    "servicenetworking.googleapis.com"
  ])

  service = each.value
  project = var.project_id
}

# Networking module
module "networking" {
  source = "../../modules/networking"

  project_id       = var.project_id
  environment      = var.environment
  region           = var.region
  domains          = var.domains
  project_services = keys(google_project_service.required_apis)
}

# Security module
module "security" {
  source = "../../modules/security"

  project_id  = var.project_id
  environment = var.environment
}

# Database module (Supabase secrets)
module "database" {
  source = "../../modules/database"

  project_id       = var.project_id
  environment      = var.environment
  project_services = keys(google_project_service.required_apis)
}

# N8N service
module "n8n" {
  source = "../../services/n8n"

  project_id            = var.project_id
  region                = var.region
  environment           = var.environment
  service_account_email = module.security.n8n_service_account.email
  db_connection_name    = "optima-cx-467616:southamerica-west1:n8n-postgres-instance"
  container_image       = "southamerica-west1-docker.pkg.dev/optima-cx-467616/n8n/n8n-multitenant:latest"
  
  # Database credentials
  db_password = var.n8n_db_password
  
  # N8N configuration
  encryption_key         = var.n8n_encryption_key
  basic_auth_password   = var.n8n_basic_auth_password

  depends_on = [
    module.database,
    module.security,
    module.networking
  ]
}

# Redis module for Chatwoot sessions
module "redis" {
  source = "../../modules/redis"

  project_id        = var.project_id
  instance_name     = "chatwoot-redis-${var.environment}"
  region           = var.region
  tier             = "BASIC"
  memory_size_gb   = 1
  vpc_network_id   = module.networking.vpc_network.id
  project_services = keys(google_project_service.required_apis)
  
  labels = {
    environment = var.environment
    service     = "chatwoot"
  }
}

# Supabase service (secrets management)
module "supabase" {
  source = "../../services/supabase"

  project_id  = var.project_id
  environment = var.environment
  region      = var.region
}
