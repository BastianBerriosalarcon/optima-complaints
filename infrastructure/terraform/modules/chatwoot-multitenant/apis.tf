# APIs requeridas para optimizaciones de Cloud SQL

# Service Networking API para VPC peering privado
resource "google_project_service" "service_networking" {
  count   = var.use_cloud_sql_santiago ? 1 : 0
  service = "servicenetworking.googleapis.com"
  
  disable_dependent_services = true
}

# SQL Admin API (ya debe estar habilitada)
resource "google_project_service" "sql_admin" {
  count   = var.use_cloud_sql_santiago ? 1 : 0
  service = "sqladmin.googleapis.com"
  
  disable_dependent_services = true
}

# Compute API para VPC y redes
resource "google_project_service" "compute" {
  count   = var.use_cloud_sql_santiago ? 1 : 0
  service = "compute.googleapis.com"
  
  disable_dependent_services = true
}
