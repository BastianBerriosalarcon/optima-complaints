# Generic Cloud Run Module - Supports N8N, Frontend, and Chatwoot

# Cloud Run Service
resource "google_cloud_run_v2_service" "service" {
  name     = var.service_name
  location = var.region
  project  = var.project_id
  
  template {
    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }
    
    service_account = var.service_account
    
    containers {
      image = var.container_image
      
      resources {
        limits = {
          memory = var.memory
          cpu    = var.cpu
        }
      }
      
      ports {
        container_port = var.container_port
      }
      
      # Standard environment variables
      dynamic "env" {
        for_each = var.env_vars
        content {
          name  = env.key
          value = env.value
        }
      }
      
      # Secret environment variables
      dynamic "env" {
        for_each = var.secret_env_vars
        content {
          name = env.key
          value_source {
            secret_key_ref {
              secret  = env.value
              version = "latest"
            }
          }
        }
      }
    }
    
    # VPC Connector (optional)
    dynamic "vpc_access" {
      for_each = var.vpc_connector_name != "" ? [1] : []
      content {
        connector = "projects/${var.project_id}/locations/${var.region}/connectors/${var.vpc_connector_name}"
        egress    = "ALL_TRAFFIC"
      }
    }
    
    # Cloud SQL connections (optional)
    dynamic "volumes" {
      for_each = var.db_connection_name != "" ? [1] : []
      content {
        name = "cloudsql"
        cloud_sql_instance {
          instances = [var.db_connection_name]
        }
      }
    }
    
    # Execution environment
    execution_environment = var.execution_environment
    
    # Timeout
    timeout = "${var.timeout_seconds}s"
    
    # Concurrency
    max_instance_request_concurrency = var.max_instance_request_concurrency
  }
  
  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }
  
  ingress = var.ingress
}

# IAM binding for public access (optional)
resource "google_cloud_run_service_iam_binding" "noauth" {
  count    = var.allow_unauthenticated ? 1 : 0
  location = google_cloud_run_v2_service.service.location
  service  = google_cloud_run_v2_service.service.name
  role     = "roles/run.invoker"
  members  = ["allUsers"]
}