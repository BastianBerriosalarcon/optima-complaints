# Cloud SQL Santiago Module for Chatwoot - CONFIGURACIÓN ECONÓMICA

# Reserva de IP para peering privado
resource "google_compute_global_address" "private_ip_alloc" {
  count         = var.use_cloud_sql_santiago ? 1 : 0
  name          = "chatwoot-private-ip-${var.environment}"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = "projects/${var.project_id}/global/networks/optimacx-vpc-${var.environment}"
}

# Usar la conexión de servicio privado existente (para Redis)
# data "google_service_networking_connection" "existing_peering" {
#   count   = var.use_cloud_sql_santiago ? 1 : 0
#   network = "projects/${var.project_id}/global/networks/optimacx-vpc-${var.environment}"
#   service = "servicenetworking.googleapis.com"
# }

# Actualizar la conexión existente para incluir el rango de Chatwoot
# resource "google_service_networking_connection" "private_vpc_peering" {
#   count                   = var.use_cloud_sql_santiago ? 1 : 0
#   network                 = "projects/${var.project_id}/global/networks/optimacx-vpc-${var.environment}"
#   service                 = "servicenetworking.googleapis.com"
#   reserved_peering_ranges = [
#     "chatwoot-redis-dev-private-ip",  # Rango existente para Redis
#     google_compute_global_address.private_ip_alloc[0].name  # Nuevo rango para Chatwoot
#   ]
#   
#   depends_on = [
#     google_compute_global_address.private_ip_alloc
#   ]
# }

resource "google_sql_database_instance" "chatwoot_santiago" {
  count            = var.use_cloud_sql_santiago ? 1 : 0
  name             = "chatwoot-postgres-santiago-${var.environment}"
  region           = "southamerica-west1"  # Santiago, Chile
  database_version = "POSTGRES_15"
  
  # depends_on = [google_service_networking_connection.private_vpc_peering]
  
  settings {
    tier              = "db-g1-small"  # INTERMEDIO: ~$20-25 USD/mes - 1 vCPU, 1.7GB RAM
    disk_size         = 10              # Mínimo para reducir costos
    disk_type         = "PD_SSD"
    availability_type = "ZONAL"         # Más económico que REGIONAL
    
    # Configuraciones optimizadas para db-g1-small
    database_flags {
      name  = "max_connections"
      value = "150"  # Aumentado para db-g1-small
    }
    
    backup_configuration {
      enabled    = true
      start_time = "04:00"  # 4 AM Chile
      location   = "southamerica-west1"
      
      backup_retention_settings {
        retained_backups = 3  # Solo 3 días para reducir costos
      }
    }
    
    ip_configuration {
      ipv4_enabled                                  = true
      # private_network                               = "projects/${var.project_id}/global/networks/optimacx-vpc-${var.environment}"
      # enable_private_path_for_google_cloud_services = true
      ssl_mode                                      = "ENCRYPTED_ONLY"  # Reemplaza require_ssl deprecated
      
      authorized_networks {
        name  = "chatwoot-cloud-run"
        value = "0.0.0.0/0"  # Mejor usar VPC connector en producción
      }
    }
  }
  
  deletion_protection = true
}

# Database creation
resource "google_sql_database" "chatwoot_db" {
  count    = var.use_cloud_sql_santiago ? 1 : 0
  name     = "chatwoot_production"
  instance = google_sql_database_instance.chatwoot_santiago[0].name
}

# User creation
resource "google_sql_user" "chatwoot_user" {
  count    = var.use_cloud_sql_santiago ? 1 : 0
  name     = "chatwoot"
  instance = google_sql_database_instance.chatwoot_santiago[0].name
  password = var.chatwoot_db_password
}

# Connection string output - OPTIMIZADO: Detecta automáticamente IP privada o proxy
output "chatwoot_database_url" {
  value = var.use_cloud_sql_santiago ? (
    google_sql_database_instance.chatwoot_santiago[0].private_ip_address != "" ?
    "postgresql://${google_sql_user.chatwoot_user[0].name}:${var.chatwoot_db_password}@${google_sql_database_instance.chatwoot_santiago[0].private_ip_address}:5432/${google_sql_database.chatwoot_db[0].name}?sslmode=require" :
    "postgresql://${google_sql_user.chatwoot_user[0].name}:${var.chatwoot_db_password}@localhost//${google_sql_database.chatwoot_db[0].name}?host=/cloudsql/${google_sql_database_instance.chatwoot_santiago[0].connection_name}&sslmode=disable"
  ) : var.supabase_database_url
}
