# Cloud Run Module - N8N Service with Secret Manager

# Get secrets from Secret Manager
data "google_secret_manager_secret_version" "db_password" {
  secret = var.db_password_secret
}

data "google_secret_manager_secret_version" "n8n_encryption_key" {
  secret = var.n8n_encryption_key_secret
}

# Service Account for Cloud Run
resource "google_service_account" "n8n_service_account" {
  account_id   = "${var.service_name}-sa"
  display_name = "Service Account for ${var.service_name}"
}

# IAM binding for Secret Manager access
resource "google_project_iam_member" "secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.n8n_service_account.email}"
}

# IAM binding for Cloud SQL client
resource "google_project_iam_member" "sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.n8n_service_account.email}"
}

# Cloud Run Service
resource "google_cloud_run_v2_service" "n8n" {
  name     = var.service_name
  location = var.region
  
  template {
    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }
    
    service_account = google_service_account.n8n_service_account.email
    
    containers {
      image = var.container_image
      
      resources {
        limits = {
          memory = var.memory
          cpu    = var.cpu
        }
      }
      
      ports {
        container_port = 5678
      }
      
      env {
        name  = "DB_TYPE"
        value = "postgresdb"
      }
      
      env {
        name  = "DB_POSTGRESDB_HOST"
        value = "/cloudsql/${var.db_connection_name}"
      }
      
      env {
        name  = "DB_POSTGRESDB_PORT"
        value = "5432"
      }
      
      env {
        name  = "DB_POSTGRESDB_DATABASE"
        value = var.db_name
      }
      
      env {
        name  = "DB_POSTGRESDB_USER"
        value = var.db_user
      }
      
      env {
        name = "DB_POSTGRESDB_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = var.db_password_secret
            version = "latest"
          }
        }
      }
      
      env {
        name = "N8N_ENCRYPTION_KEY"
        value_source {
          secret_key_ref {
            secret  = var.n8n_encryption_key_secret
            version = "latest"
          }
        }
      }
      
      env {
        name  = "N8N_USER_MANAGEMENT_DISABLED"
        value = "true"
      }
      
      env {
        name  = "N8N_METRICS"
        value = "true"
      }
      
      env {
        name  = "N8N_DIAGNOSTICS_ENABLED"
        value = "false"
      }
    }
    
    # Cloud SQL Proxy sidecar
    volumes {
      name = "cloudsql"
      cloud_sql_instance {
        instances = [var.db_connection_name]
      }
    }
  }
  
  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }
}

# Allow unauthenticated access
resource "google_cloud_run_service_iam_binding" "noauth" {
  location = google_cloud_run_v2_service.n8n.location
  service  = google_cloud_run_v2_service.n8n.name
  role     = "roles/run.invoker"
  members  = ["allUsers"]
}