# OptimaCx GCP - Terraform Configuration
# This file contains the infrastructure configuration for OptimaCx n8n deployment

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
    prefix = "terraform/state"
  }
}

# Configure the Google Cloud Provider
provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Variables
variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "burnished-data-463915-d8"
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "southamerica-west1"
}

variable "zone" {
  description = "GCP Zone"
  type        = string
  default     = "southamerica-west1-a"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "prod"
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "cloudresourcemanager.googleapis.com",
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "vpcaccess.googleapis.com",
    "secretmanager.googleapis.com",
    "aiplatform.googleapis.com",
    "compute.googleapis.com"
  ])
  
  service = each.value
  project = var.project_id
}

# VPC Network
resource "google_compute_network" "vpc" {
  name                    = "optimacx-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name          = "optimacx-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.vpc.id
}

# Cloud SQL Instance
resource "google_sql_database_instance" "postgres" {
  name             = "n8n-optima-cx-postgres"
  database_version = "POSTGRES_15"
  region           = var.region
  
  settings {
    tier = "db-f1-micro"
    
    database_flags {
      name  = "shared_preload_libraries"
      value = "vector"
    }
    
    ip_configuration {
      ipv4_enabled                                  = true
      private_network                               = google_compute_network.vpc.id
      enable_private_path_for_google_cloud_services = true
    }
    
    backup_configuration {
      enabled                        = true
      start_time                     = "02:00"
      backup_retention_settings {
        retained_backups = 7
      }
    }
  }
  
  depends_on = [google_project_service.required_apis]
}

# Cloud SQL Database
resource "google_sql_database" "n8n_db" {
  name     = "n8n_optima_cx"
  instance = google_sql_database_instance.postgres.name
}

# Cloud SQL User
resource "google_sql_user" "n8n_user" {
  name     = "n8n_user"
  instance = google_sql_database_instance.postgres.name
  password = "n8n_secure_password_change_me"
}

# Service Account for Cloud Run
resource "google_service_account" "n8n_service_account" {
  account_id   = "n8n-optimacx-sa"
  display_name = "n8n OptimaCx Service Account"
}

# IAM bindings for service account
resource "google_project_iam_member" "n8n_permissions" {
  for_each = toset([
    "roles/cloudsql.client",
    "roles/secretmanager.secretAccessor",
    "roles/aiplatform.user",
    "roles/storage.objectViewer"
  ])
  
  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.n8n_service_account.email}"
}

# Cloud Run Service
resource "google_cloud_run_service" "n8n" {
  name     = "n8n-optima-cx"
  location = var.region
  
  template {
    spec {
      service_account_name = google_service_account.n8n_service_account.email
      
      containers {
        image = "n8nio/n8n:latest"
        
        resources {
          limits = {
            cpu    = "2"
            memory = "4Gi"
          }
          requests = {
            cpu    = "1"
            memory = "2Gi"
          }
        }
        
        env {
          name  = "N8N_EDITOR_BASE_URL"
          value = "https://n8n-optima-cx-${var.project_id}.${var.region}.run.app"
        }
        
        env {
          name  = "N8N_WEBHOOK_URL"
          value = "https://n8n-optima-cx-${var.project_id}.${var.region}.run.app"
        }
        
        env {
          name  = "DB_TYPE"
          value = "postgresdb"
        }
        
        env {
          name  = "DB_POSTGRESDB_HOST"
          value = google_sql_database_instance.postgres.private_ip_address
        }
        
        env {
          name  = "DB_POSTGRESDB_PORT"
          value = "5432"
        }
        
        env {
          name  = "DB_POSTGRESDB_DATABASE"
          value = google_sql_database.n8n_db.name
        }
        
        env {
          name  = "DB_POSTGRESDB_USER"
          value = google_sql_user.n8n_user.name
        }
        
        env {
          name  = "DB_POSTGRESDB_PASSWORD"
          value = google_sql_user.n8n_user.password
        }
        
        env {
          name  = "GENERIC_TIMEZONE"
          value = "America/Santiago"
        }
        
        env {
          name  = "N8N_METRICS"
          value = "true"
        }
        
        env {
          name  = "N8N_ENCRYPTION_KEY"
          value = "n8n-encryption-key-optimacx-change-me"
        }
      }
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale"        = "10"
        "autoscaling.knative.dev/minScale"        = "1"
        "run.googleapis.com/cloudsql-instances"   = google_sql_database_instance.postgres.connection_name
        "run.googleapis.com/execution-environment" = "gen2"
        "run.googleapis.com/cpu-throttling"       = "false"
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
  
  depends_on = [
    google_project_service.required_apis,
    google_sql_database_instance.postgres
  ]
}

# Cloud Run IAM
resource "google_cloud_run_service_iam_member" "noauth" {
  location = google_cloud_run_service.n8n.location
  project  = google_cloud_run_service.n8n.project
  service  = google_cloud_run_service.n8n.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Outputs
output "n8n_url" {
  value = google_cloud_run_service.n8n.status[0].url
}

output "database_connection_name" {
  value = google_sql_database_instance.postgres.connection_name
}

output "database_private_ip" {
  value = google_sql_database_instance.postgres.private_ip_address
}