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
  
  # Dynamic service URL for multitenant setup
  service_url = "https://${local.service_name}-${var.project_id}.${var.region}.run.app"
  
  # Basic required environment variables for Chatwoot
  base_env_vars = {
    "RAILS_ENV"                = "production"
    "NODE_ENV"                 = "production" 
    "RAILS_LOG_TO_STDOUT"      = "true"
    "RAILS_LOG_LEVEL"          = "info"
    "FRONTEND_URL"             = local.service_url
    
    # Required Chatwoot settings
    "INSTALLATION_ENV"         = "docker"
    "RAILS_SERVE_STATIC_FILES" = "true"
    "EXECJS_RUNTIME"           = "Disabled"
    
    # Multitenant Configuration
    "ENABLE_ACCOUNT_SIGNUP"    = "false"  # Only admin can create accounts
    "ACCOUNT_SIGNUP_METHOD"    = "invite_only"
    "MAILER_SENDER_EMAIL"      = "noreply@optimacx.net"
    "SUPPORT_EMAIL"            = "support@optimacx.net"
    
    # WhatsApp Configuration - Optimizado para Chile
    "WHATSAPP_CLOUD_BASE_URL"  = "https://graph.facebook.com"
    "WHATSAPP_CLOUD_VERSION"   = "v18.0"
    
    # N8N Integration
    "N8N_WEBHOOK_BASE_URL"     = var.n8n_webhook_base_url
    "WEBHOOK_MAX_PAYLOAD_SIZE" = "20971520"  # 20MB
    
    # Security
    "FORCE_SSL"                = "true"
    "RAILS_ASSUME_SSL"         = "true"
    "ALLOWED_HOSTS"            = "*"
    
    # Database table prefix to avoid conflicts
    "DATABASE_TABLE_PREFIX"    = "chatwoot_"
    
    # Performance Optimization para Chile/Sudamérica
    "RAILS_MAX_THREADS"        = "10"      # Más threads para mejor concurrencia
    "WEB_CONCURRENCY"          = "2"       # Procesos worker optimizados
    "MALLOC_ARENA_MAX"         = "2"       # Control de memoria
    "RUBY_GC_HEAP_GROWTH_FACTOR" = "1.1"   # GC optimizado
    "RUBY_GC_HEAP_GROWTH_MAX_SLOTS" = "40000"
    
    # Timezone Chile
    "TZ"                       = "America/Santiago"
    "RAILS_TIMEZONE"           = "America/Santiago"
  }

  # Database configuration - Solo usar DATABASE_URL
  database_env_vars = {
    # Removed individual variables to avoid conflicts with DATABASE_URL
  }

  # Redis configuration - Optimizado para Chile/Sudamérica
  redis_env_vars = {
    "REDIS_HOST"        = var.redis_host
    "REDIS_PORT"        = var.redis_port
    "REDIS_SSL_VERIFY"  = "false"
    "REDIS_TIMEOUT"     = "2"      # Timeout reducido para baja latencia
    "REDIS_PASSWORD"    = ""       # Redis auth disabled for now
    
    # Redis Performance Optimization
    "REDIS_POOL_SIZE"   = "10"     # Pool de conexiones más grande
    "REDIS_DB"          = "0"      # Base de datos Redis
    "REDIS_KEEPALIVE"   = "true"   # Mantener conexiones vivas
    
    # Session Management optimizado
    "SESSION_TIMEOUT"   = "3600"   # 1 hora de timeout de sesión
    "RAILS_CACHE_STORE" = "redis_cache_store"
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
        # Cloud SQL Auth Proxy - cuando use_cloud_sql_santiago = true
        "run.googleapis.com/cloudsql-instances" = var.use_cloud_sql_santiago ? "${var.project_id}:${var.region}:chatwoot-postgres-santiago-${var.environment}" : ""
      }
    }

    spec {
      container_concurrency = var.max_concurrency
      timeout_seconds      = var.timeout_seconds
      service_account_name = var.service_account_email

      containers {
        image = "chatwoot/chatwoot:v4.4.0"
        
        # Custom startup command for Chatwoot
        command = ["/bin/sh"]
        args = ["-c", "bundle exec rails db:create || true && bundle exec rails db:prepare && bundle exec rails server -b 0.0.0.0 -p 3000"]

        ports {
          container_port = 3000
        }

        # Health check configuration - Tiempos extendidos para inicialización de BD
        startup_probe {
          http_get {
            path = "/"
            port = 3000
          }
          initial_delay_seconds = 120  # Aumentado: más tiempo para db:prepare
          timeout_seconds       = 10   # Timeout por probe
          period_seconds        = 30   # Intervalo entre checks
          failure_threshold     = 15   # Más intentos antes de fallar
        }

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