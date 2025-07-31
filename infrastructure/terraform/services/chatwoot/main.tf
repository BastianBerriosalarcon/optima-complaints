resource "google_cloud_run_v2_service" "main" {
  name     = "chatwoot-web-${var.environment}"
  location = var.region
  project  = var.project_id

  template {
    service_account = var.service_account_email
    vpc_access {
      connector = var.vpc_connector_name
      egress    = "ALL_TRAFFIC"
    }

    containers {
      image = "southamerica-west1-docker.pkg.dev/optima-cx-467616/optimacx-images/chatwoot:latest"

      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = "chatwoot-database-url-dev"
            version = "latest"
          }
        }
      }

      env {
        name = "SECRET_KEY_BASE"
        value_source {
          secret_key_ref {
            secret  = "chatwoot-secret-key-base-dev"
            version = "latest"
          }
        }
      }

      env {
        name = "REDIS_URL"
        value_source {
          secret_key_ref {
            secret  = "chatwoot-redis-dev-redis-url"
            version = "latest"
          }
        }
      }

      env {
        name = "FRONTEND_URL"
        value_source {
          secret_key_ref {
            secret  = "chatwoot-frontend-url-dev"
            version = "latest"
          }
        }
      }

      env {
        name = "RAILS_ENV"
        value_source {
          secret_key_ref {
            secret  = "chatwoot-rails-env-dev"
            version = "latest"
          }
        }
      }

      env {
        name = "ACTIVE_STORAGE_SERVICE"
        value_source {
          secret_key_ref {
            secret  = "chatwoot-active-storage-service-dev"
            version = "latest"
          }
        }
      }

      env {
        name = "MAILER_SENDER_EMAIL"
        value_source {
          secret_key_ref {
            secret  = "chatwoot-mailer-sender-email-dev"
            version = "latest"
          }
        }
      }

      env {
        name = "SMTP_ADDRESS"
        value_source {
          secret_key_ref {
            secret  = "chatwoot-smtp-address-dev"
            version = "latest"
          }
        }
      }

      env {
        name = "SMTP_PORT"
        value_source {
          secret_key_ref {
            secret  = "chatwoot-smtp-port-dev"
            version = "latest"
          }
        }
      }

      env {
        name = "SMTP_USERNAME"
        value_source {
          secret_key_ref {
            secret  = "chatwoot-smtp-username-dev"
            version = "latest"
          }
        }
      }

      env {
        name = "SMTP_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = "chatwoot-smtp-password-dev"
            version = "latest"
          }
        }
      }

      env {
        name = "SMTP_DOMAIN"
        value_source {
          secret_key_ref {
            secret  = "chatwoot-smtp-domain-dev"
            version = "latest"
          }
        }
      }

      env {
        name = "SMTP_AUTHENTICATION"
        value_source {
          secret_key_ref {
            secret  = "chatwoot-smtp-authentication-dev"
            version = "latest"
          }
        }
      }

      env {
        name = "SMTP_ENABLE_STARTTLS_AUTO"
        value_source {
          secret_key_ref {
            secret  = "chatwoot-smtp-enable-starttls-auto-dev"
            version = "latest"
          }
        }
      }
    }
  }
}

resource "google_cloud_run_v2_job" "db_migrate" {
  name     = "chatwoot-db-migrate-${var.environment}"
  location = var.region
  project  = var.project_id

  template {
    template {
      service_account = var.service_account_email
      vpc_access {
        connector = var.vpc_connector_name
        egress    = "ALL_TRAFFIC"
      }

      containers {
        image = "southamerica-west1-docker.pkg.dev/optima-cx-467616/optimacx-images/chatwoot:latest"
        command = ["bundle", "exec", "rake", "db:chatwoot_prepare"]

        env {
          name = "DATABASE_URL"
          value_source {
            secret_key_ref {
              secret  = "chatwoot-database-url-dev"
              version = "latest"
            }
          }
        }

        env {
          name = "SECRET_KEY_BASE"
          value_source {
            secret_key_ref {
              secret  = "chatwoot-secret-key-base-dev"
              version = "latest"
            }
          }
        }

        env {
          name = "REDIS_URL"
          value_source {
            secret_key_ref {
              secret  = "chatwoot-redis-dev-redis-url"
              version = "latest"
            }
          }
        }

        env {
          name = "FRONTEND_URL"
          value_source {
            secret_key_ref {
              secret  = "chatwoot-frontend-url-dev"
              version = "latest"
            }
          }
        }

        env {
          name = "RAILS_ENV"
          value_source {
            secret_key_ref {
              secret  = "chatwoot-rails-env-dev"
              version = "latest"
            }
          }
        }

        env {
          name = "ACTIVE_STORAGE_SERVICE"
          value_source {
            secret_key_ref {
              secret  = "chatwoot-active-storage-service-dev"
              version = "latest"
            }
          }
        }

        env {
          name = "MAILER_SENDER_EMAIL"
          value_source {
            secret_key_ref {
              secret  = "chatwoot-mailer-sender-email-dev"
              version = "latest"
            }
          }
        }

        env {
          name = "SMTP_ADDRESS"
          value_source {
            secret_key_ref {
              secret  = "chatwoot-smtp-address-dev"
              version = "latest"
            }
          }
        }

        env {
          name = "SMTP_PORT"
          value_source {
            secret_key_ref {
              secret  = "chatwoot-smtp-port-dev"
              version = "latest"
            }
          }
        }

        env {
          name = "SMTP_USERNAME"
          value_source {
            secret_key_ref {
              secret  = "chatwoot-smtp-username-dev"
              version = "latest"
            }
          }
        }

        env {
          name = "SMTP_PASSWORD"
          value_source {
            secret_key_ref {
              secret  = "chatwoot-smtp-password-dev"
              version = "latest"
            }
          }
        }

        env {
          name = "SMTP_DOMAIN"
          value_source {
            secret_key_ref {
              secret  = "chatwoot-smtp-domain-dev"
              version = "latest"
            }
          }
        }

        env {
          name = "SMTP_AUTHENTICATION"
          value_source {
            secret_key_ref {
              secret  = "chatwoot-smtp-authentication-dev"
              version = "latest"
            }
          }
        }

        env {
          name = "SMTP_ENABLE_STARTTLS_AUTO"
          value_source {
            secret_key_ref {
              secret  = "chatwoot-smtp-enable-starttls-auto-dev"
              version = "latest"
            }
          }
        }
      }
    }
  }
}