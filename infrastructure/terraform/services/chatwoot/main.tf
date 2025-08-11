# Chatwoot Multitenant Service Configuration
# Following SOLID: Dependency Inversion - Depends on abstractions, not concretions

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# Local values for DRY principle
locals {
  # Tenant configuration - Production ready domains
  tenant_domains = {
    "concesionario_001" = "concesionario1.chat.optimacx.net"
    "concesionario_002" = "concesionario2.chat.optimacx.net"
    "concesionario_003" = "concesionario3.chat.optimacx.net"
  }

  # WhatsApp Business API configuration per tenant
  whatsapp_configs = {
    "concesionario_001" = {
      phone_number_id = "PLACEHOLDER_001"
      access_token    = "PLACEHOLDER_TOKEN_001"
      verify_token    = "verify_token_001"
      webhook_secret  = "webhook_secret_001"
    }
    "concesionario_002" = {
      phone_number_id = "PLACEHOLDER_002"
      access_token    = "PLACEHOLDER_TOKEN_002"
      verify_token    = "verify_token_002"
      webhook_secret  = "webhook_secret_002"
    }
    "concesionario_003" = {
      phone_number_id = "PLACEHOLDER_003"
      access_token    = "PLACEHOLDER_TOKEN_003"
      verify_token    = "verify_token_003"
      webhook_secret  = "webhook_secret_003"
    }
  }

  common_labels = {
    project     = "optima-cx"
    service     = "chatwoot"
    environment = var.environment
    managed_by  = "terraform"
  }
}

# Service account for Chatwoot
resource "google_service_account" "chatwoot_service_account" {
  account_id   = "chatwoot-multitenant-${var.environment}"
  display_name = "Chatwoot Multitenant Service Account"
  description  = "Service account for Chatwoot multitenant deployment"
}

# IAM bindings for service account
resource "google_project_iam_member" "chatwoot_service_account_roles" {
  for_each = toset([
    "roles/secretmanager.secretAccessor",
    "roles/cloudsql.client",
    "roles/redis.editor",
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
    "roles/cloudtrace.agent"
  ])

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.chatwoot_service_account.email}"
}

# Using existing Redis instance from main environment
# module "chatwoot_redis" {
#   # Redis already exists in main configuration
# }

# Chatwoot multitenant deployment
module "chatwoot_multitenant" {
  source = "../../modules/chatwoot-multitenant"

  project_id  = var.project_id
  region      = var.region
  environment = var.environment

  # Container configuration - Optimizado para Chile
  container_image = "chatwoot/chatwoot:v4.4.0"
  cpu            = var.cpu
  memory         = var.memory
  min_instances  = var.min_instances
  max_instances  = var.max_instances
  max_concurrency = var.max_concurrency
  timeout_seconds = var.timeout_seconds

  # Networking optimizado para Sudamérica
  vpc_connector_name      = var.vpc_connector_name
  allow_unauthenticated  = true
  service_account_email  = google_service_account.chatwoot_service_account.email

  # Database configuration
  supabase_host     = var.supabase_host
  supabase_username = var.supabase_username
  supabase_password = var.supabase_password

  # Redis configuration (using existing Redis instance)
  redis_host = var.redis_host
  redis_port = var.redis_port

  # Multitenant configuration
  tenant_domains                = local.tenant_domains
  whatsapp_webhook_base_url    = var.whatsapp_webhook_base_url

  # Monitoring
  enable_monitoring      = var.enable_monitoring
  notification_channels = var.notification_channels
  log_level            = var.log_level

  depends_on = [
    google_service_account.chatwoot_service_account
  ]
}

# Create database schema for each tenant
resource "null_resource" "setup_tenant_databases" {
  for_each = local.tenant_domains

  triggers = {
    tenant_id = each.key
  }

  provisioner "local-exec" {
    command = <<-EOT
      # This would typically run a script to create tenant-specific database schemas
      echo "Setting up database schema for tenant: ${each.key}"
      # In a real implementation, you would:
      # 1. Connect to the PostgreSQL database
      # 2. Create tenant-specific schema
      # 3. Run Chatwoot migrations for the tenant
      # 4. Set up initial configuration
    EOT
  }

  depends_on = [module.chatwoot_multitenant]
}

# Create initial WhatsApp configuration for each tenant
resource "null_resource" "setup_whatsapp_configs" {
  for_each = local.tenant_domains

  triggers = {
    tenant_id = each.key
  }

  provisioner "local-exec" {
    command = <<-EOT
      echo "Setting up WhatsApp configuration for tenant: ${each.key}"
      # This would call Chatwoot API to:
      # 1. Create inbox for WhatsApp
      # 2. Configure webhook URLs
      # 3. Set up initial agents
      # 4. Configure business profile
    EOT
  }

  depends_on = [
    module.chatwoot_multitenant,
    null_resource.setup_tenant_databases
  ]
}