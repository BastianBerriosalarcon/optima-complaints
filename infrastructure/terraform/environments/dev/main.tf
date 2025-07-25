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
  tier             = "STANDARD_HA"
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

# N8N service
module "n8n" {
  source = "../../services/n8n"

  project_id  = var.project_id
  region      = var.region
  environment = var.environment
  
  # Resource configuration
  cpu           = var.n8n_cpu
  memory        = var.n8n_memory
  min_instances = var.n8n_min_instances
  max_instances = var.n8n_max_instances
  n8n_version   = var.n8n_version

  # Service account
  service_account_email = module.security.n8n_service_account.email

  # VPC networking
  vpc_connector_name = module.networking.vpc_connector_name

  # Database secrets
  database_host_secret     = "n8n-database-host-${var.environment}"
  database_name_secret     = "n8n-database-name-${var.environment}"
  database_user_secret     = "n8n-database-user-${var.environment}"
  database_password_secret = "n8n-database-password-${var.environment}"
  encryption_key_secret    = "n8n-encryption-key-${var.environment}"

  # Access configuration
  allow_unauthenticated = var.n8n_allow_unauthenticated

  depends_on = [
    module.networking,
    module.security
  ]
}

# OptimaCX Frontend service - COMMENTED OUT TEMPORARILY (no image available)
# module "frontend" {
#   source = "../../services/optimacx-frontend"
#   # ... configuration commented out until frontend image is built
# }

# Secret generation for Chatwoot
resource "google_secret_manager_secret" "chatwoot_secret_key" {
  project   = var.project_id
  secret_id = "chatwoot-secret-key-${var.environment}"

  replication {
    auto {}
  }
}

resource "random_id" "chatwoot_secret_key_value" {
  byte_length = 64
}

resource "google_secret_manager_secret_version" "chatwoot_secret_key" {
  secret      = google_secret_manager_secret.chatwoot_secret_key.id
  secret_data = random_id.chatwoot_secret_key_value.hex
}

# Chatwoot service (simplified single tenant)
module "chatwoot" {
  source = "../../services/chatwoot"

  project_id  = var.project_id
  region      = var.region
  environment = var.environment
  
  # Resource configuration
  cpu           = var.chatwoot_cpu
  memory        = var.chatwoot_memory
  min_instances = var.chatwoot_min_instances
  max_instances = var.chatwoot_max_instances

  # Service account
  service_account_email = module.security.chatwoot_service_account.email

  # VPC networking
  vpc_connector_name = module.networking.vpc_connector_name

  # Database configuration (Supabase)
  supabase_db_host     = var.supabase_db_host
  supabase_db_user     = var.supabase_db_user
  

  # Secrets
  supabase_db_password_secret = module.database.database_password_secret
  chatwoot_secret_key_secret  = google_secret_manager_secret.chatwoot_secret_key.secret_id
  redis_url_secret           = module.redis.redis_url_secret_name

  depends_on = [
    module.networking,
    module.security,
    module.database,
    module.redis,
    google_secret_manager_secret_version.chatwoot_secret_key
  ]
}