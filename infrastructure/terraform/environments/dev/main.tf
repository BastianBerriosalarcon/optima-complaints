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

  backend "gcs" {
    bucket = "optimacx-terraform-state"
    prefix = "terraform/dev"
  }
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



# OptimaCX Frontend service - COMMENTED OUT TEMPORARILY (no image available)
# module "frontend" {
#   source = "../../services/optimacx-frontend"
#   # ... configuration commented out until frontend image is built
# }

# Chatwoot basic service removed - using multitenant service instead

# Chatwoot service
module "chatwoot" {
  source = "../../services/chatwoot"

  project_id        = var.project_id
  environment       = var.environment
  region            = var.region

  service_account_email = module.security.chatwoot_service_account.email
  vpc_connector_name    = module.networking.vpc_connector_id

  database_url_secret_name    = "chatwoot-database-url-dev"
  secret_key_base_secret_name = "chatwoot-secret-key-base-dev"
  redis_url_secret_name       = module.redis.redis_url_secret_name

  depends_on = [
    module.redis,
    module.security,
    module.networking
  ]
}