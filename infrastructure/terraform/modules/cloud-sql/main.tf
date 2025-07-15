# Cloud SQL Module - PostgreSQL for Chatwoot and N8N

resource "google_sql_database_instance" "main" {
  name             = var.instance_name
  database_version = var.database_version
  region           = var.region
  project          = var.project_id

  settings {
    tier                        = var.tier
    availability_type           = var.availability_type
    disk_size                   = var.disk_size
    disk_type                   = var.disk_type
    disk_autoresize             = var.disk_autoresize
    disk_autoresize_limit       = var.disk_autoresize_limit
    deletion_protection_enabled = var.deletion_protection_enabled

    backup_configuration {
      enabled                        = var.backup_enabled
      start_time                     = var.backup_start_time
      location                       = var.region
      point_in_time_recovery_enabled = var.point_in_time_recovery_enabled
      transaction_log_retention_days = var.transaction_log_retention_days
      backup_retention_settings {
        retained_backups = var.retained_backups
        retention_unit   = "COUNT"
      }
    }

    ip_configuration {
      ipv4_enabled                                  = var.ipv4_enabled
      private_network                               = var.private_network
      enable_private_path_for_google_cloud_services = var.enable_private_path_for_google_cloud_services
      
      dynamic "authorized_networks" {
        for_each = var.authorized_networks
        content {
          name  = authorized_networks.value.name
          value = authorized_networks.value.value
        }
      }
    }

    dynamic "database_flags" {
      for_each = var.database_flags
      content {
        name  = database_flags.value.name
        value = database_flags.value.value
      }
    }

    maintenance_window {
      day          = var.maintenance_window_day
      hour         = var.maintenance_window_hour
      update_track = var.maintenance_window_update_track
    }

    insights_config {
      query_insights_enabled  = var.query_insights_enabled
      query_string_length     = var.query_string_length
      record_application_tags = var.record_application_tags
      record_client_address   = var.record_client_address
    }
  }

  depends_on = [var.project_services]
}

# Create databases
resource "google_sql_database" "databases" {
  for_each = var.databases
  
  name     = each.key
  instance = google_sql_database_instance.main.name
  charset  = each.value.charset
  collation = each.value.collation
}

# Create users
resource "google_sql_user" "users" {
  for_each = var.users
  
  name     = each.key
  instance = google_sql_database_instance.main.name
  password = each.value.password
}

# Create user secrets
resource "google_secret_manager_secret" "user_passwords" {
  for_each = var.users
  
  secret_id = "${var.instance_name}-${each.key}-password"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "user_passwords" {
  for_each = var.users
  
  secret      = google_secret_manager_secret.user_passwords[each.key].id
  secret_data = each.value.password
}