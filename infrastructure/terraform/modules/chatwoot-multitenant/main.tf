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
    
    # Performance Optimization para Chile/Sudamérica - ULTRA AGRESIVO
    "RAILS_MAX_THREADS"        = "20"      # Más threads para mejor concurrencia
    "WEB_CONCURRENCY"          = "1"       # 1 worker para evitar memory overhead
    
    # Skip Migraciones - CRÍTICO para velocidad startup
    "RAILS_SKIP_MIGRATIONS"    = "true"    # No ejecutar migraciones en startup
    "DATABASE_READY"           = "true"     # Asumir BD ya configurada
    "SKIP_DB_MIGRATE"          = "true"     # Skip migrate completo
    
    # Database Performance Critical - ULTRA OPTIMIZADO
    "DB_POOL"                  = "20"      # Pool aumentado para concurrencia
    "DB_TIMEOUT"               = "2000"    # 2 segundos timeout (ultra agresivo)
    "DATABASE_PREPARED_STATEMENTS" = "true"   # HABILITADO para mejor performance
    
    # Rails Performance Tuning - ULTRA AGRESIVO
    "RAILS_LOG_LEVEL"          = "error"   # Solo errores para máxima velocidad  
    "BOOTSNAP_CACHE_DIR"       = "/tmp"    # Cache de boot en tmpfs
    "MALLOC_ARENA_MAX"         = "2"       # Control de memoria
    "RUBY_GC_HEAP_GROWTH_FACTOR" = "1.03"  # GC más agresivo
    "RUBY_GC_HEAP_GROWTH_MAX_SLOTS" = "10000"  # Menor overhead GC
    
    # Precompilación y Cache Ultra Agresivo
    "RAILS_PRECOMPILE_ASSETS"  = "true"    # Precompilar assets
    "RAILS_ASSET_PIPELINE"     = "sprockets" # Pipeline optimizado
    "RAILS_AUTOLOAD_PATHS"     = "false"   # Deshabilitar autoload en runtime
    
    # Rails Caching Performance
    "RAILS_ASSET_HOST"         = local.service_url  # CDN-like behavior
    "RAILS_CACHE_CLASSES"      = "true"    # Cache classes en production
    "RAILS_EAGER_LOAD"         = "true"    # Preload todo el código
    
    # Timezone Chile
    "TZ"                       = "America/Santiago"
    "RAILS_TIMEZONE"           = "America/Santiago"
  }

  # Database configuration - Solo usar DATABASE_URL
  database_env_vars = {
    # Removed individual variables to avoid conflicts with DATABASE_URL
  }

  # Redis configuration - TEMPORAL: Usar Redis interno para evitar problemas ActionCable
  redis_env_vars = {
    # Comentamos Redis externo temporalmente
    # "REDIS_HOST"        = var.redis_host
    # "REDIS_PORT"        = var.redis_port
    "REDIS_SSL_VERIFY"  = "false"
    "REDIS_TIMEOUT"     = "2"      # Timeout reducido para baja latencia
    "REDIS_PASSWORD"    = ""       # Redis auth disabled for now
    
    # Redis Performance Optimization
    "REDIS_POOL_SIZE"   = "5"      # Pool más pequeño para Redis interno
    "REDIS_DB"          = "0"      # Base de datos Redis
    "REDIS_KEEPALIVE"   = "true"   # Mantener conexiones vivas
    
    # ActionCable Redis Configuration - SOLUCION SIMPLE
    "ACTION_CABLE_ADAPTER" = "async"  # Usar adaptador async en lugar de Redis
    "REDIS_SENTINELS_DISABLED" = "true"
    
    # Deshabilitar ActionCable temporalmente para resolver conectividad
    "FORCE_SSL" = "false"
    "ENABLE_ACCOUNT_SIGNUP" = "false"
    "RAILS_LOG_TO_STDOUT" = "enabled"
    
    # Session Management optimizado
    "SESSION_TIMEOUT"   = "3600"   # 1 hora de timeout de sesión
    "RAILS_CACHE_STORE" = "memory_store"  # Usar memoria en lugar de Redis
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
        # Cloud SQL Auth Proxy - REACTIVADO TEMPORALMENTE para estabilidad
        "run.googleapis.com/cloudsql-instances" = var.use_cloud_sql_santiago ? "${var.project_id}:${var.region}:chatwoot-postgres-santiago-${var.environment}" : ""
      }
    }

    spec {
      container_concurrency = var.max_concurrency
      timeout_seconds      = var.timeout_seconds
      service_account_name = var.service_account_email

      containers {
        image = "chatwoot/chatwoot:v4.4.0"
        
        # Custom startup command for Chatwoot - ULTRA OPTIMIZADO
        command = ["/bin/sh"]
        args = ["-c", "bundle exec rails server -b 0.0.0.0 -p 3000 --skip-bundle-check"]  # Skip bundle check para startup más rápido

        ports {
          container_port = 3000
        }

        # Health check configuration - ULTRARRÁPIDO para máximo rendimiento
        startup_probe {
          http_get {
            path = "/"  # Volvemos a la raíz pero con config optimizada
            port = 3000
          }
          initial_delay_seconds = 45   # Incrementado levemente para dar tiempo
          timeout_seconds       = 5    # Timeout menos agresivo
          period_seconds        = 15   # Period menos agresivo  
          failure_threshold     = 10   # Más intentos
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

        # REDIS_URL comentado temporalmente - usando Redis interno
        # env {
        #   name = "REDIS_URL"
        #   value_from {
        #     secret_key_ref {
        #       name = google_secret_manager_secret.redis_url.secret_id
        #       key  = "latest"
        #     }
        #   }
        # }

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