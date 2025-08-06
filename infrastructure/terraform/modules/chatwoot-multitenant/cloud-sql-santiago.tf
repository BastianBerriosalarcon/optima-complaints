# Cloud SQL Santiago Module for Chatwoot - CONFIGURACIÓN ECONÓMICA
resource "google_sql_database_instance" "chatwoot_santiago" {
  count            = var.use_cloud_sql_santiago ? 1 : 0
  name             = "chatwoot-postgres-santiago-${var.environment}"
  region           = "southamerica-west1"  # Santiago, Chile
  database_version = "POSTGRES_15"
  
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
      ipv4_enabled = true
      ssl_mode     = "ENCRYPTED_ONLY"  # Reemplaza require_ssl deprecated
      
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

# Connection string output
output "chatwoot_database_url" {
  value = var.use_cloud_sql_santiago ? "postgresql://${google_sql_user.chatwoot_user[0].name}:${var.chatwoot_db_password}@${google_sql_database_instance.chatwoot_santiago[0].connection_name}/${google_sql_database.chatwoot_db[0].name}?host=/cloudsql/${google_sql_database_instance.chatwoot_santiago[0].connection_name}" : var.supabase_database_url
}
