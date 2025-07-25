# Chatwoot Multitenant Module - Following SOLID Principles
# Single Responsibility: This module only manages Chatwoot multitenant infrastructure

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
}

# Local values for configuration (DRY principle)
locals {
  service_name = "chatwoot-multitenant-${var.environment}"
  
  # Basic required environment variables for Chatwoot
  base_env_vars = {
    "RAILS_ENV"                = "production"
    "NODE_ENV"                 = "production" 
    "RAILS_LOG_TO_STDOUT"      = "true"
    "RAILS_LOG_LEVEL"          = "info"
    "FRONTEND_URL"             = "https://${local.service_name}-1008284849803.southamerica-west1.run.app"
    
    # Required Chatwoot settings
    "INSTALLATION_ENV"         = "docker"
    "RAILS_SERVE_STATIC_FILES" = "true"
    "EXECJS_RUNTIME"           = "Disabled"
  }

  # Database configuration
  database_env_vars = {
    "POSTGRES_HOST"     = var.postgres_host
    "POSTGRES_PORT"     = "5432"
    "POSTGRES_DATABASE" = "postgres"  # Use default postgres database
    "POSTGRES_USERNAME" = var.postgres_username
  }

  # Redis configuration
  redis_env_vars = {
    "REDIS_HOST"        = var.redis_host
    "REDIS_PORT"        = var.redis_port
    "REDIS_SSL_VERIFY"  = "false"
    "REDIS_TIMEOUT"     = "5"
    "REDIS_PASSWORD"    = ""  # Redis auth disabled for now
  }
}

# Chatwoot multitenant Cloud Run service
resource "google_cloud_run_service" "chatwoot_multitenant" {
  name     = local.service_name
  location = var.region
  project  = var.project_id

  template {
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale"    = var.min_instances
        "autoscaling.knative.dev/maxScale"    = var.max_instances
        "run.googleapis.com/vpc-access-connector" = var.vpc_connector_name
        "run.googleapis.com/execution-environment" = "gen2"
      }
    }

    spec {
      container_concurrency = var.max_concurrency
      timeout_seconds      = var.timeout_seconds
      service_account_name = var.service_account_email

      containers {
        image = "chatwoot/chatwoot:v4.4.0"

        resources {
          limits = {
            cpu    = var.cpu
            memory = var.memory
          }
        }

        # Base environment variables
        dynamic "env" {
          for_each = merge(
            local.base_env_vars,
            local.database_env_vars,
            local.redis_env_vars
          )
          content {
            name  = env.key
            value = env.value
          }
        }

        # Secret environment variables
        env {
          name = "POSTGRES_PASSWORD"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.postgres_password.secret_id
              key  = "latest"
            }
          }
        }

        env {
          name = "REDIS_URL"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.redis_url.secret_id
              key  = "latest"
            }
          }
        }

        env {
          name = "SECRET_KEY_BASE"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.secret_key_base.secret_id
              key  = "latest"
            }
          }
        }

        env {
          name = "DATABASE_URL"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.database_url.secret_id
              key  = "latest"
            }
          }
        }

        # Ports
        ports {
          container_port = 3000
        }

        # Temporary: Remove health checks for debugging
        # startup_probe and liveness_probe removed temporarily
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  lifecycle {
    ignore_changes = [
      template[0].metadata[0].annotations["run.googleapis.com/operation-id"],
    ]
  }
}

# IAM policy for unauthenticated access
resource "google_cloud_run_service_iam_member" "chatwoot_public_access" {
  count = var.allow_unauthenticated ? 1 : 0

  service  = google_cloud_run_service.chatwoot_multitenant.name
  location = google_cloud_run_service.chatwoot_multitenant.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}