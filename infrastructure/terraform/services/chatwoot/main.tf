# Chatwoot Service Configuration
# Uses the generic cloud-run module with Chatwoot-specific settings

locals {
  service_name = "chatwoot-${var.environment}"
  
  # Chatwoot specific environment variables
  chatwoot_env_vars = {
    "RAILS_ENV"                = var.environment == "prod" ? "production" : "development"
    "NODE_ENV"                 = var.environment == "prod" ? "production" : "development"
    "RAILS_LOG_TO_STDOUT"      = "true"
    "USE_INBOX_AVATAR_FOR_BOT" = "true"
    "ENABLE_ACCOUNT_SIGNUP"    = "false"
    "POSTGRES_HOST"            = var.supabase_db_host
    "POSTGRES_PORT"            = "5432"
    "POSTGRES_DATABASE"        = "postgres"
    "POSTGRES_USERNAME"        = var.supabase_db_user
    # DATABASE_URL will be set via secret
    "FRONTEND_URL"             = var.custom_domain != "" ? "https://${var.custom_domain}" : ""
    "FORCE_SSL"                = "true"
    "ENABLE_PUSH_RELAY_SERVER" = "true"
    "INSTALLATION_ENV"         = "docker"
  }

  # Chatwoot secret environment variables
  chatwoot_secret_env_vars = {
    "POSTGRES_PASSWORD" = var.supabase_db_password_secret
    "SECRET_KEY_BASE"   = var.chatwoot_secret_key_secret
    "REDIS_URL"         = var.redis_url_secret
    "DATABASE_URL"      = google_secret_manager_secret.chatwoot_database_url.secret_id
  }
}

# Chatwoot Cloud Run Service
module "chatwoot_cloud_run" {
  source = "../../modules/cloud-run"

  project_id       = var.project_id
  region           = var.region
  service_name     = local.service_name
  container_image  = var.container_image
  service_account  = var.service_account_email
  
  # Resource configuration
  memory        = var.memory
  cpu           = var.cpu
  min_instances = var.min_instances
  max_instances = var.max_instances
  
  # Environment variables
  env_vars        = local.chatwoot_env_vars
  secret_env_vars = local.chatwoot_secret_env_vars
  
  # Networking
  vpc_connector_name = var.vpc_connector_name
  
  # No Cloud SQL connection needed for Supabase
  # db_connection_name = var.db_connection_name
  
  # Allow unauthenticated access
  allow_unauthenticated = var.allow_unauthenticated
  
  # Custom domain
  custom_domain = var.custom_domain
  
  # Health check
  health_check_path = "/api/v1/accounts"
  
  # Ingress
  ingress = "INGRESS_TRAFFIC_ALL"
  
  # Execution environment
  execution_environment = "EXECUTION_ENVIRONMENT_GEN2"
  
  # Timeout
  timeout_seconds = 300
  
  # Concurrency
  max_instance_request_concurrency = 1000
}

# Create DATABASE_URL secret for Chatwoot
resource "google_secret_manager_secret" "chatwoot_database_url" {
  secret_id = "chatwoot-database-url-${var.environment}"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "chatwoot_database_url" {
  secret      = google_secret_manager_secret.chatwoot_database_url.id
  secret_data = "postgresql://${var.supabase_db_user}:${var.supabase_db_password}@${var.supabase_db_host}:5432/postgres?schema=chatwoot_${var.environment}"
}

# Custom domain mapping (if domain is provided)
resource "google_cloud_run_domain_mapping" "chatwoot_domain" {
  count    = var.custom_domain != "" ? 1 : 0
  location = var.region
  name     = var.custom_domain

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = module.chatwoot_cloud_run.service_name
  }
}