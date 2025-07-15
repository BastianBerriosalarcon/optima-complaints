# Supabase Service Configuration
# Manages Supabase-related secrets for hosted instance (supabase.com)
# Supabase is hosted in Brazil (South America region)

# Supabase URL secret (for hosted instance)
resource "google_secret_manager_secret" "supabase_url" {
  secret_id = "supabase-url-${var.environment}"
  
  replication {
    auto {}
  }
}

# Supabase Anon Key secret
resource "google_secret_manager_secret" "supabase_anon_key" {
  secret_id = "supabase-anon-key-${var.environment}"
  
  replication {
    auto {}
  }
}

# Supabase Service Role Key secret
resource "google_secret_manager_secret" "supabase_service_role_key" {
  secret_id = "supabase-service-role-key-${var.environment}"
  
  replication {
    auto {}
  }
}

# Supabase JWT Secret (for backend verification)
resource "google_secret_manager_secret" "supabase_jwt_secret" {
  secret_id = "supabase-jwt-secret-${var.environment}"
  
  replication {
    auto {}
  }
}

# Note: Supabase is hosted on supabase.com (Brazil region)
# No Cloud SQL instance needed - using managed Supabase service