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

  project_id                      = var.project_id
  region                          = var.region
  environment                     = var.environment
  container_image                 = var.n8n_container_image
  service_account_email           = module.security.n8n_service_account.email
  memory                          = var.n8n_memory
  cpu                             = var.n8n_cpu
  min_instances                   = var.n8n_min_instances
  max_instances                   = var.n8n_max_instances
  supabase_db_password_secret     = module.database.database_password_secret
  n8n_encryption_key_secret       = var.n8n_encryption_key_secret
  vpc_connector_name              = module.networking.vpc_connector.name
  supabase_db_host                = var.supabase_db_host
  supabase_db_user                = var.supabase_db_user
  supabase_db_password            = var.supabase_db_password
  custom_domain                   = var.n8n_domain
}

# OptimaCX Frontend service (ready for when developed)
module "frontend" {
  source = "../../services/optimacx-frontend"

  project_id                        = var.project_id
  region                            = var.region
  environment                       = var.environment
  container_image                   = var.frontend_container_image
  service_account_email             = module.security.frontend_service_account.email
  memory                            = var.frontend_memory
  cpu                               = var.frontend_cpu
  min_instances                     = var.frontend_min_instances
  max_instances                     = var.frontend_max_instances
  supabase_url_secret               = module.supabase.supabase_url_secret
  supabase_anon_key_secret          = module.supabase.supabase_anon_key_secret
  supabase_service_role_key_secret  = module.supabase.supabase_service_role_key_secret
  vpc_connector_name                = module.networking.vpc_connector.name
  custom_domain                     = var.frontend_domain
}

# Chatwoot service
module "chatwoot" {
  source = "../../services/chatwoot"

  project_id                      = var.project_id
  region                          = var.region
  environment                     = var.environment
  container_image                 = var.chatwoot_container_image
  service_account_email           = module.security.chatwoot_service_account.email
  memory                          = var.chatwoot_memory
  cpu                             = var.chatwoot_cpu
  min_instances                   = var.chatwoot_min_instances
  max_instances                   = var.chatwoot_max_instances
  supabase_db_password_secret     = module.database.database_password_secret
  chatwoot_secret_key_secret      = var.chatwoot_secret_key_secret
  vpc_connector_name              = module.networking.vpc_connector.name
  supabase_db_host                = var.supabase_db_host
  supabase_db_user                = var.supabase_db_user
  supabase_db_password            = var.supabase_db_password
  redis_url_secret                = module.redis.redis_url_secret_name
  custom_domain                   = var.chatwoot_domain
}