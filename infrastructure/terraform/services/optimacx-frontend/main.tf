# OptimaCX Frontend Service Configuration
# Uses the generic cloud-run module with frontend-specific settings

locals {
  service_name = "optimacx-frontend-${var.environment}"
  
  # Frontend specific environment variables
  frontend_env_vars = {
    "NODE_ENV"           = var.environment == "prod" ? "production" : "development"
    "NEXT_PUBLIC_APP_URL" = var.custom_domain != "" ? "https://${var.custom_domain}" : ""
  }

  # Frontend secret environment variables
  frontend_secret_env_vars = {
    "NEXT_PUBLIC_SUPABASE_URL"   = var.supabase_url_secret
    "NEXT_PUBLIC_SUPABASE_ANON_KEY" = var.supabase_anon_key_secret
    "SUPABASE_SERVICE_ROLE_KEY" = var.supabase_service_role_key_secret
  }
}

# OptimaCX Frontend Cloud Run Service
module "frontend_cloud_run" {
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
  env_vars        = local.frontend_env_vars
  secret_env_vars = local.frontend_secret_env_vars
  
  # Networking
  vpc_connector_name = var.vpc_connector_name
  
  # Allow unauthenticated access
  allow_unauthenticated = var.allow_unauthenticated
  
  # Custom domain
  custom_domain = var.custom_domain
  
  # Health check
  health_check_path = "/api/health"
  
  # Container port
  container_port = 3000
  
  # Ingress
  ingress = "INGRESS_TRAFFIC_ALL"
  
  # Execution environment
  execution_environment = "EXECUTION_ENVIRONMENT_GEN2"
  
  # Timeout
  timeout_seconds = 60
  
  # Concurrency
  max_instance_request_concurrency = 1000
}

# Custom domain mapping (if domain is provided)
resource "google_cloud_run_domain_mapping" "frontend_domain" {
  count    = var.custom_domain != "" ? 1 : 0
  location = var.region
  name     = var.custom_domain

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = module.frontend_cloud_run.service_name
  }
}