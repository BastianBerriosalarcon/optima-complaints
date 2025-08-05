# Cloud SQL Santiago Module for Chatwoot
resource "google_sql_database_instance" "chatwoot_santiago" {
  count            = var.use_cloud_sql_santiago ? 1 : 0
  name             = "${var.project_id}-chatwoot-postgres-santiago"
  region           = "southamerica-west1"
  database_version = "POSTGRES_15"
  
  settings {
    tier              = "db-n1-standard-2"  # 2 vCPU, 7.5GB RAM
    disk_size         = 100
    disk_type         = "PD_SSD"
    availability_type = "ZONAL"  # Para reducir costos
    
    # Optimizaciones para chat tiempo real
    database_flags {
      name  = "shared_preload_libraries"
      value = "pg_stat_statements"
    }
    
    database_flags {
      name  = "max_connections"
      value = "200"
    }
    
    database_flags {
      name  = "work_mem"
      value = "64MB"
    }
    
    database_flags {
      name  = "checkpoint_completion_target"
      value = "0.9"
    }
    
    database_flags {
      name  = "wal_buffers"
      value = "16MB"
    }
    
    backup_configuration {
      enabled    = true
      start_time = "04:00"  # 4 AM Chile
      location   = "southamerica-west1"
      
      backup_retention_settings {
        retained_backups = 7
      }
    }
    
    ip_configuration {
      ipv4_enabled = true
      require_ssl  = true
      
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
