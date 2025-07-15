# Database Module - Supabase + Cloud SQL Configuration
# Handles database setup, secrets, and configurations

# Database URL secret
resource "google_secret_manager_secret" "database_url" {
  secret_id = "optimacx-database-url-${var.environment}"

  replication {
    auto {}
  }

  depends_on = [var.project_services]
}

# Database password secret
resource "google_secret_manager_secret" "database_password" {
  secret_id = "optimacx-database-password-${var.environment}"

  replication {
    auto {}
  }

  depends_on = [var.project_services]
}

# JWT secret for Supabase
resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "optimacx-jwt-secret-${var.environment}"

  replication {
    auto {}
  }

  depends_on = [var.project_services]
}

# Anon key for Supabase
resource "google_secret_manager_secret" "anon_key" {
  secret_id = "optimacx-anon-key-${var.environment}"

  replication {
    auto {}
  }

  depends_on = [var.project_services]
}

# Service role key for Supabase
resource "google_secret_manager_secret" "service_role_key" {
  secret_id = "optimacx-service-role-key-${var.environment}"

  replication {
    auto {}
  }

  depends_on = [var.project_services]
}